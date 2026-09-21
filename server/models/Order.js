const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
  variantSku: { type: String, required: true },
  title: { type: String, required: true },
  image: { type: String },
  size: { type: String, required: true },
  finish: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true, min: 1 },
});

const addressSchema = new mongoose.Schema({
  addressLine1: { type: String, required: true },
  addressLine2: { type: String },
  city: { type: String, required: true },
  state: { type: String, required: true },
  pincode: { type: String, required: true },
  country: { type: String, default: "India" },
});

const orderSchema = new mongoose.Schema(
  {
    orderNumber: { type: String, required: true, unique: true, index: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    items: [orderItemSchema],
    shippingAddress: { type: addressSchema, required: true },
    billingAddress: { type: addressSchema, required: true },
    paymentMethod: { type: String, default: "razorpay" },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending",
    },
    paymentInfo: {
      razorpayOrderId: { type: String },
      razorpayPaymentId: { type: String },
      razorpaySignature: { type: String },
      razorpayRefundId: { type: String },
    },
    orderStatus: {
      type: String,
      enum: ["placed", "confirmed", "shipped", "out_for_delivery", "delivered", "cancelled", "returned"],
      default: "placed",
    },
    subtotal: { type: Number, required: true },
    shippingFee: { type: Number, required: true, default: 0 },
    discount: { type: Number, required: true, default: 0 },
    comboDiscount: { type: Number, required: true, default: 0 },
    autoOfferDiscount: { type: Number, required: true, default: 0 },
    tax: { type: Number, required: true, default: 0 },
    totalAmount: { type: Number, required: true },
    couponApplied: { type: String },
    appliedComboOffers: [{ type: String }],
    appliedAutoOffers: [{ type: String }],
    trackingId: { type: String },
    courierPartner: { type: String },
    shiprocketOrderId: { type: String },
    shiprocketShipmentId: { type: String },
    awbNumber: { type: String },
    statusHistory: [
      {
        status: { type: String, required: true },
        updatedAt: { type: Date, default: Date.now },
      },
    ],
    returnPolicyAcknowledged: { type: Boolean, default: false },
    acknowledgedAt: { type: Date },
    returnRequest: {
      isRequested: { type: Boolean, default: false },
      requestType: { type: String, enum: ["return", "exchange"], default: null },
      claimReasonType: { type: String, enum: ["damage", "size_color", "other"], default: null },
      exchangeVariantSku: { type: String, default: null },
      reason: { type: String },
      unboxingVideoUrl: { type: String },
      unboxingVideoVerified: { type: Boolean, default: false },
      status: {
        type: String,
        enum: ["requested", "approved", "rejected", "received", "completed"],
        default: null,
      },
      requestedAt: { type: Date },
      resolvedAt: { type: Date },
      refundProcessedAt: { type: Date },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
