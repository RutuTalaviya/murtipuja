"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getCategories } from "@/lib/api";

const PURPOSES = [
  { label: "Pooja Room", value: "pooja-room" },
  { label: "Mandir & Sanctum", value: "mandir" },
  { label: "Spiritual", value: "spiritual" },
];

const SORT_OPTIONS = [
  { label: "Newest First", value: "-createdAt" },
  { label: "Price: Low to High", value: "basePrice" },
  { label: "Price: High to Low", value: "-basePrice" },
  { label: "Alphabetical: A-Z", value: "title" },
  { label: "Oldest First", value: "createdAt" },
];

export default function ProductFiltersDrawer({ totalResults, gridCols = 4, onGridChange }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [isOpen, setIsOpen] = useState(false);
  const [deities, setDeities] = useState(["Ram", "Shiva", "Ganesh", "Krishna", "Hanuman"]);
  const [availableSubCats, setAvailableSubCats] = useState([]);

  // Local state for prices (to avoid URL thrashing on every keystroke)
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  // Sync inputs with URL parameters
  useEffect(() => {
    setMinPrice(searchParams.get("minPrice") || "");
    setMaxPrice(searchParams.get("maxPrice") || "");
  }, [searchParams]);

  useEffect(() => {
    async function loadCategoryData() {
      try {
        const res = await getCategories();
        if (res.data && res.data.length > 0) {
          const mainList = res.data.filter((cat) => !cat.parentCategory);
          const subList = res.data.filter((cat) => cat.parentCategory);
          if (mainList.length > 0) setDeities(mainList.map((cat) => cat.name));
          setAvailableSubCats(subList);
        }
      } catch (err) {
        console.error("Failed to load categories in filters:", err);
      }
    }
    loadCategoryData();
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

  const activeCategory = searchParams.get("category") || searchParams.get("deity") || "";
  const activeSubCategory = searchParams.get("subCategory") || "";
  const activePurpose = searchParams.get("purpose") || "";
  const isOnSaleOnly = searchParams.get("onsale") === "true";
  const activeSort = searchParams.get("sort") || "";

  // Count active filters
  let activeFilterCount = 0;
  if (activeCategory) activeFilterCount++;
  if (activeSubCategory) activeFilterCount++;
  if (activePurpose) activeFilterCount++;
  if (isOnSaleOnly) activeFilterCount++;
  if (activeSort) activeFilterCount++;
  if (searchParams.get("minPrice") || searchParams.get("maxPrice")) activeFilterCount++;

  function updateQuery(key, value) {
    const params = new URLSearchParams(searchParams.toString());
    if (key === "category") {
      params.delete("deity");
    }
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
      {/* Top Right Controls Toolbar: Grid View Switcher + Sort By Dropdown + Filters Button */}
      <div className="flex flex-wrap items-center justify-end gap-2.5 sm:gap-3">
        {/* Grid View Switcher: 2 Columns (2-2) | 3 Columns (3-3) | 4 Columns (4-4 Default) */}
        {onGridChange && (
          <div className="hidden sm:flex items-center border-2 border-black bg-white divide-x-2 divide-black shadow-xs h-[38px]">
            {/* 1. 2 Columns View (2-2) */}
            <button
              type="button"
              onClick={() => onGridChange(2)}
              title="2 Columns Grid (2-2)"
              aria-label="2 Columns View"
              className={`px-2.5 h-full transition-colors flex items-center justify-center ${
                gridCols === 2
                  ? "bg-black text-white"
                  : "text-neutral-400 hover:text-black hover:bg-neutral-100"
              }`}
            >
              <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                <rect x="2" y="2" width="7" height="7" rx="0.5" />
                <rect x="11" y="2" width="7" height="7" rx="0.5" />
                <rect x="2" y="11" width="7" height="7" rx="0.5" />
                <rect x="11" y="11" width="7" height="7" rx="0.5" />
              </svg>
            </button>

            {/* 2. 3 Columns View (3-3 - Middle Icon) */}
            <button
              type="button"
              onClick={() => onGridChange(3)}
              title="3 Columns Grid (3-3)"
              aria-label="3 Columns View"
              className={`px-2.5 h-full transition-colors flex items-center justify-center ${
                gridCols === 3
                  ? "bg-black text-white"
                  : "text-neutral-400 hover:text-black hover:bg-neutral-100"
              }`}
            >
              <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                <rect x="2" y="2" width="4.3" height="4.3" rx="0.4" />
                <rect x="7.85" y="2" width="4.3" height="4.3" rx="0.4" />
                <rect x="13.7" y="2" width="4.3" height="4.3" rx="0.4" />
                <rect x="2" y="7.85" width="4.3" height="4.3" rx="0.4" />
                <rect x="7.85" y="7.85" width="4.3" height="4.3" rx="0.4" />
                <rect x="13.7" y="7.85" width="4.3" height="4.3" rx="0.4" />
                <rect x="2" y="13.7" width="4.3" height="4.3" rx="0.4" />
                <rect x="7.85" y="13.7" width="4.3" height="4.3" rx="0.4" />
                <rect x="13.7" y="13.7" width="4.3" height="4.3" rx="0.4" />
              </svg>
            </button>

            {/* 3. 4 Columns View (4-4 - Default Right Icon) */}
            <button
              type="button"
              onClick={() => onGridChange(4)}
              title="4 Columns Grid (4-4 Default)"
              aria-label="4 Columns View"
              className={`px-2.5 h-full transition-colors flex items-center justify-center ${
                gridCols === 4
                  ? "bg-black text-white"
                  : "text-neutral-400 hover:text-black hover:bg-neutral-100"
              }`}
            >
              <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                <rect x="2" y="2.5" width="16" height="2" rx="0.4" />
                <rect x="2" y="7" width="16" height="2" rx="0.4" />
                <rect x="2" y="11.5" width="16" height="2" rx="0.4" />
                <rect x="2" y="16" width="16" height="2" rx="0.4" />
              </svg>
            </button>
          </div>
        )}

        {/* Sort By Dropdown */}
        <div className="relative flex items-center">
          <label htmlFor="sort-select" className="text-[11px] font-extrabold uppercase tracking-widest text-neutral-500 mr-2 hidden sm:inline-block">
            Sort:
          </label>
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
                  Filters & Sorting
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

              {/* 1. Sort Options (Newest First, Price, etc.) */}
              <div className="pt-2 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-[11px] uppercase font-extrabold tracking-widest text-neutral-400">Sort Products</h4>
                  {activeSort && (
                    <button
                      type="button"
                      onClick={() => updateQuery("sort", "")}
                      className="text-[10px] uppercase font-bold text-orange-600 hover:underline"
                    >
                      Clear Sort
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {SORT_OPTIONS.map((opt) => {
                    const isSelected = activeSort === opt.value;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => updateQuery("sort", isSelected ? "" : opt.value)}
                        className={`text-left text-xs py-2.5 px-3.5 rounded-none border-2 transition-all flex justify-between items-center ${isSelected
                            ? "bg-black border-black text-white font-extrabold uppercase tracking-wider shadow-xs"
                            : "bg-white border-neutral-200 text-neutral-700 hover:border-orange-500 hover:text-orange-600 font-bold uppercase tracking-wider"
                          }`}
                      >
                        <span>{opt.label}</span>
                        {isSelected && <span className="text-orange-400 text-xs">✓</span>}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 2. Filter: On Sale Toggle */}
              <div className="pt-6">
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

              {/* 3. Filter: Main Category */}
              <div className="pt-6 space-y-3">
                <h4 className="text-[11px] uppercase font-extrabold tracking-widest text-neutral-400">Main Category</h4>
                <div className="grid grid-cols-2 gap-2">
                  {deities.map((catName) => {
                    const isActive = activeCategory.toLowerCase() === catName.toLowerCase();
                    return (
                      <button
                        key={catName}
                        onClick={() => updateQuery("category", isActive ? "" : catName)}
                        className={`text-left text-xs py-2.5 px-3.5 rounded-none border-2 transition-all flex justify-between items-center ${isActive
                            ? "bg-black border-black text-white font-extrabold uppercase tracking-wider"
                            : "bg-white border-neutral-200 text-neutral-700 hover:border-black font-bold uppercase tracking-wider"
                          }`}
                      >
                        <span>{catName}</span>
                        {isActive && <span className="text-gold text-xs">✓</span>}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 3. Filter: Purpose / Occasion */}
              <div className="pt-6 space-y-3">
                <h4 className="text-[11px] uppercase font-extrabold tracking-widest text-neutral-400">Purpose & Occasion</h4>
                <div className="grid grid-cols-2 gap-2">
                  {PURPOSES.map((purpose) => {
                    const isActive = activePurpose === purpose.value;
                    return (
                      <button
                        key={purpose.value}
                        onClick={() => updateQuery("purpose", isActive ? "" : purpose.value)}
                        className={`text-left text-xs py-2.5 px-3.5 rounded-none border-2 transition-all flex justify-between items-center ${isActive
                            ? "bg-black border-black text-white font-extrabold uppercase tracking-wider"
                            : "bg-white border-neutral-200 text-neutral-700 hover:border-black font-bold uppercase tracking-wider"
                          }`}
                      >
                        <span>{purpose.label}</span>
                        {isActive && <span className="text-gold text-xs">✓</span>}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 4. Filter: Subcategory / Murti Types (Lighting, Temple, Wall, etc.) */}
              {availableSubCats.length > 0 && (
                <div className="pt-6 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-[11px] uppercase font-extrabold tracking-widest text-neutral-400">
                      Murti Types & Subcategories
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
                          className={`text-left text-xs py-2.5 px-3.5 rounded-none border-2 transition-all flex justify-between items-center ${
                            isSelected
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
