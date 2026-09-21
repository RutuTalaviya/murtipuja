const express = require("express");
const router = express.Router();
const {
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
} = require("../controllers/orderController");
const { protect, adminOnly, optionalAuth } = require("../middleware/auth");

// Public / Semi-public coupon validation
router.post("/coupons/validate", protect, validateCoupon);

// Order Tracking with optional auth check
router.post("/orders/track-public", optionalAuth, trackOrderPublic);

// Orders & Checkout
router.post("/orders/create", protect, createOrder);
router.post("/payment/razorpay/verify", protect, verifyRazorpayPayment);

// Customer Account Orders
router.get("/orders/my-orders", protect, getMyOrders);
router.get("/orders/:id", protect, getOrderById);
router.post("/orders/:id/return-request", protect, createReturnRequest);

// Admin dashboard & Order management
router.get("/admin/orders", protect, adminOnly, getAllOrders);
router.put("/admin/orders/confirm-all", protect, adminOnly, confirmAllPlacedOrders);
router.put("/orders/:id/status", protect, adminOnly, updateOrderStatus);
router.put("/orders/:id/return-request/review", protect, adminOnly, reviewReturnRequest);
router.put("/orders/:id/return-request/receive", protect, adminOnly, markReturnReceived);
router.get("/admin/dashboard", protect, adminOnly, getAdminDashboard);
router.post("/admin/orders/:id/sync-shipping", protect, adminOnly, syncOrderShipping);
router.post("/admin/orders/:id/push-shiprocket", protect, adminOnly, pushOrderToShiprocket);
router.post("/admin/orders/:id/generate-awb", protect, adminOnly, generateShiprocketAwbHandler);
router.post("/admin/orders/:id/generate-label", protect, adminOnly, generateShiprocketLabelHandler);

// Shiprocket Webhook (Public)
router.post("/shipping/shiprocket/webhook", handleShiprocketWebhook);

module.exports = router;
