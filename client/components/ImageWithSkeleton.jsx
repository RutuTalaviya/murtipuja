"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { formatImageUrl } from "@/lib/api";

export default function ImageWithSkeleton({
  src,
  alt = "MurtiPuja Divine Idol",
  fill = false,
  width,
  height,
  sizes,
  priority = false,
  unoptimized = false,
  className = "",
  containerClassName = "",
  style = {},
  onMouseEnter,
  onMouseLeave,
  onClick,
  ...props
}) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  const formattedSrc = formatImageUrl(src);

  // Reset loading state when src changes
  useEffect(() => {
    setIsLoaded(false);
    setHasError(false);
  }, [src]);

  if (!formattedSrc || hasError) {
    return (
      <div
        className={`w-full h-full flex flex-col items-center justify-center bg-stone-100 text-stone-400 p-4 select-none ${containerClassName}`}
      >
        <span className="text-2xl mb-1 opacity-50">🛕</span>
        <span className="text-[10px] font-extrabold uppercase tracking-wider text-stone-400">
          MurtiPuja
        </span>
      </div>
    );
  }

  return (
    <div
      className={`relative w-full h-full overflow-hidden ${containerClassName}`}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onClick={onClick}
    >
      {/* Shimmer Skeleton Placeholder Overlay */}
      {!isLoaded && (
        <div className="skeleton-box absolute inset-0 z-10 flex items-center justify-center pointer-events-none transition-opacity duration-300">
          <div className="w-8 h-8 rounded-full bg-stone-300/40 animate-pulse flex items-center justify-center text-stone-400 text-xs">
            ✨
          </div>
        </div>
      )}

      {/* Next.js Image */}
      <Image
        src={formattedSrc}
        alt={alt}
        fill={fill}
        width={!fill ? width : undefined}
        height={!fill ? height : undefined}
        sizes={sizes || "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"}
        priority={priority}
        unoptimized={unoptimized || formattedSrc.includes("/uploads/") || formattedSrc.includes("api.murtipuja.com")}
        style={style}
        onLoad={() => setIsLoaded(true)}
        onError={() => {
          setIsLoaded(true);
          setHasError(true);
        }}
        className={`transition-opacity duration-300 ${
          isLoaded ? "opacity-100" : "opacity-0"
        } ${className}`}
        {...props}
      />
    </div>
  );
}
