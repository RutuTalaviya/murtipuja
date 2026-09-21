const mongoose = require("mongoose");

const bannerSchema = new mongoose.Schema(
  {
    tagline: { type: String, trim: true, default: "" },
    title: { type: String, trim: true, required: true },
    subtitle: { type: String, trim: true, default: "" },
    imageUrl: { type: String, default: "" },
    videoUrl: { type: String, default: "" },
    ctaText: { type: String, trim: true, default: "Shop the Drop" },
    ctaLink: { type: String, trim: true, default: "/products" },
    secondaryCtaText: { type: String, trim: true, default: "" },
    secondaryCtaLink: { type: String, trim: true, default: "" },
    badge: { type: String, trim: true, default: "" },
    position: { type: String, enum: ["hero", "middle", "footer"], default: "hero" },
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Banner", bannerSchema);

