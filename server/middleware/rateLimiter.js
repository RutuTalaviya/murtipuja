const rateLimit = require("express-rate-limit");

// Max 1 OTP request per 60 seconds per IP, and a wider cap of 5 per 15 minutes
const otpRequestLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 1,
  message: { message: "Please wait 60 seconds before requesting another OTP" },
  standardHeaders: true,
  legacyHeaders: false,
});

// Max 5 OTP verify attempts per 15 minutes per IP
const otpVerifyLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { message: "Too many attempts. Please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = { otpRequestLimiter, otpVerifyLimiter };
