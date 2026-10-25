"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import ImageWithSkeleton from "@/components/ImageWithSkeleton";
import { useWishlist } from "@/context/WishlistContext";
import { useCart } from "@/context/CartContext";
import { getProducts, formatImageUrl } from "@/lib/api";

export default function WishlistPage() {
  const { wishlist, toggleFavorite } = useWishlist();
  const { addItem, setCartDrawerOpen } = useCart();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addingToCartId, setAddingToCartId] = useState(null);
  const [actionMessage, setActionMessage] = useState("");

  useEffect(() => {
    async function loadWishlistProducts() {
      if (!wishlist || wishlist.length === 0) {
        setProducts([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const idsQuery = wishlist.join(",");
        const res = await getProducts({ ids: idsQuery, limit: 50 });
        const fetched = res.data?.products || [];
        setProducts(fetched);
      } catch (err) {
        console.error("Failed to load wishlist items:", err);
      } finally {
        setLoading(false);
      }
    }

    loadWishlistProducts();
  }, [wishlist]);

  // Handle moving an item from wishlist to cart
  const handleMoveToCart = async (product) => {
    const variant = product.variants?.[0];
    if (!variant || variant.stock <= 0) return;

    setAddingToCartId(product._id);
    setActionMessage("");

    try {
      await addItem(product._id, variant.sku, 1, product, variant);
      setActionMessage(`✓ Added "${product.title}" to your cart!`);
      setCartDrawerOpen(true);
      setTimeout(() => setActionMessage(""), 4000);
    } catch (err) {
      console.error("Failed to add wishlist item to cart:", err);
    } finally {
      setAddingToCartId(null);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-white flex items-center justify-center font-display">
        <p className="text-xs text-neutral-400 font-extrabold uppercase tracking-widest animate-pulse">
          Loading your sacred favorites...
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white px-4 md:px-8 lg:px-12 py-8 md:py-12 font-display w-full">
      <div className="w-full space-y-8">
        
        {/* Header Section */}
        <div className="border-b-2 border-black pb-6 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
          <div>
            <p className="text-[10px] uppercase tracking-[0.25em] text-neutral-400 font-extrabold mb-1">
              Curated Devotional Favorites
            </p>
            <h1 className="font-display text-3xl sm:text-4xl md:text-5xl text-black font-extrabold uppercase tracking-wider">
              My Wishlist
            </h1>
            <p className="text-xs text-neutral-500 font-semibold uppercase tracking-wider mt-1.5">
              {wishlist.length === 1 ? "1 Sacred Idol Saved" : `${wishlist.length} Sacred Idols Saved`}
            </p>
          </div>

          {products.length > 0 && (
            <Link
              href="/products"
              className="px-5 py-2.5 bg-neutral-100 hover:bg-neutral-200 border-2 border-black text-black text-xs font-extrabold uppercase tracking-widest transition-colors shadow-sm"
            >
              Continue Browsing →
            </Link>
          )}
        </div>

        {/* Action Flash Message */}
        {actionMessage && (
          <div className="bg-emerald-50 border-2 border-emerald-600 text-emerald-950 p-3.5 text-xs font-bold uppercase tracking-wide">
            {actionMessage}
          </div>
        )}

        {/* Empty Wishlist State */}
        {products.length === 0 ? (
          <div className="bg-white rounded-none p-12 sm:p-20 text-center border-2 border-black max-w-xl mx-auto space-y-5 shadow-sm">
            <div className="text-5xl sm:text-6xl mb-2">❤️</div>
            <h2 className="font-display text-2xl text-black font-extrabold uppercase tracking-wider">
              Your Wishlist is Empty
            </h2>
            <p className="text-neutral-500 text-xs font-semibold leading-relaxed max-w-md mx-auto uppercase tracking-wider">
              You haven&apos;t saved any sacred divine sculptures yet. Tap the heart icon on any idol to keep it in your favorites.
            </p>
            <div className="pt-2">
              <Link
                href="/products"
                className="inline-block bg-black hover:bg-gold hover:text-black text-white px-8 py-4 border-2 border-black rounded-none text-xs font-extrabold uppercase tracking-widest transition-all shadow-md"
              >
                Explore Divine Drops
              </Link>
            </div>
          </div>
        ) : (
          /* Wishlist Grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => {
              const activeVariant = product.variants?.[0];
              const inStock = activeVariant ? activeVariant.stock > 0 : true;
              const isSale = Boolean(product.isOnSale && activeVariant?.discountPrice && activeVariant.discountPrice < activeVariant.price);
              const price = isSale ? activeVariant.discountPrice : (activeVariant?.price || product.basePrice);
              const originalPrice = activeVariant?.price || product.basePrice;
              const image = product.images?.[0];
              const imageUrl = image?.url ? formatImageUrl(image.url) : null;

              return (
                <div
                  key={product._id}
                  className="bg-white border-2 border-black flex flex-col justify-between group overflow-hidden shadow-xs hover:shadow-xl transition-all"
                >
                  {/* Top Image Container */}
                  <div className="relative aspect-square bg-neutral-100 overflow-hidden border-b-2 border-black">
                    <Link href={`/products/${product.slug}`} className="block w-full h-full">
                      {imageUrl ? (
                        <ImageWithSkeleton
                          src={imageUrl}
                          alt={product.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-neutral-400 text-xs">
                          No Image
                        </div>
                      )}
                    </Link>

                    {/* Sale Badge */}
                    {isSale && (
                      <span className="absolute top-2.5 left-2.5 bg-black text-white text-[9px] font-black px-2 py-0.5 uppercase tracking-wider border border-white">
                        SALE
                      </span>
                    )}

                    {/* Remove from Wishlist Button */}
                    <button
                      onClick={() => toggleFavorite(product._id)}
                      className="absolute top-2.5 right-2.5 w-8 h-8 bg-white/90 hover:bg-red-500 hover:text-white border border-black flex items-center justify-center text-red-600 transition-colors shadow-sm cursor-pointer z-10"
                      title="Remove from favorites"
                      aria-label="Remove from wishlist"
                    >
                      <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                      </svg>
                    </button>

                    {/* Stock Status Pill */}
                    {!inStock && (
                      <div className="absolute inset-0 bg-white/85 backdrop-blur-xs flex items-center justify-center">
                        <span className="bg-black text-white text-[9px] font-black uppercase tracking-widest px-3 py-1.5 border border-black">
                          Out of Stock
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Product Details */}
                  <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                    <div>
                      <p className="text-[9px] uppercase tracking-widest text-neutral-400 font-bold">
                        {product.deity || "Sacred Series"} · 0.1mm Precision
                      </p>
                      <Link href={`/products/${product.slug}`}>
                        <h3 className="font-display font-extrabold text-xs sm:text-sm text-black group-hover:text-amber-800 transition-colors uppercase tracking-wider mt-0.5 line-clamp-1">
                          {product.title}
                        </h3>
                      </Link>

                      {/* Pricing */}
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-sm sm:text-base font-extrabold text-black font-mono">
                          ₹{price}
                        </span>
                        {isSale && (
                          <span className="text-xs text-neutral-400 line-through font-mono">
                            ₹{originalPrice}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="pt-2 border-t border-neutral-100 flex gap-2">
                      <button
                        onClick={() => handleMoveToCart(product)}
                        disabled={!inStock || addingToCartId === product._id}
                        className="flex-1 py-2.5 bg-black hover:bg-gold hover:text-black text-white text-xs font-black uppercase tracking-widest border-2 border-black transition-colors disabled:opacity-40 cursor-pointer shadow-xs"
                      >
                        {addingToCartId === product._id
                          ? "Adding..."
                          : !inStock
                          ? "Out of Stock"
                          : "Move to Bag"}
                      </button>

                      <button
                        onClick={() => toggleFavorite(product._id)}
                        className="px-3 py-2.5 border-2 border-neutral-300 hover:border-black text-neutral-600 hover:text-red-600 transition-colors cursor-pointer text-xs font-bold"
                        title="Remove from favorites"
                      >
                        ✕
                      </button>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        )}

      </div>
    </main>
  );
}
