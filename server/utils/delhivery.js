const axios = require("axios");

/**
 * Delhivery One (Express B2C Logistics) Integration Helper
 * Documentation: https://one.delhivery.com/ & https://delhivery-express.freshdesk.com/
 */

function getBaseUrl() {
  const isSandbox = process.env.DELHIVERY_SANDBOX === "true";
  return isSandbox
    ? "https://staging-express.delhivery.com"
    : "https://track.delhivery.com";
}

function getApiToken() {
  return (process.env.DELHIVERY_API_TOKEN || "").trim();
}

/**
 * Create/Book a B2C Express Shipment with Delhivery One
 * @param {Object} order - MurtiPuja Order document
 * @param {Object} user - Customer document
 */
async function createDelhiveryShipment(order, user = {}) {
  const token = getApiToken();

  if (!token || token.includes("your_delhivery_api_token")) {
    console.warn("WARNING: DELHIVERY_API_TOKEN not configured in server/.env. Using mock mode.");
    const mockWaybill = "DEL" + Math.floor(100000000000 + Math.random() * 900000000000);
    return {
      success: true,
      isMock: true,
      waybill: mockWaybill,
      courierPartner: "Delhivery Express",
      status: "Manifested",
      message: `[MOCK] Delhivery shipment booked for Order ${order.orderNumber}. Waybill: ${mockWaybill}`,
    };
  }

  const baseUrl = getBaseUrl();
  const pickupLocation = process.env.DELHIVERY_PICKUP_LOCATION || "Surat Studio";

  // Calculate package weight & dimensions
  // Default: 500 grams per murti, 15x15x15 cm box
  const totalItems = order.items.reduce((sum, item) => sum + (item.quantity || 1), 0);
  const packageWeightGrams = Math.max(500, totalItems * 450);
  const productsDesc = order.items.map((i) => `${i.title} (${i.size || "Standard"}/${i.finish || "Matte"}) x${i.quantity}`).join(", ").slice(0, 200);

  const customerName = (user.name || order.shippingAddress.name || "Customer").trim();
  const customerPhone = (order.shippingAddress.phone || user.phone || "").replace(/\D/g, "");

  const shipmentData = {
    shipments: [
      {
        name: customerName,
        add: `${order.shippingAddress.addressLine1} ${order.shippingAddress.addressLine2 || ""}`.trim(),
        pin: order.shippingAddress.pincode,
        city: order.shippingAddress.city,
        state: order.shippingAddress.state,
        country: order.shippingAddress.country || "India",
        phone: customerPhone,
        order: order.orderNumber,
        payment_mode: "Prepaid",
        return_pin: process.env.DELHIVERY_RETURN_PINCODE || "395007",
        return_city: process.env.DELHIVERY_RETURN_CITY || "Surat",
        return_state: process.env.DELHIVERY_RETURN_STATE || "Gujarat",
        return_country: "India",
        return_add: process.env.DELHIVERY_RETURN_ADDRESS || "MurtiPuja Headquarters, Ring Road, Surat",
        return_name: process.env.DELHIVERY_RETURN_NAME || "MurtiPuja Studio",
        return_phone: process.env.DELHIVERY_RETURN_PHONE || "+919664737035",
        products_desc: productsDesc,
        order_date: new Date(order.createdAt).toISOString().slice(0, 19).replace("T", " "),
        total_amount: Number(order.totalAmount || 0),
        cod_amount: 0,
        seller_add: process.env.DELHIVERY_RETURN_ADDRESS || "MurtiPuja Headquarters, Ring Road, Surat",
        seller_name: "MurtiPuja",
        seller_inv: order.orderNumber,
        quantity: String(totalItems),
        waybill: "", // Auto-assigned by Delhivery
        shipment_width: 15,
        shipment_height: 15,
        shipment_depth: 15,
        weight: packageWeightGrams,
        pickup_location: pickupLocation,
      },
    ],
    pickup_location: {
      name: pickupLocation,
    },
  };

  try {
    const postData = `format=json&data=${encodeURIComponent(JSON.stringify(shipmentData))}`;

    const response = await axios.post(`${baseUrl}/api/cmu/create.json`, postData, {
      headers: {
        Authorization: `Token ${token}`,
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "application/json",
      },
      timeout: 20000,
    });

    const resData = response.data;
    console.log("Delhivery CMU Response:", JSON.stringify(resData));

    if (resData.packages && resData.packages.length > 0) {
      const pkg = resData.packages[0];
      if (pkg.status === "Fail") {
        const errorMsg = (pkg.remarks && pkg.remarks.join(", ")) || "Delhivery booking failed";
        throw new Error(errorMsg);
      }

      return {
        success: true,
        waybill: pkg.waybill || pkg.wb,
        refnum: pkg.refnum || order.orderNumber,
        status: pkg.status || "Success",
        courierPartner: "Delhivery Express",
        remarks: pkg.remarks,
        rawResponse: resData,
      };
    }

    if (resData.success === false || resData.error) {
      throw new Error(resData.error || resData.message || "Failed to create Delhivery shipment");
    }

    return {
      success: true,
      waybill: resData.waybill || resData.upload_wbn,
      courierPartner: "Delhivery Express",
      rawResponse: resData,
    };
  } catch (error) {
    const errDetails = error.response?.data || error.message;
    console.error("Delhivery Booking Error:", errDetails);
    throw new Error(typeof errDetails === "string" ? errDetails : JSON.stringify(errDetails));
  }
}

