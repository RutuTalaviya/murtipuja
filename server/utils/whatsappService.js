const axios = require("axios");
const fs = require("fs");
const path = require("path");

class WhatsAppDeliveryError extends Error {
  constructor(message, providerResponse) {
    super(message);
    this.name = "WhatsAppDeliveryError";
    this.providerResponse = providerResponse;
  }
}

/**
 * Sends a WhatsApp message.
 * Falls back to local logging in development mode.
 * 
 * @param {string} phone - Recipient phone number (with country code, e.g. 919876543210)
 * @param {string} messageText - Message body text
 */
async function sendWhatsAppMessage(phone, messageText) {
  // If MSG91 is not configured, fallback to local logging
  const isDevMode = 
    !process.env.MSG91_AUTH_KEY || 
    process.env.MSG91_AUTH_KEY === "your_msg91_auth_key" || 
    !process.env.MSG91_WHATSAPP_NUMBER;

  if (isDevMode) {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] To: ${phone} | Message: "${messageText}"\n`;
    
    console.log(`\n========================================\n[DEV MODE] WhatsApp Message sent to ${phone}:\n${messageText}\n========================================\n`);
    
    try {
      // Append to server/whatsapp.log file
      fs.appendFileSync(path.join(__dirname, "..", "whatsapp.log"), logMessage);
    } catch (e) {
      console.error("Failed to write dev WhatsApp message to file:", e.message);
    }
    return { simulated: true };
  }

  // If MSG91 keys are set, make request to MSG91 WhatsApp API
  try {
    const templateName = process.env.MSG91_WHATSAPP_TEMPLATE_NAME || "default_notification";
    const languageCode = process.env.MSG91_WHATSAPP_LANG || "en";
    
    // Ensure phone has proper format (typically digits only)
    const cleanPhone = phone.replace(/\D/g, "");

    const response = await axios.post(
      "https://control.msg91.com/api/v5/whatsapp/whatsapp-outbound-message/bulk",
      {
        integrated_number: process.env.MSG91_WHATSAPP_NUMBER,
        content_type: "template",
        payload: {
          type: "template",
          template: {
            name: templateName,
            language: {
              code: languageCode,
              policy: "deterministic"
            },
            to_and_components: [
              {
                to: [cleanPhone],
                components: {
                  body_1: {
                    type: "text",
                    value: messageText
                  }
                }
              }
            ]
          }
        }
      },
      {
        headers: {
          authkey: process.env.MSG91_AUTH_KEY,
          "Content-Type": "application/json"
        },
        timeout: 10000
      }
    );

    if (response.data?.type === "error") {
      console.error("MSG91 WhatsApp returned an error:", response.data);
      throw new WhatsAppDeliveryError("WhatsApp provider could not send message", response.data);
    }

    return response.data;
  } catch (error) {
    if (error instanceof WhatsAppDeliveryError) throw error;
    console.error("MSG91 WhatsApp request failed:", error.response?.data || error.message);
    throw new WhatsAppDeliveryError(
      "WhatsApp service is temporarily unavailable",
      error.response?.data
    );
  }
}

module.exports = {
  sendWhatsAppMessage,
  WhatsAppDeliveryError
};
