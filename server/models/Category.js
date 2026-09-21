const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true }, // e.g. "Ram", "Lighting Murti"
    slug: { type: String, required: true, unique: true, lowercase: true, index: true },
    icon: { type: String, default: "" }, // e.g. "💡", "🛕", "🖼️", "🚗"
    image: { type: String, default: "" },
    description: { type: String, default: "" },
    parentCategory: { type: mongoose.Schema.Types.ObjectId, ref: "Category", default: null, index: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Category", categorySchema);

