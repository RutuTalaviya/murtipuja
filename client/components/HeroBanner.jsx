"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import ScrollReveal from "./ScrollReveal";
import { formatImageUrl } from "@/lib/api";

const DEFAULT_BANNERS = [
  {
    tagline: "⚡ DROP 01 // THE DIVINE SERIES",
    title: "DIVINITY.\nCRAFTED.",
    subtitle: "Micro-precision 3D printed spiritual idols engineered with 0.1mm accuracy for modern living spaces. Matte obsidian, sandstone, and metallic finishes.",
    imageUrl: "/images/shiva.png",
    ctaText: "Shop the Drop",
    ctaLink: "/products",
    secondaryCtaText: "The Design Lab",
    secondaryCtaLink: "/products",
    badge: "LIMITED LAB EDITIONS",
  },
  {
    tagline: "✦ SACRED CRAFT // GANESHA EDITION",
    title: "AUSPICIOUS BEGINNINGS.\nSCULPTED.",
    subtitle: "Minimalist Lord Ganesha murti finished in premium obsidian matte and aged brass tones. Designed for homes, workspaces, and car dashboards.",
    imageUrl: "/images/ganesh.png",
    ctaText: "Explore Ganesha",
    ctaLink: "/products",
    secondaryCtaText: "View All Finishes",
    secondaryCtaLink: "/products",
    badge: "BESTSELLER",
  },
  {
    tagline: "🔱 MAHASHAKTI // DIVINE PROTECTION",
    title: "POWER & DEVOTION.\nELEVATED.",
    subtitle: "Experience transcendental grace with our handcrafted Krishna and Hanuman sacred idols. Built for generations of mindful veneration.",
    imageUrl: "/images/krishna.jpg",
    ctaText: "Shop Divine Series",
    ctaLink: "/products",
    secondaryCtaText: "Explore Combos",
    secondaryCtaLink: "/products",
    badge: "FESTIVE DROP",
  },
];

const AUTO_PLAY_INTERVAL = 3000; // 3 seconds per slide

