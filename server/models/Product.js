const mongoose = require("mongoose");

const variantSchema = new mongoose.Schema(
  {
    size: { type: String, required: true }, // e.g. "6 inch", "12 inch"
    finish: { type: String, required: true }, // e.g. "matte black", "antique bronze"
    weight: { type: String }, // e.g. "500g"
    price: { type: Number, required: true },
    discountPrice: { type: Number },
    stock: { type: Number, required: true, default: 0 },
    sku: { type: String, required: true },
    image: { type: String },
    images: [{ url: String, alt: String }],
  },
  { _id: true }
);

const productSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, index: true },
    description: { type: String, required: true },
    category: [{ type: mongoose.Schema.Types.ObjectId, ref: "Category", index: true }],
    subCategory: [{ type: mongoose.Schema.Types.ObjectId, ref: "Category", index: true }],
    deity: { type: String, index: true }, // e.g. "Ram", "Shiva"
    material: { type: String, default: "Resin (3D Printed)" },
    // Powers the "shop by occasion" navigation axis
    purpose: [{ type: String }],
    images: [{ url: String, alt: String }],
    videos: [{ url: String, thumbnail: String }],
    basePrice: { type: Number, required: true }, // used for display/sort when no variant selected yet
    isCustomizable: { type: Boolean, default: false },
    isFeatured: { type: Boolean, default: false },
    isOnSale: { type: Boolean, default: false },
    ratingsAverage: { type: Number, default: 0 },
    ratingsCount: { type: Number, default: 0 },
    tags: [{ type: String }],
    productDetails: { type: String }, // Specific bullet points / dimensions / details
    materialsAndCare: { type: String }, // Care instructions & materials
    shippingReturns: { type: String }, // Shipping, returns & exchanges policy
    accordionSections: [
      {
        title: { type: String, required: true },
        content: { type: String, required: true },
      },
    ],
    variants: [variantSchema],
  },
  { timestamps: true }
);

// Basic text index to support the autocomplete/search feature
productSchema.index({ title: "text", deity: "text", tags: "text" });

module.exports = mongoose.model("Product", productSchema);

