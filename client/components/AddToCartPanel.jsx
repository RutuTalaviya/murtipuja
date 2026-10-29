"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { getVariantGalleryMedia } from "@/lib/api";

export default function AddToCartPanel({ product, finishes }) {
  const router = useRouter();
  const { addItem } = useCart();
  const { isInWishlist, toggleFavorite } = useWishlist();
  const isFav = isInWishlist(product._id);

  // Extract unique sizes and finishes
  const uniqueSizes = [...new Set(product.variants?.map((v) => v.size) || [])];
  const uniqueFinishes = [...new Set(product.variants?.map((v) => v.finish) || [])];

  // Independent selection states
  const [selectedSize, setSelectedSize] = useState(product.variants?.[0]?.size || "");
  const [selectedFinish, setSelectedFinish] = useState(product.variants?.[0]?.finish || "");
  const [quantity, setQuantity] = useState(1);
  const [status, setStatus] = useState(""); // "", "adding", "added", "error"
  const [message, setMessage] = useState("");

  // Helper to map finish name to a premium color swatch background
  const getSwatchColor = (finish) => {
    // Check if there is an administrator-defined finish with this exact name
    const match = finishes?.find((f) => f.name.toLowerCase() === finish.toLowerCase());
    if (match && match.colorCode) {
      return match.colorCode; // e.g. "#000000"
    }

    const f = finish.toLowerCase();
    if (f.includes("black")) return "bg-black border-black";
    if (f.includes("bronze")) return "bg-[#804A00] border-[#804A00]";
    if (f.includes("gold")) return "bg-[#D4AF37] border-[#D4AF37]";
    if (f.includes("white") || f.includes("marble")) return "bg-white border-charcoal/20 shadow-sm";
    if (f.includes("silver") || f.includes("grey")) return "bg-[#C0C0C0] border-[#C0C0C0]";
    if (f.includes("copper")) return "bg-[#B87333] border-[#B87333]";
    return "bg-[#8B5E3C] border-[#8B5E3C]"; // terracotta/brass fallback
  };

  // Find exact matching variant with case-insensitive fallback
  const matchVariant = (size, finish) => {
    if (!product.variants || product.variants.length === 0) return null;
    const sNorm = (size || "").toLowerCase().trim();
    const fNorm = (finish || "").toLowerCase().trim();

    return (
      product.variants.find(
        (v) => (v.size || "").toLowerCase().trim() === sNorm && (v.finish || "").toLowerCase().trim() === fNorm
      ) ||
      product.variants.find(
        (v) => (v.finish || "").toLowerCase().trim() === fNorm
      ) ||
      product.variants.find(
        (v) => (v.size || "").toLowerCase().trim() === sNorm
      ) ||
      product.variants[0] ||
      null
    );
  };

  const selectedVariant = matchVariant(selectedSize, selectedFinish);

  // Emit custom event when selected variant changes to update the image gallery
  useEffect(() => {
    if (selectedVariant) {
      const galleryImages = getVariantGalleryMedia(
        selectedVariant,
        product.variants,
        product.images,
        product.title
      );

      const event = new CustomEvent("variantChange", {
        detail: {
          variant: selectedVariant,
          images: galleryImages,
          image: galleryImages[0]?.url || selectedVariant.image || "",
        },
      });
      window.dispatchEvent(event);

      // Also trigger legacy event for backwards compatibility
      if (galleryImages[0]?.url || selectedVariant.image) {
        window.dispatchEvent(
          new CustomEvent("variantImageChange", {
            detail: galleryImages[0]?.url || selectedVariant.image,
          })
        );
      }
    }
  }, [selectedVariant, selectedFinish, selectedSize, product.title, product.images, product.variants]);

  const isSaleActive = Boolean(product.isOnSale && selectedVariant?.discountPrice && selectedVariant.discountPrice < selectedVariant.price);
  const inStock = selectedVariant ? selectedVariant.stock > 0 : false;
  const price = isSaleActive ? selectedVariant.discountPrice : (selectedVariant?.price || product.basePrice);

  const handleSizeChange = (size) => {
    setSelectedSize(size);
    const sNorm = (size || "").toLowerCase().trim();
    const fNorm = (selectedFinish || "").toLowerCase().trim();
    const exactMatch = product.variants?.find(
      (v) => (v.size || "").toLowerCase().trim() === sNorm && (v.finish || "").toLowerCase().trim() === fNorm
    );
    if (!exactMatch) {
      const fallbackMatch = product.variants?.find((v) => (v.size || "").toLowerCase().trim() === sNorm);
      if (fallbackMatch) {
        setSelectedFinish(fallbackMatch.finish);
      }
    }
  };

  const handleFinishChange = (finish) => {
    setSelectedFinish(finish);
    const sNorm = (selectedSize || "").toLowerCase().trim();
    const fNorm = (finish || "").toLowerCase().trim();
    const exactMatch = product.variants?.find(
      (v) => (v.size || "").toLowerCase().trim() === sNorm && (v.finish || "").toLowerCase().trim() === fNorm
    );
    if (!exactMatch) {
      const fallbackMatch = product.variants?.find((v) => (v.finish || "").toLowerCase().trim() === fNorm);
      if (fallbackMatch) {
        setSelectedSize(fallbackMatch.size);
      }
    }
  };

  async function handleAddToCart() {
    if (!selectedVariant) return;
    setStatus("adding");
    setMessage("");

    const result = await addItem(product._id, selectedVariant.sku, quantity);

    if (result.success) {
      setStatus("added");
      setTimeout(() => setStatus(""), 2000);
    } else {
      setStatus("error");
      setMessage(result.message);
    }
  }

  return (
    <div className="space-y-3.5">
      <p className="text-2xl sm:text-3xl text-black font-extrabold leading-tight">
        {isSaleActive && (
          <span className="text-neutral-400 line-through mr-2.5 text-lg sm:text-xl font-semibold">₹{selectedVariant.price}</span>
        )}
        ₹{price}
      </p>
 
      {/* Option Selectors */}
      <div className="space-y-3">
        {/* Size Selection */}
        {uniqueSizes.length > 0 && (
          <div>
            <p className="text-[10px] uppercase tracking-widest text-neutral-400 font-extrabold mb-1.5">
              Size
            </p>
            <div className="flex flex-wrap gap-2">
              {uniqueSizes.map((size) => {
                const isSelected = selectedSize === size;
                return (
                  <button
                    key={size}
                    onClick={() => handleSizeChange(size)}
                    className={`px-3.5 py-1.5 border-2 text-xs font-bold uppercase tracking-wider transition-all duration-300 rounded-none ${
                      isSelected
                        ? "border-black bg-black text-white shadow-sm scale-[1.02]"
                        : "border-neutral-200 text-neutral-600 bg-white hover:border-black"
                    }`}
                  >
                    {size}
                  </button>
                );
              })}
            </div>
          </div>
        )}
 
        {/* Finish / Color Selection */}
        {uniqueFinishes.length > 0 && (
          <div>
            <p className="text-[10px] uppercase tracking-widest text-neutral-400 font-extrabold mb-1.5">
              Finish / Color
            </p>
            <div className="flex items-center gap-2.5">
              {uniqueFinishes.map((finish) => {
                const isSelected = selectedFinish === finish;
                const swatchBg = getSwatchColor(finish);
                const isHex = swatchBg.startsWith("#");
                return (
                  <button
                    key={finish}
                    title={finish}
                    onClick={() => handleFinishChange(finish)}
                    className={`relative w-7 h-7 sm:w-8 sm:h-8 rounded-none border-2 transition-all duration-300 ${
                      isSelected
                        ? "border-black scale-110 shadow-sm ring-2 ring-offset-2 ring-black/10"
                        : "border-transparent hover:scale-105"
                    }`}
                  >
                    <span
                      className={`absolute inset-0.5 rounded-none ${!isHex ? swatchBg : ""} border`}
                      style={isHex ? { backgroundColor: swatchBg } : {}}
                    />
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
 
      {/* Quantity */}
      <div className="flex items-center gap-3">
        <span className="text-[10px] uppercase tracking-widest text-neutral-400 font-extrabold">Quantity</span>
        <div className="flex items-center border-2 border-black rounded-none bg-white">
          <button
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            className="w-9 h-9 hover:bg-neutral-100 text-black text-sm font-bold flex items-center justify-center border-r-2 border-black cursor-pointer"
          >
            −
          </button>
          <span className="w-10 text-center text-xs font-extrabold text-black">{quantity}</span>
          <button
            onClick={() => setQuantity((q) => Math.min(selectedVariant?.stock || 1, q + 1))}
            className="w-9 h-9 hover:bg-neutral-100 text-black text-sm font-bold flex items-center justify-center border-l-2 border-black cursor-pointer"
          >
            +
          </button>
        </div>
      </div>
 
      {/* Low Stock Urgency Alert (≤ 10 units left) */}
      {selectedVariant && selectedVariant.stock > 0 && selectedVariant.stock <= 10 && (
        <div className="flex items-center gap-2 bg-amber-50 border border-amber-300 text-amber-950 px-3 py-1.5 text-xs font-bold">
          <span className="text-sm">⚡</span>
          <span>Only <strong className="font-extrabold text-amber-900">{selectedVariant.stock} left</strong> in stock — order soon!</span>
        </div>
      )}

      {message && <p className="text-red-600 text-xs font-semibold">{message}</p>}
 
      <div className="flex flex-col sm:flex-row gap-2.5">
        <button
          onClick={handleAddToCart}
          disabled={!inStock || status === "adding"}
          className="flex-1 bg-black text-white hover:bg-gold hover:text-black border-2 border-black py-3 sm:py-3.5 rounded-none transition-colors font-extrabold uppercase tracking-widest text-xs disabled:opacity-40 cursor-pointer shadow-sm"
        >
          {!inStock
            ? "Out of Stock"
            : status === "adding"
            ? "Adding..."
            : status === "added"
            ? "Added ✓"
            : "Add to Cart"}
        </button>
        <button
          onClick={() => router.push("/cart")}
          className="w-full sm:w-auto sm:px-6 py-3 sm:py-3.5 rounded-none border-2 border-black text-black hover:bg-neutral-100 transition-colors font-extrabold uppercase tracking-widest text-xs text-center cursor-pointer"
        >
          View Cart
        </button>
        <button
          type="button"
          onClick={() => toggleFavorite(product._id)}
          className={`w-full sm:w-12 py-3 sm:py-0 rounded-none border-2 border-black flex items-center justify-center transition-colors cursor-pointer ${
            isFav ? "bg-red-50 text-red-600 border-red-600" : "bg-white text-neutral-600 hover:text-red-600"
          }`}
          title={isFav ? "Remove from wishlist" : "Save to wishlist"}
          aria-label="Toggle Wishlist"
        >
          <svg width="18" height="18" fill={isFav ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
          </svg>
        </button>
      </div>
    </div>
  );
}
