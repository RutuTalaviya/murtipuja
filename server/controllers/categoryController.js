const Category = require("../models/Category");

// Default initial seed data for categories and subcategories
const DEFAULT_CATEGORIES = [
  { name: "Ram", slug: "ram", icon: "", description: "Lord Ram Murtis & Ayodhya Series" },
  { name: "Shiva", slug: "shiva", icon: "", description: "Adiyogi & Mahadev Divine Murtis" },
  { name: "Ganesh", slug: "ganesh", icon: "", description: "Vighnaharta Ganesha Idols" },
  { name: "Krishna", slug: "krishna", icon: "", description: "Lord Krishna & Radha-Krishna Murti" },
  { name: "Hanuman", slug: "hanuman", icon: "", description: "Sankat Mochan Hanuman Ji" },
];

const DEFAULT_SUBCATEGORIES_FOR_RAM = [
  { name: "Lighting / LED Murti", slug: "ram-lighting-murti", icon: "", description: "Backlit & LED Aura illuminated Ram Murtis" },
  { name: "Temple / Mandir Murti", slug: "ram-temple-mandir-murti", icon: "", description: "Sanctum & Home Mandir Pooja Murtis" },
  { name: "Wall Murti / Hanging", slug: "ram-wall-murti", icon: "", description: "Wall decor and floating wall frame murtis" },
  { name: "Car Dashboard Murti", slug: "ram-car-dashboard-murti", icon: "", description: "Compact sacred murtis for car dashboard" },
  { name: "Pooja Room Murti", slug: "ram-pooja-room-murti", icon: "", description: "Daily prayer and abhishek puja murtis" },
];

/**
 * GET /api/categories
 * Query options: ?parent=<id|null>, ?mainOnly=true, ?slug=<slug>
 */
async function getCategories(req, res, next) {
  try {
    const { parent, mainOnly, slug } = req.query;
    let filter = { isActive: { $ne: false } };

    if (slug) {
      filter.slug = slug.toLowerCase();
    }

    if (mainOnly === "true") {
      filter.parentCategory = null;
    } else if (parent === "null" || parent === "root") {
      filter.parentCategory = null;
    } else if (parent) {
      filter.parentCategory = parent;
    }

    let categories = await Category.find(filter)
      .populate("parentCategory", "name slug icon")
      .sort({ createdAt: 1 })
      .lean();

    // If Ram exists but has no subcategories seeded yet, auto-seed default subcategories
    const ramCat = await Category.findOne({ slug: "ram" });
    if (ramCat) {
      const existingSubCount = await Category.countDocuments({ parentCategory: ramCat._id });
      if (existingSubCount === 0) {
        console.log("Seeding default subcategories for Ram...");
        const subCatsToSeed = DEFAULT_SUBCATEGORIES_FOR_RAM.map((sub) => ({
          ...sub,
          parentCategory: ramCat._id,
        }));
        await Category.insertMany(subCatsToSeed);
        categories = await Category.find(filter)
          .populate("parentCategory", "name slug icon")
          .sort({ createdAt: 1 })
          .lean();
      }
    }


    return res.status(200).json(categories);
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/categories
 * Create a new category or subcategory
 */
async function createCategory(req, res, next) {
  try {
    let { name, slug, parentCategory, icon, image, description, isActive } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Category name is required" });
    }

    if (!slug) {
      slug = name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
    } else {
      slug = slug
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
    }

    // Check slug collision
    const existing = await Category.findOne({ slug });
    if (existing) {
      slug = `${slug}-${Date.now().toString().slice(-4)}`;
    }

    const category = await Category.create({
      name: name.trim(),
      slug,
      parentCategory: parentCategory && parentCategory !== "null" && parentCategory !== "" ? parentCategory : null,
      icon: icon || "",
      image: image || "",
      description: description || "",
      isActive: isActive !== undefined ? isActive : true,
    });

    const populated = await Category.findById(category._id)
      .populate("parentCategory", "name slug icon")
      .lean();

    return res.status(201).json(populated);
  } catch (error) {
    next(error);
  }
}

/**
 * PUT /api/categories/:id
 * Update category or subcategory
 */
async function updateCategory(req, res, next) {
  try {
    const { id } = req.params;
    let { name, slug, parentCategory, icon, image, description, isActive } = req.body;

    const updateData = {};
    if (name !== undefined) updateData.name = name.trim();
    if (slug !== undefined) {
      updateData.slug = slug
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
    }
    if (parentCategory !== undefined) {
      updateData.parentCategory =
        parentCategory && parentCategory !== "null" && parentCategory !== "" && parentCategory !== id
          ? parentCategory
          : null;
    }
    if (icon !== undefined) updateData.icon = icon;
    if (image !== undefined) updateData.image = image;
    if (description !== undefined) updateData.description = description;
    if (isActive !== undefined) updateData.isActive = isActive;

    const updated = await Category.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    })
      .populate("parentCategory", "name slug icon")
      .lean();

    if (!updated) {
      return res.status(404).json({ message: "Category not found" });
    }

    return res.status(200).json(updated);
  } catch (error) {
    next(error);
  }
}

/**
 * DELETE /api/categories/:id
 * Delete a category or subcategory
 */
async function deleteCategory(req, res, next) {
  try {
    const { id } = req.params;
    const category = await Category.findByIdAndDelete(id);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    // Unlink any subcategories that had this as parent
    await Category.updateMany({ parentCategory: id }, { $set: { parentCategory: null } });

    return res.status(200).json({ message: "Category deleted successfully" });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
};
