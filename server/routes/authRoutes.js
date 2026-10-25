const express = require("express");
const router = express.Router();
const {
  sendOtp,
  verifyOtp,
  getMe,
  toggleWishlist,
  updateProfile,
  getAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
} = require("../controllers/authController");
const { protect } = require("../middleware/auth");
const { otpRequestLimiter, otpVerifyLimiter } = require("../middleware/rateLimiter");

router.post("/send-otp", otpRequestLimiter, sendOtp);
router.post("/verify-otp", otpVerifyLimiter, verifyOtp);
router.get("/me", protect, getMe);
router.put("/profile", protect, updateProfile);
router.post("/wishlist/toggle", protect, toggleWishlist);

// Address Book management routes
router.get("/addresses", protect, getAddresses);
router.post("/addresses", protect, addAddress);
router.put("/addresses/:id", protect, updateAddress);
router.delete("/addresses/:id", protect, deleteAddress);
router.put("/addresses/:id/default", protect, setDefaultAddress);

module.exports = router;

