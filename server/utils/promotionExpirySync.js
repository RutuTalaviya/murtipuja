const mongoose = require("mongoose");

/**
 * Parses user/admin input into a valid Date object.
 * If input is a 'YYYY-MM-DD' date string, sets time to 23:59:59.999 (end of the given day in local time).
 */
function parseExpiryDate(dateInput) {
  if (!dateInput) return null;
  if (dateInput instanceof Date) {
    return isNaN(dateInput.getTime()) ? null : dateInput;
  }
  const str = String(dateInput).trim();
  if (!str) return null;

  // If date string is 'YYYY-MM-DD'
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
    const [year, month, day] = str.split("-").map(Number);
    // End of that date (23:59:59.999)
    return new Date(year, month - 1, day, 23, 59, 59, 999);
  }

  const d = new Date(str);
  return isNaN(d.getTime()) ? null : d;
}

/**
 * Automatically synchronizes and pauses (sets isActive: false)
 * all Coupons, Special Offers, and Combo Deals whose expiryDate has passed.
 */
async function syncExpiredPromotions() {
  try {
    const Coupon = mongoose.model("Coupon");
    const Offer = mongoose.model("Offer");
    const ComboOffer = mongoose.model("ComboOffer");

    const now = new Date();

    await Promise.all([
      Coupon.updateMany(
        { isActive: true, expiryDate: { $ne: null, $lt: now } },
        { $set: { isActive: false } }
      ),
      Offer.updateMany(
        { isActive: true, expiryDate: { $ne: null, $lt: now } },
        { $set: { isActive: false } }
      ),
      ComboOffer.updateMany(
        { isActive: true, expiryDate: { $ne: null, $lt: now } },
        { $set: { isActive: false } }
      ),
    ]);
  } catch (err) {
    console.error("Error syncing expired promotions:", err.message);
  }
}

module.exports = {
  parseExpiryDate,
  syncExpiredPromotions,
};
