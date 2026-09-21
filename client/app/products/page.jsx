import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import ProductFiltersDrawer from "@/components/ProductFiltersDrawer";
import { fetchProducts, fetchCategories } from "@/lib/serverApi";

export const metadata = {
  title: "Shop Divine Murtis | MurtiPuja",
  description: "Browse our full collection of precision 3D-printed spiritual idols.",
};

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

export default async function ProductsPage({ searchParams }) {
  const params = await searchParams;
  const pageParams = { limit: 12, ...params };
  let data = { products: [], pagination: { total: 0, totalPages: 0, page: 1, limit: 12 } };
  let allCategories = [];

  try {
    const [prodData, catData] = await Promise.all([
      fetchProducts(pageParams),
      fetchCategories().catch(() => []),
    ]);
    data = prodData;
    allCategories = Array.isArray(catData) ? catData : [];
  } catch (err) {
    console.error("Failed to load products page:", err);
  }

  const { products, pagination } = data;
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

  // Compute clean display title
  let categorySubtitle = "ACTIVE RELEASES";
  let pageTitle = "ALL SCULPTURES";

  const activeCategoryParam = params.category || params.deity;

  if (params.subCategory) {
    categorySubtitle = activeCategoryParam ? `${activeCategoryParam.toUpperCase()} SUBCATEGORY` : "MURTI TYPE COLLECTION";
    pageTitle = `${params.subCategory.toUpperCase()} COLLECTION`;
  } else if (params.purpose === "pooja-room") {
    categorySubtitle = "SACRED ESSENTIALS";
    pageTitle = "POOJA ROOM COLLECTION";
  } else if (params.purpose === "home-decor") {
    categorySubtitle = "ARCHITECTURAL DEVOTION";
    pageTitle = "HOME DECOR IDOLS";
  } else if (activeCategoryParam) {
    categorySubtitle = "MAIN CATEGORY";
    pageTitle = `${activeCategoryParam.toUpperCase()} SACRED SERIES`;
  } else if (params.onsale === "true") {
    categorySubtitle = "LIMITED OPPORTUNITY";
    pageTitle = "SPECIAL SALE DROPS";
  } else if (params.sort === "-createdAt") {
    categorySubtitle = "LATEST ARRIVALS";
    pageTitle = "NEWEST PRODUCTS FIRST";
  } else if (params.search) {
    categorySubtitle = "SEARCH RESULTS";
    pageTitle = `RESULTS FOR "${params.search.toUpperCase()}"`;
  }

  // Active filter tags for quick removal
  const activeTags = [];
  if (activeCategoryParam) activeTags.push({ label: `Category: ${activeCategoryParam}`, keys: ["category", "deity"] });
  if (params.subCategory) activeTags.push({ label: `Type: ${params.subCategory}`, key: "subCategory" });
  if (params.purpose) {
    const purposeLabel = params.purpose === "pooja-room" ? "Pooja Essentials" : params.purpose === "home-decor" ? "Home Decor" : params.purpose;
    activeTags.push({ label: `Purpose: ${purposeLabel}`, key: "purpose" });
  }
  if (params.onsale === "true") activeTags.push({ label: "On Sale Only", key: "onsale" });
  if (params.sort && params.sort !== "random") {
    const sortLabels = {
      "-createdAt": "Newest First",
      "createdAt": "Oldest First",
      "basePrice": "Price: Low to High",
      "-basePrice": "Price: High to Low",
      "title": "A-Z",
    };
    activeTags.push({ label: `Sort: ${sortLabels[params.sort] || params.sort}`, key: "sort" });
  }
  if (params.minPrice || params.maxPrice) {
    activeTags.push({
      label: `Price: ₹${params.minPrice || "0"} - ₹${params.maxPrice || "Any"}`,
      keys: ["minPrice", "maxPrice"],
    });
  }
  if (params.search) activeTags.push({ label: `Search: "${params.search}"`, key: "search" });

  // Dynamic quick purpose & category tabs from backend
  const selectedCat = (params.category || params.deity || "").toLowerCase();
  const mainCategories = allCategories.filter((c) => !c.parentCategory);
  
  const currentMainCat = mainCategories.find(
    (c) => c.name.toLowerCase() === selectedCat || c.slug.toLowerCase() === selectedCat
  );

  let QUICK_PURPOSE_TABS = [];

  if (currentMainCat) {
    // When a category is selected: show its dynamic subcategories created in admin
    const deitySubCats = allCategories.filter(
      (c) => c.parentCategory && (c.parentCategory._id === currentMainCat._id || c.parentCategory === currentMainCat._id)
    );

    QUICK_PURPOSE_TABS = [
      {
        label: `All ${currentMainCat.name}`,
        href: `/products?category=${encodeURIComponent(currentMainCat.slug || currentMainCat.name)}`,
        active: !params.subCategory,
      },
      ...deitySubCats.map((sub) => ({
        label: sub.name,
        href: `/products?category=${encodeURIComponent(currentMainCat.slug || currentMainCat.name)}&subCategory=${encodeURIComponent(sub.name)}`,
        active:
          params.subCategory?.toLowerCase() === sub.name.toLowerCase() ||
          params.subCategory?.toLowerCase() === sub.slug.toLowerCase(),
      })),
      {
        label: "← All Categories",
        href: "/products",
        active: false,
      },
    ];
  } else {
    // When viewing all products: show dynamic series for each main category in DB
    QUICK_PURPOSE_TABS = [
      {
        label: "All Releases",
        href: "/products",
        active: !params.purpose && !params.onsale && !params.category && !params.deity && !params.subCategory && !params.sort,
      },
      {
        label: "Newest First",
        href: "/products?sort=-createdAt",
        active: params.sort === "-createdAt" && !params.purpose && !params.onsale && !params.category && !params.deity && !params.subCategory,
      },
      ...mainCategories.map((cat) => ({
        label: `${cat.name} Series`,
        href: `/products?category=${encodeURIComponent(cat.slug || cat.name)}`,
        active:
          params.category?.toLowerCase() === cat.slug?.toLowerCase() ||
          params.category?.toLowerCase() === cat.name?.toLowerCase() ||
          params.deity?.toLowerCase() === cat.name?.toLowerCase(),
      })),
      {
        label: "Special Sale",
        href: "/products?onsale=true",
        active: params.onsale === "true",
      },
    ];
  }

  return (
    <main className="min-h-screen bg-white font-display w-full selection:bg-gold selection:text-black">

      {/* 1. Header Section - Matches exact Active Releases / New Launches & Bestsellers header */}
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

            {/* Right Side: Total Count & Filters Drawer Trigger */}
            <div className="flex items-center gap-4">
              <span className="text-xs font-extrabold uppercase tracking-widest text-neutral-700">
                VIEW ALL ({totalProducts}) →
              </span>
              <ProductFiltersDrawer totalResults={totalProducts} />
            </div>
          </div>

          {/* Quick Category & Deity Filter Tabs Bar */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar pt-2 border-t border-stone-200">
            {QUICK_PURPOSE_TABS.map((tab, idx) => (
              <Link
                key={idx}
                href={tab.href}
                className={`px-3.5 py-1.5 text-xs uppercase tracking-wider font-extrabold whitespace-nowrap transition-all border ${tab.active
                    ? "bg-black text-white border-black"
                    : "bg-white text-neutral-700 border-stone-300 hover:border-black hover:text-black"
                  }`}
              >
                {tab.label}
              </Link>
            ))}
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

      {/* 3. Product Grid - Exact Edge-to-Edge 4-Column Divided Layout */}
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
          <div className="w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-stone-300 border-b border-stone-300 bg-white">
            {products.map((product) => (
              <div key={product._id} className="h-full border-b border-stone-300">
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        )}

        {/* 4. Complete Pagination Bar with 12 Item Limits */}
        <div className="w-full py-10 px-4 sm:px-8 md:px-12 lg:px-16 flex flex-col sm:flex-row justify-between items-center gap-6 border-b border-stone-300 bg-white">
          {/* Status info */}
          <div className="text-xs text-neutral-500 font-extrabold uppercase tracking-wider">
            Showing <span className="text-black font-black">{startCount}–{endCount}</span> of <span className="text-black font-black">{totalProducts}</span> Divine Idols
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
                    className={`w-10 h-10 flex items-center justify-center border-2 font-black text-xs transition-all rounded-none ${isCurrent
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
