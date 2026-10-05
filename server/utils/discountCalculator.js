const mongoose = require("mongoose");

/**
 * Calculates discounts, GST tax (18%), shipping, and totals for cart items.
 *
 * OPTION A IMPLEMENTATION (Industry Standard - Single Best Offer):
 * - Evaluates all applicable discounts: Combo Deals, Auto Offers (Store/Category/Deity), and Coupons.
 * - Applies ONLY the SINGLE HIGHEST discount to ensure store safety and provide the customer the best savings.
 * - No double-dipping/stacking of multiple promotions.
 *
 * @param {Array} cartItems - Populated cart items
 * @param {String} couponCode - Coupon code to validate & apply
 */
async function calculateCartDiscounts(cartItems, couponCode = "") {
  const ComboOffer = mongoose.model("ComboOffer");
  const Offer = mongoose.model("Offer");
  const Coupon = mongoose.model("Coupon");

  const originalSubtotal = cartItems.reduce((sum, item) => sum + item.priceAtAdd * item.quantity, 0);

  // -------------------------------------------------------------
  // Candidate 1: Calculate Potential Combo Offers Discount
  // -------------------------------------------------------------
  let candidateComboDiscount = 0;
  const candidateCombos = [];

  try {
    const activeCombos = await ComboOffer.find({ isActive: true });

    // Tracks quantities available for combo application
    const itemQuantities = {};
    for (const item of cartItems) {
      const pId = item.product?._id?.toString() || item.product?.toString();
      if (pId) {
        itemQuantities[pId] = (itemQuantities[pId] || 0) + item.quantity;
      }
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
            (item) => (item.product?._id?.toString() || item.product?.toString()) === pIdStr
          );
          if (matchedItem) {
            comboPriceSum += matchedItem.priceAtAdd;
          }
        }
      }

      // If all products in the combo are in the cart
      if (matchCount === combo.products.length && minQuantity > 0 && minQuantity !== Infinity) {
        for (const pId of combo.products) {
          itemQuantities[pId.toString()] -= minQuantity;
        }

        let discount = 0;
        if (combo.discountType === "percentage") {
          discount = Math.round(comboPriceSum * (combo.discountValue / 100) * minQuantity);
        } else if (combo.discountType === "flat") {
          discount = combo.discountValue * minQuantity;
        }

        candidateComboDiscount += discount;
        candidateCombos.push({
          title: combo.title,
          discount,
        });
      }
    }
  } catch (err) {
    console.error("Failed to calculate combo offers:", err);
  }

  // -------------------------------------------------------------
  // Candidate 2: Calculate Potential Automatic Offers Discount (Best Auto Offer)
  // -------------------------------------------------------------
  let candidateAutoOfferDiscount = 0;
  let candidateBestOffer = null;

  try {
    const activeOffers = await Offer.find({ isActive: true });
    let maxAutoDiscount = 0;

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
            const catId = cat?._id?.toString() || cat?.toString();
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
        applicableSubtotal = originalSubtotal;
        hasEligibleItems = cartItems.length > 0;
      }

      if (hasEligibleItems && originalSubtotal >= (offer.minOrderValue || 0)) {
        let discount = 0;
        if (offer.discountType === "percentage") {
          discount = Math.round(applicableSubtotal * (offer.discountValue / 100));
        } else if (offer.discountType === "flat") {
          discount = offer.discountValue;
        }

        discount = Math.min(discount, originalSubtotal);

        if (discount > maxAutoDiscount) {
          maxAutoDiscount = discount;
          candidateBestOffer = offer;
        }
      }
    }

    candidateAutoOfferDiscount = maxAutoDiscount;
  } catch (err) {
    console.error("Failed to calculate automatic offers:", err);
  }

  // -------------------------------------------------------------
  // Candidate 3: Calculate Potential Coupon Discount
  // -------------------------------------------------------------
  let candidateCouponDiscount = 0;
  let candidateCoupon = null;
  let couponError = "";

  if (couponCode) {
    if (candidateComboDiscount > 0) {
      couponError = "A Combo Offer is already applied to your cart. Coupons cannot be combined with Combo Deals (Only 1 offer allowed per order).";
    } else {
      try {
        const coupon = await Coupon.findOne({
          code: couponCode.toUpperCase().trim(),
          isActive: true,
          expiryDate: { $gt: new Date() },
        });

        if (!coupon) {
          couponError = "Coupon code is invalid or expired";
        } else if (originalSubtotal < (coupon.minOrderValue || 0)) {
          couponError = `Minimum order value of ₹${coupon.minOrderValue} is required to apply this coupon`;
        } else if (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit) {
          couponError = "Coupon code usage limit has been reached";
        } else {
          if (coupon.discountType === "percentage") {
            candidateCouponDiscount = Math.round(originalSubtotal * (coupon.discountValue / 100));
          } else if (coupon.discountType === "flat") {
            candidateCouponDiscount = coupon.discountValue;
          }

          candidateCouponDiscount = Math.min(candidateCouponDiscount, originalSubtotal);
          candidateCoupon = coupon;
        }
      } catch (err) {
        console.error("Failed to validate coupon:", err);
        couponError = "Internal error validating coupon";
      }
    }
  }

  // -------------------------------------------------------------
  // STRICT SINGLE-OFFER ENFORCEMENT: ONLY 1 OFFER CAN APPLY
  // Hierarchy & Conflict Resolution:
  // 1. If Combo Offer is active -> Combo Offer takes exclusive precedence.
  // 2. If Coupon Code is entered & valid (and no combo) -> Coupon applies exclusively.
  // 3. Otherwise, if Auto Offer is eligible -> Auto Offer applies.
  // -------------------------------------------------------------
  let comboDiscount = 0;
  let autoOfferDiscount = 0;
  let couponDiscount = 0;
  let appliedCombos = [];
  let appliedOffers = [];
  let appliedCouponCode = "";
  let appliedOfferType = "none"; // "combo" | "coupon" | "auto_offer" | "none"
  let offerNotice = "";

  // 1. Combo Offer takes exclusive priority if cart has combo pairs
  if (candidateComboDiscount > 0) {
    comboDiscount = candidateComboDiscount;
    appliedCombos = candidateCombos;
    appliedOfferType = "combo";
    if (couponCode) {
      offerNotice = "Combo Deal is active. Other coupons/offers cannot be combined with this order.";
    }
  }
  // 2. If user applied a valid Coupon (and no combo exists)
  else if (candidateCouponDiscount > 0 && candidateCoupon) {
    couponDiscount = candidateCouponDiscount;
    appliedCouponCode = candidateCoupon.code;
    appliedOfferType = "coupon";
    if (candidateAutoOfferDiscount > 0) {
      offerNotice = `Coupon '${candidateCoupon.code}' applied (Auto offer overridden for single offer policy).`;
    }
  }
  // 3. If no combo and no coupon, apply best automatic store offer
  else if (candidateAutoOfferDiscount > 0 && candidateBestOffer) {
    autoOfferDiscount = candidateAutoOfferDiscount;
    appliedOffers = [{
      title: candidateBestOffer.title,
      discount: autoOfferDiscount,
    }];
    appliedOfferType = "auto_offer";
  }

  // Strictly only ONE discount is non-zero
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
    appliedOfferType,
    offerNotice,
  };
}

module.exports = { calculateCartDiscounts };
