"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { formatImageUrl } from "@/lib/api";

export default function ProductCard({ product }) {
  const [isMainLoaded, setIsMainLoaded] = useState(false);
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

        {imageUrl ? (
          <>
            {/* Primary Main Image */}
            <Image
              src={imageUrl}
              alt={image?.alt || product.title}
              fill
              unoptimized={true}
              sizes="(max-width: 768px) 100vw, 25vw"
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
                unoptimized={true}
                sizes="(max-width: 768px) 100vw, 25vw"
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
      <div className="p-4 sm:p-5 flex flex-col justify-between bg-white border-t border-stone-300">
        <div className="flex justify-between items-start gap-2">
          <div className="min-w-0 flex-1">
            <Link href={`/products/${product.slug}`}>
              <h3 className="font-display text-[14px] sm:text-[15px] font-extrabold uppercase tracking-wider text-black hover:text-amber-800 transition-colors truncate">
                {product.title}
              </h3>
            </Link>
            <div className="flex items-center gap-1.5 flex-wrap mt-1">
              <span className="text-[11px] text-neutral-500 font-bold uppercase tracking-wider truncate">
                {categoryName.toUpperCase()} {categoryName.toLowerCase().includes("series") ? "" : "SERIES"}
              </span>
            </div>
          </div>

          {/* Price */}
          <div className="text-right flex-shrink-0">
            <p className="text-black font-extrabold text-[14px] sm:text-[15px]">
              {currentDiscountPrice && (
                <span className="text-neutral-400 line-through mr-1 text-xs font-semibold">
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
