const mongoose = require("mongoose");

const inquirySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    email: { type: String, trim: true },
    productTitle: { type: String, trim: true },
    productSlug: { type: String, trim: true },
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
    variantDetails: { type: String, trim: true }, // e.g. "6 INCH - Matte Black"
    quantity: { type: String, required: true, default: "10-25" },
    occasion: { type: String, trim: true },
    notes: { type: String, trim: true },
    status: {
      type: String,
      enum: ["New", "In Progress", "Contacted", "Quoted", "Converted", "Closed"],
      default: "New",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Inquiry", inquirySchema);
