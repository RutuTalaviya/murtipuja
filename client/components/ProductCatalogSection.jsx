"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import ProductFiltersDrawer from "@/components/ProductFiltersDrawer";

function getPageNumbers(currentPage, totalPages) {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }
  if (currentPage <= 4) {
    return [1, 2, 3, 4, 5, "...", totalPages];
  }
  if (currentPage <= totalPages - 3) {
    return [1, "...", totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
  }
  return [1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages];
}

export default function ProductCatalogSection({
  products = [],
  pagination = {},
  params = {},
  categorySubtitle,
  pageTitle,
  activeTags = [],
  quickTabs = [],
}) {
  const [gridCols, setGridCols] = useState(4);

  // Restore saved grid preference from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("mp_product_grid_cols");
      if (saved && (saved === "3" || saved === "4" || saved === "6")) {
        setGridCols(Number(saved));
      }
    } catch {
      // Ignore localStorage errors
    }
  }, []);

  function handleGridChange(cols) {
    setGridCols(cols);
    try {
      localStorage.setItem("mp_product_grid_cols", String(cols));
    } catch {
      // Ignore localStorage errors
    }
  }

  const currentPage = Number(pagination.page) || 1;
  const totalPages = Number(pagination.totalPages) || 1;
  const totalProducts = Number(pagination.total) || 0;
  const limit = Number(pagination.limit) || 12;
  const startCount = totalProducts === 0 ? 0 : (currentPage - 1) * limit + 1;
  const endCount = Math.min(currentPage * limit, totalProducts);

  const pageNumbers = getPageNumbers(currentPage, totalPages);

  const createPageUrl = (pageNumber) => {
    const q = new URLSearchParams(params);
    q.set("page", pageNumber);
    q.set("limit", 12);
    return `/products?${q.toString()}`;
  };

  return (
    <main className="min-h-screen bg-white font-display w-full selection:bg-gold selection:text-black">
      {/* 1. Header Section */}
      <div className="w-full border-b border-stone-300 bg-white">
        <div className="w-full px-4 sm:px-8 md:px-12 lg:px-16 pt-8 pb-6 space-y-4">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <p className="text-[11px] sm:text-xs uppercase tracking-widest text-amber-800 font-extrabold mb-1">
                {categorySubtitle}
              </p>
              <h1 className="font-display text-2xl sm:text-3xl md:text-4xl text-neutral-900 font-extrabold uppercase tracking-tight">
                {pageTitle}
              </h1>
            </div>

            {/* Right Side: Total Count & Controls (Sort + Filter) */}
            <div className="flex flex-wrap items-center gap-3 sm:gap-4 justify-between md:justify-end">
              <span className="text-xs font-extrabold uppercase tracking-widest text-neutral-700 hidden lg:inline-block">
                VIEW ALL ({totalProducts}) →
              </span>
              <ProductFiltersDrawer totalResults={totalProducts} />
            </div>
          </div>

          {/* Sub-bar below Title: Quick Category Tabs + Grid View Switcher */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-stone-200">
            {/* Quick Category & Deity Filter Tabs Bar */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar flex-1 min-w-0">
              {quickTabs.map((tab, idx) => (
                <Link
                  key={idx}
                  href={tab.href}
                  className={`px-3.5 py-1.5 text-xs uppercase tracking-wider font-extrabold whitespace-nowrap transition-all border ${
                    tab.active
                      ? "bg-black text-white border-black"
                      : "bg-white text-neutral-700 border-stone-300 hover:border-black hover:text-black"
                  }`}
                >
                  {tab.label}
                </Link>
              ))}
            </div>

            {/* Grid View Switcher below Title: 3 Columns | 4 Columns (Default) | 6 Columns */}
            <div className="flex items-center self-end sm:self-center shrink-0 border-2 border-black bg-white divide-x-2 divide-black shadow-xs h-[34px]">
              {/* 1. 3 Columns View (3-3) */}
              <button
                type="button"
                onClick={() => handleGridChange(3)}
                title="3 Columns Grid (3-3)"
                aria-label="3 Columns View"
                className={`px-2.5 h-full transition-colors flex items-center justify-center ${
                  gridCols === 3
                    ? "bg-black text-white"
                    : "text-neutral-400 hover:text-black hover:bg-neutral-100"
                }`}
              >
                <svg width="15" height="15" viewBox="0 0 20 20" fill="currentColor">
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

              {/* 2. 4 Columns View (4-4 - Default) */}
              <button
                type="button"
                onClick={() => handleGridChange(4)}
                title="4 Columns Grid (4-4 Default)"
                aria-label="4 Columns View"
                className={`px-2.5 h-full transition-colors flex items-center justify-center ${
                  gridCols === 4
                    ? "bg-black text-white"
                    : "text-neutral-400 hover:text-black hover:bg-neutral-100"
                }`}
              >
                <svg width="15" height="15" viewBox="0 0 20 20" fill="currentColor">
                  <rect x="2" y="2.5" width="16" height="2" rx="0.4" />
                  <rect x="2" y="7" width="16" height="2" rx="0.4" />
                  <rect x="2" y="11.5" width="16" height="2" rx="0.4" />
                  <rect x="2" y="16" width="16" height="2" rx="0.4" />
                </svg>
              </button>

              {/* 3. 6 Columns View (6-6) */}
              <button
                type="button"
                onClick={() => handleGridChange(6)}
                title="6 Columns Grid (6-6)"
                aria-label="6 Columns View"
                className={`px-2.5 h-full transition-colors flex items-center justify-center ${
                  gridCols === 6
                    ? "bg-black text-white"
                    : "text-neutral-400 hover:text-black hover:bg-neutral-100"
                }`}
              >
                <svg width="15" height="15" viewBox="0 0 20 20" fill="currentColor">
                  <rect x="2" y="2" width="4" height="6.5" rx="0.5" />
                  <rect x="8" y="2" width="4" height="6.5" rx="0.5" />
                  <rect x="14" y="2" width="4" height="6.5" rx="0.5" />
                  <rect x="2" y="11.5" width="4" height="6.5" rx="0.5" />
                  <rect x="8" y="11.5" width="4" height="6.5" rx="0.5" />
                  <rect x="14" y="11.5" width="4" height="6.5" rx="0.5" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* 2. Active Filter Chips Bar */}
        {activeTags.length > 0 && (
          <div className="px-4 sm:px-8 md:px-12 lg:px-16 py-2.5 bg-neutral-50 border-t border-stone-300 flex flex-wrap items-center gap-2">
            <span className="text-[10.5px] font-extrabold uppercase tracking-widest text-neutral-400 mr-1">
              Active Filters:
            </span>
            {activeTags.map((tag, idx) => {
              const q = new URLSearchParams(params);
              if (tag.keys) {
                tag.keys.forEach((k) => q.delete(k));
              } else if (tag.key) {
                q.delete(tag.key);
              }
              q.delete("page");

              return (
                <Link
                  key={idx}
                  href={`/products?${q.toString()}`}
                  className="inline-flex items-center gap-1.5 bg-white hover:bg-black hover:text-white text-black text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 border border-black transition-colors"
                >
                  <span>{tag.label}</span>
                  <span className="text-xs">✕</span>
                </Link>
              );
            })}

            <Link
              href="/products"
              className="text-[10px] font-extrabold text-red-600 hover:underline uppercase tracking-widest ml-2"
            >
              Clear All Filters
            </Link>
          </div>
        )}
      </div>

      {/* 3. Product Grid with Responsive Dynamic Columns */}
      <section className="w-full bg-white">
        {products.length === 0 ? (
          <div className="w-full p-16 sm:p-24 text-center space-y-4 border-b border-stone-300">
            <span className="text-4xl block">🕉️</span>
            <p className="text-neutral-500 font-extrabold text-sm uppercase tracking-wider">
              No deity sculptures found matching your selected criteria.
            </p>
            <Link
              href="/products"
              className="inline-block bg-black hover:bg-gold hover:text-black text-white font-extrabold text-xs uppercase tracking-widest px-6 py-3 border border-black transition-all"
            >
              View All Releases →
            </Link>
          </div>
        ) : (
          <div
            className={`w-full grid border-t border-l border-stone-300 bg-white transition-all duration-300 ${
              gridCols === 3
                ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
                : gridCols === 6
                ? "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6"
                : "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
            }`}
          >
            {products.map((product) => (
              <div key={product._id} className="h-full border-b border-r border-stone-300">
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        )}

        {/* 4. Complete Pagination Bar with 12 Item Limits */}
        <div className="w-full py-10 px-4 sm:px-8 md:px-12 lg:px-16 flex flex-col sm:flex-row justify-between items-center gap-6 border-b border-stone-300 bg-white">
          {/* Status info */}
          <div className="text-xs text-neutral-500 font-extrabold uppercase tracking-wider">
            Showing <span className="text-black font-black">{startCount}–{endCount}</span> of{" "}
            <span className="text-black font-black">{totalProducts}</span> Divine Idols
          </div>

          {/* Page navigation controls */}
          {totalPages > 1 && (
            <div className="flex items-center gap-1.5 sm:gap-2">
              {/* Previous Button */}
              {currentPage > 1 ? (
                <Link
                  href={createPageUrl(currentPage - 1)}
                  className="px-3.5 h-10 border-2 border-black bg-white hover:bg-orange-500 hover:text-white hover:border-orange-500 text-black font-black text-xs uppercase tracking-wider flex items-center justify-center transition-all rounded-none shadow-xs"
                  aria-label="Previous Page"
                >
                  ← Prev
                </Link>
              ) : (
                <span className="px-3.5 h-10 border border-stone-200 bg-neutral-100 text-neutral-400 font-black text-xs uppercase tracking-wider flex items-center justify-center rounded-none cursor-not-allowed">
                  ← Prev
                </span>
              )}

              {/* Page Number Buttons */}
              {pageNumbers.map((p, idx) => {
                if (p === "...") {
                  return (
                    <span
                      key={`dots-${idx}`}
                      className="w-8 h-10 flex items-center justify-center font-black text-xs text-neutral-400 select-none"
                    >
                      ...
                    </span>
                  );
                }

                const isCurrent = p === currentPage;
                return (
                  <Link
                    key={p}
                    href={createPageUrl(p)}
                    className={`w-10 h-10 flex items-center justify-center border-2 font-black text-xs transition-all rounded-none ${
                      isCurrent
                        ? "bg-black text-white border-black shadow-sm"
                        : "border-stone-300 bg-white text-neutral-800 hover:border-orange-500 hover:bg-orange-50 hover:text-orange-600"
                    }`}
                    aria-current={isCurrent ? "page" : undefined}
                  >
                    {p}
                  </Link>
                );
              })}

              {/* Next Button */}
              {currentPage < totalPages ? (
                <Link
                  href={createPageUrl(currentPage + 1)}
                  className="px-3.5 h-10 border-2 border-black bg-white hover:bg-orange-500 hover:text-white hover:border-orange-500 text-black font-black text-xs uppercase tracking-wider flex items-center justify-center transition-all rounded-none shadow-xs"
                  aria-label="Next Page"
                >
                  Next →
                </Link>
              ) : (
                <span className="px-3.5 h-10 border border-stone-200 bg-neutral-100 text-neutral-400 font-black text-xs uppercase tracking-wider flex items-center justify-center rounded-none cursor-not-allowed">
                  Next →
                </span>
              )}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
