"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { formatImageUrl } from "@/lib/api";
import { useCart } from "@/context/CartContext";

export default function ProductSideVideoReels({ videos = [], product }) {
  const scrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [activeVideoUrl, setActiveVideoUrl] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const [addStatus, setAddStatus] = useState("");
  const modalVideoRef = useRef(null);

  const { addItem } = useCart();

  // Normalize videos list
  const videoList = Array.isArray(videos)
    ? videos
        .map((v) => (typeof v === "string" ? { url: v } : v))
        .filter((v) => v && (v.url || v.videoUrl))
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
    const scrollAmount = 240;
    container.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
    setTimeout(updateScrollButtons, 350);
  };

  const handleOpenModal = (url) => {
    setActiveVideoUrl(url);
    setIsMuted(false);
    setTimeout(() => {
      if (modalVideoRef.current) {
        modalVideoRef.current.currentTime = 0;
        modalVideoRef.current.play().catch(() => {
          if (modalVideoRef.current) {
            modalVideoRef.current.muted = true;
            setIsMuted(true);
            modalVideoRef.current.play();
          }
        });
      }
    }, 100);
  };

  const handleCloseModal = () => {
    setActiveVideoUrl(null);
    if (modalVideoRef.current) {
      modalVideoRef.current.pause();
    }
  };

  const toggleMute = (e) => {
    e.stopPropagation();
    if (modalVideoRef.current) {
      modalVideoRef.current.muted = !modalVideoRef.current.muted;
      setIsMuted(modalVideoRef.current.muted);
    }
  };

  const handleAddToCart = async (e) => {
    e.stopPropagation();
    if (!product?._id) return;
    setAddStatus("adding");

    const defaultVariant = product.variants?.[0];
    const sku = defaultVariant?.sku || product.slug;
    const res = await addItem(product._id, sku, 1);

    if (res.success) {
      setAddStatus("added");
      setTimeout(() => setAddStatus(""), 2200);
    } else {
      setAddStatus("");
    }
  };

  if (videoList.length === 0) return null;

  const defaultVariant = product?.variants?.[0];
  const price =
    defaultVariant?.discountPrice && defaultVariant.discountPrice > 0
      ? defaultVariant.discountPrice
      : defaultVariant?.price || product?.basePrice || 0;

  const rawProductImg =
    product?.images?.[0]?.url || product?.images?.[0] || "/images/logo.png";
  const productImgUrl = formatImageUrl(rawProductImg);

  return (
    <div className="w-full pt-2 pb-1 font-display">
      {/* Horizontal Carousel Track with Overlay Arrows */}
      <div className="relative group">
        {/* Left Arrow Button */}
        {canScrollLeft && (
          <button
            type="button"
            onClick={() => scroll("left")}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-20 w-8 h-12 rounded-r-xl bg-white/90 text-black border border-stone-200 shadow-md flex items-center justify-center font-bold text-sm hover:bg-black hover:text-white transition-all cursor-pointer"
            aria-label="Previous Videos"
          >
            ‹
          </button>
        )}

        {/* Video Reels Track */}
        <div
          ref={scrollRef}
          onScroll={updateScrollButtons}
          className="flex gap-2.5 sm:gap-3 overflow-x-auto no-scrollbar scroll-smooth py-1"
        >
          {videoList.map((vid, idx) => {
            const rawUrl = vid.url || vid.videoUrl;
            const videoUrl = formatImageUrl(rawUrl);
            if (!videoUrl) return null;

            return (
              <div
                key={idx}
                onClick={() => handleOpenModal(videoUrl)}
                className="side-reel-card relative flex-shrink-0 w-[110px] sm:w-[125px] md:w-[135px] aspect-[9/16] rounded-2xl overflow-hidden bg-neutral-900 shadow-sm hover:shadow-md cursor-pointer border border-neutral-200 transition-transform duration-200 hover:scale-[1.02] select-none"
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
                <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent pointer-events-none" />

                {/* Circular Play Button at Bottom-Left (exact match to user screenshot) */}
                <div className="absolute bottom-2.5 left-2.5 z-10 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-black/60 backdrop-blur-xs border border-white/40 flex items-center justify-center text-white shadow-md">
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

        {/* Right Arrow Button (exact match to user screenshot) */}
        {canScrollRight && (
          <button
            type="button"
            onClick={() => scroll("right")}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-20 w-8 sm:w-9 h-12 sm:h-14 rounded-l-xl bg-white/90 text-black border border-stone-200 shadow-lg flex items-center justify-center font-bold text-base hover:bg-black hover:text-white transition-all cursor-pointer"
            aria-label="Next Videos"
          >
            ›
          </button>
        )}
      </div>

      {/* Full-Screen Vertical Reel Modal with Product Card & Add to Cart */}
      {activeVideoUrl && (
        <div
          onClick={handleCloseModal}
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 animate-fadeIn"
        >
          {/* Vertical Reel Container */}
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-[360px] sm:max-w-[400px] h-[82vh] max-h-[720px] rounded-2xl overflow-hidden bg-black shadow-[0_25px_60px_rgba(0,0,0,0.7)] border border-white/15 flex flex-col justify-between"
          >
            {/* Full Background Vertical Video */}
            <video
              ref={modalVideoRef}
              src={activeVideoUrl}
              autoPlay
              loop
              playsInline
              className="absolute inset-0 w-full h-full object-cover"
            />

            {/* Ambient Shadow Gradients */}
            <div className="absolute top-0 inset-x-0 h-28 bg-gradient-to-b from-black/75 to-transparent pointer-events-none" />
            <div className="absolute bottom-0 inset-x-0 h-44 bg-gradient-to-t from-black/90 via-black/50 to-transparent pointer-events-none" />

            {/* Top Control Header Bar */}
            <div className="relative z-20 flex items-center justify-between p-3.5 sm:p-4">
              {/* Sound Toggle */}
              <button
                type="button"
                onClick={toggleMute}
                className="w-9 h-9 rounded-full bg-black/50 backdrop-blur-md border border-white/20 text-white flex items-center justify-center hover:bg-black/80 transition-all cursor-pointer"
                aria-label={isMuted ? "Unmute video" : "Mute video"}
              >
                {isMuted ? (
                  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 9.75L21 13.5m0-3.75l-3.75 3.75M11.25 5.25L6.75 9H3.75v6h3l4.5 3.75V5.25z" />
                  </svg>
                ) : (
                  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 9H3.75v6h3l4.5 3.75V5.25L6.75 9z" />
                  </svg>
                )}
              </button>

              {/* Close Button (✕) */}
              <button
                type="button"
                onClick={handleCloseModal}
                className="w-9 h-9 rounded-full bg-black/50 backdrop-blur-md border border-white/20 text-white flex items-center justify-center hover:bg-black/80 transition-all text-base font-bold cursor-pointer"
                aria-label="Close video"
              >
                ✕
              </button>
            </div>

            {/* Bottom Floating Product Card */}
            {product && (
              <div className="relative z-20 m-3 sm:m-4 p-3 bg-neutral-900/90 backdrop-blur-md rounded-xl border border-white/20 shadow-2xl space-y-2.5">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-amber-50/15 border border-white/15 overflow-hidden flex-shrink-0 flex items-center justify-center p-1">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={productImgUrl}
                      alt={product.title}
                      className="w-full h-full object-contain"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h4 className="text-white text-xs sm:text-sm font-extrabold uppercase tracking-wide truncate">
                      {product.title}
                    </h4>
                    <p className="text-amber-300 text-xs font-black mt-0.5">
                      ₹{price.toLocaleString("en-IN")}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleAddToCart}
                  disabled={addStatus === "adding"}
                  className={`w-full py-2.5 rounded-lg text-xs font-black uppercase tracking-widest transition-all cursor-pointer shadow flex items-center justify-center gap-2 ${
                    addStatus === "added"
                      ? "bg-emerald-500 text-white"
                      : "bg-white hover:bg-neutral-100 text-black active:scale-98"
                  }`}
                >
                  {addStatus === "adding" ? (
                    <span>Adding...</span>
                  ) : addStatus === "added" ? (
                    <span>✓ Added to Cart</span>
                  ) : (
                    <span>Add To Cart</span>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
