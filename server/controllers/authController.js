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

    // Always write generated OTP to otp.log and PM2 console for seamless monitoring
    const fs = require("fs");
    const path = require("path");
    try {
      fs.writeFileSync(
        path.join(__dirname, "..", "otp.log"),
        `Latest OTP for ${phone}: ${otp} (Time: ${new Date().toLocaleTimeString("en-IN")})\n`
      );
    } catch (e) {}

    console.log(`\n========================================\n🔑 [MURTIPUJA OTP] Phone: +91 ${phone}\n👉 Generated OTP: ${otp}\n👉 Testing Master OTP: 123456\n========================================\n`);

    try {
      await sendOtpSms(phone, otp);
    } catch (smsError) {
      console.error(`[OTP Error] Failed to send SMS to ${phone}:`, smsError.message, smsError.providerResponse || "");
      
      if (process.env.NODE_ENV !== "production" || process.env.ALLOW_DEV_FALLBACK === "true") {
        console.warn(`[OTP NOTE] SMS failed (${smsError.message}), but allowing generated OTP for testing.`);
        return res.status(200).json({
          message: `OTP sent (Dev/Log mode: ${otp})`,
          devOtp: otp,
        });
      }

      // In production, return clean descriptive message
      return res.status(400).json({
        message: smsError.message || "Could not deliver OTP. Please check your SMS provider setup.",
      });
    }

    return res.status(200).json({
      message: "OTP sent successfully",
      ...(process.env.NODE_ENV !== "production" ? { devOtp: otp } : {}),
    });
  } catch (error) {
    console.error("[sendOtp unhandled error]:", error);
    return res.status(400).json({ message: error.message || "Failed to process OTP request" });
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

    // Master testing OTP is enabled by default for seamless setup (set ENABLE_MASTER_OTP=false in .env when in strict live production)
    const isMasterOtpEnabled = process.env.ENABLE_MASTER_OTP !== "false";
    const isMasterOtp = isMasterOtpEnabled && (otp === "123456" || otp === "999999" || (process.env.MASTER_OTP && otp === process.env.MASTER_OTP));

    if (!isMasterOtp) {
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

      const isMatch = await compareOtp(otp, otpRecord.hashedOtp);
      if (!isMatch) {
        otpRecord.attempts += 1;
        await otpRecord.save();
        return res.status(400).json({ message: "Incorrect OTP" });
      }
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

/**
 * GET /api/auth/addresses
 * Returns saved addresses for the authenticated user
 */
async function getAddresses(req, res, next) {
  try {
    const user = req.user;
    return res.status(200).json(user.addresses || []);
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/auth/addresses
 * Add a new delivery address
 */
async function addAddress(req, res, next) {
  try {
    const user = req.user;
    const { label, addressLine1, addressLine2, city, state, pincode, isDefault } = req.body;

    if (!addressLine1 || !city || !state || !pincode) {
      return res.status(400).json({ message: "addressLine1, city, state, and pincode are required" });
    }

    const hasAddresses = user.addresses && user.addresses.length > 0;
    const shouldBeDefault = isDefault || !hasAddresses;

    if (shouldBeDefault && user.addresses) {
      user.addresses.forEach((addr) => {
        addr.isDefault = false;
      });
    }

    const newAddress = {
      label: label || "Home",
      addressLine1: addressLine1.trim(),
      addressLine2: (addressLine2 || "").trim(),
      city: city.trim(),
      state: state.trim(),
      pincode: pincode.trim(),
      country: "India",
      isDefault: shouldBeDefault,
    };

    user.addresses.push(newAddress);
    await user.save();

    return res.status(201).json({
      message: "Address saved successfully",
      addresses: user.addresses,
      address: user.addresses[user.addresses.length - 1],
    });
  } catch (error) {
    next(error);
  }
}

/**
 * PUT /api/auth/addresses/:id
 * Update an existing address
 */
async function updateAddress(req, res, next) {
  try {
    const user = req.user;
    const addressId = req.params.id;
    const { label, addressLine1, addressLine2, city, state, pincode, isDefault } = req.body;

    const address = user.addresses.id(addressId);
    if (!address) {
      return res.status(404).json({ message: "Address not found" });
    }

    if (isDefault) {
      user.addresses.forEach((addr) => {
        addr.isDefault = false;
      });
      address.isDefault = true;
    }

    if (label) address.label = label;
    if (addressLine1) address.addressLine1 = addressLine1.trim();
    if (addressLine2 !== undefined) address.addressLine2 = addressLine2.trim();
    if (city) address.city = city.trim();
    if (state) address.state = state.trim();
    if (pincode) address.pincode = pincode.trim();

    await user.save();

    return res.status(200).json({
      message: "Address updated successfully",
      addresses: user.addresses,
      address,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * DELETE /api/auth/addresses/:id
 * Delete a saved address
 */
async function deleteAddress(req, res, next) {
  try {
    const user = req.user;
    const addressId = req.params.id;

    const addressIndex = user.addresses.findIndex((a) => a._id.toString() === addressId);
    if (addressIndex === -1) {
      return res.status(404).json({ message: "Address not found" });
    }

    const wasDefault = user.addresses[addressIndex].isDefault;
    user.addresses.splice(addressIndex, 1);

    // If deleted address was default, make the first remaining address default
    if (wasDefault && user.addresses.length > 0) {
      user.addresses[0].isDefault = true;
    }

    await user.save();

    return res.status(200).json({
      message: "Address removed successfully",
      addresses: user.addresses,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * PUT /api/auth/addresses/:id/default
 * Set an address as default
 */
async function setDefaultAddress(req, res, next) {
  try {
    const user = req.user;
    const addressId = req.params.id;

    const address = user.addresses.id(addressId);
    if (!address) {
      return res.status(404).json({ message: "Address not found" });
    }

    user.addresses.forEach((addr) => {
      addr.isDefault = false;
    });
    address.isDefault = true;

    await user.save();

    return res.status(200).json({
      message: "Default address updated",
      addresses: user.addresses,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
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
};

