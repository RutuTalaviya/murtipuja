"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import ImageWithSkeleton from "@/components/ImageWithSkeleton";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";

export default function CartPage() {
  const { cart, loading, itemCount, subtotal, updateItem, removeItem } = useCart();
  const { toggleFavorite } = useWishlist();
  const [confirmRemoveId, setConfirmRemoveId] = useState(null);

  if (loading) {
    return (
      <main className="min-h-screen bg-white flex items-center justify-center font-display">
        <p className="text-xs text-neutral-400 font-extrabold uppercase tracking-widest animate-pulse">Loading your cart...</p>
      </main>
    );
  }
 
  if (itemCount === 0) {
    return (
      <main className="min-h-screen bg-white flex flex-col items-center justify-center px-6 text-center font-display">
        <h1 className="font-display text-2xl text-black font-extrabold uppercase tracking-wider mb-2">Your cart is empty</h1>
        <p className="text-neutral-500 text-xs font-semibold mb-6 uppercase tracking-wider">Explore our collection and find your drop.</p>
        <Link href="/products" className="bg-black hover:bg-gold hover:text-black text-white px-8 py-3.5 border-2 border-black rounded-none text-xs font-extrabold tracking-widest uppercase transition-colors">
          Shop Drops
        </Link>
      </main>
    );
  }
 
  return (
    <main className="min-h-screen bg-white px-4 md:px-8 lg:px-12 py-8 md:py-12 font-display w-full">
      <div className="w-full space-y-8">
        <div className="border-b-2 border-black pb-4">
          <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-extrabold uppercase tracking-wider text-black">Your Cart</h1>
          <p className="text-xs text-neutral-400 font-extrabold uppercase tracking-widest mt-1.5">{itemCount} items in bag</p>
        </div>
 
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Cart Items List */}
          <div className="lg:col-span-8 space-y-4">
          {cart.items.map((item) => (
            <div
              key={item._id}
              className="flex gap-4 bg-white p-4 rounded-none border-2 border-black relative overflow-hidden"
            >
              {/* Inline removal choice overlay */}
              {confirmRemoveId === item._id && (
                <div className="absolute inset-0 bg-white/95 z-20 flex flex-col justify-center items-center gap-2 animate-fadeIn p-4 border-2 border-black rounded-none">
                  <p className="text-xs font-bold text-black text-center uppercase tracking-wide">Remove {item.product?.title} from your cart?</p>
                  <div className="flex gap-3 w-full max-w-[360px]">
                    <button
                      onClick={() => {
                        removeItem(item._id);
                        setConfirmRemoveId(null);
                      }}
                      className="flex-1 bg-neutral-100 hover:bg-red-50 hover:text-red-600 text-black text-xs font-bold py-2.5 rounded-none transition-all border-2 border-black"
                    >
                      🗑️ Just Remove
                    </button>
                    <button
                      onClick={async () => {
                        await toggleFavorite(item.product._id);
                        removeItem(item._id);
                        setConfirmRemoveId(null);
                      }}
                      className="flex-1 bg-black text-white hover:bg-gold hover:text-black text-xs font-bold py-2.5 rounded-none transition-all border-2 border-black"
                    >
                      ❤️ Save to Favorites
                    </button>
                  </div>
                  <button
                    onClick={() => setConfirmRemoveId(null)}
                    className="text-xs text-neutral-400 hover:text-black hover:underline font-bold uppercase tracking-wider"
                  >
                    Cancel
                  </button>
                </div>
              )}
 
              <div className="relative w-20 h-20 rounded-none overflow-hidden bg-neutral-100 border border-neutral-200 flex-shrink-0">
                {item.product?.images?.[0]?.url && (
                  <ImageWithSkeleton
                    src={item.product.images[0].url}
                    alt={item.product.title}
                    fill
                    className="object-cover"
                  />
                )}
              </div>
 
              <div className="flex-1">
                <p className="font-display font-extrabold uppercase text-black text-xs md:text-sm tracking-wider">{item.product?.title}</p>
                <p className="text-[10px] text-neutral-400 font-semibold uppercase tracking-wider mb-2">{item.variantSku}</p>
 
                <div className="flex items-center gap-3">
                  <div className="flex items-center border-2 border-black rounded-none overflow-hidden bg-white">
                    <button
                      onClick={() => updateItem(item._id, Math.max(1, item.quantity - 1))}
                      className="w-7 h-7 hover:bg-neutral-100 text-xs font-bold"
                    >
                      −
                    </button>
                    <span className="w-8 text-center text-xs font-bold">{item.quantity}</span>
                    <button
                      onClick={() => updateItem(item._id, item.quantity + 1)}
                      className="w-7 h-7 hover:bg-neutral-100 text-xs font-bold"
                    >
                      +
                    </button>
                  </div>
                  <button
                    onClick={() => setConfirmRemoveId(item._id)}
                    className="text-xs text-neutral-400 hover:text-red-600 font-bold uppercase tracking-wider"
                  >
                    Remove
                  </button>
                </div>
              </div>
 
              <p className="text-black font-extrabold text-sm md:text-base">₹{item.priceAtAdd * item.quantity}</p>
            </div>
          ))}
          </div>
 
          {/* Right Column: Cart Summary */}
          <div className="lg:col-span-4 sticky top-24">
            <div className="bg-white p-6 rounded-none border-2 border-black space-y-4">
              <h2 className="font-display text-lg text-black font-extrabold uppercase tracking-wider border-b-2 border-neutral-100 pb-3">
                Order Summary
              </h2>
              <div className="flex justify-between">
                <span className="text-neutral-500 font-bold uppercase tracking-wider text-xs">Subtotal ({itemCount} items)</span>
                <span className="font-extrabold text-black text-sm md:text-base">₹{subtotal}</span>
              </div>
              <p className="text-[10px] text-neutral-400 font-semibold uppercase tracking-wider leading-relaxed">
                Free shipping on all prepaid orders. Taxes calculated at checkout.
              </p>
              <Link
                href="/checkout"
                className="block w-full bg-black hover:bg-gold hover:text-black text-white py-4 text-center rounded-none border-2 border-black transition-colors font-extrabold text-xs uppercase tracking-widest"
              >
                Proceed to Checkout
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
