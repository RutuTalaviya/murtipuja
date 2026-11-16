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

function formatPhone(phone) {
  let cleaned = String(phone || "").replace(/\D/g, "");
  if (cleaned.startsWith("0")) {
    cleaned = cleaned.substring(1);
  }
  if (cleaned.length === 10) {
    cleaned = "91" + cleaned;
  }
  return cleaned;
}

/**
 * Sends a structured WhatsApp template message with multiple variables.
 * 
 * @param {string} phone - Recipient phone number (e.g. 919876543210 or 9876543210)
 * @param {string} templateName - Approved template name (e.g. order_confirmed, order_shipped, order_delivered)
 * @param {Array<string|number>|Object} params - Array of parameter values [val1, val2, ...] or component object
 */
async function sendWhatsAppTemplate(phone, templateName, params = []) {
  const isDevMode = 
    !process.env.MSG91_AUTH_KEY || 
    process.env.MSG91_AUTH_KEY === "your_msg91_auth_key" || 
    !process.env.MSG91_WHATSAPP_NUMBER ||
    process.env.MSG91_WHATSAPP_NUMBER.includes("your_");

  const cleanPhone = formatPhone(phone);
  const languageCode = process.env.MSG91_WHATSAPP_LANG || "en";

  // Build MSG91 components dictionary
  let components = {};
  if (Array.isArray(params)) {
    params.forEach((val, idx) => {
      components[`body_${idx + 1}`] = {
        type: "text",
        value: String(val ?? "")
      };
    });
  } else if (params && typeof params === "object") {
    components = params;
  }

  if (isDevMode) {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] [Template: ${templateName}] To: ${cleanPhone} | Params: ${JSON.stringify(params)}\n`;
    
    console.log(`\n========================================\n[DEV MODE] WhatsApp Template '${templateName}' to ${cleanPhone}:\n${JSON.stringify(components, null, 2)}\n========================================\n`);
    
    try {
      fs.appendFileSync(path.join(__dirname, "..", "whatsapp.log"), logMessage);
    } catch (e) {
      console.error("Failed to write dev WhatsApp message to file:", e.message);
    }
    return { simulated: true };
  }

  try {
    const response = await axios.post(
      "https://api.msg91.com/api/v5/whatsapp/whatsapp-outbound-message/bulk/",
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
                components
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
      console.error(`MSG91 WhatsApp returned an error for template ${templateName}:`, response.data);
      throw new WhatsAppDeliveryError("WhatsApp provider could not send message", response.data);
    }

    return response.data;
  } catch (error) {
    if (error instanceof WhatsAppDeliveryError) throw error;
    console.error(`MSG91 WhatsApp request failed for template ${templateName}:`, error.response?.data || error.message);
    throw new WhatsAppDeliveryError(
      "WhatsApp service is temporarily unavailable",
      error.response?.data
    );
  }
}

/**
 * Sends a plain fallback WhatsApp message using default template.
 * 
 * @param {string} phone - Recipient phone number
 * @param {string} messageText - Message body text
 */
async function sendWhatsAppMessage(phone, messageText) {
  const templateName = process.env.MSG91_WHATSAPP_TEMPLATE_NAME || "order_confirmed";
  return await sendWhatsAppTemplate(phone, templateName, [messageText]);
}

module.exports = {
  sendWhatsAppTemplate,
  sendWhatsAppMessage,
  formatPhone,
  WhatsAppDeliveryError
};
