const rateLimit = require("express-rate-limit");

// Reliable client IP resolver behind Cloudflare / Nginx / Reverse Proxies
const getClientIp = (req) => {
  const cfIp = req.headers["cf-connecting-ip"];
  if (cfIp) return cfIp.trim();

  const realIp = req.headers["x-real-ip"];
  if (realIp) return realIp.trim();

  const forwarded = req.headers["x-forwarded-for"];
  if (forwarded) return forwarded.split(",")[0].trim();

  return req.ip || req.socket?.remoteAddress || "127.0.0.1";
};

// Maximum 3 OTP requests per 15 minutes per IP
const otpRequestLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 3, // Limit each IP to 3 OTP requests per 15 minutes
  message: {
    message: "Too many OTP requests from this network. Maximum 3 attempts allowed every 15 minutes. Please try again later.",
  },
  keyGenerator: getClientIp,
  validate: { trustProxy: false, xForwardedForHeader: false },
  standardHeaders: true,
  legacyHeaders: false,
});

// Maximum 3 OTP verify attempts per 15 minutes per IP
const otpVerifyLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 3, // Limit each IP to 3 verify attempts per 15 minutes
  message: {
    message: "Too many incorrect OTP attempts. Maximum 3 attempts allowed every 15 minutes. Please try again later.",
  },
  keyGenerator: getClientIp,
  validate: { trustProxy: false, xForwardedForHeader: false },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = { otpRequestLimiter, otpVerifyLimiter };

