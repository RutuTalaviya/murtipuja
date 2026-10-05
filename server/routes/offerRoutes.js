const express = require("express");
const router = express.Router();
const { protect, adminOnly } = require("../middleware/auth");
const ComboOffer = require("../models/ComboOffer");
const Coupon = require("../models/Coupon");
const Offer = require("../models/Offer");
const { parseExpiryDate, syncExpiredPromotions } = require("../utils/promotionExpirySync");

// Automatically sync and pause expired coupons, offers, and combos on every promotion request
router.use(async (req, res, next) => {
  await syncExpiredPromotions();
  next();
});

// ==========================================
// 1. COMBO OFFERS (Admin & Public)
// ==========================================

// GET all combos (Admin only)
router.get("/combos", protect, adminOnly, async (req, res, next) => {
  try {
    const combos = await ComboOffer.find({}).populate("products", "title basePrice").sort({ createdAt: -1 });
    res.json(combos);
  } catch (err) {
    next(err);
  }
});

// POST create combo (Admin only)
router.post("/combos", protect, adminOnly, async (req, res, next) => {
  try {
    const { title, description, products, discountType, discountValue, expiryDate, isActive = true } = req.body;
    
    if (!title || !products || !products.length || !discountType || !discountValue) {
      return res.status(400).json({ message: "All fields are required" });
    }
    
    const parsedExpiry = parseExpiryDate(expiryDate);
    const isExpired = parsedExpiry && parsedExpiry < new Date();

    const combo = await ComboOffer.create({
      title: title.trim(),
      description: description ? description.trim() : "",
      products,
      discountType,
      discountValue: Number(discountValue),
      expiryDate: parsedExpiry,
      isActive: isExpired ? false : Boolean(isActive),
    });
    res.status(201).json(combo);
  } catch (err) {
    next(err);
  }
});

// PUT update combo (Admin only)
router.put("/combos/:id", protect, adminOnly, async (req, res, next) => {
  try {
    const existing = await ComboOffer.findById(req.params.id);
    if (!existing) return res.status(404).json({ message: "Combo offer not found" });

    const updateData = { ...req.body };
    if (updateData.expiryDate !== undefined) {
      updateData.expiryDate = parseExpiryDate(updateData.expiryDate);
    }

    const effectiveExpiry = updateData.expiryDate !== undefined ? updateData.expiryDate : existing.expiryDate;
    const isExpired = effectiveExpiry && effectiveExpiry < new Date();

    if (updateData.isActive === true && isExpired) {
      return res.status(400).json({
        message: "Cannot activate an expired combo offer. Please update the expiry date first.",
      });
    }

    if (isExpired) {
      updateData.isActive = false;
    }

    const combo = await ComboOffer.findByIdAndUpdate(req.params.id, updateData, { new: true });
    res.json(combo);
  } catch (err) {
    next(err);
  }
});

// DELETE combo (Admin only)
router.delete("/combos/:id", protect, adminOnly, async (req, res, next) => {
  try {
    const combo = await ComboOffer.findByIdAndDelete(req.params.id);
    if (!combo) return res.status(404).json({ message: "Combo offer not found" });
    res.json({ message: "Combo offer deleted successfully" });
  } catch (err) {
    next(err);
  }
});

// ==========================================
// 2. COUPONS / PROMO CODES (Admin & Public)
// ==========================================

// GET active public coupons
router.get("/public/coupons", async (req, res, next) => {
  try {
    const now = new Date();
    const coupons = await Coupon.find({
      isActive: true,
      $or: [{ expiryDate: { $gt: now } }, { expiryDate: null }],
    }).select("code discountType discountValue minOrderValue expiryDate");
    res.json(coupons);
  } catch (err) {
    next(err);
  }
});

// GET all coupons (Admin only)
router.get("/coupons", protect, adminOnly, async (req, res, next) => {
  try {
    const coupons = await Coupon.find({}).sort({ createdAt: -1 });
    res.json(coupons);
  } catch (err) {
    next(err);
  }
});

// POST create coupon (Admin only)
router.post("/coupons", protect, adminOnly, async (req, res, next) => {
  try {
    const { code, discountType, discountValue, minOrderValue = 0, expiryDate, usageLimit, isActive = true } = req.body;

    if (!code || !discountType || !discountValue) {
      return res.status(400).json({ message: "Coupon Code, Discount Type, and Value are required." });
    }

    const cleanCode = code.trim().toUpperCase();
    const existing = await Coupon.findOne({ code: cleanCode });
    if (existing) {
      return res.status(400).json({ message: `Coupon code '${cleanCode}' already exists.` });
    }

    const parsedExpiry = parseExpiryDate(expiryDate) || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);
    const isExpired = parsedExpiry < new Date();

    const coupon = await Coupon.create({
      code: cleanCode,
      discountType,
      discountValue: Number(discountValue),
      minOrderValue: Number(minOrderValue) || 0,
      expiryDate: parsedExpiry,
      usageLimit: usageLimit ? Number(usageLimit) : null,
      isActive: isExpired ? false : Boolean(isActive),
    });

    res.status(201).json(coupon);
  } catch (err) {
    next(err);
  }
});

