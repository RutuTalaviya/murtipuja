const mongoose = require("mongoose");

// Stores a hashed OTP per phone number. The `expiresAt` field + TTL index
// means MongoDB automatically deletes expired OTP documents on its own.
const otpSchema = new mongoose.Schema({
  phone: { type: String, required: true, index: true },
  hashedOtp: { type: String, required: true },
  attempts: { type: Number, default: 0 },
  expiresAt: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now },
});

// TTL index: MongoDB deletes the document automatically once expiresAt passes
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model("Otp", otpSchema);
