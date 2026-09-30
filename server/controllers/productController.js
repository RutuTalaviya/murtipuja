const Product = require("../models/Product");
const Category = require("../models/Category");
const mongoose = require("mongoose");

function escapeRegex(string) {
  return string.replace(/[/\-\\^$*+?.()|[\]{}]/g, "\\$&");
}

/**
 * GET /api/products
 * Query params: page, limit, category, subCategory, deity, series, purpose, minPrice, maxPrice, sort, search, ids, onsale
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
      series,
      purpose,
      minPrice,
      maxPrice,
      sort = "-createdAt",
      search,
      ids,
      onsale,
    } = req.query;

    const filter = {};
    const conditions = [];

    // Filter by specific product IDs
    if (ids) {
      const idsArray = ids.split(",").map((id) => id.trim()).filter(Boolean);
      conditions.push({ _id: { $in: idsArray } });
    }

    // Series / Deity Filter:
    // When a user selects a Deity / Series (e.g. Ram, Shiva, Ganesh, Krishna, Hanuman),
    // we want ALL products of that deity across ALL categories (Car Desk, Lighting Idol, Temple, Wall Art, etc.)
    const activeSeries = (deity || series || "").trim();
    if (activeSeries) {
      // Find all categories & subcategories matching the series name or slug
      const matchingCats = await Category.find({
        $or: [
          { name: new RegExp(escapeRegex(activeSeries), "i") },
          { slug: new RegExp(escapeRegex(activeSeries), "i") },
        ],
      }).select("_id").lean();

      const matchingCatIds = matchingCats.map((c) => c._id);
      const deityRegex = new RegExp(escapeRegex(activeSeries), "i");

      const deityOrConditions = [
        { deity: deityRegex },
        { title: deityRegex },
        { tags: deityRegex },
      ];

      if (matchingCatIds.length > 0) {
        deityOrConditions.push({ category: { $in: matchingCatIds } });
        deityOrConditions.push({ subCategory: { $in: matchingCatIds } });
      }

      conditions.push({ $or: deityOrConditions });
    }

    // Category filter: support ObjectId, slug, or Category name (e.g. Car Desk, Lighting Idol, etc.)
    if (category) {
      if (mongoose.Types.ObjectId.isValid(category)) {
        const childCats = await Category.find({ parentCategory: category }).select("_id").lean();
        const catDoc = await Category.findById(category).lean();
        const catIds = [category, ...childCats.map((c) => c._id)];

        const catOr = [
          { category: { $in: catIds } },
          { subCategory: { $in: catIds } },
        ];
        if (catDoc) {
          catOr.push({ deity: new RegExp(`^${escapeRegex(catDoc.name)}$`, "i") });
        }
        conditions.push({ $or: catOr });
      } else {
        // Find category by slug or name
        const catDoc = await Category.findOne({
          $or: [{ slug: category.toLowerCase() }, { name: new RegExp(`^${escapeRegex(category)}$`, "i") }],
        }).lean();

        if (catDoc) {
          const childCats = await Category.find({ parentCategory: catDoc._id }).select("_id").lean();
          const sameNameCats = await Category.find({
            name: new RegExp(`^${escapeRegex(catDoc.name)}$`, "i"),
          }).select("_id").lean();

          const catIds = Array.from(new Set([
            catDoc._id.toString(),
            ...childCats.map((c) => c._id.toString()),
            ...sameNameCats.map((c) => c._id.toString()),
          ])).map((id) => new mongoose.Types.ObjectId(id));

          conditions.push({
            $or: [
              { category: { $in: catIds } },
              { subCategory: { $in: catIds } },
              { deity: new RegExp(`^${escapeRegex(catDoc.name)}$`, "i") },
              { deity: new RegExp(`^${escapeRegex(catDoc.slug)}$`, "i") },
            ],
          });
        } else {
          // Fallback to matching deity, title, or tags
          const fallbackRegex = new RegExp(escapeRegex(category.trim()), "i");
          conditions.push({
            $or: [
              { deity: fallbackRegex },
              { title: fallbackRegex },
              { tags: fallbackRegex },
            ],
          });
        }
      }
    }

    // Subcategory filter (e.g. Lighting, Temple, Car Dashboard)
    if (subCategory) {
      if (mongoose.Types.ObjectId.isValid(subCategory)) {
        conditions.push({
          $or: [
            { subCategory: subCategory },
            { category: subCategory },
          ],
        });
      } else {
        const subCatDocs = await Category.find({
          $or: [{ slug: subCategory.toLowerCase() }, { name: new RegExp(`^${escapeRegex(subCategory)}$`, "i") }],
        }).select("_id").lean();

        if (subCatDocs.length > 0) {
          const subIds = subCatDocs.map((s) => s._id);
          conditions.push({
            $or: [
              { subCategory: { $in: subIds } },
              { category: { $in: subIds } },
              { deity: new RegExp(escapeRegex(subCategory), "i") },
            ],
          });
        } else {
          const subRegex = new RegExp(escapeRegex(subCategory), "i");
          conditions.push({
            $or: [
              { purpose: subRegex },
              { tags: subRegex },
              { deity: subRegex },
              { title: subRegex },
            ],
          });
        }
      }
    }

    // Purpose / Occasion filter
    if (purpose) {
      const rawPurpose = purpose.trim();
      const formatted = rawPurpose.replace(/[-_]/g, " ").trim();
      const slugified = rawPurpose.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
      const purposePattern = new RegExp(`^(${escapeRegex(rawPurpose)}|${escapeRegex(formatted)}|${escapeRegex(slugified)})$`, "i");
      conditions.push({
        $or: [
          { purpose: purposePattern },
          { purpose: new RegExp(escapeRegex(formatted), "i") },
          { tags: purposePattern },
        ],
      });
    }

    // On Sale filter
    if (onsale === "true") {
      conditions.push({ isOnSale: true });
    }

    // Price range filter
    const priceCondition = {};
    if (minPrice && !isNaN(Number(minPrice))) {
      priceCondition.$gte = Number(minPrice);
    }
    if (maxPrice && !isNaN(Number(maxPrice))) {
      priceCondition.$lte = Number(maxPrice);
    }
    if (Object.keys(priceCondition).length > 0) {
      conditions.push({ basePrice: priceCondition });
    }

    // Tag / Tags filter
    const rawTag = req.query.tag || req.query.tags;
    if (rawTag) {
      const tagList = Array.isArray(rawTag)
        ? rawTag
        : rawTag
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean);

      if (tagList.length > 0) {
        const patterns = tagList.map((t) => {
          const formatted = t.replace(/[-_]/g, " ").trim();
          const raw = t.trim();
          return new RegExp(`^(${escapeRegex(formatted)}|${escapeRegex(raw)})$`, "i");
        });
        conditions.push({ tags: { $in: patterns } });
      }
    }

    // Full search query filter
    if (search && search.trim()) {
      const searchRegex = new RegExp(escapeRegex(search.trim()), "i");
      const searchCatDocs = await Category.find({
        $or: [{ name: searchRegex }, { slug: searchRegex }],
      }).select("_id").lean();
      const searchCatIds = searchCatDocs.map((c) => c._id);

      const searchCondition = [
        { title: searchRegex },
        { deity: searchRegex },
        { tags: searchRegex },
        { material: searchRegex },
        { purpose: searchRegex },
        { description: searchRegex },
        ...(searchCatIds.length > 0
          ? [
              { category: { $in: searchCatIds } },
              { subCategory: { $in: searchCatIds } },
            ]
          : []),
      ];

      conditions.push({ $or: searchCondition });
    }

    // Assemble final MongoDB query filter
    if (conditions.length === 1) {
      Object.assign(filter, conditions[0]);
    } else if (conditions.length > 1) {
      filter.$and = conditions;
    }

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.min(200, Math.max(1, parseInt(limit, 10)));

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
    if (req.body.images !== undefined && Array.isArray(req.body.images)) {
      req.body.images = req.body.images
        .map((img) => (typeof img === "string" ? { url: img, alt: req.body.title || "Murti" } : img))
        .filter((img) => img && img.url);
    }

    if (
      !req.body.images ||
      !Array.isArray(req.body.images) ||
      req.body.images.length === 0 ||
      !req.body.images[0]?.url
    ) {
      return res.status(400).json({ message: "Product Images Gallery is required! Please upload at least 1 image." });
    }

    if (req.body.slug) {
      const slugConflict = await Product.findOne({ slug: req.body.slug });
      if (slugConflict) {
        req.body.slug = `${req.body.slug}-${Date.now().toString().slice(-4)}`;
      }
    }

    const product = await Product.create(req.body);
    const populated = await Product.findById(product._id)
      .populate("category", "name slug icon")
      .populate("subCategory", "name slug icon")
      .lean();
    return res.status(201).json(populated);
  } catch (error) {
    console.error("createProduct backend error:", error);
    next(error);
  }
}

/** PUT /api/products/:id (admin only) */
async function updateProduct(req, res, next) {
  try {
    if (req.body.images !== undefined) {
      if (Array.isArray(req.body.images)) {
        req.body.images = req.body.images
          .map((img) => (typeof img === "string" ? { url: img, alt: req.body.title || "Murti" } : img))
          .filter((img) => img && img.url);
      }
      if (!Array.isArray(req.body.images) || req.body.images.length === 0) {
        return res.status(400).json({ message: "Product Images Gallery is required! Please upload at least 1 image." });
      }
    }

    if (req.body.slug) {
      const slugConflict = await Product.findOne({
        slug: req.body.slug,
        _id: { $ne: req.params.id },
      });
      if (slugConflict) {
        req.body.slug = `${req.body.slug}-${Date.now().toString().slice(-4)}`;
      }
    }

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
    console.error("updateProduct backend error:", error);
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

/** GET /api/products/tags - Get all distinct product tags */
async function getAvailableTags(req, res, next) {
  try {
    const dbTags = await Product.distinct("tags");
    const validDbTags = (dbTags || [])
      .filter((t) => t && typeof t === "string" && t.trim().length > 0)
      .map((t) => t.trim());

    const tags = Array.from(new Set(validDbTags));
    return res.status(200).json(tags);
  } catch (error) {
    next(error);
  }
}

/** GET /api/products/deities - Get all available Deity / Series names */
async function getAvailableDeities(req, res, next) {
  try {
    const rawDeities = await Product.distinct("deity");

    // Also inspect active categories & subcategories for deity names
    const categories = await Category.find({ isActive: { $ne: false } }).select("name slug parentCategory").lean();
    const commonDeities = [
      "Ram",
      "Shiva",
      "Ganesh",
      "Krishna",
      "Hanuman",
      "Durga",
      "Laxmi",
      "Saraswati",
      "Vishnu",
      "Radha Krishna",
      "Khatu Shyam",
      "Balaji",
      "Mahadev",
    ];

    const deityMap = new Map(); // normalized lowerCase -> formatted Name

    function registerDeity(val) {
      if (!val || typeof val !== "string") return;
      const clean = val.trim();
      if (!clean || clean.toLowerCase() === "general") return;
      const lower = clean.toLowerCase();

      // Check if it matches a known common deity for perfect casing
      const matched = commonDeities.find((cd) => cd.toLowerCase() === lower);
      const properCase = matched || clean.replace(/[-_]/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());

      if (!deityMap.has(lower)) {
        deityMap.set(lower, properCase);
      }
    }

    (rawDeities || []).forEach(registerDeity);

    categories.forEach((cat) => {
      const matchedCommon = commonDeities.find(
        (cd) => cd.toLowerCase() === cat.name.toLowerCase() || cd.toLowerCase() === cat.slug.toLowerCase()
      );
      if (matchedCommon) {
        registerDeity(matchedCommon);
      }
    });

    if (deityMap.size === 0) {
      ["Ram", "Shiva", "Ganesh", "Krishna", "Hanuman", "Durga"].forEach(registerDeity);
    }

    const deityList = Array.from(deityMap.values()).sort((a, b) => a.localeCompare(b));
    return res.status(200).json(deityList);
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
  getAvailableTags,
  getAvailableDeities,
};
