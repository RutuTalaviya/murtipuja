const mongoose = require("mongoose");

const subItemSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "Sub-menu title is required"],
    trim: true,
  },
  url: {
    type: String,
    required: [true, "Sub-menu URL is required"],
    trim: true,
  },
  badge: {
    type: String,
    trim: true,
    default: "",
  },
  order: {
    type: Number,
    default: 0,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
});

const navMenuSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Navigation title is required"],
      trim: true,
    },
    url: {
      type: String,
      trim: true,
      default: "",
    },
    order: {
      type: Number,
      default: 0,
    },
    badge: {
      type: String,
      trim: true,
      default: "",
    },
    isDropdown: {
      type: Boolean,
      default: false,
    },
    dropdownType: {
      type: String,
      enum: ["custom", "categories"],
      default: "custom",
    },
    subItems: [subItemSchema],
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("NavMenu", navMenuSchema);
