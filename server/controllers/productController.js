const Product = require("../models/Product");
const Category = require("../models/Category");
const mongoose = require("mongoose");

/**
 * GET /api/products
 * Query params: page, limit, category, subCategory, deity, purpose, minPrice, maxPrice, sort, search, ids, onsale
 * Always paginated — never returns the full catalog in one response.
 */
async function getProducts(req, res, next) {
  try {
    const {
      page = 1,
      limit = 12,
      category,
      subCategory,
      deity,
      purpose,
      minPrice,
      maxPrice,
      sort = "-createdAt",
      search,
      ids,
      onsale,
    } = req.query;

    const filter = {};

    if (ids) {
      const idsArray = ids.split(",").map((id) => id.trim()).filter(Boolean);
      filter._id = { $in: idsArray };
    }

    // Category filter: support ObjectId, slug, or Main Category name (e.g. Shiva, Ram, Hanuman)
    // When a main category is selected, all products in that category AND in all its subcategories are included!
    if (category) {
      if (mongoose.Types.ObjectId.isValid(category)) {
        const childCats = await Category.find({ parentCategory: category }).select("_id").lean();
        const catIds = [category, ...childCats.map((c) => c._id)];
        const catDoc = await Category.findById(category).lean();
        const deityPattern = catDoc ? new RegExp(`^${catDoc.name}`, "i") : null;

        filter.$or = [
          { category: { $in: catIds } },
          { subCategory: { $in: catIds } },
          ...(deityPattern ? [{ deity: deityPattern }] : []),
        ];
      } else {
        // Find category by slug or name
        const catDoc = await Category.findOne({
          $or: [{ slug: category.toLowerCase() }, { name: new RegExp(`^${category}$`, "i") }],
        }).lean();

        if (catDoc) {
          const childCats = await Category.find({ parentCategory: catDoc._id }).select("_id").lean();
          const catIds = [catDoc._id, ...childCats.map((c) => c._id)];

          filter.$or = [
            { category: { $in: catIds } },
            { subCategory: { $in: catIds } },
            { deity: new RegExp(`^${catDoc.name}`, "i") },
            { deity: new RegExp(`^${catDoc.slug}`, "i") },
          ];
        } else {
          // Fallback to matching deity field or category name pattern
          filter.$or = [
            { deity: new RegExp(`^${category}`, "i") },
          ];
        }
      }
    }

    // Subcategory / Product Type filter
    if (subCategory) {
      if (mongoose.Types.ObjectId.isValid(subCategory)) {
        filter.subCategory = subCategory;
      } else {
        // Find matching subcategory doc
        const subCatDoc = await Category.findOne({
          $or: [{ slug: subCategory.toLowerCase() }, { name: new RegExp(`^${subCategory}$`, "i") }],
        }).lean();

        if (subCatDoc) {
          filter.$or = filter.$or || [];
          filter.subCategory = subCatDoc._id;
        } else {
          // Match in purpose or tags
          filter.$or = [
            { purpose: new RegExp(subCategory, "i") },
            { tags: new RegExp(subCategory, "i") },
          ];
        }
      }
    }

    if (deity && !filter.deity && !filter.$or) {
      filter.deity = new RegExp(`^${deity}$`, "i");
    }

    if (purpose) {
      filter.purpose = new RegExp(purpose, "i");
    }

    if (onsale === "true") {
      filter.isOnSale = true;
    }

    if (minPrice || maxPrice) {
      filter.basePrice = {};
      if (minPrice) filter.basePrice.$gte = Number(minPrice);
      if (maxPrice) filter.basePrice.$lte = Number(maxPrice);
    }

    if (search) {
      filter.$text = { $search: search };
    }

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10)));

    const isRandomSort = !req.query.sort || req.query.sort === "random";
    const sortOption = isRandomSort ? "-createdAt" : sort;

    let [products, total] = await Promise.all([
      Product.find(filter)
        .select("-videos -description")
        .populate("category", "name slug icon parentCategory")
        .populate("subCategory", "name slug icon parentCategory")
        .sort(sortOption)
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum)
        .lean(),
      Product.countDocuments(filter),
    ]);

    // If random sort, shuffle products array
    if (isRandomSort && products.length > 1) {
      for (let i = products.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [products[i], products[j]] = [products[j], products[i]];
      }
    }

    return res.status(200).json({
      products,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    next(error);
  }
}

/** GET /api/products/:slug */
async function getProductBySlug(req, res, next) {
  try {
    const product = await Product.findOne({ slug: req.params.slug })
      .populate("category", "name slug icon parentCategory")
      .populate("subCategory", "name slug icon parentCategory")
      .lean();

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const ComboOffer = require("../models/ComboOffer");
    const combos = await ComboOffer.find({ products: product._id, isActive: true })
      .populate("products", "title slug images variants basePrice")
      .lean();
    product.comboOffers = combos;

    return res.status(200).json(product);
  } catch (error) {
    next(error);
  }
}

/** POST /api/products (admin only) */
async function createProduct(req, res, next) {
  try {
    const product = await Product.create(req.body);
    const populated = await Product.findById(product._id)
      .populate("category", "name slug icon")
      .populate("subCategory", "name slug icon")
      .lean();
    return res.status(201).json(populated);
  } catch (error) {
    next(error);
  }
}

/** PUT /api/products/:id (admin only) */
async function updateProduct(req, res, next) {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })
      .populate("category", "name slug icon")
      .populate("subCategory", "name slug icon")
      .lean();

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    return res.status(200).json(product);
  } catch (error) {
    next(error);
  }
}

/** DELETE /api/products/:id (admin only) */
async function deleteProduct(req, res, next) {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    return res.status(200).json({ message: "Product deleted" });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getProducts,
  getProductBySlug,
  createProduct,
  updateProduct,
  deleteProduct,
};
