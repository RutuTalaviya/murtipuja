"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { formatImageUrl } from "@/lib/api";

function formatMediaItems(items, defaultTitle) {
  const list = Array.isArray(items) ? items : items ? [items] : [];
  const seen = new Set();
  const result = [];
  list.forEach((item, idx) => {
    if (!item) return;
    const rawUrl = typeof item === "object" ? item?.url : item;
    if (rawUrl && typeof rawUrl === "string" && rawUrl.trim()) {
      const cleanUrl = rawUrl.trim();
      const formatted = formatImageUrl(cleanUrl);
      if (formatted && !seen.has(formatted)) {
        seen.add(formatted);
        result.push({
          url: formatted,
          alt: (typeof item === "object" ? item?.alt : defaultTitle) || defaultTitle || `View ${idx + 1}`,
          type: "image",
        });
      }
    }
  });
  return result;
}

export default function ImageGallery({ images = [], videos = [], title = "" }) {
  const [mounted, setMounted] = useState(false);
  const [mediaList, setMediaList] = useState(() => formatMediaItems(images, title));
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Hover Magnifier Zoom State (Main Gallery Box)
  const [isHovering, setIsHovering] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });
  const mainImageRef = useRef(null);

  // Lightbox Modal Zoom State
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [lightboxScale, setLightboxScale] = useState(1);
  const [lightboxPos, setLightboxPos] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const lightboxContainerRef = useRef(null);

  // Sync state with props
  useEffect(() => {
    const formatted = formatMediaItems(images, title);
    if (formatted.length > 0) {
      setMediaList(formatted);
      setActiveIndex(0);
    }
  }, [images, title]);

  // Variant change listener: Show variant images with full gallery accessible
  useEffect(() => {
    const handleVariantChange = (e) => {
      const data = e.detail;
      if (!data) return;

      if (Array.isArray(data.images) && data.images.length > 0) {
        const variantMedia = formatMediaItems(data.images, title);
        if (variantMedia.length > 0) {
          setMediaList(variantMedia);
          setActiveIndex(0);
          return;
        }
      }

      if (data.image) {
        const formattedUrl = formatImageUrl(data.image);
        if (formattedUrl) {
          setMediaList([{ url: formattedUrl, alt: `${title} - Selected Variant`, type: "image" }]);
          setActiveIndex(0);
        }
      }
    };

    window.addEventListener("variantChange", handleVariantChange);
    return () => window.removeEventListener("variantChange", handleVariantChange);
  }, [title]);

  // Handle Main Image Hover Zoom position
  const handleMouseMove = (e) => {
    if (!mainImageRef.current) return;
    const rect = mainImageRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
    const y = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));
    setZoomPos({ x, y });
  };

  const handleMouseEnter = () => {
    const activeMedia = mediaList[activeIndex] || mediaList[0];
    if (activeMedia?.type !== "video") {
      setIsHovering(true);
    }
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
    setZoomPos({ x: 50, y: 50 });
  };

  // Lightbox Navigation
  const handlePrev = useCallback(() => {
    setActiveIndex((prev) => (prev > 0 ? prev - 1 : mediaList.length - 1));
    setLightboxScale(1);
    setLightboxPos({ x: 0, y: 0 });
  }, [mediaList.length]);

  const handleNext = useCallback(() => {
    setActiveIndex((prev) => (prev < mediaList.length - 1 ? prev + 1 : 0));
    setLightboxScale(1);
    setLightboxPos({ x: 0, y: 0 });
  }, [mediaList.length]);

  // Lightbox Controls
  const openLightbox = () => {
    setIsLightboxOpen(true);
    setLightboxScale(1);
    setLightboxPos({ x: 0, y: 0 });
    document.body.style.overflow = "hidden";
  };

  const closeLightbox = useCallback(() => {
    setIsLightboxOpen(false);
    setLightboxScale(1);
    setLightboxPos({ x: 0, y: 0 });
    document.body.style.overflow = "unset";
  }, []);

  const handleZoomIn = (e) => {
    e?.stopPropagation();
    setLightboxScale((prev) => Math.min(prev + 0.5, 4));
  };

  const handleZoomOut = (e) => {
    e?.stopPropagation();
    setLightboxScale((prev) => {
      const next = Math.max(prev - 0.5, 1);
      if (next === 1) setLightboxPos({ x: 0, y: 0 });
      return next;
    });
  };

  const handleResetZoom = (e) => {
    e?.stopPropagation();
    setLightboxScale(1);
    setLightboxPos({ x: 0, y: 0 });
  };

  const handleToggleZoom = (e) => {
    e?.stopPropagation();
    if (lightboxScale > 1) {
      handleResetZoom();
    } else {
      setLightboxScale(2.5);
    }
  };

  // Keyboard navigation & Wheel zoom for Lightbox
  useEffect(() => {
    if (!isLightboxOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowLeft") handlePrev();
      if (e.key === "ArrowRight") handleNext();
      if (e.key === "+" || e.key === "=") handleZoomIn();
      if (e.key === "-") handleZoomOut();
    };

    const handleWheel = (e) => {
      if (lightboxContainerRef.current?.contains(e.target)) {
        e.preventDefault();
        if (e.deltaY < 0) {
          setLightboxScale((prev) => Math.min(prev + 0.25, 4));
        } else {
          setLightboxScale((prev) => {
            const next = Math.max(prev - 0.25, 1);
            if (next === 1) setLightboxPos({ x: 0, y: 0 });
            return next;
          });
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("wheel", handleWheel, { passive: false });

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("wheel", handleWheel);
    };
  }, [isLightboxOpen, closeLightbox, handlePrev, handleNext]);

  // Dragging / Panning inside Lightbox when zoomed
  const handleMouseDown = (e) => {
    if (lightboxScale <= 1) return;
    e.preventDefault();
    setIsDragging(true);
    dragStartRef.current = {
      x: e.clientX - lightboxPos.x,
      y: e.clientY - lightboxPos.y,
    };
  };

  const handleLightboxMouseMove = (e) => {
    if (!isDragging || lightboxScale <= 1) return;
    setLightboxPos({
      x: e.clientX - dragStartRef.current.x,
      y: e.clientY - dragStartRef.current.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Touch Handling for Mobile Gestures (Pinch to Zoom, Double Tap, Pan, Swipe)
  const touchStartRef = useRef({ x: 0, y: 0, time: 0 });
  const touchDistanceRef = useRef(0);
  const initialScaleRef = useRef(1);

  const handleTouchStart = (e) => {
    const now = Date.now();
    if (e.touches.length === 2) {
      // 2 fingers: Pinch to zoom start
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const dist = Math.hypot(touch2.clientX - touch1.clientX, touch2.clientY - touch1.clientY);
      touchDistanceRef.current = dist;
      initialScaleRef.current = lightboxScale;
    } else if (e.touches.length === 1) {
      const touch = e.touches[0];
      // Double-tap detection
      if (now - touchStartRef.current.time < 300) {
        handleToggleZoom(e);
        touchStartRef.current.time = 0;
        return;
      }
      touchStartRef.current = {
        x: touch.clientX,
        y: touch.clientY,
        time: now,
      };
      if (lightboxScale > 1) {
        setIsDragging(true);
        dragStartRef.current = {
          x: touch.clientX - lightboxPos.x,
          y: touch.clientY - lightboxPos.y,
        };
      }
    }
  };

  const handleTouchMove = (e) => {
    if (e.touches.length === 2 && touchDistanceRef.current > 0) {
      e.preventDefault();
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const dist = Math.hypot(touch2.clientX - touch1.clientX, touch2.clientY - touch1.clientY);
      const ratio = dist / touchDistanceRef.current;
      const newScale = Math.max(1, Math.min(4, initialScaleRef.current * ratio));
      setLightboxScale(newScale);
      if (newScale === 1) {
        setLightboxPos({ x: 0, y: 0 });
      }
    } else if (e.touches.length === 1) {
      const touch = e.touches[0];
      if (lightboxScale > 1 && isDragging) {
        e.preventDefault();
        setLightboxPos({
          x: touch.clientX - dragStartRef.current.x,
          y: touch.clientY - dragStartRef.current.y,
        });
      }
    }
  };

  const handleTouchEnd = (e) => {
    setIsDragging(false);
    touchDistanceRef.current = 0;
    if (lightboxScale === 1 && e.changedTouches?.length === 1) {
      const touch = e.changedTouches[0];
      const deltaX = touch.clientX - touchStartRef.current.x;
      const deltaY = Math.abs(touch.clientY - touchStartRef.current.y);
      // Horizontal swipe detected (min 45px distance and predominantly horizontal)
      if (Math.abs(deltaX) > 45 && deltaY < 80) {
        if (deltaX < 0) {
          handleNext();
        } else {
          handlePrev();
        }
      }
    }
  };

  if (!mediaList || mediaList.length === 0) {
    return (
      <div className="relative aspect-square w-full max-w-[540px] bg-neutral-50 rounded-none overflow-hidden border-2 border-black flex flex-col items-center justify-center text-neutral-400 font-extrabold text-xs uppercase tracking-wider p-6 text-center">
        <span className="text-4xl mb-2 opacity-60">🛕</span>
        <span>MurtiPuja Idol</span>
      </div>
    );
  }

  const activeMedia = mediaList[activeIndex] || mediaList[0];

  return (
    <div className="w-full flex flex-col md:flex-row gap-3 sm:gap-4 md:gap-6 items-start font-display md:pl-3 lg:pl-6">
      {/* ------------------------------------------------------------- */}
      {/* 1. LEFT VERTICAL THUMBNAILS (Desktop) */}
      {/* ------------------------------------------------------------- */}
      {mediaList.length > 1 && (
        <div className="hidden md:flex flex-col gap-2.5 sm:gap-3 overflow-x-hidden overflow-y-auto w-16 lg:w-20 max-h-[min(540px,calc(100vh-180px))] no-scrollbar flex-shrink-0 py-0.5">
          {mediaList.map((media, idx) => (
            <button
              key={idx}
              onClick={() => setActiveIndex(idx)}
              onMouseEnter={() => setActiveIndex(idx)}
              className={`relative w-16 h-16 lg:w-20 lg:h-20 rounded-none overflow-hidden border-2 bg-white flex-shrink-0 transition-all cursor-pointer ${
                idx === activeIndex
                  ? "border-black ring-2 ring-orange-500 scale-[0.98]"
                  : "border-neutral-200 hover:border-black opacity-75 hover:opacity-100"
              }`}
              aria-label={`View media ${idx + 1}`}
            >
              {media.type === "video" ? (
                <div className="relative w-full h-full bg-neutral-900">
                  <video src={media.url} className="w-full h-full object-cover opacity-60" muted playsInline />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-6 h-6 rounded-none bg-black border border-white flex items-center justify-center text-white text-[10px] font-bold">
                      ▶
                    </div>
                  </div>
                </div>
              ) : (
                <Image
                  src={media.url}
                  alt={media.alt || `${title} thumbnail ${idx + 1}`}
                  fill
                  sizes="80px"
                  unoptimized
                  className="object-contain p-1"
                />
              )}
            </button>
          ))}
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 2. MAIN ACTIVE MEDIA DISPLAY (With Interactive Hover Zoom) */}
      {/* ------------------------------------------------------------- */}
      <div className="flex-1 w-full max-w-[540px] mx-auto space-y-3">
        <div
          ref={mainImageRef}
          onMouseMove={handleMouseMove}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onClick={openLightbox}
          className={`relative w-full aspect-square max-h-[min(540px,calc(100vh-180px))] bg-neutral-50 rounded-none overflow-hidden border-2 border-black shadow-sm group flex items-center justify-center ${
            activeMedia.type === "video" ? "cursor-default" : "cursor-zoom-in"
          }`}
        >
          {activeMedia.type === "video" ? (
            <video
              src={activeMedia.url}
              controls
              className="w-full h-full object-contain"
              autoPlay
              muted
              playsInline
              key={activeMedia.url}
            />
          ) : (
            <div className="relative w-full h-full overflow-hidden flex items-center justify-center p-3 sm:p-4">
              <Image
                src={activeMedia.url}
                alt={activeMedia.alt || title}
                fill
                sizes="(max-width: 768px) 100vw, 540px"
                unoptimized
                priority
                className={`object-contain p-2 sm:p-3 transition-transform duration-300 ease-out select-none pointer-events-none ${
                  isHovering ? "scale-[2.2]" : "scale-100"
                }`}
                style={{
                  transformOrigin: isHovering ? `${zoomPos.x}% ${zoomPos.y}%` : "center center",
                }}
              />
            </div>
          )}

          {/* Prev / Next Navigation Arrows */}
          {mediaList.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handlePrev();
                }}
                className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-9 sm:h-9 bg-white/90 hover:bg-orange-500 hover:text-white text-black border-2 border-black flex items-center justify-center font-extrabold text-sm transition-all z-10 shadow-sm md:opacity-0 md:group-hover:opacity-100 cursor-pointer"
                aria-label="Previous Image"
              >
                ←
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleNext();
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-9 sm:h-9 bg-white/90 hover:bg-orange-500 hover:text-white text-black border-2 border-black flex items-center justify-center font-extrabold text-sm transition-all z-10 shadow-sm md:opacity-0 md:group-hover:opacity-100 cursor-pointer"
                aria-label="Next Image"
              >
                →
              </button>
            </>
          )}
        </div>

        {/* ------------------------------------------------------------- */}
        {/* 3. MOBILE THUMBNAIL STRIP */}
        {/* ------------------------------------------------------------- */}
        {mediaList.length > 1 && (
          <div className="md:hidden space-y-2">
            <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
              {mediaList.map((media, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveIndex(idx)}
                  className={`relative w-16 h-16 sm:w-20 sm:h-20 rounded-none overflow-hidden border-2 bg-white flex-shrink-0 transition-all cursor-pointer ${
                    idx === activeIndex
                      ? "border-black ring-2 ring-orange-500 scale-[0.98]"
                      : "border-neutral-200 opacity-70 hover:opacity-100"
                  }`}
                  aria-label={`View thumbnail ${idx + 1}`}
                >
                  {media.type === "video" ? (
                    <div className="relative w-full h-full bg-neutral-900">
                      <video src={media.url} className="w-full h-full object-cover opacity-60" muted playsInline />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-white text-[9px] font-bold">▶</span>
                      </div>
                    </div>
                  ) : (
                    <Image
                      src={media.url}
                      alt={media.alt || `${title} thumbnail ${idx + 1}`}
                      fill
                      sizes="80px"
                      unoptimized
                      className="object-contain p-1"
                    />
                  )}
                </button>
              ))}
            </div>

            {/* Mobile Progress Dots */}
            <div className="flex items-center justify-center gap-1.5 pt-1">
              {mediaList.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveIndex(idx)}
                  className={`h-1.5 rounded-full transition-all ${
                    idx === activeIndex ? "w-6 bg-orange-500" : "w-1.5 bg-neutral-300"
                  }`}
                  aria-label={`Go to slide ${idx + 1}`}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 4. FULLSCREEN HD LIGHTBOX MODAL WITH MULTI-LEVEL ZOOM & PAN */}
      {/* ------------------------------------------------------------- */}
      {mounted && isLightboxOpen && createPortal(
        <div
          className="fixed inset-0 flex flex-col justify-between bg-black/95 backdrop-blur-md font-display select-none transition-opacity duration-200 h-[100dvh] w-screen overflow-hidden z-[999999]"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 999999,
          }}
        >
          {/* Top Bar Controls */}
          <div className="flex items-center justify-between px-3 py-2.5 sm:px-6 sm:py-3.5 border-b border-white/15 bg-black/70 backdrop-blur-sm z-30">
            {/* Left: Product title & counter */}
            <div className="flex items-center gap-2 sm:gap-3 min-w-0 pr-2">
              <span className="bg-orange-500 text-white text-[9px] sm:text-[10px] font-black uppercase tracking-widest px-2 py-0.5 sm:py-1 border border-white/20 flex-shrink-0">
                HD VIEW
              </span>
              <h3 className="text-white text-xs sm:text-sm md:text-base font-extrabold uppercase tracking-wide truncate max-w-[120px] xs:max-w-[180px] sm:max-w-xs md:max-w-md">
                {title}
              </h3>
              <span className="text-neutral-400 text-[10px] sm:text-xs font-bold flex-shrink-0">
                ({activeIndex + 1}/{mediaList.length})
              </span>
            </div>

            {/* Right: Zoom Controls & Close Button */}
            <div className="flex items-center gap-1.5 sm:gap-3 flex-shrink-0">
              {activeMedia.type !== "video" && (
                <div className="flex items-center bg-neutral-900 border border-neutral-700 rounded-none overflow-hidden">
                  <button
                    onClick={handleZoomOut}
                    disabled={lightboxScale <= 1}
                    className="w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 flex items-center justify-center text-white hover:bg-orange-500 hover:text-white transition-colors disabled:opacity-30 disabled:hover:bg-transparent font-black text-xs sm:text-sm cursor-pointer"
                    title="Zoom Out (-)"
                    aria-label="Zoom Out"
                  >
                    −
                  </button>
                  <span className="text-[10px] sm:text-[11px] font-extrabold text-neutral-300 px-1.5 sm:px-2 min-w-[34px] sm:min-w-[42px] text-center">
                    {Math.round(lightboxScale * 100)}%
                  </span>
                  <button
                    onClick={handleZoomIn}
                    disabled={lightboxScale >= 4}
                    className="w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 flex items-center justify-center text-white hover:bg-orange-500 hover:text-white transition-colors disabled:opacity-30 disabled:hover:bg-transparent font-black text-xs sm:text-sm cursor-pointer"
                    title="Zoom In (+)"
                    aria-label="Zoom In"
                  >
                    +
                  </button>
                  <button
                    onClick={handleResetZoom}
                    className="hidden xs:flex px-2 sm:px-2.5 h-7 sm:h-8 md:h-9 border-l border-neutral-700 text-[9px] sm:text-[10px] font-extrabold text-neutral-300 hover:bg-orange-500 hover:text-white transition-colors items-center justify-center cursor-pointer uppercase"
                    title="Reset Zoom"
                  >
                    Reset
                  </button>
                </div>
              )}

              {/* Close Button */}
              <button
                onClick={closeLightbox}
                className="w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 rounded-none border border-neutral-600 bg-neutral-900 text-white hover:bg-orange-500 hover:text-white hover:border-orange-500 flex items-center justify-center transition-colors cursor-pointer"
                aria-label="Close Lightbox"
                title="Close (Esc)"
              >
                <svg className="w-4 h-4 sm:w-4.5 sm:h-4.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Center Zoom Workspace */}
          <div
            ref={lightboxContainerRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleLightboxMouseMove}
            onMouseUp={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onDoubleClick={handleToggleZoom}
            className={`relative flex-1 w-full h-full overflow-hidden flex items-center justify-center p-2 sm:p-4 touch-none ${
              lightboxScale > 1
                ? isDragging
                  ? "cursor-grabbing"
                  : "cursor-grab"
                : "cursor-zoom-in"
            }`}
          >
            {activeMedia.type === "video" ? (
              <div className="relative max-w-4xl max-h-[75vh] w-full aspect-video flex items-center justify-center">
                <video
                  src={activeMedia.url}
                  controls
                  autoPlay
                  className="w-full h-full object-contain"
                />
              </div>
            ) : (
              <div
                className="relative w-full h-full max-w-[94vw] max-h-[68vh] sm:max-w-[85vw] sm:max-h-[75vh] flex items-center justify-center transition-transform duration-100 ease-out"
                style={{
                  transform: `translate(${lightboxPos.x}px, ${lightboxPos.y}px) scale(${lightboxScale})`,
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={activeMedia.url}
                  alt={activeMedia.alt || title}
                  className="max-w-full max-h-full object-contain pointer-events-none drop-shadow-2xl select-none"
                  draggable={false}
                />
              </div>
            )}

            {/* Left / Right Arrow Navigation inside Modal */}
            {mediaList.length > 1 && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePrev();
                  }}
                  className="absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-11 sm:h-11 md:w-12 md:h-12 bg-black/60 hover:bg-orange-500 active:bg-orange-500 text-white border border-white/30 hover:border-orange-500 rounded-none flex items-center justify-center font-black text-sm sm:text-base md:text-lg transition-all z-20 shadow-xl cursor-pointer"
                  aria-label="Previous image"
                >
                  ←
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleNext();
                  }}
                  className="absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-11 sm:h-11 md:w-12 md:h-12 bg-black/60 hover:bg-orange-500 active:bg-orange-500 text-white border border-white/30 hover:border-orange-500 rounded-none flex items-center justify-center font-black text-sm sm:text-base md:text-lg transition-all z-20 shadow-xl cursor-pointer"
                  aria-label="Next image"
                >
                  →
                </button>
              </>
            )}

            {/* Responsive Zoom Instruction Tip */}
            {activeMedia.type !== "video" && (
              <div className="absolute bottom-2 sm:bottom-4 left-1/2 -translate-x-1/2 pointer-events-none z-20 max-w-[90vw]">
                <span className="bg-black/80 text-neutral-300 text-[9px] sm:text-[10px] font-bold px-2.5 py-1 border border-white/15 backdrop-blur-sm rounded-none whitespace-nowrap block text-center truncate">
                  <span className="hidden sm:inline">💡 Scroll to Zoom · Drag to Pan · Double Click to Toggle</span>
                  <span className="sm:hidden">💡 Pinch / Double-Tap to Zoom · Swipe to switch</span>
                </span>
              </div>
            )}
          </div>

          {/* Bottom Thumbnails Strip */}
          {mediaList.length > 1 && (
            <div className="p-2 sm:p-3 bg-black/70 border-t border-white/15 backdrop-blur-sm z-20 flex justify-center flex-shrink-0">
              <div className="flex gap-2 sm:gap-2.5 overflow-x-auto no-scrollbar max-w-full py-0.5">
                {mediaList.map((media, idx) => (
                  <button
                    key={idx}
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveIndex(idx);
                      setLightboxScale(1);
                      setLightboxPos({ x: 0, y: 0 });
                    }}
                    className={`relative w-11 h-11 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-none overflow-hidden border-2 bg-neutral-900 flex-shrink-0 transition-all cursor-pointer ${
                      idx === activeIndex
                        ? "border-orange-500 ring-2 ring-orange-500/50 scale-105"
                        : "border-white/20 opacity-60 hover:opacity-100 hover:border-white"
                    }`}
                  >
                    {media.type === "video" ? (
                      <div className="relative w-full h-full bg-neutral-800 flex items-center justify-center">
                        <span className="text-white text-xs">▶</span>
                      </div>
                    ) : (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={media.url}
                        alt={media.alt || `Thumbnail ${idx + 1}`}
                        className="w-full h-full object-contain p-1"
                      />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>,
        document.body
      )}
    </div>
  );
}
