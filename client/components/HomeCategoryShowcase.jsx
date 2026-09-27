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

// Check if a product matches a subcategory
function isProductInSubCategory(product, subCategory) {
  if (!product || !subCategory) return false;
  const subIdStr = subCategory._id ? subCategory._id.toString() : "";
  const subNameLower = (subCategory.name || "").toLowerCase().trim();
  const subSlugLower = (subCategory.slug || "").toLowerCase().trim();

  // 1. Match against product.subCategory array or object
  if (Array.isArray(product.subCategory)) {
    const match = product.subCategory.some((sub) => {
      const id = sub?._id ? sub._id.toString() : sub?.toString?.();
      const rawName = typeof sub === "string" ? sub : sub?.name || "";
      const name = String(rawName).toLowerCase().trim();
      const slug = String(sub?.slug || "").toLowerCase().trim();
      return (
        (subIdStr && id === subIdStr) ||
        (subNameLower && (name === subNameLower || name.includes(subNameLower))) ||
        (subSlugLower && slug === subSlugLower)
      );
    });
    if (match) return true;
  } else if (product.subCategory) {
    const id = product.subCategory?._id ? product.subCategory._id.toString() : product.subCategory.toString?.();
    const rawName = typeof product.subCategory === "string" ? product.subCategory : product.subCategory?.name || "";
    const name = String(rawName).toLowerCase().trim();
    if ((subIdStr && id === subIdStr) || (subNameLower && name.includes(subNameLower))) return true;
  }

  // 2. Match against product.category if product has matching category name or slug
  if (Array.isArray(product.category)) {
    const match = product.category.some((c) => {
      const id = c?._id ? c._id.toString() : c?.toString?.();
      const name = (c?.name || "").toLowerCase().trim();
      const slug = (c?.slug || "").toLowerCase().trim();
      return (
        (subIdStr && id === subIdStr) ||
        (subNameLower && name === subNameLower) ||
        (subSlugLower && slug === subSlugLower)
      );
    });
    if (match) return true;
  }

  // 3. Match against product.deity string
  if (product.deity && subNameLower) {
    const deityLower = product.deity.toLowerCase().trim();
    if (deityLower === subNameLower || deityLower.includes(subNameLower) || subNameLower.includes(deityLower)) {
      return true;
    }
  }

  return false;
}

// Check if a product matches a main category
function isProductInMainCategory(product, mainCategory) {
  if (!product || !mainCategory) return false;
  const catIdStr = mainCategory._id ? mainCategory._id.toString() : "";
  const catNameLower = (mainCategory.name || "").toLowerCase().trim();
  const catSlugLower = (mainCategory.slug || "").toLowerCase().trim();

  if (Array.isArray(product.category)) {
    return product.category.some((c) => {
      const id = c?._id ? c._id.toString() : c?.toString?.();
      const name = (c?.name || "").toLowerCase().trim();
      const slug = (c?.slug || "").toLowerCase().trim();
      return (
        (catIdStr && id === catIdStr) ||
        (catNameLower && name === catNameLower) ||
        (catSlugLower && slug === catSlugLower)
      );
    });
  } else if (product.category) {
    const id = product.category?._id ? product.category._id.toString() : product.category.toString?.();
    return catIdStr && id === catIdStr;
  }

  if (product.deity && catNameLower) {
    const deityLower = product.deity.toLowerCase().trim();
    return deityLower === catNameLower || deityLower === catSlugLower;
  }

  return false;
}

export default function HomeCategoryShowcase({ categories = [], products = [] }) {
  // Client-side randomized category products map
  const [randomizedCategoryMap, setRandomizedCategoryMap] = useState({});

  // Group products by subcategories (primary display axis)
  const categoryGroups = useMemo(() => {
    const groups = [];
    const matchedProductIds = new Set();

    const subCategories = categories.filter((cat) => cat.parentCategory);
    const mainCategories = categories.filter((cat) => !cat.parentCategory);

    // 1. Group by Subcategories first
    subCategories.forEach((subCat) => {
      const parentCat = mainCategories.find(
        (m) =>
          m._id?.toString() === subCat.parentCategory?._id?.toString() ||
          m._id?.toString() === subCat.parentCategory?.toString()
      );

      const subProducts = products.filter((p) => isProductInSubCategory(p, subCat));
      if (subProducts.length > 0) {
        subProducts.forEach((p) => matchedProductIds.add(p._id?.toString()));
        groups.push({
          id: subCat._id,
          name: subCat.name,
          slug: subCat.slug,
          isSub: true,
          parentName: parentCat?.name || "",
          parentSlug: parentCat?.slug || "",
          link: parentCat
            ? `/products?category=${encodeURIComponent(parentCat.slug || parentCat.name)}&subCategory=${encodeURIComponent(subCat.slug || subCat.name)}`
            : `/products?subCategory=${encodeURIComponent(subCat.slug || subCat.name)}`,
          products: subProducts,
        });
      }
    });

    // 2. For products that didn't match any subcategory, group by main category
    mainCategories.forEach((mainCat) => {
      const remainingProducts = products.filter(
        (p) => !matchedProductIds.has(p._id?.toString()) && isProductInMainCategory(p, mainCat)
      );

      if (remainingProducts.length > 0) {
        groups.push({
          id: mainCat._id,
          name: mainCat.name,
          slug: mainCat.slug,
          isSub: false,
          parentName: "",
          parentSlug: "",
          link: `/products?category=${encodeURIComponent(mainCat.slug || mainCat.name)}`,
          products: remainingProducts,
        });
      }
    });

    // Fallback: If no groups matched but products exist
    if (groups.length === 0 && products.length > 0) {
      groups.push({
        id: "all",
        name: "Divine Sculptures",
        slug: "all",
        isSub: false,
        parentName: "",
        parentSlug: "",
        link: "/products",
        products: products,
      });
    }

    return groups;
  }, [categories, products]);

  // Randomize up to 4 products STRICTLY from within that subcategory/category on mount
  useEffect(() => {
    const catMap = {};
    categoryGroups.forEach((group) => {
      const shuffledCat = shuffleArray(group.products);
      catMap[group.id] = shuffledCat.slice(0, 4);
    });
    setRandomizedCategoryMap(catMap);
  }, [categoryGroups]);

  return (
    <div className="w-full bg-white">
      {/* 1. Subcategory-Wise Product Sections */}
      {categoryGroups.map((group) => {
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
            {/* Section Header Bar: Subcategory Title on Left, "All Products" on Right */}
            <div className="w-full px-4 sm:px-8 md:px-12 lg:px-16 xl:px-20 py-6 sm:py-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-300 bg-white">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-2 h-2 rounded-full bg-amber-600"></span>
                  <p className="text-[11px] sm:text-xs uppercase tracking-widest text-amber-900 font-extrabold">
                    {group.parentName ? `${group.parentName} · ` : ""}{group.name} {group.isSub ? "Subcategory" : "Series"} · Active Releases
                  </p>
                </div>
                <h2 className="font-display text-2xl sm:text-3xl md:text-4xl text-neutral-900 font-extrabold uppercase tracking-tight">
                  {group.name} Collection
                </h2>
              </div>

              {/* Right Side: All [Subcategory] Products CTA */}
              <Link
                href={group.link}
                className="inline-flex items-center gap-2 text-xs font-extrabold text-neutral-800 hover:text-amber-800 uppercase tracking-widest transition-colors group self-start sm:self-center py-2 px-3 sm:px-4 rounded-none border border-stone-300 hover:border-black bg-stone-50 hover:bg-white shadow-2xs"
              >
                <span>All {group.name} Products</span>
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

