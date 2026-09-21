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
    console.log(`\n========================================\n[DEV MODE] OTP for ${phone}: ${otp}\n========================================\n`);
    const fs = require("fs");
    const path = require("path");
    try {
      fs.writeFileSync(path.join(__dirname, "..", "otp.log"), `OTP for ${phone}: ${otp} (at ${new Date().toISOString()})\n`);
    } catch (e) {
      console.error("Failed to write dev OTP to file:", e.message);
    }
    return { simulated: true };
  }

  try {
    const formattedMobile = phone.startsWith("91") && phone.length === 12
      ? phone
      : phone.startsWith("+91")
      ? phone.slice(1)
      : `91${phone.replace(/\D/g, "")}`;

    let response;
    try {
      response = await axios.post(
        "https://control.msg91.com/api/v5/otp",
        {
          mobile: formattedMobile,
          otp,
          sender: process.env.MSG91_SENDER_ID,
          template_id: process.env.MSG91_TEMPLATE_ID,
          otp_channel: "WHATSAPP", // Deliver OTP via WhatsApp first
        },
        {
          headers: {
            authkey: process.env.MSG91_AUTH_KEY,
            "Content-Type": "application/json",
          },
          timeout: 10000,
        }
      );
    } catch (err) {
      console.warn("WhatsApp OTP attempt returned error, trying standard SMS fallback:", err.response?.data || err.message);
      response = await axios.post(
        "https://control.msg91.com/api/v5/otp",
        {
          mobile: formattedMobile,
          otp,
          sender: process.env.MSG91_SENDER_ID,
          template_id: process.env.MSG91_TEMPLATE_ID,
        },
        {
          headers: {
            authkey: process.env.MSG91_AUTH_KEY,
            "Content-Type": "application/json",
          },
          timeout: 10000,
        }
      );
    }

    // MSG91 returns type: "success" or type: "error" in the body even on HTTP 200,
    // so a successful HTTP response isn't always a successful send.
    if (response.data?.type === "error") {
      console.error("MSG91 returned an error:", response.data);
      throw new OtpDeliveryError(
        "SMS provider could not send the OTP right now",
        response.data
      );
    }

    return response.data;
  } catch (error) {
    if (error instanceof OtpDeliveryError) throw error;

    // Network error, timeout, wallet balance exhausted (401/402-style responses), etc.
    console.error("MSG91 request failed:", error.response?.data || error.message);
    throw new OtpDeliveryError(
      "SMS service is temporarily unavailable. Please try again in a few minutes.",
      error.response?.data
    );
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
