"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import ImageWithSkeleton from "@/components/ImageWithSkeleton";

export default function VideoReelsCarousel({ videos = [] }) {
  const scrollContainerRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [scrollProgress, setScrollProgress] = useState(0);

  // Muted states for each video (default: muted for silent autoplay compliance)
  const [mutedStates, setMutedStates] = useState({});
  // Playing states (default: playing)
  const [playingStates, setPlayingStates] = useState({});

  const videoList = Array.isArray(videos) && videos.length > 0 ? videos : [];

  // Ref map to manage video elements
  const videoElementsRef = useRef({});

  // Trigger autoplay for all visible videos on mount
  useEffect(() => {
    Object.values(videoElementsRef.current).forEach((videoEl) => {
      if (videoEl) {
        videoEl.play().catch(() => {
          videoEl.muted = true;
          videoEl.play().catch(() => {});
        });
      }
    });
  }, [videoList]);

  // Check scroll positions
  const updateScrollButtons = useCallback(() => {
    if (!scrollContainerRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);

    const totalScroll = scrollWidth - clientWidth;
    if (totalScroll > 0) {
      setScrollProgress((scrollLeft / totalScroll) * 100);
    }
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
    const cardWidth = container.querySelector(".reel-card")?.clientWidth || 320;
    const scrollAmount = (cardWidth + 24) * (window.innerWidth < 640 ? 1 : 2);
    
    container.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  const toggleMute = (e, videoId) => {
    e.stopPropagation();
    setMutedStates((prev) => {
      const nextState = !prev[videoId];
      const el = videoElementsRef.current[videoId];
      if (el) {
        el.muted = !nextState;
      }
      return {
        ...prev,
        [videoId]: nextState,
      };
    });
  };

  const togglePlayPause = (videoId) => {
    const el = videoElementsRef.current[videoId];
    if (!el) return;
    if (el.paused) {
      el.play().catch(() => {});
      setPlayingStates((prev) => ({ ...prev, [videoId]: true }));
    } else {
      el.pause();
      setPlayingStates((prev) => ({ ...prev, [videoId]: false }));
    }
  };

  if (videoList.length === 0) return null;

  return (
    <section className="w-full bg-white py-12 sm:py-16 md:py-20 border-b-2 border-black overflow-hidden font-display select-none">
      <div className="w-full px-3 sm:px-6 md:px-8 lg:px-12">
        
        {/* Section Header with Left / Right Navigation Controls */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 pb-6 border-b-2 border-black">
          <div>
            <div className="inline-flex items-center gap-2 bg-neutral-100 text-black border-2 border-black px-3 py-1 rounded-none text-[10px] font-extrabold uppercase tracking-widest mb-2.5">
              <span className="w-2 h-2 rounded-none bg-red-600 animate-pulse" />
              <span>Divine Craftsmanship Showcase</span>
            </div>
            <h2 className="font-display text-2xl sm:text-4xl md:text-5xl font-extrabold text-black uppercase tracking-wider">
              Watch The Craft in Motion
            </h2>
            <p className="text-neutral-500 text-xs sm:text-sm font-semibold uppercase tracking-wider mt-1.5 max-w-xl">
              Live short reels capturing 0.1mm micro-precision carving, artisanal finishing, and unboxing moments.
            </p>
          </div>

          {/* Left / Right Scroll Action Buttons in Header */}
          <div className="flex items-center gap-3 self-end sm:self-auto">
            <button
              onClick={() => scroll("left")}
              disabled={!canScrollLeft}
              aria-label="Previous Reel"
              className={`w-11 h-11 rounded-none border-2 border-black flex items-center justify-center text-base font-extrabold transition-colors ${
                canScrollLeft
                  ? "bg-white text-black hover:bg-black hover:text-white cursor-pointer active:scale-95"
                  : "bg-neutral-100 text-neutral-300 cursor-not-allowed opacity-50"
              }`}
            >
              ←
            </button>

            <button
              onClick={() => scroll("right")}
              disabled={!canScrollRight}
              aria-label="Next Reel"
              className={`w-11 h-11 rounded-none border-2 border-black flex items-center justify-center text-base font-extrabold transition-colors ${
                canScrollRight
                  ? "bg-black text-white hover:bg-gold hover:text-black cursor-pointer active:scale-95"
                  : "bg-neutral-100 text-neutral-300 cursor-not-allowed opacity-50"
              }`}
            >
              →
            </button>
          </div>
        </div>

        {/* Carousel Container with Floating Side Arrow Buttons */}
        <div className="relative mt-8 group/carousel">
          
          {/* Floating Left Arrow Button */}
          {canScrollLeft && (
            <button
              onClick={() => scroll("left")}
              aria-label="Scroll Left"
              className="absolute -left-3 sm:-left-5 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-none bg-white border-2 border-black text-black flex items-center justify-center text-lg font-extrabold shadow-lg hover:bg-black hover:text-white transition-all cursor-pointer hidden md:flex"
            >
              ←
            </button>
          )}

          {/* Floating Right Arrow Button */}
          {canScrollRight && (
            <button
              onClick={() => scroll("right")}
              aria-label="Scroll Right"
              className="absolute -right-3 sm:-right-5 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-none bg-white border-2 border-black text-black flex items-center justify-center text-lg font-extrabold shadow-lg hover:bg-gold hover:text-black transition-all cursor-pointer hidden md:flex"
            >
              →
            </button>
          )}

          {/* Scrollable Reels Carousel Track */}
          <div
            ref={scrollContainerRef}
            className="flex gap-4 sm:gap-6 overflow-x-auto scrollbar-none py-2 scroll-smooth"
            style={{ 
              scrollSnapType: "x mandatory", 
              WebkitOverflowScrolling: "touch",
              scrollbarWidth: "none",
              msOverflowStyle: "none"
            }}
          >
            {videoList.map((video, idx) => {
              const isUnmuted = Boolean(mutedStates[video._id]);
              const isPaused = playingStates[video._id] === false;

              return (
                <div
                  key={video._id || idx}
                  style={{ scrollSnapAlign: "start" }}
                  onClick={() => togglePlayPause(video._id)}
                  className="reel-card group relative w-[250px] sm:w-[280px] md:w-[310px] aspect-[9/16] flex-shrink-0 rounded-none overflow-hidden bg-neutral-950 border-2 border-black cursor-pointer transition-all duration-300 hover:-translate-y-1.5 shadow-sm"
                >
                  {/* Autoplaying Video Element (Square/Sharp Edges) */}
                  <div className="absolute inset-0 w-full h-full bg-neutral-950 rounded-none overflow-hidden">
                    {video.videoUrl ? (
                      <video
                        ref={(el) => {
                          if (el) videoElementsRef.current[video._id] = el;
                        }}
                        src={video.videoUrl}
                        poster={video.thumbnailUrl || undefined}
                        autoPlay
                        loop
                        muted={!isUnmuted}
                        playsInline
                        preload="auto"
                        className="w-full h-full object-cover rounded-none transition-transform duration-700 group-hover:scale-105"
                      />
                    ) : video.thumbnailUrl ? (
                      <ImageWithSkeleton
                        src={video.thumbnailUrl}
                        alt={video.title}
                        fill
                        className="object-cover rounded-none transition-transform duration-700 group-hover:scale-105"
                      />
                    ) : null}
                  </div>

                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-black/40 pointer-events-none rounded-none" />

                  {/* Top Bar inside Card */}
                  <div className="absolute top-3.5 inset-x-3.5 flex justify-between items-center z-10">
                    <span className="inline-flex items-center gap-1.5 bg-black/80 text-white border border-white/30 px-2.5 py-1 rounded-none text-[9.5px] font-extrabold uppercase tracking-widest">
                      <span className="w-1.5 h-1.5 rounded-none bg-red-500 animate-pulse" />
                      <span>{video.badge || "4K REEL"}</span>
                    </span>

                    {/* Mute/Unmute toggle (Sharp Edge) */}
                    <button
                      type="button"
                      onClick={(e) => toggleMute(e, video._id)}
                      className="w-8 h-8 rounded-none bg-black/80 border border-white/30 text-white flex items-center justify-center text-xs hover:bg-white hover:text-black transition-colors cursor-pointer"
                      title={isUnmuted ? "Mute" : "Unmute audio"}
                    >
                      {isUnmuted ? "🔊" : "🔇"}
                    </button>
                  </div>

                  {/* Center Play/Pause indicator icon when paused or hovered */}
                  <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
                    <div className={`w-12 h-12 rounded-none bg-black/80 border-2 border-white flex items-center justify-center text-white text-base transition-all duration-300 ${
                      isPaused
                        ? "opacity-100 scale-100 bg-gold text-black border-black font-extrabold"
                        : "opacity-0 group-hover:opacity-80 group-hover:scale-105"
                    }`}>
                      {isPaused ? "▶" : "⏸"}
                    </div>
                  </div>

                  {/* Bottom Information */}
                  <div className="absolute bottom-3.5 inset-x-3.5 z-10 space-y-1.5">
                    {video.tagline && (
                      <p className="text-[10px] text-amber-400 font-extrabold uppercase tracking-widest line-clamp-1">
                        {video.tagline}
                      </p>
                    )}
                    <h3 className="text-sm sm:text-base font-extrabold text-white uppercase leading-snug line-clamp-2">
                      {video.title}
                    </h3>

                    {/* Action footer */}
                    <div className="pt-2 flex items-center justify-between">
                      <span className="text-[9.5px] text-neutral-300 font-bold uppercase tracking-wider flex items-center gap-1">
                        <span>{isPaused ? "Tap to Play" : "Tap to Pause"}</span>
                      </span>
                      {video.productLink && (
                        <Link
                          href={video.productLink}
                          onClick={(e) => e.stopPropagation()}
                          className="inline-flex items-center gap-1.5 bg-white text-black hover:bg-gold hover:text-black px-3 py-1.5 rounded-none text-[10px] font-extrabold uppercase tracking-widest transition-colors border border-black"
                        >
                          <span>Shop</span>
                          <span>→</span>
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Scroll Progress Bar & Controls Indicator */}
        <div className="flex items-center justify-center gap-3 mt-6">
          <button
            onClick={() => scroll("left")}
            disabled={!canScrollLeft}
            className="text-xs font-extrabold text-neutral-400 hover:text-black disabled:opacity-30 disabled:cursor-not-allowed uppercase tracking-wider transition-colors"
          >
            ← Prev
          </button>
          <div className="w-48 sm:w-64 bg-neutral-200 h-1.5 rounded-none overflow-hidden border border-black/20">
            <div
              className="bg-black h-full rounded-none transition-all duration-300"
              style={{ width: `${Math.max(15, scrollProgress)}%` }}
            />
          </div>
          <button
            onClick={() => scroll("right")}
            disabled={!canScrollRight}
            className="text-xs font-extrabold text-neutral-400 hover:text-black disabled:opacity-30 disabled:cursor-not-allowed uppercase tracking-wider transition-colors"
          >
            Next →
          </button>
        </div>

      </div>
    </section>
  );
}
