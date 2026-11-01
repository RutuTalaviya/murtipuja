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

// Format raw string into Title Case (e.g. "khatu-shyam" -> "Khatu Shyam", "durga" -> "Durga")
function formatTitleCase(str) {
  if (!str || typeof str !== "string") return "";
  return str
    .trim()
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (l) => l.toUpperCase());
}

export default function HomeCategoryShowcase({ categories = [], products = [], deities = [] }) {
  // Client-side randomized category products map
  const [randomizedCategoryMap, setRandomizedCategoryMap] = useState({});

  // Group products strictly by Main Category (only top-level categories without parentCategory)
  const showcaseGroups = useMemo(() => {
    const groups = [];
    const mainCategories = categories.filter((cat) => !cat.parentCategory);

    mainCategories.forEach((mainCat) => {
      const catIdStr = mainCat._id ? mainCat._id.toString() : "";
      const catNameLower = (mainCat.name || "").toLowerCase().trim();
      const catSlugLower = (mainCat.slug || "").toLowerCase().trim();

      // Find any subcategories that belong to this main category
      const childSubIds = new Set(
        categories
          .filter((c) => {
            const pId = c.parentCategory?._id ? c.parentCategory._id.toString() : c.parentCategory?.toString?.();
            return pId && pId === catIdStr;
          })
          .map((c) => c._id?.toString?.())
          .filter(Boolean)
      );

      const catProducts = products.filter((p) => {
        // 1. Direct category match
        if (Array.isArray(p.category)) {
          const matched = p.category.some((c) => {
            const id = c?._id ? c._id.toString() : c?.toString?.();
            const name = (c?.name || (typeof c === "string" ? c : "")).toLowerCase().trim();
            const slug = (c?.slug || "").toLowerCase().trim();
            return (catIdStr && id === catIdStr) || (catNameLower && name === catNameLower) || (catSlugLower && slug === catSlugLower);
          });
          if (matched) return true;
        } else if (p.category) {
          const id = p.category?._id ? p.category._id.toString() : p.category.toString?.();
          const name = (p.category?.name || (typeof p.category === "string" ? p.category : "")).toLowerCase().trim();
          if ((catIdStr && id === catIdStr) || (catNameLower && name === catNameLower)) return true;
        }

        // 2. Child subcategory match
        if (Array.isArray(p.subCategory)) {
          const subMatched = p.subCategory.some((s) => {
            const id = s?._id ? s._id.toString() : s?.toString?.();
            return id && childSubIds.has(id);
          });
          if (subMatched) return true;
        } else if (p.subCategory) {
          const id = p.subCategory?._id ? p.subCategory._id.toString() : p.subCategory.toString?.();
          if (id && childSubIds.has(id)) return true;
        }

        return false;
      });

      // Deduplicate products by _id
      const uniqueCatProductsMap = new Map();
      catProducts.forEach((p) => {
        const id = p._id ? p._id.toString() : p.slug;
        if (id && !uniqueCatProductsMap.has(id)) {
          uniqueCatProductsMap.set(id, p);
        }
      });
      const uniqueCatProducts = Array.from(uniqueCatProductsMap.values());

      if (uniqueCatProducts.length > 0) {
        groups.push({
          id: `cat-${mainCat._id}`,
          name: mainCat.name,
          title: `${mainCat.name} Collection`,
          badge: `${mainCat.name} · Curated Editions`,
          slug: mainCat.slug || mainCat.name,
          link: `/products?category=${encodeURIComponent(mainCat.slug || mainCat.name)}`,
          buttonText: `All ${mainCat.name} Products`,
          products: uniqueCatProducts,
        });
      }
    });

    // Fallback: If categories have no products assigned yet, show all products
    if (groups.length === 0 && products.length > 0) {
      groups.push({
        id: "all",
        name: "Divine Sculptures",
        title: "Divine Sculptures Collection",
        badge: "Sacred Drop 01 · Active Releases",
        slug: "all",
        link: "/products",
        buttonText: "All Products",
        products: products,
      });
    }

    return groups;
  }, [categories, products]);

  // Randomize up to 4 distinct products from within that group on mount
  useEffect(() => {
    const catMap = {};
    showcaseGroups.forEach((group) => {
      const shuffledCat = shuffleArray(group.products);
      catMap[group.id] = shuffledCat.slice(0, 4);
    });
    setRandomizedCategoryMap(catMap);
  }, [showcaseGroups]);

  return (
    <div className="w-full bg-white">
      {/* 1. Series & Category Product Sections */}
      {showcaseGroups.map((group) => {
        const displayProducts =
          randomizedCategoryMap[group.id] && randomizedCategoryMap[group.id].length > 0
            ? randomizedCategoryMap[group.id]
            : group.products.slice(0, 4);

        return (
          <section
            key={group.id}
            id={`section-${group.slug || group.id}`}
            className="w-full bg-white border-b border-stone-300"
          >
            {/* Section Header Bar: Series Title on Left, "All [Series] Products" on Right */}
            <div className="w-full px-4 sm:px-8 md:px-12 lg:px-16 xl:px-20 py-6 sm:py-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-300 bg-white">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-2 h-2 rounded-full bg-amber-600"></span>
                  <p className="text-[11px] sm:text-xs uppercase tracking-widest text-amber-900 font-extrabold">
                    {group.badge}
                  </p>
                </div>
                <h2 className="font-display text-2xl sm:text-3xl md:text-4xl text-neutral-900 font-extrabold uppercase tracking-tight">
                  {group.title}
                </h2>
              </div>

              {/* Right Side: All [Series] Products CTA */}
              <Link
                href={group.link}
                className="inline-flex items-center gap-2 text-xs font-extrabold text-neutral-800 hover:text-amber-800 uppercase tracking-widest transition-colors group self-start sm:self-center py-2 px-3 sm:px-4 rounded-none border border-stone-300 hover:border-black bg-stone-50 hover:bg-white shadow-2xs"
              >
                <span>{group.buttonText}</span>
                <span className="text-amber-800 font-bold group-hover:translate-x-1 transition-transform">
                  ({group.products.length}) →
                </span>
              </Link>
            </div>

            {/* Edge-to-Edge Grid: 2 col mobile, up to 4 desktop with crisp borders */}
            <div className="w-full grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 divide-stone-300 bg-white">
              {displayProducts.map((product) => (
                <div key={product._id} className="h-full flex flex-col justify-between w-full border-r border-b border-stone-300">
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


