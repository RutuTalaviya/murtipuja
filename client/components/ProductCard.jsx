"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { formatImageUrl } from "@/lib/api";
import { useWishlist } from "@/context/WishlistContext";

export default function ProductCard({ product }) {
  const [isMainLoaded, setIsMainLoaded] = useState(false);
  const { isInWishlist, toggleFavorite } = useWishlist();
  const isFav = isInWishlist(product._id);

  const activeVariant = product.variants?.[0];
  const image = product.images?.[0];
  const hoverImage = product.images?.[1] || null;
  const inStock = activeVariant ? activeVariant.stock > 0 : true;

  const imageUrl = image?.url ? formatImageUrl(image.url) : null;
  const hoverImageUrl = hoverImage?.url ? formatImageUrl(hoverImage.url) : null;

  // Price calculations
  const isSaleActive = Boolean(
    product.isOnSale && activeVariant?.discountPrice && activeVariant.discountPrice < activeVariant.price
  );
  const currentPrice = activeVariant ? activeVariant.price : product.basePrice;
  const currentDiscountPrice = isSaleActive ? activeVariant.discountPrice : null;
  const showPrice = currentDiscountPrice || currentPrice;

  // Category / Deity Series display
  const categoryName =
    Array.isArray(product.category) && product.category.length > 0
      ? product.category[0].name || product.category[0].slug || product.category[0]
      : product.category?.name || product.deity || "Sacred Series";

  return (
    <div className="group block bg-white rounded-none overflow-hidden relative flex flex-col justify-between font-display h-full w-full">
      {/* Product Image Link */}
      <Link href={`/products/${product.slug}`} className="block relative aspect-square bg-neutral-100 overflow-hidden w-full">
        {/* Shimmer Skeleton Loader */}
        {!isMainLoaded && (
          <div className="skeleton-box absolute inset-0 z-10 pointer-events-none transition-opacity duration-300" />
        )}

        {/* Top-Left Sale Badge */}
        {isSaleActive && (
          <span className="absolute top-3 left-3 bg-black text-white text-[9px] font-extrabold px-2.5 py-1 uppercase tracking-wider z-20 shadow-sm">
            SALE
          </span>
        )}

        {/* Wishlist Heart Button */}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleFavorite(product._id);
          }}
          className={`absolute top-2.5 right-2.5 z-20 w-8 h-8 rounded-full flex items-center justify-center transition-all shadow-sm cursor-pointer ${
            isFav
              ? "bg-red-50 text-red-600 border border-red-200"
              : "bg-white/90 text-neutral-600 hover:text-red-600 border border-neutral-300 opacity-90 group-hover:opacity-100"
          }`}
          title={isFav ? "Remove from favorites" : "Add to favorites"}
          aria-label="Toggle Wishlist"
        >
          <svg width="16" height="16" fill={isFav ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
          </svg>
        </button>

        {imageUrl ? (
          <>
            {/* Primary Main Image */}
            <Image
              src={imageUrl}
              alt={image?.alt || product.title}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              onLoad={() => setIsMainLoaded(true)}
              onError={() => setIsMainLoaded(true)}
              className={`object-cover object-center transition-all duration-500 ${
                isMainLoaded ? "opacity-100" : "opacity-0"
              } ${
                hoverImageUrl ? "group-hover:opacity-0" : "group-hover:scale-105"
              } ${!inStock ? "grayscale-[40%] opacity-90" : ""}`}
            />

            {/* Secondary Hover Image */}
            {hoverImageUrl && (
              <Image
                src={hoverImageUrl}
                alt={hoverImage?.alt || `${product.title} hover view`}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                className={`object-cover object-center absolute inset-0 opacity-0 group-hover:opacity-100 transition-all duration-500 ${
                  !inStock ? "grayscale-[40%] opacity-90" : ""
                }`}
              />
            )}
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-neutral-400 text-sm">
            No image
          </div>
        )}

        {/* Sold Out Overlay */}
        {!inStock && (
          <div className="absolute inset-0 bg-white/80 backdrop-blur-[2px] flex items-center justify-center z-10 transition-all duration-300">
            <span className="bg-black text-white border-2 border-black text-[9px] font-extrabold uppercase tracking-widest px-4 py-2 shadow-lg">
              Sold Out
            </span>
          </div>
        )}
      </Link>

      {/* Product Details: Name, Category, Price only (Clean minimalist layout) */}
      <div className="p-2.5 sm:p-5 flex flex-col justify-between bg-white border-t border-stone-300">
        <div className="flex justify-between items-start gap-1.5 sm:gap-2">
          <div className="min-w-0 flex-1">
            <Link href={`/products/${product.slug}`}>
              <h3 className="font-display text-xs sm:text-[15px] font-extrabold uppercase tracking-wider text-black hover:text-amber-800 transition-colors truncate">
                {product.title}
              </h3>
            </Link>
            <div className="flex items-center gap-1 flex-wrap mt-0.5 sm:mt-1">
              <span className="text-[9px] sm:text-[11px] text-neutral-500 font-bold uppercase tracking-wider truncate">
                {categoryName.toUpperCase()} {categoryName.toLowerCase().includes("series") ? "" : "SERIES"}
              </span>
            </div>
          </div>

          {/* Price */}
          <div className="text-right flex-shrink-0">
            <p className="text-black font-extrabold text-xs sm:text-[15px]">
              {currentDiscountPrice && (
                <span className="text-neutral-400 line-through mr-1 text-[10px] sm:text-xs font-semibold">
                  ₹{currentPrice}
                </span>
              )}
              ₹{showPrice}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