// PUT update coupon (Admin only)
router.put("/coupons/:id", protect, adminOnly, async (req, res, next) => {
  try {
    const existing = await Coupon.findById(req.params.id);
    if (!existing) return res.status(404).json({ message: "Coupon not found" });

    const updateData = { ...req.body };
    if (updateData.code) {
      updateData.code = updateData.code.trim().toUpperCase();
    }
    if (updateData.expiryDate !== undefined) {
      updateData.expiryDate = parseExpiryDate(updateData.expiryDate);
    }

    const effectiveExpiry = updateData.expiryDate !== undefined ? updateData.expiryDate : existing.expiryDate;
    const isExpired = effectiveExpiry && effectiveExpiry < new Date();

    if (updateData.isActive === true && isExpired) {
      return res.status(400).json({
        message: "Cannot activate an expired coupon code. Please update the expiry date first.",
      });
    }

    if (isExpired) {
      updateData.isActive = false;
    }

    const coupon = await Coupon.findByIdAndUpdate(req.params.id, updateData, { new: true });
    res.json(coupon);
  } catch (err) {
    next(err);
  }
});

// DELETE coupon (Admin only)
router.delete("/coupons/:id", protect, adminOnly, async (req, res, next) => {
  try {
    const coupon = await Coupon.findByIdAndDelete(req.params.id);
    if (!coupon) return res.status(404).json({ message: "Coupon not found" });
    res.json({ message: "Coupon deleted successfully" });
  } catch (err) {
    next(err);
  }
});

// ==========================================
// 3. AUTOMATIC OFFERS (Admin & Public)
// ==========================================

// GET active public offers
router.get("/public/offers", async (req, res, next) => {
  try {
    const now = new Date();
    const offers = await Offer.find({
      isActive: true,
      $or: [{ expiryDate: { $gt: now } }, { expiryDate: null }],
    });
    res.json(offers);
  } catch (err) {
    next(err);
  }
});

// GET all offers (Admin only)
router.get("/offers", protect, adminOnly, async (req, res, next) => {
  try {
    const offers = await Offer.find({}).populate("applicableCategory", "name slug").sort({ createdAt: -1 });
    res.json(offers);
  } catch (err) {
    next(err);
  }
});

// POST create automatic offer (Admin only)
router.post("/offers", protect, adminOnly, async (req, res, next) => {
  try {
    const { title, description, discountType, discountValue, minOrderValue = 0, applicableCategory, applicableDeity, expiryDate, isActive = true } = req.body;

    if (!title || !discountType || !discountValue) {
      return res.status(400).json({ message: "Title, Discount Type, and Value are required." });
    }

    const parsedExpiry = parseExpiryDate(expiryDate);
    const isExpired = parsedExpiry && parsedExpiry < new Date();

    const offer = await Offer.create({
      title: title.trim(),
      description: description ? description.trim() : "",
      discountType,
      discountValue: Number(discountValue),
      minOrderValue: Number(minOrderValue) || 0,
      applicableCategory: applicableCategory || [],
      applicableDeity: applicableDeity || "",
      expiryDate: parsedExpiry,
      isActive: isExpired ? false : Boolean(isActive),
    });

    res.status(201).json(offer);
  } catch (err) {
    next(err);
  }
});

// PUT update automatic offer (Admin only)
router.put("/offers/:id", protect, adminOnly, async (req, res, next) => {
  try {
    const existing = await Offer.findById(req.params.id);
    if (!existing) return res.status(404).json({ message: "Offer not found" });

    const updateData = { ...req.body };
    if (updateData.expiryDate !== undefined) {
      updateData.expiryDate = parseExpiryDate(updateData.expiryDate);
    }

    const effectiveExpiry = updateData.expiryDate !== undefined ? updateData.expiryDate : existing.expiryDate;
    const isExpired = effectiveExpiry && effectiveExpiry < new Date();

    if (updateData.isActive === true && isExpired) {
      return res.status(400).json({
        message: "Cannot activate an expired special offer. Please update the expiry date first.",
      });
    }

    if (isExpired) {
      updateData.isActive = false;
    }

    const offer = await Offer.findByIdAndUpdate(req.params.id, updateData, { new: true });
    res.json(offer);
  } catch (err) {
    next(err);
  }
});

// DELETE automatic offer (Admin only)
router.delete("/offers/:id", protect, adminOnly, async (req, res, next) => {
  try {
    const offer = await Offer.findByIdAndDelete(req.params.id);
    if (!offer) return res.status(404).json({ message: "Offer not found" });
    res.json({ message: "Offer deleted successfully" });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
