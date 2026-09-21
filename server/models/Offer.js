const mongoose = require("mongoose");

const offerSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String },
    discountType: { type: String, enum: ["percentage", "flat"], required: true },
    discountValue: { type: Number, required: true },
    minOrderValue: { type: Number, default: 0 },
    applicableCategory: [{ type: mongoose.Schema.Types.ObjectId, ref: "Category" }],
    applicableDeity: { type: String },
    isActive: { type: Boolean, default: true },
    expiryDate: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Offer", offerSchema);
