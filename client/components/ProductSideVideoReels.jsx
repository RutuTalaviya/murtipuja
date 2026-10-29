"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { formatImageUrl } from "@/lib/api";

export default function ProductSideVideoReels({ videos = [], productTitle = "" }) {
  const scrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [activeModalVideo, setActiveModalVideo] = useState(null);

  const videoList = Array.isArray(videos)
    ? videos
        .map((v) => (typeof v === "string" ? { url: v } : v))
        .filter((v) => v && v.url)
    : [];

  const updateScrollButtons = useCallback(() => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
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
    if (!scrollRef.current) return;
    const container = scrollRef.current;
    const cardWidth = container.querySelector(".side-reel-card")?.clientWidth || 140;
    const scrollAmount = (cardWidth + 12) * 2;
    container.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
    setTimeout(updateScrollButtons, 350);
  };

  if (videoList.length === 0) return null;

  return (
    <div className="w-full pt-3 pb-2 font-display">
      {/* Video Reel Container with Left/Right Arrows */}
      <div className="relative group">
        {/* Left Arrow Button */}
        {canScrollLeft && (
          <button
            type="button"
            onClick={() => scroll("left")}
            className="absolute left-1 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-white/95 text-black border border-neutral-300 shadow-md flex items-center justify-center font-bold text-sm hover:bg-black hover:text-white transition-all cursor-pointer"
            aria-label="Previous Videos"
          >
            ‹
          </button>
        )}

        {/* Video Reels Scroll Track */}
        <div
          ref={scrollRef}
          onScroll={updateScrollButtons}
          className="flex gap-2.5 sm:gap-3 overflow-x-auto no-scrollbar scroll-smooth py-1"
        >
          {videoList.map((vid, idx) => {
            const rawUrl = typeof vid === "string" ? vid : vid?.url;
            const videoUrl = formatImageUrl(rawUrl);
            if (!videoUrl) return null;

            return (
              <div
                key={idx}
                onClick={() => setActiveModalVideo(videoUrl)}
                className="side-reel-card relative flex-shrink-0 w-[115px] sm:w-[130px] md:w-[140px] aspect-[9/16] rounded-2xl overflow-hidden bg-neutral-900 shadow-sm hover:shadow-md cursor-pointer border border-neutral-200 transition-transform duration-200 hover:scale-[1.02]"
              >
                {/* Silent Autoplay Video Preview */}
                <video
                  src={videoUrl}
                  muted
                  loop
                  playsInline
                  autoPlay
                  preload="metadata"
                  className="w-full h-full object-cover pointer-events-none"
                />

                {/* Subtle dark gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />

                {/* Play Button Icon at Bottom-Left (exact match to screenshot) */}
                <div className="absolute bottom-2.5 left-2.5 z-10 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-black/60 backdrop-blur-xs border border-white/30 flex items-center justify-center text-white shadow-md">
                  <svg
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="w-3.5 h-3.5 sm:w-4 sm:h-4 ml-0.5"
                  >
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Arrow Button */}
        {canScrollRight && (
          <button
            type="button"
            onClick={() => scroll("right")}
            className="absolute right-1 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-white/95 text-black border border-neutral-300 shadow-md flex items-center justify-center font-bold text-sm hover:bg-black hover:text-white transition-all cursor-pointer"
            aria-label="Next Videos"
          >
            ›
          </button>
        )}
      </div>

      {/* Fullscreen Reel Video Modal */}
      {activeModalVideo && (
        <div
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setActiveModalVideo(null)}
        >
          <div
            className="relative w-full max-w-sm aspect-[9/16] max-h-[85vh] bg-black rounded-2xl overflow-hidden border-2 border-white/20 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setActiveModalVideo(null)}
              className="absolute top-3 right-3 z-30 w-8 h-8 rounded-full bg-black/70 text-white flex items-center justify-center font-bold text-sm border border-white/30 hover:bg-white hover:text-black transition-colors cursor-pointer"
              aria-label="Close Video"
            >
              ✕
            </button>

            {/* Video Player */}
            <video
              src={activeModalVideo}
              controls
              autoPlay
              playsInline
              className="w-full h-full object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
}
