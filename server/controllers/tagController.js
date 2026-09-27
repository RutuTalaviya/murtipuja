const Tag = require("../models/Tag");
const Product = require("../models/Product");

/** GET /api/tags - Get all tags (from Tag collection + Products) */
async function getTags(req, res, next) {
  try {
    const dbTagDocs = await Tag.find({ isActive: true }).sort("name").lean();
    const productTags = await Product.distinct("tags");

    const existingNames = new Set(dbTagDocs.map((t) => t.name.trim().toLowerCase()));

    // Include any custom tag string saved on existing products that isn't in Tag collection yet
    const extraTags = [];
    (productTags || []).forEach((pt) => {
      if (pt && typeof pt === "string") {
        const trimmed = pt.trim();
        if (trimmed && !existingNames.has(trimmed.toLowerCase())) {
          existingNames.add(trimmed.toLowerCase());
          extraTags.push({
            _id: `prod-tag-${trimmed}`,
            name: trimmed,
            slug: trimmed.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
            isDynamic: true,
          });
        }
      }
    });

    const combined = [...dbTagDocs, ...extraTags];
    return res.status(200).json(combined);
  } catch (error) {
    next(error);
  }
}

/** POST /api/tags (Admin only) */
async function createTag(req, res, next) {
  try {
    const { name, slug, description, color } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ message: "Tag name is required" });
    }

    const cleanName = name.trim();
    const generatedSlug =
      slug?.trim() ||
      cleanName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

    let tag = await Tag.findOne({
      $or: [{ slug: generatedSlug }, { name: new RegExp(`^${cleanName}$`, "i") }],
    });

    if (tag) {
      tag.isActive = true;
      if (description) tag.description = description;
      if (color) tag.color = color;
      await tag.save();
      return res.status(200).json(tag);
    }

    tag = await Tag.create({
      name: cleanName,
      slug: generatedSlug,
      description: description || "",
      color: color || "",
    });

    return res.status(201).json(tag);
  } catch (error) {
    next(error);
  }
}

/** PUT /api/tags/:id (Admin only) */
async function updateTag(req, res, next) {
  try {
    const tag = await Tag.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!tag) {
      return res.status(404).json({ message: "Tag not found" });
    }
    return res.status(200).json(tag);
  } catch (error) {
    next(error);
  }
}

/** DELETE /api/tags/:id (Admin only) */
async function deleteTag(req, res, next) {
  try {
    const tag = await Tag.findByIdAndDelete(req.params.id);
    if (!tag) {
      return res.status(404).json({ message: "Tag not found" });
    }
    return res.status(200).json({ message: "Tag deleted successfully" });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getTags,
  createTag,
  updateTag,
  deleteTag,
};
