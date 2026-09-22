"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import ProductCard from "./ProductCard";

// Helper function to shuffle an array (Fisher-Yates)
function shuffleArray(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// Check if a product matches a category (including all its subcategories)
function isProductInCategory(product, category, allCategories = []) {
  if (!product || !category) return false;
  const catIdStr = category._id ? category._id.toString() : "";
  const catNameLower = (category.name || "").toLowerCase().trim();
  const catSlugLower = (category.slug || "").toLowerCase().trim();

  // Subcategory IDs belonging to this main category
  const childCategoryIds = allCategories
    .filter(
      (c) =>
        c.parentCategory &&
        (c.parentCategory._id?.toString?.() === catIdStr ||
          c.parentCategory?.toString?.() === catIdStr)
    )
    .map((c) => c._id?.toString?.() || "");

  const allValidCategoryIds = [catIdStr, ...childCategoryIds].filter(Boolean);

  // 1. Match against product.category array or object
  if (Array.isArray(product.category)) {
    const match = product.category.some((c) => {
      const id = c?._id ? c._id.toString() : c?.toString?.();
      const name = (c?.name || "").toLowerCase().trim();
      const slug = (c?.slug || "").toLowerCase().trim();
      return (
        allValidCategoryIds.includes(id) ||
        (catNameLower && name === catNameLower) ||
        (catSlugLower && slug === catSlugLower)
      );
    });
    if (match) return true;
  } else if (product.category) {
    const id = product.category?._id ? product.category._id.toString() : product.category.toString?.();
    if (allValidCategoryIds.includes(id)) return true;
  }

  // 2. Match against product.subCategory array or object
  if (Array.isArray(product.subCategory)) {
    const match = product.subCategory.some((sub) => {
      const id = sub?._id ? sub._id.toString() : sub?.toString?.();
      const rawName = typeof sub === "string" ? sub : sub?.name || "";
      const name = String(rawName).toLowerCase().trim();
      return allValidCategoryIds.includes(id) || (catNameLower && name.includes(catNameLower));
    });
    if (match) return true;
  } else if (product.subCategory) {
    const id = product.subCategory?._id ? product.subCategory._id.toString() : product.subCategory.toString?.();
    if (allValidCategoryIds.includes(id)) return true;
  }

  // 3. Match against product.deity string
  if (product.deity) {
    const deityLower = product.deity.toLowerCase().trim();
    if (
      deityLower === catNameLower ||
      deityLower === catSlugLower ||
      (catNameLower.length >= 3 && deityLower.startsWith(catNameLower)) ||
      (catSlugLower.length >= 3 && deityLower.startsWith(catSlugLower))
    ) {
      return true;
    }
  }

  return false;
}

export default function HomeCategoryShowcase({ categories = [], products = [] }) {
  // Client-side randomized category products map
  const [randomizedCategoryMap, setRandomizedCategoryMap] = useState({});

  // Filter only top-level / main categories
  const mainCategories = useMemo(() => {
    return categories.filter((cat) => !cat.parentCategory);
  }, [categories]);

  // Group products by category (including all subcategories)
  const categoryGroups = useMemo(() => {
    const groups = [];

    mainCategories.forEach((cat) => {
      const catProducts = products.filter((p) => isProductInCategory(p, cat, categories));
      if (catProducts.length > 0) {
        groups.push({
          category: cat,
          products: catProducts,
        });
      }
    });

    // Fallback: If no category matched but products exist, create a group
    if (groups.length === 0 && products.length > 0) {
      groups.push({
        category: { _id: "all", name: "Divine Sculptures", slug: "all" },
        products: products,
      });
    }

    return groups;
  }, [mainCategories, products]);

  // Randomize up to 4 products STRICTLY from within that category on mount
  useEffect(() => {
    const catMap = {};
    categoryGroups.forEach((group) => {
      // Shuffled category-specific products only (no other categories mixed in)
      const shuffledCat = shuffleArray(group.products);
      catMap[group.category._id] = shuffledCat.slice(0, 4);
    });
    setRandomizedCategoryMap(catMap);
  }, [categoryGroups]);

  return (
    <div className="w-full bg-white">
      {/* 1. Category-Wise Product Sections (Strictly Same-Category Random Products) */}
      {categoryGroups.map(({ category, products: catProducts }) => {
        // Use randomized products strictly from this category
        const displayProducts =
          randomizedCategoryMap[category._id] && randomizedCategoryMap[category._id].length > 0
            ? randomizedCategoryMap[category._id]
            : catProducts.slice(0, 4);

        const categoryLink =
          category.slug && category.slug !== "all"
            ? `/products?category=${encodeURIComponent(category.name)}`
            : "/products";

        return (
          <section
            key={category._id}
            id={`category-${category.slug || category._id}`}
            className="w-full bg-white border-b border-stone-300"
          >
            {/* Section Header Bar: Category Title on Left, "All Products" on Right */}
            <div className="w-full px-4 sm:px-8 md:px-12 lg:px-16 xl:px-20 py-6 sm:py-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-300 bg-white">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-2 h-2 rounded-full bg-amber-600"></span>
                  <p className="text-[11px] sm:text-xs uppercase tracking-widest text-amber-900 font-extrabold">
                    {category.name} Series · Active Releases
                  </p>
                </div>
                <h2 className="font-display text-2xl sm:text-3xl md:text-4xl text-neutral-900 font-extrabold uppercase tracking-tight">
                  {category.name === "Divine Sculptures" ? category.name : `${category.name} Collection`}
                </h2>
              </div>

              {/* Right Side: All [Category] Products CTA */}
              <Link
                href={categoryLink}
                className="inline-flex items-center gap-2 text-xs font-extrabold text-neutral-800 hover:text-amber-800 uppercase tracking-widest transition-colors group self-start sm:self-center py-2 px-3 sm:px-4 rounded-none border border-stone-300 hover:border-black bg-stone-50 hover:bg-white shadow-2xs"
              >
                <span>All {category.name} Products</span>
                <span className="text-amber-800 font-bold group-hover:translate-x-1 transition-transform">
                  ({catProducts.length}) →
                </span>
              </Link>
            </div>

            {/* Edge-to-Edge Grid: 1 col mobile, 2 tablet, up to 4 desktop with crisp borders */}
            <div className="w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-stone-300 bg-white">
              {displayProducts.map((product) => (
                <div key={product._id} className="h-full flex flex-col justify-between w-full">
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          </section>
        );
      })}

      {/* 2. Bottom Section: Full Store Catalog Button */}
      <section className="w-full bg-[#fdfcfb] py-14 sm:py-16 px-6 sm:px-12 md:px-16 lg:px-20 border-b border-stone-300 text-center">
        <div className="max-w-4xl mx-auto space-y-4">
          <p className="text-xs uppercase tracking-widest text-amber-800 font-extrabold">
            Complete Sacred Collection
          </p>
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl text-neutral-900 font-extrabold uppercase tracking-tight">
            Explore The Full Store
          </h2>
          <p className="text-stone-600 text-xs sm:text-sm max-w-xl mx-auto font-normal">
            Discover all micro-precision 3D printed deities, temple editions, lighting murtis, and devotional collections.
          </p>
          <div className="pt-2">
            <Link
              href="/products"
              className="inline-flex items-center gap-3 px-9 sm:px-12 py-4 bg-black hover:bg-gold hover:text-black text-white text-xs sm:text-sm font-extrabold uppercase tracking-widest border border-black transition-all shadow-md active:scale-95 cursor-pointer"
            >
              <span>VIEW FULL STORE CATALOG ({products.length} PRODUCTS)</span>
              <span>→</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
