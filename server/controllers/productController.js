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
    const rawKey = decodeURIComponent(req.params.slug || "").trim();
    if (!rawKey) {
      return res.status(400).json({ message: "Product slug or ID is required" });
    }

    let product = null;

    // 1. Try finding by MongoDB ObjectId
    if (mongoose.Types.ObjectId.isValid(rawKey)) {
      product = await Product.findById(rawKey)
        .populate("category", "name slug icon parentCategory")
        .populate("subCategory", "name slug icon parentCategory")
        .lean();
    }

    // 2. Try finding by exact slug
    if (!product) {
      product = await Product.findOne({ slug: rawKey.toLowerCase() })
        .populate("category", "name slug icon parentCategory")
        .populate("subCategory", "name slug icon parentCategory")
        .lean();
    }

    // 3. Try finding by case-insensitive regex slug
    if (!product) {
      product = await Product.findOne({
        slug: new RegExp(`^${escapeRegex(rawKey)}$`, "i"),
      })
        .populate("category", "name slug icon parentCategory")
        .populate("subCategory", "name slug icon parentCategory")
        .lean();
    }

    // 4. Try finding by title
    if (!product) {
      product = await Product.findOne({
        title: new RegExp(`^${escapeRegex(rawKey)}$`, "i"),
      })
        .populate("category", "name slug icon parentCategory")
        .populate("subCategory", "name slug icon parentCategory")
        .lean();
    }

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    try {
      const ComboOffer = require("../models/ComboOffer");
      const combos = await ComboOffer.find({ products: product._id, isActive: true })
        .populate("products", "title slug images variants basePrice")
        .lean();
      product.comboOffers = combos || [];
    } catch (comboErr) {
      product.comboOffers = [];
    }

    return res.status(200).json(product);
  } catch (error) {
    console.error("getProductBySlug backend error:", error);
    next(error);
  }
}

