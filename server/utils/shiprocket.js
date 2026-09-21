const axios = require("axios");

let tokenCache = null;
let tokenExpiry = null;

/**
 * Log in to Shiprocket and cache the token for subsequent requests.
 */
async function getShiprocketToken() {
  const now = new Date();
  if (tokenCache && tokenExpiry && now < tokenExpiry) {
    return tokenCache;
  }

  const email = process.env.SHIPROCKET_EMAIL;
  const password = process.env.SHIPROCKET_PASSWORD;

  // For testing/development, if credentials aren't set, output warnings and return mock token
  if (!email || !password || email.includes("your_shiprocket_email")) {
    console.warn("WARNING: Shiprocket credentials are not configured in server/.env. Using mock mode.");
    return "MOCK_SHIPROCKET_TOKEN";
  }

  try {
    const response = await axios.post("https://apiv2.shiprocket.in/v1/external/auth/login", {
      email,
      password,
    });

    tokenCache = response.data.token;
    // Token is valid for 10 days, cache it for 9 days
    tokenExpiry = new Date(now.getTime() + 9 * 24 * 60 * 60 * 1000);
    return tokenCache;
  } catch (error) {
    console.error("Shiprocket Login Error:", error.response?.data || error.message);
    throw new Error("Failed to authenticate with Shiprocket API");
  }
}

/**
 * Creates an order in Shiprocket for a paid/confirmed order in MurtiPuja.
 * @param {Object} order - The MurtiPuja order document
 * @param {Object} user - The user document associated with the order
 */
async function createShiprocketOrder(order, user) {
  const token = await getShiprocketToken();

  // If in mock mode, return simulated details
  if (token === "MOCK_SHIPROCKET_TOKEN") {
    console.log(`[MOCK] Creating Shiprocket order for MurtiPuja Order: ${order.orderNumber}`);
    return {
      order_id: Math.floor(1000000 + Math.random() * 9000000),
      shipment_id: Math.floor(10000000 + Math.random() * 90000000),
      status: "NEW",
    };
  }

  // Format date: "YYYY-MM-DD HH:MM"
  const orderDate = new Date(order.createdAt).toISOString().slice(0, 16).replace("T", " ");

  // Shiprocket needs first and last name separated
  const nameParts = (user.name || "Customer").trim().split(/\s+/);
  const firstName = nameParts[0] || "Customer";
  const lastName = nameParts.slice(1).join(" ") || "Customer";

  // Map items to Shiprocket item structure
  const orderItems = order.items.map((item) => ({
    name: item.title,
    sku: item.variantSku,
    units: item.quantity,
    selling_price: item.price.toString(),
  }));

  const payload = {
    order_id: order.orderNumber,
    order_date: orderDate,
    pickup_location: process.env.SHIPROCKET_PICKUP_LOCATION || "Primary",
    billing_customer_name: firstName,
    billing_last_name: lastName,
    billing_address: order.shippingAddress.addressLine1,
    billing_address_2: order.shippingAddress.addressLine2 || "",
    billing_city: order.shippingAddress.city,
    billing_pincode: order.shippingAddress.pincode,
    billing_state: order.shippingAddress.state,
    billing_country: order.shippingAddress.country || "India",
    billing_email: user.email || "customer@murtipuja.com",
    billing_phone: user.phone,
    shipping_is_billing: true,
    order_items: orderItems,
    payment_method: "Prepaid",
    sub_total: order.subtotal,
    length: 15, // standard 15cm size for Murti package box
    breadth: 15,
    height: 15,
    weight: 0.5, // 500g default weight for Resin/3D printed Murti
  };

  try {
    const response = await axios.post(
      "https://apiv2.shiprocket.in/v1/external/orders/create/adhoc",
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    return response.data; // contains order_id (shiprocket order ID) and shipment_id
  } catch (error) {
    console.error("Shiprocket Order Creation Error:", error.response?.data || error.message);
    throw new Error(
      `Shiprocket order creation failed: ${JSON.stringify(error.response?.data || error.message)}`
    );
  }
}

/**
 * Fetch latest tracking info for a shipment from Shiprocket.
 * @param {string} shipmentId - Shiprocket shipment ID
 */
async function trackShipment(shipmentId) {
  const token = await getShiprocketToken();

  if (token === "MOCK_SHIPROCKET_TOKEN" || shipmentId.toString().startsWith("mock_") || !shipmentId) {
    console.log(`[MOCK] Tracking Shiprocket Shipment ID: ${shipmentId}`);
    return {
      tracking_data: {
        track_status: 1,
        shipment_status: "dispatched",
        awb_code: "AWB1234567890",
      },
    };
  }

  try {
    const response = await axios.get(
      `https://apiv2.shiprocket.in/v1/external/courier/track/shipment/${shipmentId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("Shiprocket Tracking Error:", error.response?.data || error.message);
    throw new Error("Failed to track shipment on Shiprocket");
  }
}

/**
 * Generate/Assign AWB for a Shipment in Shiprocket
 * @param {string} shipmentId - Shiprocket shipment ID
 */
async function generateAwb(shipmentId) {
  const token = await getShiprocketToken();

  if (token === "MOCK_SHIPROCKET_TOKEN" || shipmentId.toString().startsWith("mock_") || !shipmentId) {
    console.log(`[MOCK] Generating AWB for Shipment ID: ${shipmentId}`);
    return {
      awb_code: `SR${Math.floor(1000000000 + Math.random() * 9000000000)}`,
      courier_name: "Blue Dart Express",
      courier_company_id: 1,
      applied_weight: 0.5,
    };
  }

  try {
    const response = await axios.post(
      "https://apiv2.shiprocket.in/v1/external/courier/assign/awb",
      { shipment_id: shipmentId },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    const awbData = response.data?.response?.data || response.data;
    return awbData;
  } catch (error) {
    console.error("Shiprocket AWB Generation Error:", error.response?.data || error.message);
    throw new Error(
      `Shiprocket AWB generation failed: ${JSON.stringify(error.response?.data || error.message)}`
    );
  }
}

/**
 * Generate Shipping Label PDF for a Shipment in Shiprocket
 * @param {string} shipmentId - Shiprocket shipment ID
 */
async function generateLabel(shipmentId) {
  const token = await getShiprocketToken();

  if (token === "MOCK_SHIPROCKET_TOKEN" || shipmentId.toString().startsWith("mock_") || !shipmentId) {
    console.log(`[MOCK] Generating Shipping Label for Shipment ID: ${shipmentId}`);
    return {
      label_created: 1,
      label_url: "https://kr-shipmultichannel.s3.ap-southeast-1.amazonaws.com/mock-sample-label.pdf",
    };
  }

  try {
    const response = await axios.post(
      "https://apiv2.shiprocket.in/v1/external/courier/generate/label",
      { shipment_id: [shipmentId] },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("Shiprocket Label Generation Error:", error.response?.data || error.message);
    throw new Error(
      `Shiprocket Label generation failed: ${JSON.stringify(error.response?.data || error.message)}`
    );
  }
}

module.exports = {
  createShiprocketOrder,
  generateAwb,
  generateLabel,
  trackShipment,
};
