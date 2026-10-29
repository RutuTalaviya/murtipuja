"use client";

import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import ProductCard from "@/components/ProductCard";

export default function RelatedDropsCarousel({ products = [], currentDeity = "" }) {
  const scrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScroll = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener("resize", checkScroll);
    return () => window.removeEventListener("resize", checkScroll);
  }, [products]);

  const scroll = (direction) => {
    if (!scrollRef.current) return;
    const container = scrollRef.current;
    const scrollAmount = container.clientWidth * 0.75;
    container.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
    setTimeout(checkScroll, 350);
  };

  if (!products || products.length === 0) return null;

  return (
    <section className="w-full bg-[#fdfcfb] py-8 sm:py-10 md:py-12 border-t-2 border-stone-200 font-display">
      <div className="w-full px-4 md:px-8 lg:px-10">
        {/* Section Header */}
        <div className="flex flex-row items-end justify-between gap-4 pb-4 border-b border-stone-200 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
              <p className="text-[10px] sm:text-[11px] uppercase tracking-widest text-amber-800 font-extrabold">
                Sacred Companions
              </p>
            </div>
            <h2 className="font-display text-xl sm:text-2xl md:text-3xl text-neutral-900 font-extrabold uppercase tracking-tight">
              Related Drops
            </h2>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href={currentDeity ? `/products?deity=${encodeURIComponent(currentDeity)}` : "/products"}
              className="hidden sm:inline-flex items-center gap-1.5 text-xs font-extrabold text-neutral-800 hover:text-amber-800 uppercase tracking-widest transition-colors group"
            >
              <span>Explore All Drops</span>
              <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
            </Link>

            {/* Prev / Next Slider Controls */}
            {products.length > 4 && (
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => scroll("left")}
                  disabled={!canScrollLeft}
                  className="w-8 h-8 sm:w-9 sm:h-9 border-2 border-black bg-white hover:bg-black hover:text-white disabled:opacity-30 disabled:hover:bg-white disabled:hover:text-black flex items-center justify-center font-bold text-sm transition-all cursor-pointer shadow-2xs"
                  aria-label="Previous Related Drops"
                >
                  ←
                </button>
                <button
                  type="button"
                  onClick={() => scroll("right")}
                  disabled={!canScrollRight}
                  className="w-8 h-8 sm:w-9 sm:h-9 border-2 border-black bg-white hover:bg-black hover:text-white disabled:opacity-30 disabled:hover:bg-white disabled:hover:text-black flex items-center justify-center font-bold text-sm transition-all cursor-pointer shadow-2xs"
                  aria-label="Next Related Drops"
                >
                  →
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Product Cards Row - Fits 100% on a Single Screen */}
        <div
          ref={scrollRef}
          onScroll={checkScroll}
          className="w-full flex gap-4 sm:gap-5 md:gap-6 overflow-x-auto no-scrollbar scroll-smooth py-1"
        >
          {products.map((product) => (
            <div
              key={product._id}
              className="flex-shrink-0 w-[220px] sm:w-[240px] md:w-[260px] lg:w-[calc(25%-18px)] xl:w-[calc(25%-18px)] border border-stone-200 hover:border-black transition-all bg-white shadow-2xs group"
            >
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
