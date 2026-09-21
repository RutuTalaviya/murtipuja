const mongoose = require("mongoose");

/**
 * Calculates discounts, GST tax (18%), shipping, and totals for cart items.
 * Supports:
 * 1. Combo Offers: buy specific products together for flat/percentage discount.
 * 2. Automatic Offers: shop-wide, category-specific, or deity-specific auto-applied discounts.
 * 3. Coupons: manual coupon codes.
 * 4. 18% GST (added on top of taxable subtotal).
 * 5. 100% Free Shipping for all orders across India (₹0).
 *
 * @param {Array} cartItems - Populated cart items
 * @param {String} couponCode - Coupon code to validate & apply
 */
async function calculateCartDiscounts(cartItems, couponCode = "") {
  const ComboOffer = mongoose.model("ComboOffer");
  const Offer = mongoose.model("Offer");
  const Coupon = mongoose.model("Coupon");

  const originalSubtotal = cartItems.reduce((sum, item) => sum + item.priceAtAdd * item.quantity, 0);

  // 1. Calculate Combo Offers
  let comboDiscount = 0;
  const appliedCombos = [];
  
  try {
    const activeCombos = await ComboOffer.find({ isActive: true });
    
    // Tracks quantities available for combo application
    const itemQuantities = {};
    for (const item of cartItems) {
      const pId = item.product._id?.toString() || item.product.toString();
      itemQuantities[pId] = (itemQuantities[pId] || 0) + item.quantity;
    }

    for (const combo of activeCombos) {
      let matchCount = 0;
      let minQuantity = Infinity;
      let comboPriceSum = 0;

      for (const pId of combo.products) {
        const pIdStr = pId.toString();
        const qtyAvailable = itemQuantities[pIdStr] || 0;
        if (qtyAvailable > 0) {
          matchCount++;
          minQuantity = Math.min(minQuantity, qtyAvailable);
          
          const matchedItem = cartItems.find(
            (item) => (item.product._id?.toString() || item.product.toString()) === pIdStr
          );
          if (matchedItem) {
            comboPriceSum += matchedItem.priceAtAdd;
          }
        }
      }

      // If all products in the combo are in the cart
      if (matchCount === combo.products.length && minQuantity > 0 && minQuantity !== Infinity) {
        // Consume quantities
        for (const pId of combo.products) {
          itemQuantities[pId.toString()] -= minQuantity;
        }

        let discount = 0;
        if (combo.discountType === "percentage") {
          discount = Math.round(comboPriceSum * (combo.discountValue / 100) * minQuantity);
        } else if (combo.discountType === "flat") {
          discount = combo.discountValue * minQuantity;
        }

        comboDiscount += discount;
        appliedCombos.push({
          title: combo.title,
          discount,
        });
      }
    }
  } catch (err) {
    console.error("Failed to calculate combo offers:", err);
  }

  const subtotalAfterCombos = Math.max(0, originalSubtotal - comboDiscount);

  // 2. Calculate Automatic General Offers (Apply the one that yields the maximum discount)
  let autoOfferDiscount = 0;
  const appliedOffers = [];

  try {
    const activeOffers = await Offer.find({ isActive: true });
    let maxAutoDiscount = 0;
    let bestOffer = null;

    for (const offer of activeOffers) {
      let applicableSubtotal = 0;
      let hasEligibleItems = false;

      if (offer.applicableCategory && offer.applicableCategory.length > 0) {
        const categoryIds = offer.applicableCategory.map((c) => c.toString());
        const eligibleItems = cartItems.filter((item) => {
          const productObj = item.product;
          if (!productObj || !productObj.category) return false;
          
          const pCats = Array.isArray(productObj.category) ? productObj.category : [productObj.category];
          return pCats.some((cat) => {
            const catId = cat._id?.toString() || cat.toString();
            return categoryIds.includes(catId);
          });
        });

        applicableSubtotal = eligibleItems.reduce((sum, item) => sum + item.priceAtAdd * item.quantity, 0);
        hasEligibleItems = eligibleItems.length > 0;
      } else if (offer.applicableDeity) {
        const eligibleItems = cartItems.filter((item) => {
          const productObj = item.product;
          return productObj && productObj.deity?.toLowerCase() === offer.applicableDeity.toLowerCase();
        });

        applicableSubtotal = eligibleItems.reduce((sum, item) => sum + item.priceAtAdd * item.quantity, 0);
        hasEligibleItems = eligibleItems.length > 0;
      } else {
        // Store-wide offer
        applicableSubtotal = subtotalAfterCombos;
        hasEligibleItems = cartItems.length > 0;
      }

      if (hasEligibleItems && subtotalAfterCombos >= offer.minOrderValue) {
        let discount = 0;
        if (offer.discountType === "percentage") {
          discount = Math.round(applicableSubtotal * (offer.discountValue / 100));
        } else if (offer.discountType === "flat") {
          discount = offer.discountValue;
        }

        discount = Math.min(discount, subtotalAfterCombos);

        if (discount > maxAutoDiscount) {
          maxAutoDiscount = discount;
          bestOffer = offer;
        }
      }
    }

    if (bestOffer) {
      autoOfferDiscount = maxAutoDiscount;
      appliedOffers.push({
        title: bestOffer.title,
        discount: autoOfferDiscount,
      });
    }
  } catch (err) {
    console.error("Failed to calculate automatic offers:", err);
  }

  const subtotalAfterOffers = Math.max(0, subtotalAfterCombos - autoOfferDiscount);

  // 3. Calculate Coupon Discounts
  let couponDiscount = 0;
  let appliedCouponCode = "";
  let couponError = "";

  if (couponCode) {
    try {
      const coupon = await Coupon.findOne({
        code: couponCode.toUpperCase().trim(),
        isActive: true,
        expiryDate: { $gt: new Date() },
      });

      if (!coupon) {
        couponError = "Coupon code is invalid or expired";
      } else if (subtotalAfterOffers < coupon.minOrderValue) {
        couponError = `Minimum order value of ₹${coupon.minOrderValue} is required to apply this coupon`;
      } else if (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit) {
        couponError = "Coupon code usage limit has been reached";
      } else {
        if (coupon.discountType === "percentage") {
          couponDiscount = Math.round(subtotalAfterOffers * (coupon.discountValue / 100));
        } else if (coupon.discountType === "flat") {
          couponDiscount = coupon.discountValue;
        }

        couponDiscount = Math.min(couponDiscount, subtotalAfterOffers);
        appliedCouponCode = coupon.code;
      }
    } catch (err) {
      console.error("Failed to validate coupon:", err);
      couponError = "Internal error validating coupon";
    }
  }

  // 4. Totals, GST (18%) and Shipping
  const totalDiscount = comboDiscount + autoOfferDiscount + couponDiscount;
  const taxableAmount = Math.max(0, originalSubtotal - totalDiscount);
  const gstRate = 0.18; // 18% GST
  const tax = Math.round(taxableAmount * gstRate);
  
  // 100% Free Shipping for all orders across India
  const shippingFee = 0;
  const totalAmount = taxableAmount + tax + shippingFee;

  return {
    subtotal: originalSubtotal,
    comboDiscount,
    autoOfferDiscount,
    couponDiscount,
    totalDiscount,
    taxableAmount,
    tax,
    shippingFee,
    totalAmount,
    appliedCombos,
    appliedOffers,
    appliedCouponCode,
    couponError,
  };
}

module.exports = { calculateCartDiscounts };
