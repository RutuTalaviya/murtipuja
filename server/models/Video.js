const mongoose = require("mongoose");

const videoSchema = new mongoose.Schema(
  {
    title: { type: String, trim: true, required: true },
    tagline: { type: String, trim: true, default: "" },
    videoUrl: { type: String, required: true, trim: true },
    thumbnailUrl: { type: String, default: "", trim: true },
    badge: { type: String, trim: true, default: "4K REEL" },
    productLink: { type: String, trim: true, default: "/products" },
    duration: { type: String, trim: true, default: "0:30" },
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Video", videoSchema);