export default function HeroBanner({ banners = [] }) {
  const activeBanners = Array.isArray(banners) && banners.length > 0 ? banners : DEFAULT_BANNERS;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const touchStartX = useRef(0);

  // Auto-play interval for multi-banner slider
  useEffect(() => {
    if (activeBanners.length <= 1 || isHovered) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % activeBanners.length);
    }, AUTO_PLAY_INTERVAL);

    return () => clearInterval(timer);
  }, [activeBanners.length, isHovered, currentIndex]);

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % activeBanners.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + activeBanners.length) % activeBanners.length);
  };

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e) => {
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) {
      if (diff > 0) handleNext();
      else handlePrev();
    }
  };

  const currentBanner = activeBanners[currentIndex] || activeBanners[0] || DEFAULT_BANNERS[0];

  return (
    <section
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className="relative w-full min-h-[75vh] md:min-h-[85vh] bg-black text-white flex flex-col justify-end p-6 sm:p-10 md:p-16 border-b-2 border-black overflow-hidden select-none font-display"
    >
      {/* Background Images with Cross-Fade Transition */}
      {activeBanners.map((banner, idx) => (
        <div
          key={banner._id || idx}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
            idx === currentIndex ? "opacity-100 z-0" : "opacity-0 pointer-events-none"
          }`}
        >
          {banner.imageUrl && (
            <div
              className={`absolute inset-0 bg-cover bg-center transition-transform duration-1000 ease-out ${
                idx === currentIndex ? "scale-100" : "scale-105"
              }`}
              style={{ backgroundImage: `url(${formatImageUrl(banner.imageUrl)})` }}
            >
              {/* High-contrast gradient overlay to ensure text legibility */}
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-black/35" />
            </div>
          )}
        </div>
      ))}

      {/* Subtle Technical Dot Grid Background */}
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(white_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none z-[1]" />

      {/* Main Banner Content */}
      <div
        key={`content-${currentIndex}`}
        className="relative z-10 max-w-4xl space-y-5 sm:space-y-6 transition-all duration-500 animate-fadeIn"
      >
        {/* Tagline / Badge */}
        {(currentBanner.tagline || currentBanner.badge) && (
          <ScrollReveal delay={50} duration={500} animation="fade-up">
            <div className="inline-flex items-center gap-2 bg-gold text-black px-3.5 py-1 text-[10px] sm:text-[11px] font-extrabold uppercase tracking-widest border border-black shadow-sm">
              <span>{currentBanner.tagline || currentBanner.badge}</span>
            </div>
          </ScrollReveal>
        )}

        {/* Main Headline */}
        <ScrollReveal delay={150} duration={600} animation="fade-up">
          <h1 className="font-display text-4xl sm:text-6xl md:text-7xl lg:text-8xl text-white font-extrabold uppercase tracking-tight leading-[0.95] whitespace-pre-line">
            {currentBanner.title}
          </h1>
        </ScrollReveal>

        {/* Subtitle / Description */}
        {currentBanner.subtitle && (
          <ScrollReveal delay={250} duration={600} animation="fade-up">
            <p className="text-neutral-300 text-xs sm:text-sm md:text-base max-w-2xl leading-relaxed font-semibold uppercase tracking-wider">
              {currentBanner.subtitle}
            </p>
          </ScrollReveal>
        )}

        {/* Action CTAs */}
        <ScrollReveal delay={350} duration={500} animation="fade-up">
          <div className="flex flex-wrap items-center gap-3 sm:gap-4 pt-2">
            {currentBanner.ctaText && (
              <Link
                href={currentBanner.ctaLink || "/products"}
                className="bg-gold text-black hover:bg-white hover:text-black border-2 border-black transition-all px-7 sm:px-10 py-3.5 sm:py-4 font-extrabold text-xs tracking-widest uppercase inline-flex items-center gap-2 shadow-md active:scale-[0.98]"
              >
                <span>{currentBanner.ctaText}</span>
                <span className="text-sm font-bold">→</span>
              </Link>
            )}

            {currentBanner.secondaryCtaText && (
              <Link
                href={currentBanner.secondaryCtaLink || "/products"}
                className="bg-transparent text-white hover:bg-white/10 border-2 border-white/40 hover:border-white transition-all px-6 sm:px-8 py-3.5 sm:py-4 font-extrabold text-xs tracking-widest uppercase inline-flex items-center"
              >
                {currentBanner.secondaryCtaText}
              </Link>
            )}
          </div>
        </ScrollReveal>
      </div>

      {/* Carousel Navigation Controls & Progress Indicator */}
      {activeBanners.length > 1 && (
        <div className="relative z-20 flex items-center justify-between pt-8 sm:pt-10 border-t border-white/15 mt-8">
          {/* Bullet / Bar Slide Indicators with Animated Progress Fill */}
          <div className="flex items-center gap-2 sm:gap-3">
            {activeBanners.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`relative h-2 overflow-hidden transition-all duration-300 ${
                  idx === currentIndex
                    ? "w-10 sm:w-14 bg-white/20"
                    : "w-3 sm:w-4 bg-white/30 hover:bg-white/60"
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              >
                {idx === currentIndex && (
                  <div
                    key={`progress-${currentIndex}-${isHovered}`}
                    className="absolute inset-0 bg-gold"
                    style={{
                      animation: isHovered
                        ? "none"
                        : `progressFill ${AUTO_PLAY_INTERVAL}ms linear forwards`,
                    }}
                  />
                )}
              </button>
            ))}
          </div>

          {/* Left / Right Arrow Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrev}
              className="w-9 h-9 sm:w-10 sm:h-10 border border-white/30 hover:border-gold hover:bg-gold hover:text-black text-white flex items-center justify-center transition-all active:scale-95"
              aria-label="Previous Banner"
            >
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
              </svg>
            </button>
            <button
              onClick={handleNext}
              className="w-9 h-9 sm:w-10 sm:h-10 border border-white/30 hover:border-gold hover:bg-gold hover:text-black text-white flex items-center justify-center transition-all active:scale-95"
              aria-label="Next Banner"
            >
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Keyframe animation for progress fill */}
      <style jsx>{`
        @keyframes progressFill {
          from {
            width: 0%;
          }
          to {
            width: 100%;
          }
        }
      `}</style>
    </section>
  );
}
