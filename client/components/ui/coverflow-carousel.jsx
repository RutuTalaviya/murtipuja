"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";

function SlideImage({ src, alt, priority }) {
  const [isLoaded, setIsLoaded] = useState(false);
  return (
    <>
      {!isLoaded && (
        <div className="skeleton-box absolute inset-0 z-10 pointer-events-none transition-opacity duration-300" />
      )}
      <Image
        src={src}
        alt={alt}
        fill
        unoptimized
        sizes="(max-width: 640px) 280px, (max-width: 1024px) 400px, 460px"
        onLoad={() => setIsLoaded(true)}
        onError={() => setIsLoaded(true)}
        className={`object-cover transition-all duration-700 hover:scale-105 ${
          isLoaded ? "opacity-100" : "opacity-0"
        }`}
        priority={priority}
      />
    </>
  );
}

export function CoverflowCarousel({
  slides = [],
  showCaption = true,
  autoPlay = false,
  autoPlayInterval = 4500,
  className = "",
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [windowWidth, setWindowWidth] = useState(1200);
  const [isMounted, setIsMounted] = useState(false);
  const containerRef = useRef(null);
  const touchStartX = useRef(null);
  const touchEndX = useRef(null);

  const totalSlides = slides.length;

  useEffect(() => {
    setIsMounted(true);
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const nextSlide = useCallback(() => {
    if (totalSlides === 0) return;
    setActiveIndex((prev) => (prev + 1) % totalSlides);
  }, [totalSlides]);

  const prevSlide = useCallback(() => {
    if (totalSlides === 0) return;
    setActiveIndex((prev) => (prev - 1 + totalSlides) % totalSlides);
  }, [totalSlides]);

  const goToSlide = (index) => {
    setActiveIndex(index);
  };

  // Keyboard navigation
  useEffect(() => {
    function handleKeyDown(e) {
      if (containerRef.current && containerRef.current.contains(document.activeElement)) {
        if (e.key === "ArrowLeft") {
          prevSlide();
        } else if (e.key === "ArrowRight") {
          nextSlide();
        }
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [nextSlide, prevSlide]);

  // Autoplay timer
  useEffect(() => {
    if (!autoPlay || isHovered || totalSlides <= 1) return;
    const timer = setInterval(() => {
      nextSlide();
    }, autoPlayInterval);
    return () => clearInterval(timer);
  }, [autoPlay, autoPlayInterval, isHovered, nextSlide, totalSlides]);

  // Touch event handlers for mobile swiping
  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const diff = touchStartX.current - touchEndX.current;
    const threshold = 40; // Minimum drag distance to trigger slide
    if (diff > threshold) {
      nextSlide();
    } else if (diff < -threshold) {
      prevSlide();
    }
    touchStartX.current = null;
    touchEndX.current = null;
  };

  if (!slides || slides.length === 0) return null;

  const activeSlide = slides[activeIndex] || slides[0];

  // Dynamic step spacing based on screen width
  const stepX = isMounted
    ? windowWidth < 640
      ? 140
      : windowWidth < 1024
      ? 230
      : 290
    : 260;

  return (
    <div
      ref={containerRef}
      tabIndex={0}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className={`w-full flex flex-col items-center select-none outline-none font-display py-4 ${className}`}
    >
      {/* 3D Coverflow Stage */}
      <div
        className="w-full relative h-[400px] sm:h-[480px] md:h-[550px] lg:h-[600px] flex items-center justify-center overflow-hidden"
        style={{ perspective: "1300px" }}
      >
        {/* Ambient Backlight Glow for active item */}
        <div className="absolute w-96 h-96 sm:w-[540px] sm:h-[540px] bg-gradient-to-tr from-amber-500/10 via-amber-200/15 to-transparent rounded-full blur-3xl pointer-events-none -z-10" />

        {/* Carousel Tracks / 3D Stack */}
        <div
          className="relative w-full h-full flex items-center justify-center"
          style={{ transformStyle: "preserve-3d" }}
        >
          {slides.map((slide, index) => {
            // Calculate circular offset
            let offset = index - activeIndex;
            if (offset > totalSlides / 2) offset -= totalSlides;
            if (offset < -totalSlides / 2) offset += totalSlides;

            const isCurrent = offset === 0;
            const isVisible = Math.abs(offset) <= 3; // Render only nearby items

            if (!isVisible) return null;

            // 3D positioning calculations
            const rotateY = offset === 0 ? 0 : offset < 0 ? 40 : -40;
            const translateX = offset * stepX;
            const translateZ = Math.abs(offset) * -130;
            const scale = Math.max(0.72, 1 - Math.abs(offset) * 0.11);
            const zIndex = 30 - Math.abs(offset);
            const opacity = Math.max(0.35, 1 - Math.abs(offset) * 0.22);

            return (
              <div
                key={slide._id || slide.title || index}
                onClick={() => goToSlide(index)}
                className={`absolute w-[260px] sm:w-[330px] md:w-[390px] lg:w-[440px] aspect-[4/5] rounded-none cursor-pointer transition-all duration-500 ease-out flex flex-col justify-end overflow-hidden ${
                  isCurrent
                    ? "border-2 border-black shadow-2xl ring-4 ring-black/5"
                    : "border border-neutral-300 shadow-md hover:border-black"
                }`}
                style={{
                  transform: `translateX(${translateX}px) translateZ(${translateZ}px) rotateY(${rotateY}deg) scale(${scale})`,
                  zIndex,
                  opacity,
                  transformOrigin: "center center",
                }}
              >
                {/* Image Container */}
                <div className="absolute inset-0 bg-neutral-100">
                  {slide.src ? (
                    <SlideImage
                      src={slide.src}
                      alt={slide.alt || slide.title || "Sacred Murti"}
                      priority={isCurrent}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-neutral-200 text-neutral-400 font-bold">
                      No Image
                    </div>
                  )}

                  {/* Gradient Overlay for contrast */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent pointer-events-none" />

                  {/* Top Badge (Deity / Sale / Special) */}
                  {(slide.badge || slide.subtitle) && (
                    <div className="absolute top-3.5 left-3.5 z-10">
                      <span className="bg-black/90 backdrop-blur-md text-white border border-white/20 text-[9px] sm:text-[10px] font-black uppercase tracking-widest px-3 py-1 shadow-sm">
                        {slide.badge || slide.subtitle}
                      </span>
                    </div>
                  )}

                  {/* Bottom Image Caption preview */}
                  <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 z-10 space-y-1 text-white">
                    <p className="text-sm sm:text-base md:text-lg font-extrabold uppercase tracking-wider truncate font-display drop-shadow-sm">
                      {slide.title}
                    </p>
                    {slide.price && (
                      <p className="text-xs sm:text-sm md:text-base font-extrabold text-amber-300">
                        {slide.price}
                      </p>
                    )}
                  </div>
                </div>

                {/* Non-active overlay tint */}
                {!isCurrent && (
                  <div className="absolute inset-0 bg-white/20 backdrop-brightness-90 transition-opacity duration-300 hover:opacity-0" />
                )}
              </div>
            );
          })}
        </div>

        {/* Previous Button */}
        <button
          type="button"
          onClick={prevSlide}
          aria-label="Previous Slide"
          className="absolute left-2 sm:left-6 md:left-10 z-40 w-11 h-11 sm:w-14 sm:h-14 bg-white/95 hover:bg-black text-black hover:text-white border-2 border-black flex items-center justify-center text-base sm:text-lg font-black transition-all shadow-md active:scale-95 cursor-pointer"
        >
          ←
        </button>

        {/* Next Button */}
        <button
          type="button"
          onClick={nextSlide}
          aria-label="Next Slide"
          className="absolute right-2 sm:right-6 md:right-10 z-40 w-11 h-11 sm:w-14 sm:h-14 bg-white/95 hover:bg-black text-black hover:text-white border-2 border-black flex items-center justify-center text-base sm:text-lg font-black transition-all shadow-md active:scale-95 cursor-pointer"
        >
          →
        </button>
      </div>

      {/* Pagination Counter & Indicators */}
      <div className="flex items-center gap-3 mt-4 sm:mt-6">
        <span className="text-[11px] sm:text-xs font-extrabold uppercase tracking-widest text-neutral-400 font-mono">
          {String(activeIndex + 1).padStart(2, "0")} / {String(totalSlides).padStart(2, "0")}
        </span>

        {/* Dot / Dash Indicators */}
        <div className="flex items-center gap-1.5">
          {slides.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => goToSlide(idx)}
              aria-label={`Go to slide ${idx + 1}`}
              className={`h-1.5 transition-all duration-300 rounded-none cursor-pointer ${
                idx === activeIndex
                  ? "w-8 bg-black"
                  : "w-2.5 bg-neutral-300 hover:bg-neutral-500"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Detailed Meta Caption Box (Expanded Width matching full luxury layout) */}
      {showCaption && activeSlide && (
        <div className="w-full max-w-4xl md:max-w-5xl mt-6 sm:mt-8 p-6 sm:p-7 bg-white border-2 border-black shadow-md transition-all">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-2 border-neutral-100 pb-5">
            <div>
              <span className="text-[10px] uppercase tracking-widest font-black text-amber-800 bg-amber-50 border border-amber-200 px-3 py-1">
                {activeSlide.subtitle || "Divine Series"}
              </span>
              <h3 className="font-display text-xl sm:text-2xl md:text-3xl font-extrabold uppercase tracking-wider text-black mt-2.5">
                {activeSlide.title}
              </h3>
            </div>

            {/* Action CTA */}
            {activeSlide.link && (
              <Link
                href={activeSlide.link}
                className="inline-flex items-center justify-center gap-2 bg-black hover:bg-gold hover:text-black text-white px-7 py-3 border-2 border-black text-xs sm:text-sm font-black uppercase tracking-widest transition-all shadow-xs flex-shrink-0"
              >
                <span>View Drop</span>
                <span>→</span>
              </Link>
            )}
          </div>

          {/* Meta Key-Value Spec Grid */}
          {activeSlide.meta && activeSlide.meta.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 pt-5 text-left">
              {activeSlide.meta.map((m, idx) => (
                <div key={idx} className="bg-neutral-50 p-3 sm:p-3.5 border border-neutral-200">
                  <p className="text-[9.5px] uppercase tracking-widest text-neutral-400 font-extrabold">
                    {m.label}
                  </p>
                  <p className="text-xs sm:text-sm font-extrabold text-neutral-900 mt-1 truncate">
                    {m.value}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}


