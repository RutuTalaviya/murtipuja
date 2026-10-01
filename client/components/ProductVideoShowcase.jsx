"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { formatImageUrl } from "@/lib/api";

export default function ProductVideoShowcase({ videos = [], productTitle = "" }) {
  const scrollContainerRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const videoList = Array.isArray(videos)
    ? videos
        .map((v) => (typeof v === "string" ? { url: v } : v))
        .filter((v) => v && v.url)
    : [];

  const updateScrollButtons = useCallback(() => {
    if (!scrollContainerRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
  }, []);

  useEffect(() => {
    const el = scrollContainerRef.current;
    if (el) {
      updateScrollButtons();
      el.addEventListener("scroll", updateScrollButtons, { passive: true });
      window.addEventListener("resize", updateScrollButtons);
      return () => {
        el.removeEventListener("scroll", updateScrollButtons);
        window.removeEventListener("resize", updateScrollButtons);
      };
    }
  }, [updateScrollButtons, videoList.length]);

  const scroll = (direction) => {
    if (!scrollContainerRef.current) return;
    const container = scrollContainerRef.current;
    const firstCard = container.querySelector(".product-video-card");
    const cardWidth = firstCard ? firstCard.clientWidth : 300;
    const gap = 24;
    const scrollAmount = (cardWidth + gap) * (window.innerWidth < 640 ? 1 : 2);

    container.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  if (videoList.length === 0) return null;

  return (
    <section className="w-full bg-[#fcfaf7] py-10 sm:py-14 px-3 sm:px-6 md:px-10 border-t-2 border-b-2 border-stone-300 font-display">
      <div className="w-full max-w-7xl mx-auto space-y-6">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-stone-300 pb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              <p className="text-[11px] sm:text-xs uppercase tracking-widest text-amber-900 font-extrabold">
                Sacred 3D Video Showcase
              </p>
            </div>
            <h2 className="font-display text-2xl sm:text-3xl font-extrabold uppercase tracking-tight text-neutral-900">
              Product In Motion
            </h2>
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-3">
            <span className="text-xs text-stone-500 font-bold uppercase tracking-wider hidden sm:inline">
              Real Consecrated Finishes & 360° Views
            </span>

            {/* Navigation Arrows for Scrolling */}
            {videoList.length > 1 && (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => scroll("left")}
                  disabled={!canScrollLeft}
                  className={`w-9 h-9 sm:w-10 sm:h-10 border-2 border-black flex items-center justify-center font-black text-sm sm:text-base transition-all cursor-pointer shadow-sm rounded-none ${
                    canScrollLeft
                      ? "bg-black text-white hover:bg-gold hover:text-black hover:border-black active:scale-95"
                      : "bg-neutral-100 text-neutral-400 border-neutral-300 cursor-not-allowed opacity-50"
                  }`}
                  aria-label="Scroll left"
                >
                  ←
                </button>
                <button
                  type="button"
                  onClick={() => scroll("right")}
                  disabled={!canScrollRight}
                  className={`w-9 h-9 sm:w-10 sm:h-10 border-2 border-black flex items-center justify-center font-black text-sm sm:text-base transition-all cursor-pointer shadow-sm rounded-none ${
                    canScrollRight
                      ? "bg-black text-white hover:bg-gold hover:text-black hover:border-black active:scale-95"
                      : "bg-neutral-100 text-neutral-400 border-neutral-300 cursor-not-allowed opacity-50"
                  }`}
                  aria-label="Scroll right"
                >
                  →
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Video Scrollable Carousel Container */}
        <div className="relative">
          <div
            ref={scrollContainerRef}
            className="flex gap-4 sm:gap-6 overflow-x-auto no-scrollbar scroll-smooth pb-3 snap-x snap-mandatory"
          >
            {videoList.map((vid, vIdx) => {
              const videoUrl = typeof vid === "string" ? vid : vid?.url;
              if (!videoUrl) return null;

              return (
                <div
                  key={vIdx}
                  className="product-video-card flex-none w-[270px] sm:w-[280px] md:w-[calc(33.333%-16px)] lg:w-[calc(25%-18px)] snap-start"
                >
                  <div className="relative aspect-[9/16] sm:aspect-[4/5] bg-black border-2 border-black overflow-hidden shadow-md group rounded-none">
                    <video
                      src={formatImageUrl(videoUrl)}
                      controls
                      playsInline
                      className="w-full h-full object-cover"
                      preload="metadata"
                    />
                    <div className="absolute top-2 left-2 z-10 pointer-events-none">
                      <span className="bg-black/80 backdrop-blur-sm text-gold text-[9px] font-black uppercase px-2 py-0.5 border border-gold/40">
                        Video #{vIdx + 1}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
