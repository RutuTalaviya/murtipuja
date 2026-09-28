const Purpose = require("../models/Purpose");
const Product = require("../models/Product");

const DEFAULT_PURPOSES = [
  { name: "Pooja Room", slug: "pooja-room", description: "Daily prayer, aarti and home sanctum placement" },
  { name: "Mandir & Sanctum", slug: "mandir", description: "Sanctum and grand home mandir idols" },
  { name: "Home Decor & Living", slug: "home-decor", description: "Architectural and aesthetic spiritual centerpieces" },
  { name: "Car Dashboard", slug: "car-dashboard", description: "Compact sacred murtis for car and travel protection" },
  { name: "Housewarming / Griha Pravesh", slug: "griha-pravesh", description: "Auspicious gifts and idols for new beginnings" },
  { name: "Festive & Diwali Puja", slug: "festive-puja", description: "Sacred idols for Diwali, Navratri and holy festivities" },
  { name: "Spiritual Meditation", slug: "spiritual", description: "Serene focus for yoga, meditation and peace" },
  { name: "Corporate & Personal Gifting", slug: "gifting", description: "Cherished divine gifts for weddings and milestone occasions" },
];

/**
 * GET /api/purposes
 * Get all available purposes/occasions (seeded defaults + DB + products)
 */
async function getPurposes(req, res, next) {
  try {
    const count = await Purpose.countDocuments();
    if (count === 0) {
      try {
        await Purpose.insertMany(DEFAULT_PURPOSES, { ordered: false });
      } catch (seedErr) {
        // Ignore duplicate seed errors
      }
    }

    const dbPurposes = await Purpose.find({ isActive: { $ne: false } }).sort("name").lean();
    const productPurposes = await Product.distinct("purpose");

    const existingNames = new Set(dbPurposes.map((p) => p.name.trim().toLowerCase()));
    const existingSlugs = new Set(dbPurposes.map((p) => p.slug.trim().toLowerCase()));

    const extraPurposes = [];
    (productPurposes || []).forEach((pp) => {
      if (pp && typeof pp === "string") {
        const trimmed = pp.trim();
        const slugified = trimmed.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
        if (trimmed && !existingNames.has(trimmed.toLowerCase()) && !existingSlugs.has(slugified)) {
          existingNames.add(trimmed.toLowerCase());
          existingSlugs.add(slugified);
          extraPurposes.push({
            _id: `prod-purpose-${slugified}`,
            name: trimmed.replace(/[-_]/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()),
            slug: slugified,
            description: "",
            isDynamic: true,
          });
        }
      }
    });

    const combined = [...dbPurposes, ...extraPurposes];
    return res.status(200).json(combined);
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/purposes (Admin only)
 * Create a new purpose/occasion
 */
async function createPurpose(req, res, next) {
  try {
    const { name, slug, description, icon } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ message: "Occasion / Purpose name is required" });
    }

    const cleanName = name.trim();
    const generatedSlug =
      slug?.trim() ||
      cleanName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

    let purpose = await Purpose.findOne({
      $or: [{ slug: generatedSlug }, { name: new RegExp(`^${cleanName}$`, "i") }],
    });

    if (purpose) {
      purpose.isActive = true;
      if (description) purpose.description = description;
      if (icon) purpose.icon = icon;
      await purpose.save();
      return res.status(200).json(purpose);
    }

    purpose = await Purpose.create({
      name: cleanName,
      slug: generatedSlug,
      description: description || "",
      icon: icon || "",
    });

    return res.status(201).json(purpose);
  } catch (error) {
    next(error);
  }
}

/**
 * PUT /api/purposes/:id (Admin only)
 * Update purpose
 */
async function updatePurpose(req, res, next) {
  try {
    const { id } = req.params;
    const { name, slug, description, icon, isActive } = req.body;

    const updateData = {};
    if (name !== undefined) updateData.name = name.trim();
    if (slug !== undefined) {
      updateData.slug = slug.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    }
    if (description !== undefined) updateData.description = description;
    if (icon !== undefined) updateData.icon = icon;
    if (isActive !== undefined) updateData.isActive = isActive;

    const purpose = await Purpose.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!purpose) {
      return res.status(404).json({ message: "Occasion / Purpose not found" });
    }
    return res.status(200).json(purpose);
  } catch (error) {
    next(error);
  }
}

/**
 * DELETE /api/purposes/:id (Admin only)
 * Delete purpose
 */
async function deletePurpose(req, res, next) {
  try {
    const purpose = await Purpose.findByIdAndDelete(req.params.id);
    if (!purpose) {
      return res.status(404).json({ message: "Occasion / Purpose not found" });
    }
    return res.status(200).json({ message: "Occasion / Purpose deleted successfully" });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getPurposes,
  createPurpose,
  updatePurpose,
  deletePurpose,
};
