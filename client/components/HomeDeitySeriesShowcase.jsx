"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import ImageWithSkeleton from "./ImageWithSkeleton";

function shuffleArray(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export default function HomeDeitySeriesShowcase({ products = [], deities = [], categories = [] }) {
  // 1. Group all available deities with their real products and images
  const allDeitySeries = useMemo(() => {
    const deityMap = new Map(); // normalized lowerCase -> formatted Name

    // Collect deities from products
    products.forEach((p) => {
      if (p.deity && typeof p.deity === "string") {
        const clean = p.deity.trim();
        if (clean && clean.toLowerCase() !== "general") {
          const lower = clean.toLowerCase();
          if (!deityMap.has(lower)) {
            const formatted = clean.replace(/[-_]/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
            deityMap.set(lower, formatted);
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
            const formatted = clean.replace(/[-_]/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
            deityMap.set(lower, formatted);
          }
        }
      }
    });

    const seriesData = [];

    deityMap.forEach((deityName, lower) => {
      const slug = lower.replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

      // Find all matching products for this deity
      const matchingProducts = products.filter((p) => {
        const pDeity = (p.deity || "").toLowerCase().trim();
        if (pDeity === lower || pDeity.includes(lower) || lower.includes(pDeity)) return true;

        // Check category or subCategory
        if (Array.isArray(p.category)) {
          const matchedCat = p.category.some((c) => {
            const cName = (typeof c === "string" ? c : c?.name || "").toLowerCase();
            return cName === lower || cName.includes(lower);
          });
          if (matchedCat) return true;
        }

        if (Array.isArray(p.subCategory)) {
          const matchedSub = p.subCategory.some((s) => {
            const sName = (typeof s === "string" ? s : s?.name || "").toLowerCase();
            return sName === lower || sName.includes(lower);
          });
          if (matchedSub) return true;
        }

        return false;
      });

      // Find first product with a valid real uploaded image
      const productWithImage = matchingProducts.find(
        (p) => p.images && Array.isArray(p.images) && p.images.length > 0 && p.images[0]?.url
      );

      // Only include this deity series if it has real products with uploaded photos!
      if (productWithImage && productWithImage.images[0]?.url) {
        const dynamicImage = productWithImage.images[0].url;
        const count = matchingProducts.length;

        seriesData.push({
          id: `deity-${slug}`,
          name: deityName,
          slug,
          imageSrc: dynamicImage,
          badgeText: `${count} Sacred ${count === 1 ? "Sculpture" : "Sculptures"}`,
          subtitle: `Explore ${count} ${deityName} ${count === 1 ? "Design" : "Designs"} across All Formats`,
          count,
          link: `/products?deity=${encodeURIComponent(deityName)}`,
        });
      }
    });

    return seriesData;
  }, [products, deities, categories]);

  // 2. Select Random 3 Deity Series on client mount
  const [selectedDeities, setSelectedDeities] = useState(() => allDeitySeries.slice(0, 3));

  useEffect(() => {
    if (allDeitySeries.length > 0) {
      const shuffled = shuffleArray(allDeitySeries);
      setSelectedDeities(shuffled.slice(0, 3));
    } else {
      setSelectedDeities([]);
    }
  }, [allDeitySeries]);

  // If no products with uploaded deity images exist, hide the section cleanly
  if (selectedDeities.length === 0) return null;

  const count = selectedDeities.length;
  const gridClass =
    count === 1
      ? "grid grid-cols-1 max-w-2xl mx-auto"
      : count === 2
      ? "grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-stone-300"
      : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-stone-300";

  return (
    <section className="w-full bg-white border-b border-stone-300">
      {/* Header Bar */}
      <div className="w-full px-4 sm:px-8 md:px-12 lg:px-16 xl:px-20 py-6 sm:py-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-stone-300 bg-white">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
            <p className="text-[11px] sm:text-xs uppercase tracking-widest text-amber-800 font-extrabold">
              Sacred Deity Series
            </p>
          </div>
          <h2 className="font-display text-2xl sm:text-3xl md:text-4xl text-neutral-900 font-extrabold uppercase tracking-tight">
            Shop by Deity Series
          </h2>
        </div>
        <Link
          href="/products"
          className="text-xs font-extrabold text-neutral-800 hover:text-amber-800 uppercase tracking-widest transition-colors flex items-center gap-1.5 self-start sm:self-auto py-2 px-4 rounded-none border border-stone-300 hover:border-black bg-stone-50 hover:bg-white shadow-2xs"
        >
          <span>Explore All Series</span>
          <span>→</span>
        </Link>
      </div>

      {/* Dynamic Responsive Deity Series Grid */}
      <div className={`w-full bg-stone-200 ${gridClass}`}>
        {selectedDeities.map((item) => (
          <Link
            key={item.id}
            href={item.link}
            className="group relative min-h-[500px] sm:min-h-[560px] md:min-h-[600px] lg:min-h-[640px] overflow-hidden flex flex-col justify-between p-6 sm:p-8 md:p-10 bg-gradient-to-b from-[#faf7f2] via-[#f4eee4] to-[#ebe1d1] hover:from-[#fdf8f0] hover:via-[#f7efe0] hover:to-[#e3d3ba] transition-all duration-500"
          >
            {/* Ambient Halo Glow */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(245,158,11,0.18)_0%,transparent_70%)] opacity-70 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

            {/* Top Badge & Indicator */}
            <div className="flex justify-between items-center z-10 w-full">
              <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/95 backdrop-blur-sm border border-stone-300/80 text-[11px] sm:text-xs font-extrabold uppercase tracking-widest text-neutral-900 shadow-xs">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                <span>{item.badgeText}</span>
              </span>
              <span className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/90 backdrop-blur-sm border border-stone-300 flex items-center justify-center text-stone-600 text-xs font-extrabold group-hover:rotate-90 group-hover:text-amber-800 group-hover:bg-white group-hover:border-amber-300 transition-all duration-500 shadow-xs">
                ⌖
              </span>
            </div>

            {/* Center Stage: Prominent, Centered & Large Real Product Image */}
            <div className="relative flex-1 flex items-center justify-center w-full my-4 sm:my-6 py-2 z-0">
              {/* Pedestal Ambient Glow */}
              <div className="absolute w-52 sm:w-64 md:w-72 h-52 sm:h-64 md:h-72 rounded-full bg-amber-400/20 blur-3xl pointer-events-none group-hover:bg-amber-400/30 transition-all duration-700" />

              <div className="relative z-10 w-full h-full max-h-[320px] sm:max-h-[360px] md:max-h-[400px] flex items-center justify-center">
                <ImageWithSkeleton
                  src={item.imageSrc}
                  alt={`${item.name} Series Murti`}
                  width={420}
                  height={420}
                  className="max-w-[85%] max-h-[300px] sm:max-h-[340px] md:max-h-[380px] lg:max-h-[400px] w-auto h-auto object-contain drop-shadow-[0_25px_35px_rgba(0,0,0,0.22)] transition-all duration-700 ease-out group-hover:scale-110 group-hover:-translate-y-2"
                />
              </div>
            </div>

            {/* Bottom Card Information */}
            <div className="space-y-1.5 sm:space-y-2 z-10 bg-white/95 backdrop-blur-md p-4 sm:p-5 md:p-6 rounded-2xl border border-stone-300/90 shadow-sm group-hover:border-amber-400 group-hover:bg-white group-hover:shadow-md transition-all duration-300 w-full">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                    <h3 className="font-display text-xl sm:text-2xl md:text-3xl font-extrabold text-neutral-900 tracking-tight uppercase group-hover:text-amber-900 transition-colors truncate">
                      {item.name} Series
                    </h3>
                  </div>
                  <p className="text-[11px] sm:text-xs text-stone-500 font-bold uppercase tracking-wider mt-1 truncate">
                    {item.subtitle}
                  </p>
                </div>
                <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-neutral-900 text-white group-hover:bg-amber-600 flex items-center justify-center transition-all duration-300 group-hover:scale-105 group-hover:translate-x-1 shadow-md shrink-0 text-sm font-bold">
                  →
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

