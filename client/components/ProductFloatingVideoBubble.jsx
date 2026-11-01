"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { formatImageUrl } from "@/lib/api";
import { useCart } from "@/context/CartContext";

export default function ProductFloatingVideoBubble({ product, videos = [] }) {
  const { addItem } = useCart();
  const [isOpen, setIsOpen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [addStatus, setAddStatus] = useState(""); // "", "adding", "added"
  const modalVideoRef = useRef(null);

  // Normalize video list
  const videoList = Array.isArray(videos)
    ? videos
        .map((v) => (typeof v === "string" ? { url: v } : v))
        .filter((v) => v && (v.url || v.videoUrl))
    : [];

  const rawVideo = videoList[0]?.url || videoList[0]?.videoUrl || "";
  const videoUrl = rawVideo ? formatImageUrl(rawVideo) : "";

  // If no video available, don't render widget
  if (!videoUrl || !product) return null;

  // Variant details for Add To Cart & Price
  const defaultVariant = product.variants?.[0];
  const price =
    defaultVariant?.discountPrice && defaultVariant.discountPrice > 0
      ? defaultVariant.discountPrice
      : defaultVariant?.price || product.basePrice || 0;

  const rawProductImg =
    product.images?.[0]?.url || product.images?.[0] || "/images/logo.png";
  const productImgUrl = formatImageUrl(rawProductImg);

  const handleOpenModal = () => {
    setIsOpen(true);
    setIsMuted(false);
    setTimeout(() => {
      if (modalVideoRef.current) {
        modalVideoRef.current.currentTime = 0;
        modalVideoRef.current.play().catch(() => {
          // If browser prevents unmuted autoplay, mute and play
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
    setIsOpen(false);
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
    if (!product._id) return;
    setAddStatus("adding");

    const sku = defaultVariant?.sku || product.slug;
    const res = await addItem(product._id, sku, 1);

    if (res.success) {
      setAddStatus("added");
      setTimeout(() => setAddStatus(""), 2200);
    } else {
      setAddStatus("");
    }
  };

  return (
    <>
      {/* 1. Floating Circular Video Bubble (Bottom-Left) */}
      <div
        onClick={handleOpenModal}
        className="fixed bottom-6 left-6 z-40 sm:bottom-8 sm:left-8 cursor-pointer select-none group"
        title="Click to watch full reel"
      >
        {/* Subtle pulsing beacon halo */}
        <span className="absolute -inset-1 rounded-full border-2 border-amber-500/40 animate-ping pointer-events-none" />

        {/* Outer Circular Glow Container */}
        <div className="relative w-18 h-18 sm:w-20 sm:h-20 rounded-full p-1 bg-white/95 backdrop-blur-sm border-2 border-amber-600/70 group-hover:border-black shadow-[0_10px_30px_rgba(0,0,0,0.35)] group-hover:scale-108 transition-all duration-300">
          <div className="relative w-full h-full rounded-full overflow-hidden bg-neutral-900">
            {/* Silent Autoplay Loop Video */}
            <video
              src={videoUrl}
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              className="w-full h-full object-cover scale-110 group-hover:scale-125 transition-transform duration-500 pointer-events-none"
            />

            {/* Subtle Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />

            {/* Small Play Badge Indicator */}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/30">
              <span className="w-7 h-7 rounded-full bg-white/90 text-black flex items-center justify-center text-xs font-bold pl-0.5 shadow">
                ▶
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Full-Screen / Centered Reel Modal (Exact Match to Second Screenshot) */}
      {isOpen && (
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
              src={videoUrl}
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
              {/* Sound Toggle (Speaker Icon) */}
              <button
                type="button"
                onClick={toggleMute}
                className="w-9 h-9 rounded-full bg-black/50 backdrop-blur-md border border-white/20 text-white flex items-center justify-center hover:bg-black/80 transition-all cursor-pointer"
                aria-label={isMuted ? "Unmute video" : "Mute video"}
              >
                {isMuted ? (
                  /* Muted Speaker SVG */
                  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 9.75L21 13.5m0-3.75l-3.75 3.75M11.25 5.25L6.75 9H3.75v6h3l4.5 3.75V5.25z" />
                  </svg>
                ) : (
                  /* Playing Sound Wave Speaker SVG */
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

            {/* Bottom Floating Product Card (Exact Match to User Reference Screenshot) */}
            <div className="relative z-20 m-3 sm:m-4 p-3 bg-neutral-900/90 backdrop-blur-md rounded-xl border border-white/20 shadow-2xl space-y-2.5">
              {/* Product Thumbnail + Title + Price */}
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

              {/* Add To Cart Action Button */}
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
          </div>
        </div>
      )}
    </>
  );
}
