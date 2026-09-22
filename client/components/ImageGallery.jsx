"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";

export default function ImageGallery({ images = [], videos = [], title = "" }) {
  const [mounted, setMounted] = useState(false);
  const [mediaList, setMediaList] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isMainImageLoaded, setIsMainImageLoaded] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Reset main image loading when active index changes
  useEffect(() => {
    setIsMainImageLoaded(false);
  }, [activeIndex]);

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
    const combined = [
      ...images.map((img) => ({ ...img, type: "image" })),
      ...videos.map((vid) => ({ ...vid, type: "video" })),
    ];
    setMediaList(combined);
    setActiveIndex(0);
  }, [images, videos]);

  // Variant change listener
  useEffect(() => {
    const handleVariantImage = (e) => {
      const url = e.detail;
      if (!url) return;

      const idx = mediaList.findIndex((item) => item.url === url);
      if (idx !== -1) {
        setActiveIndex(idx);
      } else {
        const newImg = { url, alt: `${title} - Selected Variant`, type: "image" };
        setMediaList((prev) => {
          if (prev.some((item) => item.url === url)) return prev;
          const updated = [...prev, newImg];
          setActiveIndex(updated.length - 1);
          return updated;
        });
      }
    };

    window.addEventListener("variantImageChange", handleVariantImage);
    return () => window.removeEventListener("variantImageChange", handleVariantImage);
  }, [mediaList, title]);

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

  if (!mediaList || mediaList.length === 0) {
    return (
      <div className="relative aspect-square bg-neutral-100 rounded-none overflow-hidden border-2 border-black flex items-center justify-center text-neutral-400 font-extrabold text-xs uppercase tracking-wider">
        No media available
      </div>
    );
  }

  const activeMedia = mediaList[activeIndex] || mediaList[0];

  return (
    <div className="w-full flex flex-col md:flex-row gap-3 sm:gap-4 md:gap-5 items-start font-display">
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
              {!isMainImageLoaded && (
                <div className="skeleton-box absolute inset-0 z-10 pointer-events-none transition-opacity duration-300" />
              )}
              <Image
                src={activeMedia.url}
                alt={activeMedia.alt || title}
                fill
                onLoad={() => setIsMainImageLoaded(true)}
                onError={() => setIsMainImageLoaded(true)}
                className={`object-contain p-2 sm:p-3 transition-all duration-300 ease-out select-none pointer-events-none ${
                  isMainImageLoaded ? "opacity-100" : "opacity-0"
                } ${
                  isHovering ? "scale-[2.2]" : "scale-100"
                }`}
                style={{
                  transformOrigin: isHovering ? `${zoomPos.x}% ${zoomPos.y}%` : "center center",
                }}
                priority
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
          className="fixed inset-0 flex flex-col justify-between bg-black/95 backdrop-blur-md font-display select-none transition-opacity duration-200"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            width: "100vw",
            height: "100vh",
            zIndex: 999999,
          }}
        >
          {/* Top Bar Controls */}
          <div className="flex items-center justify-between p-4 sm:p-6 border-b border-white/15 bg-black/50 backdrop-blur-sm z-20">
            <div className="flex items-center gap-3">
              <span className="bg-orange-500 text-white text-[10px] font-black uppercase tracking-widest px-2.5 py-1 border border-white/20">
                HD ZOOM VIEW
              </span>
              <h3 className="text-white text-sm sm:text-base font-extrabold uppercase tracking-wide truncate max-w-[200px] sm:max-w-md">
                {title}
              </h3>
              <span className="text-neutral-400 text-xs font-bold hidden sm:inline">
                ({activeIndex + 1} / {mediaList.length})
              </span>
            </div>

            {/* Zoom Controls & Close Button */}
            <div className="flex items-center gap-2 sm:gap-3">
              {activeMedia.type !== "video" && (
                <div className="flex items-center bg-neutral-900 border border-neutral-700 rounded-none overflow-hidden">
                  <button
                    onClick={handleZoomOut}
                    disabled={lightboxScale <= 1}
                    className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center text-white hover:bg-orange-500 hover:text-white transition-colors disabled:opacity-30 disabled:hover:bg-transparent font-black text-sm cursor-pointer"
                    title="Zoom Out (-)"
                  >
                    −
                  </button>
                  <span className="text-[11px] font-extrabold text-neutral-300 px-2 min-w-[42px] text-center">
                    {Math.round(lightboxScale * 100)}%
                  </span>
                  <button
                    onClick={handleZoomIn}
                    disabled={lightboxScale >= 4}
                    className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center text-white hover:bg-orange-500 hover:text-white transition-colors disabled:opacity-30 disabled:hover:bg-transparent font-black text-sm cursor-pointer"
                    title="Zoom In (+)"
                  >
                    +
                  </button>
                  <button
                    onClick={handleResetZoom}
                    className="px-2.5 h-8 sm:h-9 border-l border-neutral-700 text-[10px] font-extrabold text-neutral-300 hover:bg-orange-500 hover:text-white transition-colors flex items-center justify-center cursor-pointer uppercase"
                    title="Reset Zoom"
                  >
                    Reset
                  </button>
                </div>
              )}

              {/* Close Button with Orange Hover */}
              <button
                onClick={closeLightbox}
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-none border border-neutral-600 bg-neutral-900 text-white hover:bg-orange-500 hover:text-white hover:border-orange-500 flex items-center justify-center transition-colors cursor-pointer"
                aria-label="Close Lightbox"
                title="Close (Esc)"
              >
                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
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
            onDoubleClick={handleToggleZoom}
            className={`relative flex-1 w-full h-full overflow-hidden flex items-center justify-center p-4 ${
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
                className="relative w-full h-full max-w-[85vw] max-h-[75vh] flex items-center justify-center transition-transform duration-100 ease-out"
                style={{
                  transform: `translate(${lightboxPos.x}px, ${lightboxPos.y}px) scale(${lightboxScale})`,
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={activeMedia.url}
                  alt={activeMedia.alt || title}
                  className="max-w-full max-h-full object-contain pointer-events-none drop-shadow-2xl"
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
                  className="absolute left-4 sm:left-8 top-1/2 -translate-y-1/2 w-11 h-11 sm:w-13 sm:h-13 bg-black/60 hover:bg-orange-500 text-white border-2 border-white/30 hover:border-orange-500 rounded-none flex items-center justify-center font-black text-lg transition-all z-20 shadow-xl cursor-pointer"
                  aria-label="Previous image"
                >
                  ←
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleNext();
                  }}
                  className="absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 w-11 h-11 sm:w-13 sm:h-13 bg-black/60 hover:bg-orange-500 text-white border-2 border-white/30 hover:border-orange-500 rounded-none flex items-center justify-center font-black text-lg transition-all z-20 shadow-xl cursor-pointer"
                  aria-label="Next image"
                >
                  →
                </button>
              </>
            )}

            {/* Subtle Zoom Instruction Tip */}
            {activeMedia.type !== "video" && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 pointer-events-none z-20">
                <span className="bg-black/75 text-neutral-300 text-[10px] font-bold px-3 py-1 border border-white/15 backdrop-blur-sm rounded-none">
                  💡 Scroll to Zoom · Click & Drag to Pan · Double Click to Toggle
                </span>
              </div>
            )}
          </div>

          {/* Bottom Thumbnails Strip */}
          {mediaList.length > 1 && (
            <div className="p-3 sm:p-4 bg-black/60 border-t border-white/15 backdrop-blur-sm z-20 flex justify-center">
              <div className="flex gap-2.5 overflow-x-auto no-scrollbar max-w-full py-1">
                {mediaList.map((media, idx) => (
                  <button
                    key={idx}
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveIndex(idx);
                      setLightboxScale(1);
                      setLightboxPos({ x: 0, y: 0 });
                    }}
                    className={`relative w-14 h-14 sm:w-16 sm:h-16 rounded-none overflow-hidden border-2 bg-neutral-900 flex-shrink-0 transition-all cursor-pointer ${
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
