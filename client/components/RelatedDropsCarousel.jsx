"use client";

import { useMemo } from "react";
import Link from "next/link";
import { CoverflowCarousel } from "@/components/ui/coverflow-carousel";

export default function RelatedDropsCarousel({ products = [], currentDeity = "" }) {
  // Transform product items into Coverflow Slide format
  const slides = useMemo(() => {
    if (!products || products.length === 0) return [];

    return products.map((product) => {
      const primaryVariant = product.variants?.[0];
      const isSaleActive = Boolean(
        product.isOnSale &&
          primaryVariant?.discountPrice &&
          primaryVariant.discountPrice < primaryVariant.price
      );
      const displayPrice = isSaleActive
        ? primaryVariant.discountPrice
        : primaryVariant?.price || product.basePrice || 0;

      const finishValue = primaryVariant?.finish || "Matte Finish";
      const sizeValue = primaryVariant?.size || "Standard";

      return {
        _id: product._id,
        src: product.images?.[0]?.url || "/images/shiva.png",
        alt: product.images?.[0]?.alt || product.title,
        title: product.title,
        subtitle: product.deity ? `${product.deity} Series` : "Sacred Drop",
        badge: isSaleActive ? "SALE" : (product.deity || "Sacred"),
        price: `₹${displayPrice.toLocaleString("en-IN")}`,
        link: `/products/${product.slug}`,
        meta: [
          { label: "Deity", value: product.deity || "Divine" },
          { label: "Size", value: sizeValue },
          { label: "Finish", value: finishValue },
          { label: "Price", value: `₹${displayPrice.toLocaleString("en-IN")}` },
        ],
      };
    });
  }, [products]);

  if (!products || products.length === 0) return null;

  return (
    <section className="w-full bg-stone-50/50 py-14 sm:py-20 border-t-2 border-stone-200 overflow-hidden font-display">
      <div className="w-full max-w-[1700px] mx-auto px-3 sm:px-6 lg:px-10">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-6 border-b border-stone-200 mb-8">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
              <p className="text-[11px] sm:text-xs uppercase tracking-widest text-amber-800 font-extrabold">
                Sacred Companions
              </p>
            </div>
            <h2 className="font-display text-2xl sm:text-3xl md:text-4xl text-neutral-900 font-extrabold uppercase tracking-tight mt-1">
              Related Drops
            </h2>
          </div>

          <Link
            href={currentDeity ? `/products?deity=${encodeURIComponent(currentDeity)}` : "/products"}
            className="inline-flex items-center gap-2 text-xs font-extrabold text-neutral-800 hover:text-amber-700 uppercase tracking-widest transition-colors group"
          >
            <span>Explore All Drops</span>
            <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
          </Link>
        </div>

        {/* 3D Coverflow Carousel */}
        <CoverflowCarousel
          slides={slides}
          showCaption={true}
          autoPlay={true}
          autoPlayInterval={5000}
        />
      </div>
    </section>
  );
}

