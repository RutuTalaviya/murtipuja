"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import ImageWithSkeleton from "./ImageWithSkeleton";

const DEFAULT_DEITY_FALLBACKS = {
  shiva: { image: "/images/shiva.png", subtitle: "Meditative Power & Transcendence" },
  ganesh: { image: "/images/ganesh.png", subtitle: "Auspicious Beginnings & Wisdom" },
  krishna: { image: "/images/krishna.jpg", subtitle: "Divine Devotion & Joy" },
  hanuman: { image: "/images/hanuman.jpg", subtitle: "Strength, Courage & Devotion" },
  durga: { image: "/images/durga.jpg", subtitle: "Sacred Mahashakti & Protection" },
  saraswati: { image: "/images/saraswati.jpg", subtitle: "Wisdom, Music & Art" },
  ram: { image: "/images/shiva.png", subtitle: "Dharma, Righteousness & Peace" },
};

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
    const deityNamesSet = new Set();

    // From products
    products.forEach((p) => {
      if (p.deity && typeof p.deity === "string" && p.deity.trim().toLowerCase() !== "general") {
        deityNamesSet.add(p.deity.trim());
      }
    });

    // From deities list
    (deities || []).forEach((d) => {
      if (d && typeof d === "string" && d.trim().toLowerCase() !== "general") {
        deityNamesSet.add(d.trim());
      }
    });

    if (deityNamesSet.size === 0) {
      ["Ram", "Shiva", "Ganesh", "Krishna", "Hanuman", "Durga"].forEach((d) => deityNamesSet.add(d));
    }

    const deityList = Array.from(deityNamesSet);

    const seriesData = deityList.map((deityName) => {
      const lower = deityName.toLowerCase();
      const slug = lower.replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

      // Find all matching products for this deity
      const matchingProducts = products.filter((p) => {
        const pDeity = (p.deity || "").toLowerCase().trim();
        if (pDeity === lower || pDeity.includes(lower) || lower.includes(pDeity)) return true;

        // check category
        if (Array.isArray(p.category)) {
          return p.category.some((c) => {
            const cName = (typeof c === "string" ? c : c?.name || "").toLowerCase();
            return cName === lower || cName.includes(lower);
          });
        }
        return false;
      });

      // Best dynamic product image (take first product image uploaded)
      const productWithImage = matchingProducts.find(
        (p) => p.images && p.images.length > 0 && p.images[0]?.url
      );
      const dynamicImage = productWithImage?.images[0]?.url;
      const fallbackImage = DEFAULT_DEITY_FALLBACKS[slug]?.image || "/images/shiva.png";
      const imageSrc = dynamicImage || fallbackImage;

      // Dynamic subtitle & badge
      const count = matchingProducts.length;
      const defaultSub = DEFAULT_DEITY_FALLBACKS[slug]?.subtitle || "Micro-Precision Sacred 3D Sculptures";
      const badgeText = count > 0 ? `${count} Sacred Sculptures` : "Sacred Deity Drop";

      return {
        id: `deity-${slug}`,
        name: deityName,
        slug,
        imageSrc,
        badgeText,
        subtitle: defaultSub,
        count,
        link: `/products?deity=${encodeURIComponent(deityName)}`,
        hasRealProducts: count > 0,
      };
    });

    return seriesData;
  }, [products, deities, categories]);

  // 2. Select Random 3 Deity Series on client mount
  const [selectedDeities, setSelectedDeities] = useState(() => {
    const withProducts = allDeitySeries.filter((d) => d.hasRealProducts);
    const source = withProducts.length >= 3 ? withProducts : allDeitySeries;
    return source.slice(0, 3);
  });

  useEffect(() => {
    const withProducts = allDeitySeries.filter((d) => d.hasRealProducts);
    const pool = withProducts.length >= 3 ? withProducts : allDeitySeries;
    const shuffled = shuffleArray(pool);
    setSelectedDeities(shuffled.slice(0, 3));
  }, [allDeitySeries]);

  if (selectedDeities.length === 0) return null;

  return (
    <section className="w-full bg-white border-b border-stone-200">
      {/* Header Bar */}
      <div className="w-full px-6 sm:px-12 md:px-16 lg:px-20 py-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-stone-200 bg-white">
        <div>
          <p className="text-xs uppercase tracking-widest text-amber-800 font-extrabold mb-1">
            Sacred Collections
          </p>
          <h2 className="font-display text-2xl sm:text-3xl md:text-4xl text-neutral-900 font-extrabold uppercase tracking-tight">
            Shop by Deity Series
          </h2>
        </div>
        <Link
          href="/products"
          className="text-xs font-extrabold text-neutral-700 hover:text-amber-800 uppercase tracking-widest transition-colors flex items-center gap-1.5"
        >
          <span>Explore All Series</span>
          <span>→</span>
        </Link>
      </div>

      {/* Dynamic 3-Column Deity Series Grid */}
      <div className="w-full grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-stone-200 bg-stone-100">
        {selectedDeities.map((item) => (
          <Link
            key={item.id}
            href={item.link}
            className="group relative h-[440px] sm:h-[480px] lg:h-[520px] overflow-hidden flex flex-col justify-between p-7 sm:p-9 bg-gradient-to-b from-white via-[#faf8f5] to-[#f4eee4] hover:from-[#fdf8f0] hover:to-[#ede2cf] transition-all duration-500"
          >
            {/* Ambient Halo Glow */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(245,158,11,0.12)_0%,transparent_70%)] opacity-60 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

            {/* Top Badge & Indicator */}
            <div className="flex justify-between items-center z-10">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/90 backdrop-blur-sm border border-stone-200/90 text-[11px] font-extrabold uppercase tracking-widest text-neutral-800 shadow-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                <span>{item.badgeText}</span>
              </span>
              <span className="w-8 h-8 rounded-full bg-white/80 border border-stone-200/80 flex items-center justify-center text-stone-500 text-xs font-bold group-hover:rotate-90 group-hover:text-amber-800 group-hover:bg-white transition-all duration-500 shadow-sm">
                ⌖
              </span>
            </div>

            {/* Center Dynamic Deity Image */}
            <div className="relative my-auto flex items-center justify-center py-4 z-0">
              <ImageWithSkeleton
                src={item.imageSrc}
                alt={`${item.name} Series`}
                width={280}
                height={280}
                className="w-44 sm:w-52 lg:w-56 h-44 sm:h-52 lg:h-56 object-contain drop-shadow-[0_20px_30px_rgba(0,0,0,0.16)] transition-all duration-700 ease-out group-hover:scale-110 group-hover:-translate-y-2"
              />
            </div>

            {/* Bottom Card Information */}
            <div className="space-y-2 z-10 bg-white/85 backdrop-blur-md p-5 rounded-2xl border border-stone-200/80 shadow-sm group-hover:border-amber-300/80 group-hover:bg-white/95 transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-display text-xl sm:text-2xl font-extrabold text-neutral-900 tracking-tight uppercase group-hover:text-amber-900 transition-colors">
                    {item.name} Series
                  </h3>
                  <p className="text-[11px] text-stone-500 font-bold uppercase tracking-wider mt-0.5">
                    {item.count > 0 ? `Explore ${item.count} Models in All Formats` : "Micro-Precision 3D Sculptures"}
                  </p>
                </div>
                <div className="w-9 h-9 rounded-xl bg-neutral-900 text-white group-hover:bg-amber-600 flex items-center justify-center transition-all duration-300 group-hover:translate-x-1 shadow-sm flex-shrink-0">
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
