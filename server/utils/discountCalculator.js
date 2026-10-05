const mongoose = require("mongoose");
const { syncExpiredPromotions } = require("./promotionExpirySync");

/**
 * Calculates discounts, GST tax (18%), shipping, and totals for cart items.
 *
 * POLICY RULES:
 * 1. Priority 1 - Combo Deals:
 *    - If cart contains items matching an active Combo Offer, Combo Offer takes exclusive 1st priority.
 *    - Coupon codes and Special Offers cannot be applied to combo orders.
 *
 * 2. Normal Cart (No Combo Deal):
 *    - Both Special Offers and Coupons are shown to the customer.
 *    - The customer can choose to apply whichever 1 offer they want (Coupon OR Special Offer).
 *    - Strictly at most ONE offer/discount can apply per order.
 *
 * @param {Array} cartItems - Populated cart items
 * @param {String} couponCode - Optional coupon code chosen/entered by user
 * @param {String} offerId - Optional special offer ID chosen by user
 */
async function calculateCartDiscounts(cartItems, couponCode = "", offerId = "") {
  // Sync all expired coupons, offers, and combos before doing any calculations
  await syncExpiredPromotions();

  const ComboOffer = mongoose.model("ComboOffer");
  const Offer = mongoose.model("Offer");
  const Coupon = mongoose.model("Coupon");

  const originalSubtotal = cartItems.reduce((sum, item) => sum + item.priceAtAdd * item.quantity, 0);

  // -------------------------------------------------------------
  // Step 1: Check Combo / BOGO Offers (Priority 1)
  // -------------------------------------------------------------
  let candidateComboDiscount = 0;
  const candidateCombos = [];

  try {
    const activeCombos = await ComboOffer.find({
      isActive: true,
      $or: [{ expiryDate: { $gt: new Date() } }, { expiryDate: null }],
    });

    // Track available quantities by Product ID string
    const itemQuantities = {};
    for (const item of cartItems) {
      const pId = item.product?._id ? item.product._id.toString() : (item.product?.toString() || "");
      if (pId) {
        itemQuantities[pId] = (itemQuantities[pId] || 0) + item.quantity;
      }
    }

    for (const combo of activeCombos) {
      if (!combo.products || combo.products.length === 0) continue;

      // Count how many of each product ID are required for 1 combo set
      const requiredProductCounts = {};
      for (const p of combo.products) {
        const pIdStr = p?._id ? p._id.toString() : p.toString();
        requiredProductCounts[pIdStr] = (requiredProductCounts[pIdStr] || 0) + 1;
      }

      // Find max complete combo sets that can be formed from available quantities
      let maxSets = Infinity;
      let singleComboPriceSum = 0;

      for (const [pIdStr, reqQty] of Object.entries(requiredProductCounts)) {
        const availQty = itemQuantities[pIdStr] || 0;
        if (availQty < reqQty) {
          maxSets = 0;
          break;
        }
        const possibleSets = Math.floor(availQty / reqQty);
        maxSets = Math.min(maxSets, possibleSets);

        const matchedItem = cartItems.find(
          (item) => (item.product?._id?.toString() || item.product?.toString()) === pIdStr
        );
        if (matchedItem) {
          singleComboPriceSum += matchedItem.priceAtAdd * reqQty;
        }
      }

      // If at least 1 full set of this combo is in the cart
      if (maxSets > 0 && maxSets !== Infinity) {
        // Deduct quantities consumed by this combo
        for (const [pIdStr, reqQty] of Object.entries(requiredProductCounts)) {
          itemQuantities[pIdStr] -= reqQty * maxSets;
        }

        let discount = 0;
        if (combo.discountType === "percentage") {
          discount = Math.round(singleComboPriceSum * (combo.discountValue / 100) * maxSets);
        } else if (combo.discountType === "flat") {
          discount = combo.discountValue * maxSets;
        }

        candidateComboDiscount += discount;
        candidateCombos.push({
          _id: combo._id?.toString(),
          title: combo.title,
          discount,
        });
      }
    }
  } catch (err) {
    console.error("Failed to calculate combo offers:", err);
  }

  // -------------------------------------------------------------
  // If Combo Offer is found -> Combo gets EXCLUSIVE 1st Priority!
  // Coupons & Special Offers are completely blocked.
  // -------------------------------------------------------------
  if (candidateComboDiscount > 0) {
    const comboDiscount = candidateComboDiscount;
    const totalDiscount = comboDiscount;
    const taxableAmount = Math.max(0, originalSubtotal - totalDiscount);
    const tax = Math.round(taxableAmount * 0.18);
    const shippingFee = 0;
    const totalAmount = taxableAmount + tax + shippingFee;

    return {
      subtotal: originalSubtotal,
      comboDiscount,
      autoOfferDiscount: 0,
      couponDiscount: 0,
      totalDiscount,
      taxableAmount,
      tax,
      shippingFee,
      totalAmount,
      appliedCombos: candidateCombos,
      appliedOffers: [],
      appliedOfferId: "",
      appliedCouponCode: "",
      appliedOfferType: "combo",
      couponError: couponCode ? "Combo Offer is active on your cart. Coupons cannot be combined with combo deals." : "",
      offerError: offerId ? "Combo Offer is active on your cart. Special offers cannot be combined with combo deals." : "",
      offerNotice: "Combo Deal is active (1st Priority). Other offers & coupons are disabled.",
    };
  }

  // -------------------------------------------------------------
  // Step 2: Normal Cart (No Combo Offer)
  // Evaluate User's Choice: Coupon Code OR Special Offer
  // -------------------------------------------------------------
  let couponDiscount = 0;
  let autoOfferDiscount = 0;
  let appliedCouponCode = "";
  let appliedOfferId = "";
  let appliedOffers = [];
  let appliedOfferType = "none";
  let couponError = "";
  let offerError = "";
  let offerNotice = "";

  const cleanCoupon = (couponCode || "").trim().toUpperCase();
  const cleanOfferId = (offerId || "").trim();

  // Helper to validate & calculate a single offer's discount
  function calculateOfferDiscount(offer) {
    let applicableSubtotal = 0;
    let hasEligibleItems = false;

    if (offer.applicableCategory && offer.applicableCategory.length > 0) {
      const categoryIds = offer.applicableCategory.map((c) => (c._id ? c._id.toString() : c.toString()));
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
      applicableSubtotal = originalSubtotal;
      hasEligibleItems = cartItems.length > 0;
    }

    if (!hasEligibleItems) {
      return { eligible: false, discount: 0, reason: "No eligible items in cart for this offer" };
    }

    if (originalSubtotal < (offer.minOrderValue || 0)) {
      return {
        eligible: false,
        discount: 0,
        reason: `Minimum order value of ₹${offer.minOrderValue} is required for this offer`,
      };
    }

    let discount = 0;
    if (offer.discountType === "percentage") {
      discount = Math.round(applicableSubtotal * (offer.discountValue / 100));
    } else if (offer.discountType === "flat") {
      discount = offer.discountValue;
    }
    discount = Math.min(discount, originalSubtotal);

    return { eligible: true, discount, reason: "" };
  }

  // A. User selected/entered a Coupon Code -> Apply ONLY Coupon
  if (cleanCoupon) {
    try {
      const coupon = await Coupon.findOne({
        code: cleanCoupon,
        isActive: true,
        $or: [{ expiryDate: { $gt: new Date() } }, { expiryDate: null }],
      });

      if (!coupon) {
        const rawCoupon = await Coupon.findOne({ code: cleanCoupon });
        if (!rawCoupon) {
          couponError = `Coupon code '${cleanCoupon}' is invalid`;
        } else if (!rawCoupon.isActive || (rawCoupon.expiryDate && rawCoupon.expiryDate <= new Date())) {
          couponError = `Coupon code '${cleanCoupon}' has expired or is paused`;
        } else {
          couponError = `Coupon code '${cleanCoupon}' is currently unavailable`;
        }
      } else if (originalSubtotal < (coupon.minOrderValue || 0)) {
        couponError = `Minimum order value of ₹${coupon.minOrderValue} is required to apply coupon '${cleanCoupon}'`;
      } else if (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit) {
        couponError = `Coupon code '${cleanCoupon}' usage limit has been reached`;
      } else {
        if (coupon.discountType === "percentage") {
          couponDiscount = Math.round(originalSubtotal * (coupon.discountValue / 100));
        } else if (coupon.discountType === "flat") {
          couponDiscount = coupon.discountValue;
        }
        couponDiscount = Math.min(couponDiscount, originalSubtotal);
        appliedCouponCode = coupon.code;
        appliedOfferType = "coupon";
        offerNotice = `Coupon '${coupon.code}' applied.`;
      }
    } catch (err) {
      console.error("Failed to validate coupon:", err);
      couponError = "Internal error validating coupon";
    }
  }
  // B. User selected a Special Offer (and no coupon) -> Apply ONLY Special Offer
  else if (cleanOfferId && cleanOfferId !== "none") {
    try {
      if (mongoose.Types.ObjectId.isValid(cleanOfferId)) {
        const offer = await Offer.findOne({
          _id: cleanOfferId,
          isActive: true,
          $or: [{ expiryDate: { $gt: new Date() } }, { expiryDate: null }],
        });

        if (!offer) {
          const rawOffer = await Offer.findById(cleanOfferId);
          if (!rawOffer) {
            offerError = "Selected special offer is invalid";
          } else if (!rawOffer.isActive || (rawOffer.expiryDate && rawOffer.expiryDate <= new Date())) {
            offerError = "Selected special offer has expired or is paused";
          } else {
            offerError = "Selected special offer is currently inactive";
          }
        } else {
          const check = calculateOfferDiscount(offer);
          if (!check.eligible) {
            offerError = check.reason;
          } else {
            autoOfferDiscount = check.discount;
            appliedOfferId = offer._id.toString();
            appliedOffers = [{
              _id: offer._id.toString(),
              title: offer.title,
              discount: autoOfferDiscount,
            }];
            appliedOfferType = "special_offer";
            offerNotice = `Special offer '${offer.title}' applied.`;
          }
        }
      } else {
        offerError = "Invalid offer ID format";
      }
    } catch (err) {
      console.error("Failed to validate special offer:", err);
      offerError = "Internal error validating special offer";
    }
  }

  // Exactly ONE discount applies (or 0 if user hasn't chosen one)
  const totalDiscount = couponDiscount + autoOfferDiscount;
  const taxableAmount = Math.max(0, originalSubtotal - totalDiscount);
  const tax = Math.round(taxableAmount * 0.18); // 18% GST
  const shippingFee = 0; // 100% Free Shipping
  const totalAmount = taxableAmount + tax + shippingFee;

  return {
    subtotal: originalSubtotal,
    comboDiscount: 0,
    autoOfferDiscount,
    couponDiscount,
    totalDiscount,
    taxableAmount,
    tax,
    shippingFee,
    totalAmount,
    appliedCombos: [],
    appliedOffers,
    appliedOfferId,
    appliedCouponCode,
    appliedOfferType,
    couponError,
    offerError,
    offerNotice,
  };
}

module.exports = { calculateCartDiscounts };
