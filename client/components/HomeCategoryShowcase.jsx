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

  // Group products by Series / Deity first, then by Subcategories/Categories
  const showcaseGroups = useMemo(() => {
    const groups = [];
    const seenGroupKeys = new Set();

    // 1. Group by Series / Deity (Primary Showcase Axis)
    const deityMap = new Map(); // normalized lowerCase -> formatted Name

    // Collect deities from products
    products.forEach((p) => {
      if (p.deity && typeof p.deity === "string") {
        const clean = p.deity.trim();
        if (clean && clean.toLowerCase() !== "general") {
          const lower = clean.toLowerCase();
          if (!deityMap.has(lower)) {
            deityMap.set(lower, formatTitleCase(clean));
          }
        }
      }
    });

    // Also collect deities from API list if any
    (deities || []).forEach((d) => {
      if (d && typeof d === "string") {
        const clean = d.trim();
        if (clean && clean.toLowerCase() !== "general") {
          const lower = clean.toLowerCase();
          if (!deityMap.has(lower)) {
            deityMap.set(lower, formatTitleCase(clean));
          }
        }
      }
    });

    // Build Series groups
    deityMap.forEach((formattedName, lowerDeity) => {
      const slug = lowerDeity.replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

      // Find all matching products for this series
      const seriesProducts = products.filter((p) => {
        const pDeity = (p.deity || "").toLowerCase().trim();
        if (pDeity === lowerDeity || pDeity.includes(lowerDeity) || lowerDeity.includes(pDeity)) {
          return true;
        }
        if (Array.isArray(p.tags)) {
          const hasTag = p.tags.some((t) => {
            const cleanT = String(t).toLowerCase().trim();
            return cleanT === lowerDeity || cleanT.includes(lowerDeity);
          });
          if (hasTag) return true;
        }
        return false;
      });

      // Deduplicate products by _id
      const uniqueProductsMap = new Map();
      seriesProducts.forEach((p) => {
        const id = p._id ? p._id.toString() : p.slug;
        if (id && !uniqueProductsMap.has(id)) {
          uniqueProductsMap.set(id, p);
        }
      });
      const uniqueProducts = Array.from(uniqueProductsMap.values());

      if (uniqueProducts.length > 0) {
        seenGroupKeys.add(lowerDeity);
        groups.push({
          id: `series-${slug}`,
          name: formattedName,
          title: `${formattedName} Series Collection`,
          badge: `${formattedName} Series · Active Releases`,
          slug: slug,
          link: `/products?deity=${encodeURIComponent(formattedName)}`,
          buttonText: `All ${formattedName} Products`,
          products: uniqueProducts,
        });
      }
    });

    // 2. Add Subcategory groups (if not duplicate of any deity series)
    const subCategories = categories.filter((cat) => cat.parentCategory);
    const mainCategories = categories.filter((cat) => !cat.parentCategory);

    subCategories.forEach((subCat) => {
      const subNameLower = (subCat.name || "").toLowerCase().trim();
      if (seenGroupKeys.has(subNameLower)) return;

      const parentCat = mainCategories.find(
        (m) =>
          m._id?.toString() === subCat.parentCategory?._id?.toString() ||
          m._id?.toString() === subCat.parentCategory?.toString()
      );

      const subIdStr = subCat._id ? subCat._id.toString() : "";

      const subProducts = products.filter((p) => {
        if (Array.isArray(p.subCategory)) {
          return p.subCategory.some((s) => {
            const id = s?._id ? s._id.toString() : s?.toString?.();
            const name = String(typeof s === "string" ? s : s?.name || "").toLowerCase().trim();
            return (subIdStr && id === subIdStr) || (subNameLower && name === subNameLower);
          });
        }
        if (p.subCategory) {
          const id = p.subCategory?._id ? p.subCategory._id.toString() : p.subCategory.toString?.();
          return subIdStr && id === subIdStr;
        }
        return false;
      });

      // Deduplicate products
      const uniqueSubProductsMap = new Map();
      subProducts.forEach((p) => {
        const id = p._id ? p._id.toString() : p.slug;
        if (id && !uniqueSubProductsMap.has(id)) {
          uniqueSubProductsMap.set(id, p);
        }
      });
      const uniqueSubProducts = Array.from(uniqueSubProductsMap.values());

      if (uniqueSubProducts.length > 0) {
        seenGroupKeys.add(subNameLower);
        groups.push({
          id: `sub-${subCat._id}`,
          name: subCat.name,
          title: `${subCat.name} Collection`,
          badge: `${parentCat ? `${parentCat.name} · ` : ""}${subCat.name} Subcategory · Active Releases`,
          slug: subCat.slug,
          link: parentCat
            ? `/products?category=${encodeURIComponent(parentCat.slug || parentCat.name)}&subCategory=${encodeURIComponent(subCat.slug || subCat.name)}`
            : `/products?subCategory=${encodeURIComponent(subCat.slug || subCat.name)}`,
          buttonText: `All ${subCat.name} Products`,
          products: uniqueSubProducts,
        });
      }
    });

    // 3. Add Main Category groups (if not duplicate of any deity series or subcategory)
    mainCategories.forEach((mainCat) => {
      const catNameLower = (mainCat.name || "").toLowerCase().trim();
      if (seenGroupKeys.has(catNameLower)) return;

      const catIdStr = mainCat._id ? mainCat._id.toString() : "";
      const catProducts = products.filter((p) => {
        if (Array.isArray(p.category)) {
          return p.category.some((c) => {
            const id = c?._id ? c._id.toString() : c?.toString?.();
            const name = (c?.name || "").toLowerCase().trim();
            return (catIdStr && id === catIdStr) || (catNameLower && name === catNameLower);
          });
        }
        if (p.category) {
          const id = p.category?._id ? p.category._id.toString() : p.category.toString?.();
          return catIdStr && id === catIdStr;
        }
        return false;
      });

      const uniqueCatProductsMap = new Map();
      catProducts.forEach((p) => {
        const id = p._id ? p._id.toString() : p.slug;
        if (id && !uniqueCatProductsMap.has(id)) {
          uniqueCatProductsMap.set(id, p);
        }
      });
      const uniqueCatProducts = Array.from(uniqueCatProductsMap.values());

      if (uniqueCatProducts.length > 0) {
        seenGroupKeys.add(catNameLower);
        groups.push({
          id: `cat-${mainCat._id}`,
          name: mainCat.name,
          title: `${mainCat.name} Collection`,
          badge: `${mainCat.name} Category · Active Releases`,
          slug: mainCat.slug,
          link: `/products?category=${encodeURIComponent(mainCat.slug || mainCat.name)}`,
          buttonText: `All ${mainCat.name} Products`,
          products: uniqueCatProducts,
        });
      }
    });

    // Fallback: If no groups matched but products exist
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
  }, [categories, products, deities]);

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


