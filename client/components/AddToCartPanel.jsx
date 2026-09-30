"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";

export default function AddToCartPanel({ product, finishes }) {
  const router = useRouter();
  const { addItem } = useCart();

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

  // Find exact matching variant
  const selectedVariant = product.variants?.find(
    (v) => v.size === selectedSize && v.finish === selectedFinish
  ) || product.variants?.[0] || null;

  // Emit custom event when selected variant changes to update the image gallery
  useEffect(() => {
    if (selectedVariant) {
      const variantImages =
        Array.isArray(selectedVariant.images) && selectedVariant.images.length > 0
          ? selectedVariant.images
          : selectedVariant.image
          ? [{ url: selectedVariant.image, alt: `${product.title} - ${selectedVariant.finish}` }]
          : [];

      const event = new CustomEvent("variantChange", {
        detail: {
          variant: selectedVariant,
          images: variantImages,
          image: selectedVariant.image,
        },
      });
      window.dispatchEvent(event);

      // Also trigger legacy event for backwards compatibility
      if (selectedVariant.image) {
        window.dispatchEvent(new CustomEvent("variantImageChange", { detail: selectedVariant.image }));
      }
    }
  }, [selectedVariant, product.title]);

  const isSaleActive = Boolean(product.isOnSale && selectedVariant?.discountPrice && selectedVariant.discountPrice < selectedVariant.price);
  const inStock = selectedVariant ? selectedVariant.stock > 0 : false;
  const price = isSaleActive ? selectedVariant.discountPrice : (selectedVariant?.price || product.basePrice);

  const handleSizeChange = (size) => {
    setSelectedSize(size);
    // Find if current finish is available in the new size
    const exactMatch = product.variants?.find((v) => v.size === size && v.finish === selectedFinish);
    if (!exactMatch) {
      // Fallback: select first available finish for this size
      const fallbackMatch = product.variants?.find((v) => v.size === size);
      if (fallbackMatch) {
        setSelectedFinish(fallbackMatch.finish);
      }
    }
  };

  const handleFinishChange = (finish) => {
    setSelectedFinish(finish);
    // Find if current size is available in the new finish
    const exactMatch = product.variants?.find((v) => v.size === selectedSize && v.finish === finish);
    if (!exactMatch) {
      // Fallback: select first available size for this finish
      const fallbackMatch = product.variants?.find((v) => v.finish === finish);
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
    <div className="space-y-6">
      <p className="text-3xl text-black font-extrabold">
        {isSaleActive && (
          <span className="text-neutral-400 line-through mr-2.5 text-xl font-semibold">₹{selectedVariant.price}</span>
        )}
        ₹{price}
      </p>
 
      {/* Option Selectors */}
      <div className="space-y-5">
        {/* Size Selection */}
        {uniqueSizes.length > 0 && (
          <div>
            <p className="text-[10px] uppercase tracking-widest text-neutral-400 font-extrabold mb-2">
              Size
            </p>
            <div className="flex flex-wrap gap-2">
              {uniqueSizes.map((size) => {
                const isSelected = selectedSize === size;
                return (
                  <button
                    key={size}
                    onClick={() => handleSizeChange(size)}
                    className={`px-4 py-2 border-2 text-xs font-bold uppercase tracking-wider transition-all duration-300 rounded-none ${
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
            <p className="text-[10px] uppercase tracking-widest text-neutral-400 font-extrabold mb-2 flex items-center justify-between">
              <span>Finish / Color</span>
              <span className="text-[9px] text-black font-extrabold bg-gold border-2 border-black px-2.5 py-0.5 rounded-none uppercase tracking-widest">
                {selectedFinish}
              </span>
            </p>
            <div className="flex items-center gap-3">
              {uniqueFinishes.map((finish) => {
                const isSelected = selectedFinish === finish;
                const swatchBg = getSwatchColor(finish);
                const isHex = swatchBg.startsWith("#");
                return (
                  <button
                    key={finish}
                    title={finish}
                    onClick={() => handleFinishChange(finish)}
                    className={`relative w-8 h-8 rounded-none border-2 transition-all duration-300 ${
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
      <div className="flex items-center gap-3 pt-2">
        <span className="text-[10px] uppercase tracking-widest text-neutral-400 font-extrabold">Quantity</span>
        <div className="flex items-center border-2 border-black rounded-none bg-white">
          <button
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            className="w-10 h-10 hover:bg-neutral-100 text-black text-sm font-bold flex items-center justify-center border-r-2 border-black"
          >
            −
          </button>
          <span className="w-12 text-center text-xs font-extrabold text-black">{quantity}</span>
          <button
            onClick={() => setQuantity((q) => Math.min(selectedVariant?.stock || 1, q + 1))}
            className="w-10 h-10 hover:bg-neutral-100 text-black text-sm font-bold flex items-center justify-center border-l-2 border-black"
          >
            +
          </button>
        </div>
      </div>
 
      {message && <p className="text-red-600 text-sm">{message}</p>}
 
      <div className="flex flex-col sm:flex-row gap-3 pt-2">
        <button
          onClick={handleAddToCart}
          disabled={!inStock || status === "adding"}
          className="flex-1 bg-black text-white hover:bg-gold hover:text-black border-2 border-black py-4 rounded-none transition-colors font-extrabold uppercase tracking-widest text-xs disabled:opacity-40"
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
          className="w-full sm:w-auto sm:px-8 py-4 rounded-none border-2 border-black text-black hover:bg-neutral-100 transition-colors font-extrabold uppercase tracking-widest text-xs text-center"
        >
          View Cart
        </button>
      </div>
    </div>
  );
}
