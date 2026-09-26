const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const axios = require("axios");

const OTP_LENGTH = 6;
const OTP_EXPIRY_SECONDS = 300; // 5 minutes validity

/** Generates a random numeric OTP, e.g. "482913" */
function generateOtp() {
  const min = 10 ** (OTP_LENGTH - 1);
  const max = 10 ** OTP_LENGTH - 1;
  return crypto.randomInt(min, max).toString();
}

/** Hashes the OTP before storing it in the DB (never store plain text) */
async function hashOtp(otp) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(otp, salt);
}

async function compareOtp(otp, hashedOtp) {
  return bcrypt.compare(otp, hashedOtp);
}

function getExpiryDate() {
  return new Date(Date.now() + OTP_EXPIRY_SECONDS * 1000);
}


/**
 * Custom error type so the controller can tell "SMS provider failed"
 * apart from other kinds of errors, and respond with a friendly message
 * instead of a raw 500 crash.
 */
class OtpDeliveryError extends Error {
  constructor(message, providerResponse) {
    super(message);
    this.name = "OtpDeliveryError";
    this.providerResponse = providerResponse;
  }
}

/**
 * Sends the OTP via MSG91 SMS API.
 * Docs: https://docs.msg91.com/reference/send-otp
 * In development (no MSG91 key set), it just logs the OTP to the console
 * so you can test the flow without spending SMS credits.
 *
 * On failure (e.g. wallet balance exhausted, invalid template, network
 * issue), this throws an `OtpDeliveryError` instead of letting the raw
 * axios error bubble up — the controller catches this specific error and
 * returns a clean, user-friendly message instead of crashing/500-ing.
 */
async function sendOtpSms(phone, otp) {
  if (!process.env.MSG91_AUTH_KEY || process.env.MSG91_AUTH_KEY === "your_msg91_auth_key") {
    console.log(`\n========================================\n[DEV/MOCK OTP] Phone: +91 ${phone} | OTP: ${otp}\n========================================\n`);
    const fs = require("fs");
    const path = require("path");
    try {
      fs.writeFileSync(path.join(__dirname, "..", "otp.log"), `OTP for ${phone}: ${otp} (at ${new Date().toISOString()})\n`);
    } catch (e) {
      console.error("Failed to write dev OTP to file:", e.message);
    }
    return { simulated: true };
  }

  const formattedMobile = phone.startsWith("91") && phone.length === 12
    ? phone
    : phone.startsWith("+91")
    ? phone.slice(1)
    : `91${phone.replace(/\D/g, "")}`;

  try {
    const payload = {
      template_id: process.env.MSG91_TEMPLATE_ID,
      mobile: formattedMobile,
      otp,
      otp_length: 6,
      otp_expiry: 5,
    };

    if (process.env.MSG91_SENDER_ID && process.env.MSG91_SENDER_ID !== "your_msg91_sender_id") {
      payload.sender = process.env.MSG91_SENDER_ID;
    }

    if (process.env.MSG91_CHANNEL === "WHATSAPP") {
      payload.otp_channel = "WHATSAPP";
    }

    console.log(`[MSG91] Sending OTP to ${formattedMobile} with template ${process.env.MSG91_TEMPLATE_ID}...`);

    const response = await axios.post(
      "https://control.msg91.com/api/v5/otp",
      payload,
      {
        headers: {
          authkey: process.env.MSG91_AUTH_KEY,
          "Content-Type": "application/json",
        },
        timeout: 12000,
      }
    );

    console.log("[MSG91 Response]:", response.data);

    if (response.data?.type === "error") {
      const errMsg = response.data?.message || "MSG91 returned an error";
      console.error("[MSG91 Error]:", errMsg);
      throw new OtpDeliveryError(errMsg, response.data);
    }

    return response.data;
  } catch (error) {
    const errorDetails = error.response?.data || error.message;
    console.error("[MSG91 Request Failed]:", errorDetails);

    // Write OTP to fallback log on server so admin can always see it
    const fs = require("fs");
    const path = require("path");
    try {
      fs.writeFileSync(path.join(__dirname, "..", "otp.log"), `OTP for ${phone}: ${otp} (at ${new Date().toISOString()})\n`);
    } catch (e) {}

    const friendlyMsg = error.response?.data?.message || error.message || "Failed to send OTP via SMS";
    throw new OtpDeliveryError(friendlyMsg, error.response?.data);
  }
}

module.exports = {
  generateOtp,
  hashOtp,
  compareOtp,
  getExpiryDate,
  sendOtpSms,
  OtpDeliveryError,
  OTP_LENGTH,
};