/** POST /api/products (admin only) */
async function createProduct(req, res, next) {
  try {
    // Process and normalize variant images
    const allVariantImages = [];
    if (Array.isArray(req.body.variants)) {
      // Fetch category and subcategory names for auto SKU if needed
      let mainCatName = "";
      let subCatName = "";
      if (req.body.category && req.body.category[0]) {
        try {
          const catDoc = await Category.findById(req.body.category[0]).select("name slug");
          if (catDoc) mainCatName = catDoc.name;
        } catch (e) {}
      }
      if (req.body.subCategory && req.body.subCategory[0]) {
        try {
          const subDoc = await Category.findById(req.body.subCategory[0]).select("name slug");
          if (subDoc) subCatName = subDoc.name;
        } catch (e) {}
      }

      const cleanSkuToken = (str) => (!str ? "" : str.toString().trim().toUpperCase().replace(/[^A-Z0-9]+/g, "-").replace(/(^-|-$)/g, ""));
      const cleanSizeToken = (str) => (!str ? "6INCH" : str.toString().trim().toUpperCase().replace(/\s+/g, "").replace(/[^A-Z0-9-]/g, ""));

      req.body.variants = req.body.variants.map((v, i) => {
        let vImages = [];
        if (Array.isArray(v.images) && v.images.length > 0) {
          vImages = v.images
            .map((img) => {
              if (typeof img === "string") return { url: img, alt: `${req.body.title || "Murti"} - ${v.finish || ""}` };
              if (img && typeof img === "object" && img.url) return { url: img.url, alt: img.alt || `${req.body.title || "Murti"} - ${v.finish || ""}` };
              return null;
            })
            .filter(Boolean);
        } else if (v.image) {
          const singleUrl = typeof v.image === "object" ? v.image?.url : v.image;
          if (singleUrl) {
            vImages = [{ url: singleUrl, alt: `${req.body.title || "Murti"} - ${v.finish || ""}` }];
          }
        }
        vImages.forEach((img) => {
          if (img && img.url) allVariantImages.push(img);
        });
        const firstUrl = vImages[0]?.url || (typeof v.image === "object" ? v.image?.url : v.image) || "";
        
        const catToken = cleanSkuToken(mainCatName) || cleanSkuToken(req.body.deity) || "MURTI";
        const subToken = cleanSkuToken(subCatName) || cleanSkuToken(req.body.deity) || cleanSkuToken((req.body.title || "").slice(0, 4)) || "GEN";
        const sizeToken = cleanSizeToken(v.size);
        const finishToken = cleanSkuToken(v.finish || "STD");
        const autoSku = `${catToken}-${subToken}-${sizeToken}-${finishToken}`;
        const sku = v.sku || autoSku;
        
        const variantObj = {
          size: v.size || "6 inch",
          finish: v.finish || "Standard",
          price: Number(v.price) || Number(req.body.basePrice || 0),
          discountPrice: v.discountPrice !== undefined && v.discountPrice !== null && v.discountPrice !== "" ? Number(v.discountPrice) : null,
          stock: Number(v.stock) || 0,
          sku,
          weight: v.weight || "500g",
          images: vImages,
          image: firstUrl,
        };
        if (v._id && mongoose.Types.ObjectId.isValid(v._id)) {
          variantObj._id = new mongoose.Types.ObjectId(v._id);
        }
        return variantObj;
      });
    }

    if (req.body.images !== undefined && Array.isArray(req.body.images)) {
      req.body.images = req.body.images
        .map((img) => {
          if (typeof img === "string") return { url: img, alt: req.body.title || "Murti" };
          if (img && typeof img === "object" && img.url) return { url: img.url, alt: img.alt || req.body.title || "Murti" };
          return null;
        })
        .filter(Boolean);
    }

    if ((!req.body.images || req.body.images.length === 0) && allVariantImages.length > 0) {
      req.body.images = allVariantImages.slice(0, 2);
    }

    if (req.body.category) {
      req.body.category = (Array.isArray(req.body.category) ? req.body.category : [req.body.category])
        .map((c) => (typeof c === "object" ? c?._id : c))
        .filter((id) => id && mongoose.Types.ObjectId.isValid(id))
        .map((id) => new mongoose.Types.ObjectId(id));
    }
    if (req.body.subCategory) {
      req.body.subCategory = (Array.isArray(req.body.subCategory) ? req.body.subCategory : [req.body.subCategory])
        .map((s) => (typeof s === "object" ? s?._id : s))
        .filter((id) => id && mongoose.Types.ObjectId.isValid(id))
        .map((id) => new mongoose.Types.ObjectId(id));
    }

    if (
      (!req.body.images || !Array.isArray(req.body.images) || req.body.images.length < 2 || !req.body.images[0]?.url || !req.body.images[1]?.url) &&
      allVariantImages.length < 2
    ) {
      return res.status(400).json({ message: "Product Cover & Hover Images are required! Please upload both Cover Image (#1) and Hover Image (#2)." });
    }

    if (req.body.slug) {
      const slugConflict = await Product.findOne({ slug: req.body.slug });
      if (slugConflict) {
        req.body.slug = `${req.body.slug}-${Date.now().toString().slice(-4)}`;
      }
    }

    const product = new Product(req.body);
    product.markModified("variants");
    product.markModified("images");
    product.markModified("category");
    product.markModified("subCategory");
    await product.save();

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
    const rawId = (req.params.id || "").trim();
    let existingProduct = null;

    if (mongoose.Types.ObjectId.isValid(rawId)) {
      existingProduct = await Product.findById(rawId);
    }
    if (!existingProduct && req.body.slug) {
      existingProduct = await Product.findOne({ slug: req.body.slug.toLowerCase().trim() });
    }
    if (!existingProduct && rawId) {
      existingProduct = await Product.findOne({ slug: rawId.toLowerCase() });
    }
    if (!existingProduct && rawId) {
      existingProduct = await Product.findOne({
        slug: new RegExp(`^${escapeRegex(rawId)}$`, "i"),
      });
    }

    if (!existingProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    const allVariantImages = [];
    let processedVariants = existingProduct.variants || [];
    if (Array.isArray(req.body.variants)) {
      // Fetch category and subcategory names for auto SKU if needed
      let mainCatName = "";
      let subCatName = "";
      const catId = (req.body.category && req.body.category[0]) || (existingProduct.category && existingProduct.category[0]);
      const subCatId = (req.body.subCategory && req.body.subCategory[0]) || (existingProduct.subCategory && existingProduct.subCategory[0]);
      if (catId) {
        try {
          const catDoc = await Category.findById(catId).select("name slug");
          if (catDoc) mainCatName = catDoc.name;
        } catch (e) {}
      }
      if (subCatId) {
        try {
          const subDoc = await Category.findById(subCatId).select("name slug");
          if (subDoc) subCatName = subDoc.name;
        } catch (e) {}
      }

      const cleanSkuToken = (str) => (!str ? "" : str.toString().trim().toUpperCase().replace(/[^A-Z0-9]+/g, "-").replace(/(^-|-$)/g, ""));
      const cleanSizeToken = (str) => (!str ? "6INCH" : str.toString().trim().toUpperCase().replace(/\s+/g, "").replace(/[^A-Z0-9-]/g, ""));

      processedVariants = req.body.variants.map((v, i) => {
        let vImages = [];
        if (Array.isArray(v.images) && v.images.length > 0) {
          vImages = v.images
            .map((img) => {
              if (typeof img === "string") return { url: img, alt: `${req.body.title || existingProduct.title || "Murti"} - ${v.finish || ""}` };
              if (img && typeof img === "object" && img.url) return { url: img.url, alt: img.alt || `${req.body.title || existingProduct.title || "Murti"} - ${v.finish || ""}` };
              return null;
            })
            .filter(Boolean);
        } else if (v.image) {
          const singleUrl = typeof v.image === "object" ? v.image?.url : v.image;
          if (singleUrl) {
            vImages = [{ url: singleUrl, alt: `${req.body.title || existingProduct.title || "Murti"} - ${v.finish || ""}` }];
          }
        }
        vImages.forEach((img) => {
          if (img && img.url) allVariantImages.push(img);
        });
        const firstUrl = vImages[0]?.url || (typeof v.image === "object" ? v.image?.url : v.image) || "";
        
        const catToken = cleanSkuToken(mainCatName) || cleanSkuToken(req.body.deity || existingProduct.deity) || "MURTI";
        const subToken = cleanSkuToken(subCatName) || cleanSkuToken(req.body.deity || existingProduct.deity) || cleanSkuToken((req.body.title || existingProduct.title || "").slice(0, 4)) || "GEN";
        const sizeToken = cleanSizeToken(v.size);
        const finishToken = cleanSkuToken(v.finish || "STD");
        const autoSku = `${catToken}-${subToken}-${sizeToken}-${finishToken}`;
        const sku = v.sku || autoSku;
        
        const variantObj = {
          size: v.size || "6 inch",
          finish: v.finish || "Standard",
          price: Number(v.price) || Number(req.body.basePrice || existingProduct.basePrice || 0),
          discountPrice: v.discountPrice !== undefined && v.discountPrice !== null && v.discountPrice !== "" ? Number(v.discountPrice) : null,
          stock: Number(v.stock) || 0,
          sku,
          weight: v.weight || "500g",
          images: vImages,
          image: firstUrl,
        };
        if (v._id && mongoose.Types.ObjectId.isValid(v._id)) {
          variantObj._id = new mongoose.Types.ObjectId(v._id);
        }
        return variantObj;
      });
    }

    let processedImages = existingProduct.images || [];
    if (req.body.images !== undefined && Array.isArray(req.body.images)) {
      processedImages = req.body.images
        .map((img) => {
          if (typeof img === "string") return { url: img, alt: req.body.title || existingProduct.title || "Murti" };
          if (img && typeof img === "object" && img.url) return { url: img.url, alt: img.alt || req.body.title || existingProduct.title || "Murti" };
          return null;
        })
        .filter(Boolean);
    }

    if ((!processedImages || processedImages.length === 0) && allVariantImages.length > 0) {
      processedImages = allVariantImages.slice(0, 2);
    }

    let categoryIds = existingProduct.category;
    if (req.body.category !== undefined) {
      categoryIds = (Array.isArray(req.body.category) ? req.body.category : [req.body.category])
        .map((c) => (typeof c === "object" ? c?._id : c))
        .filter((id) => id && mongoose.Types.ObjectId.isValid(id))
        .map((id) => new mongoose.Types.ObjectId(id));
    }

    let subCategoryIds = existingProduct.subCategory;
    if (req.body.subCategory !== undefined) {
      subCategoryIds = (Array.isArray(req.body.subCategory) ? req.body.subCategory : [req.body.subCategory])
        .map((s) => (typeof s === "object" ? s?._id : s))
        .filter((id) => id && mongoose.Types.ObjectId.isValid(id))
        .map((id) => new mongoose.Types.ObjectId(id));
    }

    let targetSlug = existingProduct.slug;
    if (req.body.slug && req.body.slug !== existingProduct.slug) {
      targetSlug = req.body.slug.toLowerCase().trim();
      const slugConflict = await Product.findOne({
        slug: targetSlug,
        _id: { $ne: existingProduct._id },
      });
      if (slugConflict) {
        targetSlug = `${targetSlug}-${Date.now().toString().slice(-4)}`;
      }
    }

    const updateDoc = {
      title: req.body.title !== undefined ? req.body.title.trim() : existingProduct.title,
      slug: targetSlug,
      description: req.body.description !== undefined ? req.body.description.trim() : existingProduct.description,
      deity: req.body.deity !== undefined ? req.body.deity.trim() : existingProduct.deity,
      basePrice: req.body.basePrice !== undefined ? Number(req.body.basePrice) : existingProduct.basePrice,
      isOnSale: req.body.isOnSale !== undefined ? Boolean(req.body.isOnSale) : existingProduct.isOnSale,
      isFeatured: req.body.isFeatured !== undefined ? Boolean(req.body.isFeatured) : existingProduct.isFeatured,
      isCustomizable: req.body.isCustomizable !== undefined ? Boolean(req.body.isCustomizable) : existingProduct.isCustomizable,
      category: categoryIds,
      subCategory: subCategoryIds,
      purpose: req.body.purpose !== undefined ? req.body.purpose : existingProduct.purpose,
      tags: req.body.tags !== undefined ? req.body.tags : existingProduct.tags,
      images: processedImages,
      videos: req.body.videos !== undefined ? req.body.videos : existingProduct.videos,
      productDetails: req.body.productDetails !== undefined ? req.body.productDetails : existingProduct.productDetails,
      materialsAndCare: req.body.materialsAndCare !== undefined ? req.body.materialsAndCare : existingProduct.materialsAndCare,
      shippingReturns: req.body.shippingReturns !== undefined ? req.body.shippingReturns : existingProduct.shippingReturns,
      accordionSections: req.body.accordionSections !== undefined ? req.body.accordionSections : existingProduct.accordionSections,
      variants: processedVariants,
    };

    const updated = await Product.findByIdAndUpdate(
      existingProduct._id,
      { $set: updateDoc },
      { new: true, runValidators: true }
    )
      .populate("category", "name slug icon")
      .populate("subCategory", "name slug icon")
      .lean();

    console.log(`[Product Update] Successfully updated "${updated.title}" (${updated._id}) with ${updated.variants?.length} variants and ${updated.images?.length} images`);

    return res.status(200).json(updated);
  } catch (error) {
    console.error("updateProduct backend error:", error);
    next(error);
  }
}

/** DELETE /api/products/:id (admin only) */
async function deleteProduct(req, res, next) {
  try {
    const rawId = (req.params.id || "").trim();
    let product = null;
    if (mongoose.Types.ObjectId.isValid(rawId)) {
      product = await Product.findByIdAndDelete(rawId);
    }
    if (!product && rawId) {
      product = await Product.findOneAndDelete({ slug: rawId.toLowerCase() });
    }
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
