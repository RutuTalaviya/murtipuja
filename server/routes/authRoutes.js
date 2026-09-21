const express = require("express");
const router = express.Router();
const { sendOtp, verifyOtp, getMe, toggleWishlist, updateProfile } = require("../controllers/authController");
const { protect } = require("../middleware/auth");
const { otpRequestLimiter, otpVerifyLimiter } = require("../middleware/rateLimiter");

router.post("/send-otp", otpRequestLimiter, sendOtp);
router.post("/verify-otp", otpVerifyLimiter, verifyOtp);
router.get("/me", protect, getMe);
router.put("/profile", protect, updateProfile);
router.post("/wishlist/toggle", protect, toggleWishlist);

module.exports = router;

