const mongoose = require("mongoose");

const comboOfferSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String },
    products: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true }],
    discountType: { type: String, enum: ["percentage", "flat"], required: true },
    discountValue: { type: Number, required: true },
    isActive: { type: Boolean, default: true },
    expiryDate: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ComboOffer", comboOfferSchema);
