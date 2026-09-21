const User = require("../models/User");
const Otp = require("../models/Otp");
const Product = require("../models/Product");
const generateToken = require("../utils/generateToken");
const { sendWhatsAppMessage } = require("../utils/whatsappService");
const {
  generateOtp,
  hashOtp,
  compareOtp,
  getExpiryDate,
  sendOtpSms,
  OtpDeliveryError,
} = require("../utils/otpService");

const PHONE_REGEX = /^[6-9]\d{9}$/; // basic Indian 10-digit mobile validation

/**
 * POST /api/auth/send-otp
 * body: { phone }
 */
async function sendOtp(req, res, next) {
  try {
    const { phone } = req.body;

    if (!phone || !PHONE_REGEX.test(phone)) {
      return res.status(400).json({ message: "Please provide a valid 10-digit mobile number" });
    }

    // Remove any previous unexpired OTPs for this number before issuing a new one
    await Otp.deleteMany({ phone });

    const otp = generateOtp();
    const hashedOtp = await hashOtp(otp);

    await Otp.create({
      phone,
      hashedOtp,
      expiresAt: getExpiryDate(),
    });

    if (process.env.NODE_ENV !== "production") {
      console.log(`\n========================================\n🔑 [MURTIPUJA OTP] Phone: +91 ${phone}\n👉 Generated OTP: ${otp}\n👉 Dev Master OTP: 123456\n========================================\n`);
    }

    try {
      await sendOtpSms(phone, otp);
    } catch (smsError) {
      if (process.env.NODE_ENV !== "production") {
        console.warn(`[DEV NOTE] SMS delivery warning (${smsError.message}), but allowing dev OTP ${otp} or master OTP 123456`);
        return res.status(200).json({
          message: "OTP sent successfully",
          devOtp: otp,
        });
      }

      // Clean up the OTP record since it was never actually delivered in production
      await Otp.deleteMany({ phone });

      if (smsError instanceof OtpDeliveryError) {
        console.error(`OTP delivery failed for ${phone}:`, smsError.providerResponse || smsError.message);
        return res.status(503).json({
          message: "We couldn't send the OTP right now. Please try again in a few minutes.",
        });
      }
      throw smsError;
    }

    return res.status(200).json({
      message: "OTP sent successfully",
      ...(process.env.NODE_ENV !== "production" ? { devOtp: otp } : {}),
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/auth/verify-otp
 * body: { phone, otp }
 */
async function verifyOtp(req, res, next) {
  try {
    const { phone, otp } = req.body;

    if (!phone || !otp) {
      return res.status(400).json({ message: "Phone and OTP are required" });
    }

    const otpRecord = await Otp.findOne({ phone }).sort({ createdAt: -1 });

    if (!otpRecord || new Date() > new Date(otpRecord.expiresAt)) {
      if (otpRecord) await Otp.deleteMany({ phone });
      return res.status(400).json({
        expired: true,
        message: "OTP has expired. Please click 'Resend OTP' to request a new code.",
      });
    }

    if (otpRecord.attempts >= 5) {
      await Otp.deleteMany({ phone });
      return res.status(429).json({ message: "Too many incorrect attempts. Please request a new OTP." });
    }

    // Support master dev OTP '123456' or '999999' in development
    const isMasterDevOtp = process.env.NODE_ENV !== "production" && (otp === "123456" || otp === "999999");
    let isMatch = isMasterDevOtp;
    if (!isMatch) {
      isMatch = await compareOtp(otp, otpRecord.hashedOtp);
    }

    if (!isMatch) {
      otpRecord.attempts += 1;
      await otpRecord.save();
      return res.status(400).json({ message: "Incorrect OTP" });
    }

    // OTP correct — clean up, then find or create the user
    await Otp.deleteMany({ phone });

    let user = await User.findOne({ phone });
    let isNewUser = false;

    if (!user) {
      user = await User.create({ phone, phoneVerified: true, authProvider: "otp" });
      isNewUser = true;
    } else if (!user.phoneVerified) {
      user.phoneVerified = true;
      await user.save();
    }

    // If user exists but hasn't set an email yet, treat as needing the email step
    if (!user.email) {
      isNewUser = true;
    }

    const token = generateToken(user);

    return res.status(200).json({
      token,
      isNewUser,
      user: {
        id: user._id,
        name: user.name,
        phone: user.phone,
        email: user.email,
        role: user.role,
        isNewUser,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/auth/me
 * Returns the logged-in user's profile (requires `protect` middleware)
 */
async function getMe(req, res) {
  const { _id, name, phone, email, role, addresses, wishlist } = req.user;
  res.status(200).json({ id: _id, name, phone, email, role, addresses, wishlist });
}

async function toggleWishlist(req, res, next) {
  try {
    const { productId } = req.body;
    if (!productId) {
      return res.status(400).json({ message: "Product ID is required" });
    }

    const user = req.user;
    const index = user.wishlist.indexOf(productId);
    let isAdded = false;

    if (index === -1) {
      user.wishlist.push(productId);
      isAdded = true;
    } else {
      user.wishlist.splice(index, 1);
    }

    await user.save();

    // Send WhatsApp notification if a product was added and the user is logged in
    if (isAdded && user.phone) {
      Product.findById(productId)
        .then((product) => {
          if (product) {
            const messageText = `Hi ${user.name || "Customer"},\n\nYou have added "${product.title}" to your Favorites ❤️ on MurtiPuja. Check your wishlist here: http://localhost:3000/wishlist`;
            sendWhatsAppMessage(user.phone, messageText).catch((err) => {
              console.error("Failed to send WhatsApp wishlist notification:", err.message);
            });
          }
        })
        .catch((err) => {
          console.error("Failed to fetch product for WhatsApp notification:", err.message);
        });
    }

    return res.status(200).json(user.wishlist);
  } catch (error) {
    next(error);
  }
}

/**
 * PUT /api/auth/profile
 * body: { email, name }
 * Requires `protect` middleware
 */
async function updateProfile(req, res, next) {
  try {
    const { email, name } = req.body;
    const user = req.user;

    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const cleanEmail = email.toLowerCase().trim();
      if (!emailRegex.test(cleanEmail)) {
        return res.status(400).json({ message: "Please provide a valid email address" });
      }

      // Check if another user already has this email
      const existingUser = await User.findOne({ email: cleanEmail, _id: { $ne: user._id } });
      if (existingUser) {
        return res.status(400).json({ message: "This email is already associated with another account" });
      }

      user.email = cleanEmail;
    }

    if (name && typeof name === "string") {
      user.name = name.trim();
    }

    await user.save();

    return res.status(200).json({
      message: "Profile updated successfully",
      user: {
        id: user._id,
        name: user.name,
        phone: user.phone,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
}

module.exports = { sendOtp, verifyOtp, getMe, toggleWishlist, updateProfile };

