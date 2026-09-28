"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getCategories, getProductTags, getDeities, getPurposes } from "@/lib/api";

const SORT_OPTIONS = [
  { label: "Newest First", value: "-createdAt" },
  { label: "Price: Low to High", value: "basePrice" },
  { label: "Price: High to Low", value: "-basePrice" },
  { label: "Alphabetical: A-Z", value: "title" },
  { label: "Oldest First", value: "createdAt" },
];

export default function ProductFiltersDrawer({ totalResults }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [isOpen, setIsOpen] = useState(false);
  const [deities, setDeities] = useState(["Ram", "Shiva", "Ganesh", "Krishna", "Hanuman", "Durga"]);
  const [availableMainCats, setAvailableMainCats] = useState([]);
  const [availableSubCats, setAvailableSubCats] = useState([]);
  const [availablePurposes, setAvailablePurposes] = useState([]);
  const [availableTags, setAvailableTags] = useState([]);

  // Local state for prices (to avoid URL thrashing on every keystroke)
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  // Sync inputs with URL parameters
  useEffect(() => {
    setMinPrice(searchParams.get("minPrice") || "");
    setMaxPrice(searchParams.get("maxPrice") || "");
  }, [searchParams]);

  useEffect(() => {
    async function loadData() {
      try {
        const [catRes, tagRes, deityRes, purposeRes] = await Promise.allSettled([
          getCategories(),
          getProductTags(),
          getDeities(),
          getPurposes(),
        ]);

        if (deityRes.status === "fulfilled" && Array.isArray(deityRes.value?.data) && deityRes.value.data.length > 0) {
          setDeities(deityRes.value.data);
        } else if (catRes.status === "fulfilled" && catRes.value?.data && catRes.value.data.length > 0) {
          const names = catRes.value.data.map((c) => c.name);
          setDeities(Array.from(new Set(names)));
        }

        if (catRes.status === "fulfilled" && catRes.value?.data && catRes.value.data.length > 0) {
          const mainList = catRes.value.data.filter((cat) => !cat.parentCategory);
          const subList = catRes.value.data.filter((cat) => cat.parentCategory);
          setAvailableMainCats(mainList);
          setAvailableSubCats(subList);
        }

        if (purposeRes.status === "fulfilled" && Array.isArray(purposeRes.value?.data) && purposeRes.value.data.length > 0) {
          setAvailablePurposes(purposeRes.value.data);
        }

        if (tagRes.status === "fulfilled" && Array.isArray(tagRes.value?.data) && tagRes.value.data.length > 0) {
          const names = tagRes.value.data
            .map((item) => (typeof item === "string" ? item : item?.name))
            .filter(Boolean);
          if (names.length > 0) {
            setAvailableTags(Array.from(new Set(names)));
          }
        }
      } catch (err) {
        console.error("Failed to load filter metadata:", err);
      }
    }
    loadData();
  }, []);

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const activeDeity = searchParams.get("deity") || searchParams.get("series") || "";
  const activeCategory = searchParams.get("category") || "";
  const activeSubCategory = searchParams.get("subCategory") || "";
  const activePurpose = searchParams.get("purpose") || "";
  const activeTag = searchParams.get("tag") || searchParams.get("tags") || "";
  const isOnSaleOnly = searchParams.get("onsale") === "true";
  const activeSort = searchParams.get("sort") || "";

  // Count active filters
  let activeFilterCount = 0;
  if (activeDeity) activeFilterCount++;
  if (activeCategory) activeFilterCount++;
  if (activeSubCategory) activeFilterCount++;
  if (activePurpose) activeFilterCount++;
  if (activeTag) activeFilterCount++;
  if (isOnSaleOnly) activeFilterCount++;
  if (activeSort) activeFilterCount++;
  if (searchParams.get("minPrice") || searchParams.get("maxPrice")) activeFilterCount++;

  function updateQuery(key, value) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.delete("page");
    router.push(`/products?${params.toString()}`);
  }

  function handleSortChange(e) {
    updateQuery("sort", e.target.value);
  }

  function handlePriceApply(e) {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());

    if (minPrice) params.set("minPrice", minPrice);
    else params.delete("minPrice");

    if (maxPrice) params.set("maxPrice", maxPrice);
    else params.delete("maxPrice");

    params.delete("page");
    router.push(`/products?${params.toString()}`);
  }

  function handleClearFilters() {
    setMinPrice("");
    setMaxPrice("");
    router.push(`/products`);
  }

  return (
    <div className="font-display">
      {/* Top Right Controls Toolbar: Sort By Dropdown + Filters Button */}
      <div className="flex flex-wrap items-center justify-end gap-2.5 sm:gap-3">
        {/* Sort By Dropdown */}
        <div className="relative flex items-center">
          <div className="relative">
            <select
              id="sort-select"
              value={activeSort}
              onChange={handleSortChange}
              className="appearance-none bg-white border-2 border-black text-black font-extrabold text-xs uppercase tracking-wider py-2.5 pl-3.5 pr-8 rounded-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-orange-500 hover:border-orange-500 transition-colors"
            >
              <option value="" className="font-bold py-1">
                Sort By
              </option>
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value} className="font-bold py-1">
                  {opt.label}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2.5 text-black">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

        {/* Filter Drawer Trigger Button */}
        <button
          onClick={() => setIsOpen(true)}
          className="inline-flex items-center gap-2 bg-black hover:bg-orange-500 hover:text-white text-white font-extrabold text-xs uppercase tracking-widest px-4 py-2.5 border-2 border-black hover:border-orange-500 rounded-none transition-all active:scale-95 shadow-sm"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="4" y1="21" x2="4" y2="14" />
            <line x1="4" y1="10" x2="4" y2="3" />
            <line x1="12" y1="21" x2="12" y2="12" />
            <line x1="12" y1="8" x2="12" y2="3" />
            <line x1="20" y1="21" x2="20" y2="16" />
            <line x1="20" y1="12" x2="20" y2="3" />
            <line x1="1" y1="14" x2="7" y2="14" />
            <line x1="9" y1="8" x2="15" y2="8" />
            <line x1="17" y1="16" x2="23" y2="16" />
          </svg>
          <span>Filter</span>
          {activeFilterCount > 0 && (
            <span className="bg-orange-500 text-white text-[10px] font-extrabold px-1.5 py-0.2 rounded-none border border-black ml-0.5">
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>

      {/* Slide-Out Right Drawer Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Dark Backdrop Overlay */}
          <div
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-fadeIn"
          />

          {/* Drawer Container (Right side slide-in) */}
          <div className="relative w-full max-w-md bg-white border-l-2 border-black h-full max-h-screen flex flex-col z-10 shadow-2xl animate-slide-right-reverse">

            {/* Drawer Header */}
            <div className="shrink-0 p-5 sm:p-6 border-b-2 border-black flex justify-between items-center bg-white">
              <div className="flex items-center gap-2">
                <h3 className="font-display font-extrabold text-base sm:text-lg text-black uppercase tracking-wider">
                  Product Filters
                </h3>
                {activeFilterCount > 0 && (
                  <span className="bg-orange-500 text-white text-[10px] font-extrabold px-2 py-0.5 border border-black">
                    {activeFilterCount} Active
                  </span>
                )}
              </div>

              <div className="flex items-center gap-3">
                {activeFilterCount > 0 && (
                  <button
                    onClick={handleClearFilters}
                    className="text-[10px] uppercase tracking-widest text-red-600 hover:underline font-extrabold"
                  >
                    Reset All
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="w-8 h-8 rounded-none border border-black bg-neutral-100 hover:bg-orange-500 hover:text-white flex items-center justify-center text-black transition-all"
                  aria-label="Close Filter Drawer"
                >
                  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Drawer Body (Scrollable filter controls with min-h-0 and generous bottom padding) */}
            <div className="flex-1 min-h-0 overflow-y-auto p-5 sm:p-6 pb-12 space-y-7 divide-y-2 divide-neutral-100">

              {/* 1. Filter: On Sale Toggle */}
              <div className="pt-2">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs uppercase font-extrabold tracking-wider text-black">On Sale Only</p>
                    <p className="text-[10px] text-neutral-400 font-semibold uppercase tracking-wider">Discounted drops only</p>
                  </div>
                  <button
                    onClick={() => updateQuery("onsale", isOnSaleOnly ? "" : "true")}
                    className={`w-12 h-7 flex items-center p-0.5 cursor-pointer border-2 border-black transition-colors duration-300 outline-none rounded-none ${isOnSaleOnly ? "bg-orange-500" : "bg-neutral-200"
                      }`}
                    aria-label="Toggle On Sale filter"
                  >
                    <div
                      className={`bg-black w-5 h-5 shadow transition-transform duration-300 rounded-none ${isOnSaleOnly ? "translate-x-5" : "translate-x-0"
                        }`}
                    />
                  </button>
                </div>
              </div>

              {/* 2. Filter: Deity / Sacred Series (Ram, Shiva, Ganesh, Krishna, Hanuman, etc.) */}
              <div className="pt-6 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-[11px] uppercase font-extrabold tracking-widest text-neutral-400">
                    Shop by Deity Series
                  </h4>
                  {activeDeity && (
                    <button
                      type="button"
                      onClick={() => updateQuery("deity", "")}
                      className="text-[10px] uppercase font-bold text-orange-600 hover:underline"
                    >
                      Clear Series
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {deities.map((deityName) => {
                    const isActive = activeDeity.toLowerCase() === deityName.toLowerCase();
                    return (
                      <button
                        key={deityName}
                        type="button"
                        onClick={() => updateQuery("deity", isActive ? "" : deityName)}
                        className={`text-left text-xs py-2.5 px-3.5 rounded-none border-2 transition-all flex justify-between items-center ${isActive
                          ? "bg-black border-black text-white font-extrabold uppercase tracking-wider shadow-xs"
                          : "bg-white border-neutral-200 text-neutral-700 hover:border-orange-500 hover:text-orange-600 font-bold uppercase tracking-wider"
                          }`}
                      >
                        <span>{deityName} Series</span>
                        {isActive && <span className="text-orange-400 text-xs">✓</span>}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 3. Filter: Categories & Murti Formats (Car Desk, Lighting Idol, Temple, Wall Art, etc.) */}
              {availableMainCats.length > 0 && (
                <div className="pt-6 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-[11px] uppercase font-extrabold tracking-widest text-neutral-400">
                      Categories & Murti Formats
                    </h4>
                    {activeCategory && (
                      <button
                        type="button"
                        onClick={() => updateQuery("category", "")}
                        className="text-[10px] uppercase font-bold text-orange-600 hover:underline"
                      >
                        Clear Category
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {availableMainCats.map((cat) => {
                      const isSelected =
                        activeCategory.toLowerCase() === (cat.slug || "").toLowerCase() ||
                        activeCategory.toLowerCase() === cat.name.toLowerCase();
                      return (
                        <button
                          key={cat._id}
                          type="button"
                          onClick={() => updateQuery("category", isSelected ? "" : (cat.slug || cat.name))}
                          className={`text-left text-xs py-2.5 px-3.5 rounded-none border-2 transition-all flex justify-between items-center ${isSelected
                            ? "bg-black border-black text-white font-extrabold uppercase tracking-wider shadow-xs"
                            : "bg-white border-neutral-200 text-neutral-700 hover:border-orange-500 hover:text-orange-600 font-bold uppercase tracking-wider"
                            }`}
                        >
                          <span className="truncate">{cat.name}</span>
                          {isSelected && <span className="text-orange-400 text-xs">✓</span>}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* 4. Filter: Subcategory / Specific Types */}
              {availableSubCats.length > 0 && (
                <div className="pt-6 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-[11px] uppercase font-extrabold tracking-widest text-neutral-400">
                      Subcategories & Variants
                    </h4>
                    {activeSubCategory && (
                      <button
                        type="button"
                        onClick={() => updateQuery("subCategory", "")}
                        className="text-[10px] uppercase font-bold text-orange-600 hover:underline"
                      >
                        Clear Subcategory
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {availableSubCats.map((sub) => {
                      const isSelected =
                        activeSubCategory.toLowerCase() === sub.name.toLowerCase() ||
                        activeSubCategory.toLowerCase() === sub.slug.toLowerCase();
                      return (
                        <button
                          key={sub._id}
                          type="button"
                          onClick={() => updateQuery("subCategory", isSelected ? "" : sub.name)}
                          className={`text-left text-xs py-2.5 px-3.5 rounded-none border-2 transition-all flex justify-between items-center ${isSelected
                            ? "bg-black border-black text-white font-extrabold uppercase tracking-wider shadow-xs"
                            : "bg-white border-neutral-200 text-neutral-700 hover:border-orange-500 hover:text-orange-600 font-bold uppercase tracking-wider"
                            }`}
                        >
                          <span className="truncate">
                            {sub.name}
                          </span>
                          {isSelected && <span className="text-orange-400 text-xs">✓</span>}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* 5. Filter: Shop by Occasion & Purpose */}
              {availablePurposes.length > 0 && (
                <div className="pt-6 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-[11px] uppercase font-extrabold tracking-widest text-neutral-400">
                      Shop by Occasion & Purpose
                    </h4>
                    {activePurpose && (
                      <button
                        type="button"
                        onClick={() => updateQuery("purpose", "")}
                        className="text-[10px] uppercase font-bold text-orange-600 hover:underline"
                      >
                        Clear Occasion
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {availablePurposes.map((p) => {
                      const pName = typeof p === "string" ? p : p.name;
                      const pSlug = typeof p === "string" ? p.toLowerCase().replace(/\s+/g, "-") : (p.slug || pName.toLowerCase().replace(/\s+/g, "-"));
                      const isSelected =
                        activePurpose.toLowerCase() === pSlug.toLowerCase() ||
                        activePurpose.toLowerCase() === pName.toLowerCase();
                      return (
                        <button
                          key={p._id || pSlug}
                          type="button"
                          onClick={() => updateQuery("purpose", isSelected ? "" : pSlug)}
                          className={`text-left text-xs py-2.5 px-3.5 rounded-none border-2 transition-all flex justify-between items-center ${isSelected
                            ? "bg-black border-black text-white font-extrabold uppercase tracking-wider shadow-xs"
                            : "bg-white border-neutral-200 text-neutral-700 hover:border-orange-500 hover:text-orange-600 font-bold uppercase tracking-wider"
                            }`}
                        >
                          <span className="truncate">{pName}</span>
                          {isSelected && <span className="text-orange-400 text-xs">✓</span>}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* 6. Filter: Product Tags & Highlights */}
              {availableTags.length > 0 && (
                <div className="pt-6 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-[11px] uppercase font-extrabold tracking-widest text-neutral-400">
                      Product Tags & Highlights
                    </h4>
                    {activeTag && (
                      <button
                        type="button"
                        onClick={() => updateQuery("tag", "")}
                        className="text-[10px] uppercase font-bold text-orange-600 hover:underline"
                      >
                        Clear Tag
                      </button>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {availableTags.map((tagItem, idx) => {
                      const tagName = typeof tagItem === "string" ? tagItem : tagItem?.name || "";
                      if (!tagName) return null;
                      const tagSlug = typeof tagItem === "string"
                        ? tagItem.replace(/\s+/g, "-").toLowerCase()
                        : (tagItem?.slug || tagName.replace(/\s+/g, "-").toLowerCase());
                      const isSelected =
                        activeTag.toLowerCase() === tagName.toLowerCase() ||
                        activeTag.toLowerCase() === tagSlug;
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => updateQuery("tag", isSelected ? "" : tagName)}
                          className={`text-xs py-1.5 px-3 rounded-none border-2 transition-all flex items-center gap-1.5 font-bold uppercase tracking-wider ${
                            isSelected
                              ? "bg-black border-black text-white shadow-xs"
                              : "bg-white border-neutral-200 text-neutral-700 hover:border-orange-500 hover:text-orange-600"
                          }`}
                        >
                          <span>{tagName}</span>
                          {isSelected ? (
                            <span className="text-orange-400 text-xs">✓</span>
                          ) : (
                            <span className="text-neutral-400 text-[10px]">+</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* 5. Filter: Price Range */}
              <div className="pt-6 space-y-3 pb-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-[11px] uppercase font-extrabold tracking-widest text-neutral-400">Price Range (₹)</h4>
                  {(minPrice || maxPrice) && (
                    <button
                      type="button"
                      onClick={() => {
                        setMinPrice("");
                        setMaxPrice("");
                        const params = new URLSearchParams(searchParams.toString());
                        params.delete("minPrice");
                        params.delete("maxPrice");
                        params.delete("page");
                        router.push(`/products?${params.toString()}`);
                      }}
                      className="text-[10px] uppercase font-bold text-neutral-500 hover:text-black underline"
                    >
                      Clear Price
                    </button>
                  )}
                </div>

                <form onSubmit={handlePriceApply} className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-neutral-400">₹</span>
                      <input
                        type="text"
                        placeholder="Min"
                        value={minPrice}
                        onChange={(e) => setMinPrice(e.target.value.replace(/\D/g, ""))}
                        className="w-full pl-7 pr-3 py-2.5 border-2 border-neutral-300 rounded-none bg-transparent outline-none focus:border-black text-xs font-bold text-black placeholder:text-neutral-400"
                      />
                    </div>
                    <span className="text-neutral-400 text-xs font-bold">—</span>
                    <div className="relative flex-1">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-neutral-400">₹</span>
                      <input
                        type="text"
                        placeholder="Max"
                        value={maxPrice}
                        onChange={(e) => setMaxPrice(e.target.value.replace(/\D/g, ""))}
                        className="w-full pl-7 pr-3 py-2.5 border-2 border-neutral-300 rounded-none bg-transparent outline-none focus:border-black text-xs font-bold text-black placeholder:text-neutral-400"
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-[#FFE600] hover:bg-black hover:text-white text-black text-xs uppercase tracking-widest font-extrabold py-3 rounded-none border-2 border-black transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none cursor-pointer"
                  >
                    Apply Price Range
                  </button>
                </form>
              </div>

            </div>

            {/* Drawer Bottom Action Bar */}
            <div className="shrink-0 p-4 sm:p-5 border-t-2 border-black bg-white shadow-lg">
              <button
                onClick={() => setIsOpen(false)}
                className="w-full bg-black hover:bg-gold hover:text-black text-white font-extrabold text-xs uppercase tracking-widest py-3.5 sm:py-4 border-2 border-black rounded-none transition-all cursor-pointer"
              >
                View {totalResults !== undefined ? `${totalResults} ` : ""}Results
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
