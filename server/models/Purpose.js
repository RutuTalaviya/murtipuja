const mongoose = require("mongoose");

const purposeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true }, // e.g. "Pooja Room", "Car Dashboard", "Griha Pravesh"
    slug: { type: String, required: true, unique: true, lowercase: true, index: true },
    icon: { type: String, default: "" },
    description: { type: String, default: "" },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Purpose", purposeSchema);
