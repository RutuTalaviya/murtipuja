"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getCategories, getDeities, getPurposes } from "@/lib/api";

export default function ProductFilters() {
  const [deities, setDeities] = useState(["Ram", "Shiva", "Ganesh", "Krishna", "Hanuman", "Durga"]);
  const [purposesList, setPurposesList] = useState([]);

  useEffect(() => {
    async function loadMetadata() {
      try {
        const [deityRes, purposeRes, catRes] = await Promise.allSettled([
          getDeities(),
          getPurposes(),
          getCategories(),
        ]);

        if (deityRes.status === "fulfilled" && Array.isArray(deityRes.value?.data) && deityRes.value.data.length > 0) {
          setDeities(deityRes.value.data);
        } else if (catRes.status === "fulfilled" && catRes.value?.data && catRes.value.data.length > 0) {
          setDeities(catRes.value.data.map((cat) => cat.name));
        }

        if (purposeRes.status === "fulfilled" && Array.isArray(purposeRes.value?.data) && purposeRes.value.data.length > 0) {
          setPurposesList(purposeRes.value.data);
        }
      } catch (err) {
        console.error("Failed to load metadata in filters:", err);
      }
    }
    loadMetadata();
  }, []);
  const router = useRouter();
  const searchParams = useSearchParams();

  // Local state for prices (to avoid URL thrashing on every keystroke)
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  // Sync inputs with URL parameters
  useEffect(() => {
    setMinPrice(searchParams.get("minPrice") || "");
    setMaxPrice(searchParams.get("maxPrice") || "");
  }, [searchParams]);

  const activeDeity = searchParams.get("deity") || "";
  const activePurpose = searchParams.get("purpose") || "";
  const isOnSaleOnly = searchParams.get("onsale") === "true";

  function updateQuery(key, value) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    // Always reset to page 1 on filter change
    params.delete("page");
    router.push(`/products?${params.toString()}`);
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
    router.push("/products");
  }

  const hasActiveFilters =
    activeDeity || activePurpose || isOnSaleOnly || searchParams.get("minPrice") || searchParams.get("maxPrice") || searchParams.get("search");

  return (
    <aside className="w-full md:w-60 bg-white border-2 border-black p-5 space-y-6 self-start font-display rounded-none">
      
      {/* Sidebar Header */}
      <div className="flex justify-between items-center border-b-2 border-neutral-100 pb-4">
        <h3 className="font-display font-extrabold text-base text-black uppercase tracking-wider">Filters</h3>
        {hasActiveFilters && (
          <button
            onClick={handleClearFilters}
            className="text-[9.5px] uppercase tracking-widest text-red-600 hover:underline font-bold"
          >
            Clear All
          </button>
        )}
      </div>

      {/* Filter: On Sale Toggle */}
      <div className="space-y-3 pb-4 border-b-2 border-neutral-100">
        <div className="flex items-center justify-between">
          <span className="text-[10px] uppercase font-extrabold tracking-widest text-black/50">On Sale Only</span>
          <button
            onClick={() => updateQuery("onsale", isOnSaleOnly ? "" : "true")}
            className={`w-10 h-6 flex items-center p-0.5 cursor-pointer border-2 border-black transition-colors duration-300 outline-none rounded-none ${
              isOnSaleOnly ? "bg-gold" : "bg-neutral-200"
            }`}
            aria-label="Toggle On Sale filter"
          >
            <div
              className={`bg-black w-4 h-4 shadow transition-transform duration-300 rounded-none ${
                isOnSaleOnly ? "translate-x-4" : "translate-x-0"
              }`}
            />
          </button>
        </div>
      </div>

      {/* Filter by Deity */}
      <div className="space-y-3">
        <h4 className="text-[10px] uppercase font-extrabold tracking-widest text-black/50">Shop by Deity</h4>
        <div className="flex flex-col gap-2">
          {deities.map((deity) => {
            const isActive = activeDeity === deity;
            return (
              <button
                key={deity}
                onClick={() => updateQuery("deity", isActive ? "" : deity)}
                className={`text-left text-xs py-2 px-3 rounded-none border-2 transition-all flex justify-between items-center ${
                  isActive
                    ? "bg-neutral-100 border-black text-black font-bold uppercase tracking-wider"
                    : "border-transparent text-neutral-600 hover:bg-neutral-50 font-semibold uppercase tracking-wider"
                }`}
              >
                <span>{deity}</span>
                {isActive && <span className="text-[10px]">✓</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* Filter by Purpose / Occasion */}
      {purposesList.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-[10px] uppercase font-extrabold tracking-widest text-black/50">Purpose & Occasion</h4>
          <div className="flex flex-col gap-2">
            {purposesList.map((p) => {
              const pName = typeof p === "string" ? p : p.name;
              const pSlug = typeof p === "string" ? p.toLowerCase().replace(/\s+/g, "-") : (p.slug || pName.toLowerCase().replace(/\s+/g, "-"));
              const isActive =
                activePurpose.toLowerCase() === pSlug.toLowerCase() ||
                activePurpose.toLowerCase() === pName.toLowerCase();
              return (
                <button
                  key={p._id || pSlug}
                  onClick={() => updateQuery("purpose", isActive ? "" : pSlug)}
                  className={`text-left text-xs py-2 px-3 rounded-none border-2 transition-all flex justify-between items-center ${
                    isActive
                      ? "bg-neutral-100 border-black text-black font-bold uppercase tracking-wider"
                      : "border-transparent text-neutral-600 hover:bg-neutral-50 font-semibold uppercase tracking-wider"
                  }`}
                >
                  <span>{pName}</span>
                  {isActive && <span className="text-[10px]">✓</span>}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Filter by Price Range */}
      <div className="space-y-3">
        <h4 className="text-[10px] uppercase font-extrabold tracking-widest text-black/50">Price Range</h4>
        <form onSubmit={handlePriceApply} className="space-y-3">
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Min"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value.replace(/\D/g, ""))}
              className="w-full px-3 py-2 border-2 border-neutral-200 rounded-none bg-transparent outline-none focus:border-black text-xs font-bold text-black"
            />
            <span className="text-neutral-400 text-xs">—</span>
            <input
              type="text"
              placeholder="Max"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value.replace(/\D/g, ""))}
              className="w-full px-3 py-2 border-2 border-neutral-200 rounded-none bg-transparent outline-none focus:border-black text-xs font-bold text-black"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-black hover:bg-gold hover:text-black text-white text-[10.5px] uppercase tracking-widest font-extrabold py-2.5 rounded-none border-2 border-black transition-all"
          >
            Apply Price
          </button>
        </form>
      </div>

    </aside>
  );
}
