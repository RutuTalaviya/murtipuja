"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import ImageWithSkeleton from "@/components/ImageWithSkeleton";
import { getCategories, getProductTags, getProducts } from "@/lib/api";

const DEFAULT_POPULAR_KEYWORDS = [
  "Shiva",
  "Ganesh",
  "Krishna",
  "Hanuman",
  "Ram",
  "Lighting Murti",
  "Car Dashboard",
  "Pooja Room",
  "Bestseller",
];

export default function SearchModal({ isOpen, onClose }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const inputRef = useRef(null);

  const [categories, setCategories] = useState([]);
  const [popularTags, setPopularTags] = useState(DEFAULT_POPULAR_KEYWORDS);
  
  // Live dynamic search results state
  const [liveResults, setLiveResults] = useState([]);
  const [totalMatches, setTotalMatches] = useState(0);
  const [isSearching, setIsSearching] = useState(false);
  const searchDebounceRef = useRef(null);

  // Load dynamic categories & tags when modal is opened
  useEffect(() => {
    async function loadMetadata() {
      try {
        const [catRes, tagRes] = await Promise.allSettled([
          getCategories(),
          getProductTags(),
        ]);

        if (catRes.status === "fulfilled" && Array.isArray(catRes.value?.data)) {
          const mainCats = catRes.value.data.filter((c) => !c.parentCategory);
          setCategories(mainCats.slice(0, 6));
        }

        if (tagRes.status === "fulfilled" && Array.isArray(tagRes.value?.data) && tagRes.value.data.length > 0) {
          const tagNames = tagRes.value.data
            .map((t) => (typeof t === "string" ? t : t?.name))
            .filter(Boolean);
          if (tagNames.length > 0) {
            setPopularTags(Array.from(new Set([...tagNames, ...DEFAULT_POPULAR_KEYWORDS])).slice(0, 10));
          }
        }
      } catch (err) {
        console.error("Failed to load search metadata:", err);
      }
    }

    if (isOpen) {
      loadMetadata();
    }
  }, [isOpen]);

  // Handle live search as user types with 250ms debounce
  useEffect(() => {
    if (!isOpen) return;

    const trimmed = query.trim();
    if (!trimmed) {
      setLiveResults([]);
      setTotalMatches(0);
      setIsSearching(false);
      if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
      return;
    }

    setIsSearching(true);
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);

    searchDebounceRef.current = setTimeout(async () => {
      try {
        const res = await getProducts({ search: trimmed, limit: 6 });
        const products = res.data?.products || [];
        const total = res.data?.pagination?.total || products.length;
        setLiveResults(products);
        setTotalMatches(total);
      } catch (err) {
        console.error("Search query error:", err);
        setLiveResults([]);
        setTotalMatches(0);
      } finally {
        setIsSearching(false);
      }
    }, 250);

    return () => {
      if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    };
  }, [query, isOpen]);

  // Focus input and lock scroll on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 80);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  // Escape key handler
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === "Escape") {
        onClose();
      }
    }
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  function handleSearchSubmit(searchVal) {
    const val = (searchVal || query).trim();
    if (val) {
      onClose();
      router.push(`/products?search=${encodeURIComponent(val)}`);
    }
  }

  function handleProductClick(slug) {
    onClose();
    router.push(`/products/${slug}`);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/70 backdrop-blur-xs p-3 sm:p-4 pt-6 sm:pt-10 md:pt-14 overflow-y-auto">
      {/* Backdrop Close Handler */}
      <div className="fixed inset-0" onClick={onClose} />

      {/* Modal Container */}
      <div className="relative bg-white w-full max-w-3xl rounded-none shadow-2xl border-2 border-black p-4 sm:p-6 md:p-7 z-10 space-y-6 max-h-[88vh] overflow-y-auto no-scrollbar animate-fadeIn my-auto font-display">
        
        {/* Search input header */}
        <div className="relative flex items-center border-2 border-black bg-stone-50 rounded-none overflow-hidden focus-within:ring-2 focus-within:ring-orange-500 focus-within:border-black transition-all">
          <span className="pl-3.5 sm:pl-4 text-black">
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </span>
          <input
            ref={inputRef}
            type="text"
            placeholder="Search divine murtis, deities, tags (e.g. Shiva, Ganesh, Lighting)..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearchSubmit(query)}
            className="w-full pl-3 pr-20 py-3.5 sm:py-4 bg-transparent text-xs sm:text-sm text-black outline-none font-bold uppercase tracking-wider placeholder:text-neutral-400 placeholder:normal-case"
          />

          <div className="absolute right-2 sm:right-3 flex items-center gap-1.5">
            {isSearching && (
              <span className="w-4 h-4 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mr-1" />
            )}
            {query && (
              <button
                onClick={() => setQuery("")}
                className="w-6 h-6 rounded-none hover:bg-neutral-200 text-neutral-500 hover:text-black flex items-center justify-center text-xs font-bold transition-colors cursor-pointer"
                title="Clear search"
              >
                ✕
              </button>
            )}
            <button
              onClick={onClose}
              className="w-7 h-7 rounded-none bg-neutral-100 hover:bg-black hover:text-white border border-black/20 flex items-center justify-center text-black font-bold transition-colors cursor-pointer text-xs"
              title="Close"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Info Hints Bar */}
        <div className="flex justify-between items-center text-[10px] text-neutral-400 font-extrabold uppercase tracking-widest px-1">
          <span>⏎ press Enter to search</span>
          <span>ESC to close</span>
        </div>

        {/* LIVE SEARCH RESULTS SECTION (When user is typing) */}
        {query.trim().length > 0 ? (
          <div className="space-y-4 pt-1">
            <div className="flex items-center justify-between border-b border-stone-200 pb-2">
              <h4 className="text-[11px] uppercase font-extrabold tracking-widest text-neutral-700 flex items-center gap-1.5">
                <span>⚡ Live Search Results</span>
                {totalMatches > 0 && (
                  <span className="bg-orange-500 text-white text-[9px] font-black px-1.5 py-0.2">
                    {totalMatches} Found
                  </span>
                )}
              </h4>

              {totalMatches > 0 && (
                <button
                  type="button"
                  onClick={() => handleSearchSubmit(query)}
                  className="text-[11px] font-extrabold uppercase tracking-wider text-orange-600 hover:text-orange-700 hover:underline"
                >
                  View All ({totalMatches}) →
                </button>
              )}
            </div>

            {/* Results Grid */}
            {liveResults.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {liveResults.map((product) => {
                  const imageSrc = product.images?.[0]?.url || "/images/shiva.png";
                  const deity = product.deity || (Array.isArray(product.category) ? product.category[0]?.name : "");

                  return (
                    <div
                      key={product._id}
                      onClick={() => handleProductClick(product.slug)}
                      className="group flex sm:flex-col items-center sm:items-start gap-3 p-2.5 bg-stone-50 hover:bg-white border-2 border-stone-200 hover:border-black transition-all cursor-pointer shadow-xs hover:shadow-md"
                    >
                      {/* Image Thumbnail */}
                      <div className="relative w-16 h-16 sm:w-full sm:aspect-square bg-white border border-stone-200 shrink-0 overflow-hidden flex items-center justify-center">
                        <ImageWithSkeleton
                          src={imageSrc}
                          alt={product.title}
                          fill
                          className="object-contain p-1.5 group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>

                      {/* Product Details */}
                      <div className="flex-1 min-w-0 space-y-1">
                        {deity && (
                          <span className="inline-block text-[9px] uppercase tracking-wider font-extrabold text-amber-900 bg-amber-100/80 px-1.5 py-0.2 border border-amber-200 truncate max-w-full">
                            {deity}
                          </span>
                        )}
                        <h5 className="font-extrabold text-xs sm:text-[13px] text-neutral-900 uppercase tracking-tight truncate group-hover:text-orange-600 transition-colors">
                          {product.title}
                        </h5>
                        <div className="flex items-center gap-2">
                          <span className="text-xs sm:text-sm font-black text-black">
                            ₹{product.basePrice}
                          </span>
                          {product.isOnSale && (
                            <span className="text-[9px] font-black text-white bg-red-600 px-1 py-0.2 uppercase">
                              SALE
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : !isSearching ? (
              <div className="text-center py-8 px-4 bg-stone-50 border border-stone-200 space-y-2">
                <span className="text-3xl block">🔍</span>
                <p className="text-xs uppercase font-extrabold tracking-wider text-neutral-800">
                  No divine sculptures found for &quot;{query}&quot;
                </p>
                <p className="text-[11px] text-neutral-500 font-normal max-w-md mx-auto">
                  Check for spelling, try searching with general deity names like &quot;Shiva&quot;, &quot;Ganesh&quot;, &quot;Krishna&quot;, or select from the tags below.
                </p>
              </div>
            ) : (
              <div className="py-12 text-center text-xs font-bold uppercase tracking-widest text-neutral-400">
                Searching Divine Catalog...
              </div>
            )}

            {/* Bottom View All Button */}
            {totalMatches > 0 && (
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => handleSearchSubmit(query)}
                  className="w-full bg-black hover:bg-orange-500 text-white font-extrabold text-xs uppercase tracking-widest py-3.5 border-2 border-black hover:border-orange-500 transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>View All {totalMatches} Results for &quot;{query}&quot;</span>
                  <span>→</span>
                </button>
              </div>
            )}
          </div>
        ) : null}

        {/* DEFAULT VIEW (When query is empty) */}
        {query.trim().length === 0 && (
          <div className="space-y-6">
            {/* Section 1: Popular Keywords / Tags */}
            <div className="space-y-2.5">
              <h4 className="text-[10px] uppercase font-extrabold tracking-widest text-neutral-500">
                ⚡ Popular Searches &amp; Tags
              </h4>
              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                {popularTags.map((kw) => (
                  <button
                    key={kw}
                    onClick={() => handleSearchSubmit(kw)}
                    className="px-3 sm:px-3.5 py-1.5 rounded-none text-[11px] bg-stone-50 border border-stone-300 hover:border-black hover:bg-black hover:text-white text-neutral-800 font-extrabold uppercase tracking-wider transition-all cursor-pointer"
                  >
                    ✦ {kw}
                  </button>
                ))}
              </div>
            </div>

            {/* Section 2: Explore Quick Hubs */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                onClick={() => { onClose(); router.push("/products"); }}
                className="bg-stone-50 hover:bg-black hover:text-white p-4 rounded-none border border-stone-300 text-left transition-all group flex justify-between items-center cursor-pointer"
              >
                <div>
                  <p className="text-[9px] uppercase tracking-wider text-neutral-400 font-extrabold group-hover:text-amber-400">Catalog</p>
                  <h5 className="font-display font-extrabold text-xs sm:text-sm text-black group-hover:text-white uppercase tracking-wider mt-0.5">All Sculptures</h5>
                </div>
                <span className="text-black group-hover:text-amber-400 group-hover:translate-x-1.5 transition-transform font-bold">→</span>
              </button>

              <button
                onClick={() => { onClose(); router.push("/products?purpose=pooja-room"); }}
                className="bg-stone-50 hover:bg-black hover:text-white p-4 rounded-none border border-stone-300 text-left transition-all group flex justify-between items-center cursor-pointer"
              >
                <div>
                  <p className="text-[9px] uppercase tracking-wider text-neutral-400 font-extrabold group-hover:text-amber-400">Sanctum</p>
                  <h5 className="font-display font-extrabold text-xs sm:text-sm text-black group-hover:text-white uppercase tracking-wider mt-0.5">Pooja Essentials</h5>
                </div>
                <span className="text-black group-hover:text-amber-400 group-hover:translate-x-1.5 transition-transform font-bold">→</span>
              </button>

              <button
                onClick={() => { onClose(); router.push("/track-order"); }}
                className="bg-stone-50 hover:bg-black hover:text-white p-4 rounded-none border border-stone-300 text-left transition-all group flex justify-between items-center cursor-pointer"
              >
                <div>
                  <p className="text-[9px] uppercase tracking-wider text-neutral-400 font-extrabold group-hover:text-amber-400">Logistics</p>
                  <h5 className="font-display font-extrabold text-xs sm:text-sm text-black group-hover:text-white uppercase tracking-wider mt-0.5">Track Order</h5>
                </div>
                <span className="text-black group-hover:text-amber-400 group-hover:translate-x-1.5 transition-transform font-bold">→</span>
              </button>
            </div>

            {/* Section 3: Dynamic Featured Categories */}
            {categories.length > 0 && (
              <div className="space-y-3 pt-1 border-t border-stone-200">
                <h4 className="text-[10px] uppercase font-extrabold tracking-widest text-neutral-500">
                  ⭐ Featured Deity Collections
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
                  {categories.map((cat) => {
                    const slug = (cat.slug || cat.name || "").toLowerCase();
                    const deityImages = {
                      shiva: "/images/shiva.png",
                      ganesh: "/images/ganesh.png",
                      krishna: "/images/krishna.jpg",
                      hanuman: "/images/hanuman.jpg",
                      durga: "/images/durga.jpg",
                      saraswati: "/images/saraswati.jpg",
                    };
                    const imageSrc = deityImages[slug] || "/images/shiva.png";

                    return (
                      <button
                        key={cat._id}
                        onClick={() => {
                          onClose();
                          router.push(`/products?category=${encodeURIComponent(cat.slug || cat.name)}`);
                        }}
                        className="group text-center space-y-1.5 focus:outline-none border border-stone-200 hover:border-black p-2 bg-stone-50 hover:bg-white transition-all cursor-pointer"
                      >
                        <div className="relative aspect-square w-full bg-white rounded-none overflow-hidden border border-stone-200 flex items-center justify-center">
                          <ImageWithSkeleton
                            src={imageSrc}
                            alt={cat.name}
                            fill
                            className="object-contain p-1 group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                        <p className="text-[10.5px] font-extrabold text-neutral-800 group-hover:text-orange-600 uppercase tracking-wider truncate">
                          {cat.name}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
