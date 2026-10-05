const Order = require("../models/Order");
const Cart = require("../models/Cart");
const Product = require("../models/Product");
const Coupon = require("../models/Coupon");
const User = require("../models/User");
const razorpay = require("../config/razorpay");
const crypto = require("crypto");
const { calculateCartDiscounts } = require("../utils/discountCalculator");

/**
 * POST /api/coupons/validate
 * body: { code, orderValue }
 */
async function validateCoupon(req, res, next) {
  try {
    const { code, orderValue } = req.body;
    if (!code) {
      return res.status(400).json({ message: "Coupon code is required" });
    }

    const coupon = await Coupon.findOne({
      code: code.toUpperCase().trim(),
      isActive: true,
      expiryDate: { $gt: new Date() },
    });

    if (!coupon) {
      return res.status(404).json({ message: "Coupon code is invalid or expired" });
    }

    if (orderValue < coupon.minOrderValue) {
      return res.status(400).json({
        message: `Minimum order value of ₹${coupon.minOrderValue} is required to use this coupon`,
      });
    }

    if (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit) {
      return res.status(400).json({ message: "Coupon code usage limit has been reached" });
    }

    return res.status(200).json(coupon);
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/orders/create
 * body: { shippingAddress, billingAddress, couponCode, offerId, returnPolicyAcknowledged }
 */
async function createOrder(req, res, next) {
  try {
    const { shippingAddress, billingAddress, couponCode, offerId, returnPolicyAcknowledged } = req.body;

    if (!returnPolicyAcknowledged) {
      return res.status(400).json({
        message: "You must acknowledge and agree to the unboxing video policy.",
      });
    }

    // 1. Fetch user's cart
    const cart = await Cart.findOne({ user: req.user._id }).populate("items.product");
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: "Your cart is empty" });
    }

    // 2. Validate products, prices, and stock
    const orderItems = [];

    for (const item of cart.items) {
      const product = item.product;
      if (!product) {
        return res.status(400).json({ message: `Product not found` });
      }

      const variant = product.variants.find((v) => v.sku === item.variantSku);
      if (!variant) {
        return res.status(400).json({ message: `Variant SKU ${item.variantSku} not found` });
      }

      if (variant.stock < item.quantity) {
        return res.status(400).json({
          message: `Product '${product.title}' (${variant.size}/${variant.finish}) is out of stock. Available: ${variant.stock}`,
        });
      }

      const price = Boolean(product.isOnSale && variant.discountPrice && variant.discountPrice < variant.price)
        ? variant.discountPrice
        : variant.price;

      orderItems.push({
        product: product._id,
        variantSku: item.variantSku,
        title: product.title,
        image: product.images?.[0]?.url || "",
        size: variant.size,
        finish: variant.finish,
        price,
        quantity: item.quantity,
      });
    }

    // 3. Run discount calculation utility
    const calculations = await calculateCartDiscounts(cart.items, couponCode, offerId);

    if (couponCode && calculations.couponError) {
      return res.status(400).json({ message: calculations.couponError });
    }

    if (offerId && calculations.offerError) {
      return res.status(400).json({ message: calculations.offerError });
    }


    const {
      subtotal,
      shippingFee,
      totalDiscount,
      comboDiscount,
      autoOfferDiscount,
      tax,
      totalAmount,
      appliedCombos,
      appliedOffers,
      appliedCouponCode,
    } = calculations;

    // 6. Generate order number (MP-YYYY-Random)
    const year = new Date().getFullYear();
    const rand = Math.floor(10000 + Math.random() * 90000); // 5 digit random number
    const orderNumber = `MP-${year}-${rand}`;

    // 7. Create DB entry for Order
    const order = await Order.create({
      orderNumber,
      user: req.user._id,
      items: orderItems,
      shippingAddress,
      billingAddress,
      subtotal,
      shippingFee,
      discount: totalDiscount,
      comboDiscount,
      autoOfferDiscount,
      tax,
      totalAmount,
      couponApplied: appliedCouponCode || undefined,
      appliedComboOffers: appliedCombos.map((c) => c.title),
      appliedAutoOffers: appliedOffers.map((o) => o.title),
      returnPolicyAcknowledged,
      acknowledgedAt: new Date(),
      paymentMethod: "razorpay",
      paymentStatus: "pending",
      orderStatus: "placed",
      statusHistory: [{ status: "placed" }],
    });

    // 8. Create Razorpay order
    const rpOptions = {
      amount: totalAmount * 100, // in paisa
      currency: "INR",
      receipt: order._id.toString(),
    };

    let razorpayOrder;
    try {
      razorpayOrder = await razorpay.orders.create(rpOptions);
    } catch (rpErr) {
      console.error("Razorpay order creation failed:", rpErr);
      // Clean up local order to avoid dangling records
      await Order.findByIdAndDelete(order._id);
      return res.status(502).json({
        message: "Failed to initialize payment gateway. Please try again.",
      });
    }

    // 9. Save Razorpay Order ID to database order
    order.paymentInfo = {
      razorpayOrderId: razorpayOrder.id,
    };
    await order.save();

    const razorpayKeyId = process.env.RAZORPAY_KEY_ID || "rzp_live_TcNNAglqRPpV08";
    return res.status(201).json({ order, razorpayOrder, razorpayKeyId });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/payment/razorpay/verify
 * body: { orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature }
 */
async function verifyRazorpayPayment(req, res, next) {
  try {
    const { orderId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;

    if (!orderId || !razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      return res.status(400).json({ message: "All payment credentials are required" });
    }

    // 1. Verify Razorpay Signature
    const keySecret = process.env.RAZORPAY_KEY_SECRET || "rzp_test_secret_placeholder";
    const hmac = crypto.createHmac("sha256", keySecret);
    hmac.update(razorpayOrderId + "|" + razorpayPaymentId);
    const generatedSignature = hmac.digest("hex");

    if (generatedSignature !== razorpaySignature) {
      // Set order payment as failed
      await Order.findByIdAndUpdate(orderId, {
        paymentStatus: "failed",
      });
      return res.status(400).json({ message: "Invalid payment signature verification" });
    }

    // 2. Fetch and confirm order
    const order = await Order.findById(orderId).populate("user");
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.paymentStatus === "paid") {
      return res.status(200).json({ success: true, message: "Order already confirmed" });
    }

    order.paymentStatus = "paid";
    order.orderStatus = "confirmed";
    order.paymentInfo = {
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
    };
    order.statusHistory.push({ status: "confirmed" });
    await order.save();

    // Trigger Shiprocket Order Creation
    try {
      const shiprocket = require("../utils/shiprocket");
      const srData = await shiprocket.createShiprocketOrder(order, order.user);
      if (srData) {
        order.shiprocketOrderId = srData.order_id?.toString();
        order.shiprocketShipmentId = srData.shipment_id?.toString();
        await order.save();
        console.log(`Shiprocket order created successfully. Order ID: ${order.shiprocketOrderId}, Shipment ID: ${order.shiprocketShipmentId}`);
      }
    } catch (srErr) {
      console.error("Failed to automatically create Shiprocket order for tracking:", srErr.message);
    }

    // 3. Deduct variant stock
    for (const item of order.items) {
      const product = await Product.findById(item.product);
      if (product) {
        const variant = product.variants.find((v) => v.sku === item.variantSku);
        if (variant) {
          variant.stock = Math.max(0, variant.stock - item.quantity);
          await product.save();
        }
      }
    }

    // 4. Update coupon usage
    if (order.couponApplied) {
      const coupon = await Coupon.findOne({ code: order.couponApplied });
      if (coupon) {
        coupon.usedCount += 1;
        await coupon.save();
      }
    }

    // 5. Clear User's Cart
    await Cart.deleteOne({ user: order.user });

    return res.status(200).json({ success: true, order });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/orders/my-orders
 * (Authenticated)
 */
async function getMyOrders(req, res, next) {
  try {
    const orders = await Order.find({ user: req.user._id }).sort("-createdAt");
    return res.status(200).json(orders);
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/orders/:id
 * (Authenticated)
 */
async function getOrderById(req, res, next) {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    // Ensure the user owns the order, or is an admin
    if (order.user.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized to view this order" });
    }
    return res.status(200).json(order);
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/orders/:id/return-request
 * (Authenticated)
 * body: { reason, unboxingVideoUrl }
 */
async function createReturnRequest(req, res, next) {
  try {
    const { requestType, reason, claimReasonType, unboxingVideoUrl, exchangeVariantSku } = req.body;

    if (!requestType || !claimReasonType || !reason) {
      return res.status(400).json({ message: "Request type, reason, and claim type are required" });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to modify this order" });
    }

    if (order.orderStatus !== "delivered") {
      return res.status(400).json({ message: "Return/Exchange claims can only be requested for delivered orders" });
    }

    // Check 7-day claim window
    const deliveredHistoryItem = order.statusHistory?.find((h) => h.status === "delivered");
    const deliveredDate = deliveredHistoryItem ? new Date(deliveredHistoryItem.updatedAt) : new Date(order.updatedAt);
    const diffDays = Math.ceil((new Date() - deliveredDate) / (1000 * 60 * 60 * 24));
    if (diffDays > 7) {
      return res.status(400).json({ message: "Return or exchange requests must be filed within 7 days of delivery" });
    }

    // Refunds are only permitted for damaged goods
    if (requestType === "return" && claimReasonType !== "damage") {
      return res.status(400).json({ message: "Return and refund requests are only allowed if the product arrived damaged" });
    }

    // Unboxing video proof is strictly compulsory for all return and exchange claims
    if (!unboxingVideoUrl) {
      return res.status(400).json({ message: "A valid unboxing video proof is compulsory for all return and exchange claims" });
    }

    order.returnRequest = {
      isRequested: true,
      requestType,
      claimReasonType,
      exchangeVariantSku: requestType === "exchange" ? exchangeVariantSku : undefined,
      reason,
      unboxingVideoUrl: unboxingVideoUrl,
      unboxingVideoVerified: false,
      status: "requested",
      requestedAt: new Date(),
    };
    await order.save();

    return res.status(200).json(order);
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/admin/orders
 * (Admin only)
 */
async function getAllOrders(req, res, next) {
  try {
    const orders = await Order.find({}).populate("user", "name phone email").sort("-createdAt");
    return res.status(200).json(orders);
  } catch (error) {
    next(error);
  }
}

/**
 * PUT /api/orders/:id/status
 * (Admin only)
 * body: { status }
 */
async function updateOrderStatus(req, res, next) {
  try {
    const { status, trackingId, awbNumber, courierPartner } = req.body;
    const order = await Order.findById(req.params.id).populate("user");
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    const previousStatus = order.orderStatus;
    if (status) {
      order.orderStatus = status;
      order.statusHistory.push({ status, updatedAt: new Date() });
    }

    if (trackingId !== undefined || awbNumber !== undefined) {
      const awb = (trackingId || awbNumber || "").trim();
      order.trackingId = awb;
      order.awbNumber = awb;
    }

    if (courierPartner !== undefined) {
      order.courierPartner = (courierPartner || "").trim();
    }

    // If manually confirming an order from placed, trigger Shiprocket and deduct stock
    if (status === "confirmed" && previousStatus === "placed") {
      // Trigger Shiprocket Order Creation if not already present
      if (!order.shiprocketOrderId) {
        try {
          const shiprocket = require("../utils/shiprocket");
          const srData = await shiprocket.createShiprocketOrder(order, order.user);
          if (srData) {
            order.shiprocketOrderId = srData.order_id?.toString();
            order.shiprocketShipmentId = srData.shipment_id?.toString();
          }
        } catch (srErr) {
          console.error(`Failed to create Shiprocket order for manually confirmed order ${order.orderNumber}:`, srErr.message);
        }
      }

      // Deduct variant stock
      for (const item of order.items) {
        const product = await Product.findById(item.product);
        if (product) {
          const variant = product.variants.find((v) => v.sku === item.variantSku);
          if (variant) {
            variant.stock = Math.max(0, variant.stock - item.quantity);
            await product.save();
          }
        }
      }
    }

    // If cancelling a confirmed order, restore stock
    if (status === "cancelled" && previousStatus !== "placed" && previousStatus !== "cancelled" && previousStatus !== "returned") {
      for (const item of order.items) {
        const product = await Product.findById(item.product);
        if (product) {
          const variant = product.variants.find((v) => v.sku === item.variantSku);
          if (variant) {
            variant.stock = variant.stock + item.quantity;
            await product.save();
          }
        }
      }
    }

    await order.save();

    return res.status(200).json(order);
  } catch (error) {
    next(error);
  }
}

/**
 * PUT /api/orders/:id/return-request/review
 * (Admin only)
 * body: { status, unboxingVideoVerified } // status = 'approved' | 'rejected'
 */
async function reviewReturnRequest(req, res, next) {
  try {
    const { status, unboxingVideoVerified } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (!order.returnRequest?.isRequested) {
      return res.status(400).json({ message: "No active claim request found for this order" });
    }

    if (status === "approved" && order.returnRequest.claimReasonType === "damage" && !unboxingVideoVerified) {
      return res.status(400).json({ message: "Cannot approve damage claim without verifying unboxing video." });
    }

    order.returnRequest.status = status;
    order.returnRequest.unboxingVideoVerified = unboxingVideoVerified || false;
    order.returnRequest.resolvedAt = new Date();

    await order.save();
    return res.status(200).json(order);
  } catch (error) {
    next(error);
  }
}

// @desc    Mark returned item as received at warehouse, process refund or complete exchange
// @route   PUT /api/orders/:id/return-request/receive
// @access  Private/Admin
async function markReturnReceived(req, res, next) {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (!order.returnRequest?.isRequested || order.returnRequest.status !== "approved") {
      return res.status(400).json({ message: "Return request must be approved first" });
    }

    order.returnRequest.status = "received";

    if (order.returnRequest.requestType === "return") {
      // Process Razorpay automatic refund
      const paymentId = order.paymentInfo?.razorpayPaymentId;
      if (!paymentId) {
        return res.status(400).json({
          message: "Cannot process automatic refund. Razorpay Payment ID not found on this order."
        });
      }

      if (order.paymentStatus === "refunded") {
        return res.status(400).json({ message: "This order has already been refunded." });
      }

      try {
        const keyId = process.env.RAZORPAY_KEY_ID || "";
        const keySecret = process.env.RAZORPAY_KEY_SECRET || "";

        if (!keyId || !keySecret || keyId.includes("your_") || keyId.includes("placeholder")) {
          console.warn("WARNING: Razorpay credentials are using placeholders. Simulating refund.");
          order.paymentInfo.razorpayRefundId = "rfnd_mock_" + Math.floor(100000 + Math.random() * 900000);
        } else {
          console.log(`Initiating automatic Razorpay refund for Payment ID: ${paymentId}`);
          const refundResponse = await razorpay.payments.refund(paymentId, {
            amount: order.totalAmount * 100, // in paise
            notes: {
              reason: `Return received at warehouse. Refund approved for order ${order.orderNumber}`,
            }
          });
          console.log("Razorpay refund processed successfully:", refundResponse.id);
          order.paymentInfo.razorpayRefundId = refundResponse.id;
        }
      } catch (refundErr) {
        console.error("Razorpay Automatic Refund Failed:", refundErr.message || refundErr);
        return res.status(502).json({
          message: `Failed to process refund on Razorpay: ${refundErr.description || refundErr.message || "Unknown error"}`
        });
      }

      order.orderStatus = "returned";
      order.paymentStatus = "refunded";
      order.returnRequest.status = "completed";
      order.returnRequest.refundProcessedAt = new Date();
      order.statusHistory.push({ status: "returned", updatedAt: new Date() });
    } else if (order.returnRequest.requestType === "exchange") {
      // Process replacement SKU stock adjustment
      const targetSku = order.returnRequest.exchangeVariantSku;
      if (targetSku) {
        const product = await Product.findOne({ "variants.sku": targetSku });
        if (product) {
          const variant = product.variants.find((v) => v.sku === targetSku);
          if (variant) {
            variant.stock = Math.max(0, variant.stock - 1);
            await product.save();
            console.log(`Decremented replacement variant SKU ${targetSku} stock by 1.`);
          }
        }
      }

      order.returnRequest.status = "completed";
      order.returnRequest.resolvedAt = new Date();
      order.statusHistory.push({ status: "replacement_shipped", updatedAt: new Date() });
    }

    await order.save();
    return res.status(200).json(order);
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/admin/dashboard
 * (Admin only)
 */
async function getAdminDashboard(req, res, next) {
  try {
    // 1. Total revenue
    const revenueData = await Order.aggregate([
      { $match: { paymentStatus: "paid" } },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } },
    ]);
    const totalRevenue = revenueData[0]?.total || 0;

    // 2. Total orders count
    const totalOrders = await Order.countDocuments({ paymentStatus: "paid" });

    // 3. Low stock alerts (variant stock < 5)
    const products = await Product.find({});
    const lowStockProducts = [];
    products.forEach((p) => {
      p.variants.forEach((v) => {
        if (v.stock < 5) {
          lowStockProducts.push({
            productId: p._id,
            title: p.title,
            sku: v.sku,
            size: v.size,
            finish: v.finish,
            stock: v.stock,
          });
        }
      });
    });

    // 4. Return requests count
    const activeReturnRequests = await Order.countDocuments({
      "returnRequest.isRequested": true,
      "returnRequest.status": "requested",
    });

    return res.status(200).json({
      totalRevenue,
      totalOrders,
      lowStockProducts,
      activeReturnRequests,
    });
  } catch (error) {
    next(error);
  }
}

async function handleShiprocketWebhook(req, res, next) {
  try {
    const { event, awb, order_id, current_status } = req.body;

    console.log(`Shiprocket Webhook received. Event: ${event}, Order ID: ${order_id}, Status: ${current_status}`);

    if (!order_id) {
      return res.status(400).json({ message: "order_id is required in webhook body" });
    }

    const order = await Order.findOne({ orderNumber: order_id });
    if (!order) {
      return res.status(404).json({ message: `Order ${order_id} not found` });
    }

    if (awb) {
      order.awbNumber = awb;
      order.trackingId = awb;
    }

    const statusLower = (current_status || event || "").toLowerCase();
    let newStatus = null;

    if (statusLower.includes("shipped") || statusLower.includes("transit") || statusLower.includes("dispatched")) {
      newStatus = "shipped";
    } else if (statusLower.includes("out_for_delivery") || statusLower.includes("out for delivery")) {
      newStatus = "out_for_delivery";
    } else if (statusLower.includes("delivered")) {
      newStatus = "delivered";
    } else if (statusLower.includes("cancelled")) {
      newStatus = "cancelled";
    } else if (statusLower.includes("rto") || statusLower.includes("return")) {
      newStatus = "returned";
    }

    if (newStatus && order.orderStatus !== newStatus) {
      order.orderStatus = newStatus;
      order.statusHistory.push({ status: newStatus, updatedAt: new Date() });
      await order.save();
      console.log(`Updated Order ${order.orderNumber} status to ${newStatus} via Shiprocket webhook`);
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("Webhook processing error:", error.message);
    return res.status(200).json({ success: false, error: error.message });
  }
}

async function pushOrderToShiprocket(req, res, next) {
  try {
    const order = await Order.findById(req.params.id).populate("user");
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    const shiprocket = require("../utils/shiprocket");
    const srData = await shiprocket.createShiprocketOrder(order, order.user);

    if (srData) {
      order.shiprocketOrderId = srData.order_id?.toString();
      order.shiprocketShipmentId = srData.shipment_id?.toString();
      if (!order.courierPartner) {
        order.courierPartner = "Shiprocket";
      }
      if (order.orderStatus === "placed") {
        order.orderStatus = "confirmed";
        order.statusHistory.push({ status: "confirmed", updatedAt: new Date() });
      }
      await order.save();
    }

    return res.status(200).json({
      success: true,
      message: `Order pushed to Shiprocket successfully! (Order #${order.shiprocketOrderId})`,
      order,
    });
  } catch (error) {
    next(error);
  }
}

async function generateShiprocketAwbHandler(req, res, next) {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (!order.shiprocketShipmentId) {
      return res.status(400).json({ message: "Please push order to Shiprocket first to get a Shipment ID." });
    }

    const shiprocket = require("../utils/shiprocket");
    const awbData = await shiprocket.generateAwb(order.shiprocketShipmentId);

    if (awbData && awbData.awb_code) {
      order.awbNumber = awbData.awb_code;
      order.trackingId = awbData.awb_code;
      if (awbData.courier_name) {
        order.courierPartner = awbData.courier_name;
      }
      if (order.orderStatus === "confirmed" || order.orderStatus === "placed") {
        order.orderStatus = "shipped";
        order.statusHistory.push({ status: "shipped", updatedAt: new Date() });
      }
      await order.save();
    }

    return res.status(200).json({
      success: true,
      message: `AWB Generated: ${order.awbNumber} (${order.courierPartner || "Shiprocket"})`,
      order,
      awbData,
    });
  } catch (error) {
    next(error);
  }
}

async function generateShiprocketLabelHandler(req, res, next) {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (!order.shiprocketShipmentId) {
      return res.status(400).json({ message: "Please push order to Shiprocket first." });
    }

    const shiprocket = require("../utils/shiprocket");
    const labelData = await shiprocket.generateLabel(order.shiprocketShipmentId);

    return res.status(200).json({
      success: true,
      labelUrl: labelData.label_url,
      labelData,
    });
  } catch (error) {
    next(error);
  }
}

async function syncOrderShipping(req, res, next) {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (!order.shiprocketShipmentId) {
      return res.status(400).json({ message: "This order does not have an associated Shiprocket Shipment ID" });
    }

    const shiprocket = require("../utils/shiprocket");
    const trackingInfo = await shiprocket.trackShipment(order.shiprocketShipmentId);

    const trackingData = trackingInfo.tracking_data;
    if (trackingData) {
      if (trackingData.awb_code) {
        order.awbNumber = trackingData.awb_code;
        order.trackingId = trackingData.awb_code;
      }
      if (trackingData.courier_name) {
        order.courierPartner = trackingData.courier_name;
      }
      
      const statusLower = (trackingData.shipment_status || trackingData.current_status || "").toLowerCase();
      let newStatus = null;

      if (statusLower.includes("shipped") || statusLower.includes("transit") || statusLower.includes("dispatched") || statusLower.includes("in transit")) {
        newStatus = "shipped";
      } else if (statusLower.includes("out_for_delivery") || statusLower.includes("out for delivery")) {
        newStatus = "out_for_delivery";
      } else if (statusLower.includes("delivered")) {
        newStatus = "delivered";
      } else if (statusLower.includes("cancelled")) {
        newStatus = "cancelled";
      } else if (statusLower.includes("rto") || statusLower.includes("return")) {
        newStatus = "returned";
      }

      if (newStatus && order.orderStatus !== newStatus) {
        order.orderStatus = newStatus;
        order.statusHistory.push({ status: newStatus, updatedAt: new Date() });
        console.log(`Synced Order ${order.orderNumber} status to ${newStatus} via Shiprocket tracking API`);
      }
      await order.save();
    }

    return res.status(200).json({ 
      success: true, 
      message: `Shipment status synchronized: ${order.orderStatus.toUpperCase()} (AWB: ${order.awbNumber || "Pending"})`,
      order, 
      trackingInfo 
    });
  } catch (error) {
    next(error);
  }
}

/**
 * PUT /api/admin/orders/confirm-all
 * (Admin only)
 * Confirms all orders that are currently in 'placed' status.
 */
async function confirmAllPlacedOrders(req, res, next) {
  try {
    const placedOrders = await Order.find({ orderStatus: "placed" }).populate("user");
    
    if (placedOrders.length === 0) {
      return res.status(200).json({ message: "No placed orders found to confirm", count: 0, orders: [] });
    }

    const shiprocket = require("../utils/shiprocket");
    const updatedOrders = [];

    for (const order of placedOrders) {
      order.orderStatus = "confirmed";
      order.statusHistory.push({ status: "confirmed", updatedAt: new Date() });

      // Trigger Shiprocket Order Creation if not already present
      if (!order.shiprocketOrderId) {
        try {
          const srData = await shiprocket.createShiprocketOrder(order, order.user);
          if (srData) {
            order.shiprocketOrderId = srData.order_id?.toString();
            order.shiprocketShipmentId = srData.shipment_id?.toString();
          }
        } catch (srErr) {
          console.error(`Failed to create Shiprocket order for ${order.orderNumber} during bulk confirmation:`, srErr.message);
        }
      }

      // Deduct variant stock
      for (const item of order.items) {
        const product = await Product.findById(item.product);
        if (product) {
          const variant = product.variants.find((v) => v.sku === item.variantSku);
          if (variant) {
            variant.stock = Math.max(0, variant.stock - item.quantity);
            await product.save();
          }
        }
      }

      await order.save();
      updatedOrders.push(order);
    }

    return res.status(200).json({
      message: `Successfully confirmed ${placedOrders.length} orders`,
      count: placedOrders.length,
      orders: updatedOrders,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/orders/track-public
 * body: { orderNumber, phone }
 */
async function trackOrderPublic(req, res, next) {
  try {
    const { orderNumber, phone } = req.body;
    if (!orderNumber || !phone) {
      return res.status(400).json({ message: "Order number and phone number are required." });
    }

    const cleanOrderNumber = orderNumber.trim();
    const cleanPhone = phone.trim().replace(/\D/g, "");

    const order = await Order.findOne({
      $or: [
        { orderNumber: { $regex: new RegExp(`^${cleanOrderNumber}$`, "i") } },
        { awbNumber: cleanOrderNumber }
      ]
    }).populate("user");

    if (!order) {
      return res.status(404).json({ message: "Order not found. Please verify the Order ID." });
    }

    // 1. If user is logged in (and not admin), strictly ensure they own this order
    if (req.user && req.user.role !== "admin") {
      const orderUserId = order.user?._id?.toString() || order.user?.toString();
      const currentUserId = req.user._id.toString();
      if (orderUserId && orderUserId !== currentUserId) {
        return res.status(403).json({
          message: `This order belongs to another account (+91 ${cleanPhone}). Please log in with the account used to place this order.`
        });
      }
    }

    // 2. Phone number verification check
    const userPhoneClean = order.user?.phone ? order.user.phone.replace(/\D/g, "") : "";
    const shippingPhoneClean = order.shippingAddress?.phone ? order.shippingAddress.phone.replace(/\D/g, "") : "";

    const isPhoneMatch =
      (userPhoneClean && (userPhoneClean.endsWith(cleanPhone) || cleanPhone.endsWith(userPhoneClean))) ||
      (shippingPhoneClean && (shippingPhoneClean.endsWith(cleanPhone) || cleanPhone.endsWith(shippingPhoneClean)));

    if (!isPhoneMatch) {
      return res.status(403).json({ message: "Mobile number does not match this order." });
    }

    return res.status(200).json({
      success: true,
      orderNumber: order.orderNumber,
      orderStatus: order.orderStatus,
      courierPartner: order.courierPartner,
      awbNumber: order.awbNumber,
      createdAt: order.createdAt,
      statusHistory: order.statusHistory,
      items: order.items.map(item => ({
        title: item.title,
        quantity: item.quantity,
        size: item.size,
        finish: item.finish,
        image: item.image
      })),
      shippingAddress: {
        city: order.shippingAddress.city,
        state: order.shippingAddress.state,
      }
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  validateCoupon,
  createOrder,
  verifyRazorpayPayment,
  getMyOrders,
  getOrderById,
  createReturnRequest,
  getAllOrders,
  updateOrderStatus,
  reviewReturnRequest,
  markReturnReceived,
  getAdminDashboard,
  handleShiprocketWebhook,
  syncOrderShipping,
  pushOrderToShiprocket,
  generateShiprocketAwbHandler,
  generateShiprocketLabelHandler,
  confirmAllPlacedOrders,
  trackOrderPublic,
};