/**
 * Track an existing shipment via Delhivery Live Tracking API
 * @param {string} waybill - Delhivery Waybill / AWB Number
 */
async function trackDelhiveryShipment(waybill) {
  const token = getApiToken();

  if (!token || token.includes("your_delhivery_api_token")) {
    return {
      success: true,
      isMock: true,
      waybill,
      status: "In Transit",
      location: "Surat Central Hub, Gujarat",
      expectedDelivery: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
      scans: [
        {
          scanDateTime: new Date().toISOString(),
          location: "Surat Logistics Hub",
          status: "In Transit",
          activity: "Package dispatched via Air Cargo Express",
          instructions: "On schedule",
        },
        {
          scanDateTime: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
          location: "MurtiPuja Surat Studio",
          status: "Manifested",
          activity: "Sacred murti packed & handed over to Delhivery courier executive",
          instructions: "Pickup completed",
        },
      ],
    };
  }

  const baseUrl = getBaseUrl();

  try {
    const response = await axios.get(`${baseUrl}/api/v1/packages/json/?waybill=${encodeURIComponent(waybill)}`, {
      headers: {
        Authorization: `Token ${token}`,
        Accept: "application/json",
      },
      timeout: 15000,
    });

    const data = response.data;
    const shipmentData = data.ShipmentData?.[0]?.Shipment;

    if (!shipmentData) {
      return {
        success: false,
        message: "No tracking data found for this Waybill in Delhivery.",
        raw: data,
      };
    }

    const currentStatusObj = shipmentData.Status || {};
    const scansList = (shipmentData.Scans || []).map((s) => {
      const scan = s.ScanDetail || {};
      return {
        scanDateTime: scan.ScanDateTime || scan.ScannedDateTime,
        location: scan.ScannedLocation || scan.ScanLocation || "",
        status: scan.ScanType || scan.Scan,
        activity: scan.Instructions || scan.Comment || scan.ScanType || "Status Updated",
        instructions: scan.Instructions || "",
      };
    });

    return {
      success: true,
      waybill,
      status: currentStatusObj.Status || currentStatusObj.StatusType || "In Transit",
      statusType: currentStatusObj.StatusType,
      statusCode: currentStatusObj.StatusCode,
      location: currentStatusObj.StatusLocation || "",
      statusDateTime: currentStatusObj.StatusDateTime,
      expectedDelivery: shipmentData.ExpectedDeliveryDate || null,
      origin: shipmentData.Origin,
      destination: shipmentData.Destination,
      consignee: shipmentData.Consignee?.Name,
      scans: scansList,
      raw: shipmentData,
    };
  } catch (error) {
    console.error("Delhivery Track Error:", error.response?.data || error.message);
    throw new Error(error.response?.data?.message || error.message || "Failed to fetch Delhivery tracking data");
  }
}

/**
 * Generate Shipping Label / Packing Slip URL for Delhivery Waybill
 * @param {string} waybill - Delhivery Waybill Number
 */
async function generateDelhiveryLabel(waybill) {
  const token = getApiToken();
  const baseUrl = getBaseUrl();

  if (!token || token.includes("your_delhivery_api_token")) {
    return {
      success: true,
      isMock: true,
      waybill,
      labelUrl: `https://track.delhivery.com/api/p/packing_slip?wbns=${waybill}&pdf=true`,
    };
  }

  try {
    // Delhivery packing slip URL
    const labelUrl = `${baseUrl}/api/p/packing_slip?wbns=${encodeURIComponent(waybill)}&pdf=true`;
    return {
      success: true,
      waybill,
      labelUrl,
    };
  } catch (error) {
    console.error("Delhivery Label Error:", error.message);
    throw new Error("Failed to generate Delhivery shipping label");
  }
}

/**
 * Check Pincode Serviceability with Delhivery
 * @param {string} pincode - 6-digit Indian PIN code
 */
async function checkDelhiveryPincode(pincode) {
  const token = getApiToken();
  if (!token || token.includes("your_delhivery_api_token")) {
    return {
      serviceable: true,
      pincode,
      prepaid: true,
      cod: false,
      state: "Gujarat",
      city: "Surat",
    };
  }

  const baseUrl = getBaseUrl();
  try {
    const response = await axios.get(`${baseUrl}/c/api/pin-codes/json/?filter_codes=${pincode}`, {
      headers: {
        Authorization: `Token ${token}`,
      },
      timeout: 10000,
    });

    const data = response.data;
    const pinInfo = data.delivery_codes?.[0]?.postal_code;
    if (pinInfo) {
      return {
        serviceable: pinInfo.pre_paid === "Y",
        pincode,
        prepaid: pinInfo.pre_paid === "Y",
        cod: pinInfo.cod === "Y",
        city: pinInfo.district || pinInfo.city,
        state: pinInfo.state,
      };
    }
    return { serviceable: false, pincode };
  } catch (error) {
    console.error("Delhivery Pincode Error:", error.message);
    return { serviceable: true, pincode }; // Graceful fallback
  }
}

module.exports = {
  createDelhiveryShipment,
  trackDelhiveryShipment,
  generateDelhiveryLabel,
  checkDelhiveryPincode,
};
