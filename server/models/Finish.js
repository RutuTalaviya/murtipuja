const mongoose = require("mongoose");

const finishSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, unique: true }, // e.g., "Matte Black"
    slug: { type: String, required: true, unique: true, lowercase: true }, // e.g., "matte-black"
    colorCode: { type: String, trim: true, default: "" }, // e.g., "#000000" or a custom hex
  },
  { timestamps: true }
);

module.exports = mongoose.model("Finish", finishSchema);
