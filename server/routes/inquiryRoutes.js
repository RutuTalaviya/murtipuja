const express = require("express");
const router = express.Router();
const Inquiry = require("../models/Inquiry");
const { protect, admin } = require("../middleware/authMiddleware");

// POST /api/inquiries (Public lead submission)
router.post("/", async (req, res) => {
  try {
    const {
      name,
      phone,
      email,
      productTitle,
      productSlug,
      productId,
      variantDetails,
      quantity,
      occasion,
      notes,
    } = req.body;

    if (!name || !phone) {
      return res.status(400).json({ message: "Name and Phone number are required." });
    }

    const inquiry = await Inquiry.create({
      name: name.trim(),
      phone: phone.trim(),
      email: email ? email.trim() : "",
      productTitle: productTitle || "General Bulk Inquiry",
      productSlug: productSlug || "",
      productId: productId || null,
      variantDetails: variantDetails || "",
      quantity: quantity || "10+",
      occasion: occasion || "Corporate / Bulk Gifting",
      notes: notes || "",
    });

    res.status(201).json({ success: true, inquiry });
  } catch (err) {
    console.error("Failed to save inquiry:", err);
    res.status(500).json({ message: "Failed to submit inquiry", error: err.message });
  }
});

// GET /api/inquiries (Admin only)
router.get("/", protect, admin, async (req, res) => {
  try {
    const inquiries = await Inquiry.find().sort({ createdAt: -1 });
    res.json(inquiries);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

module.exports = router;
