"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import ImageWithSkeleton from "@/components/ImageWithSkeleton";
import { useCart } from "@/context/CartContext";

export default function CartDrawer() {
  const router = useRouter();
  const {
    cart,
    itemCount,
    subtotal,
    calculations,
    couponCode,
    updateItem,
    removeItem,
    isCartDrawerOpen,
    setCartDrawerOpen,
  } = useCart();

  const [confirmRemoveId, setConfirmRemoveId] = useState(null);

  const drawerRef = useRef(null);

  // Close drawer on escape key press
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === "Escape") {
        setCartDrawerOpen(false);
      }
    }
    if (isCartDrawerOpen) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden"; // lock scroll
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [isCartDrawerOpen, setCartDrawerOpen]);

  if (!isCartDrawerOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end font-display">
      {/* Backdrop */}
      <div
        onClick={() => setCartDrawerOpen(false)}
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
      />
 
      {/* Drawer Body */}
      <div
        ref={drawerRef}
        className="relative w-full max-w-md h-full bg-white shadow-2xl flex flex-col z-10 animate-slide-left border-l-2 border-black"
      >
        {/* Drawer Header */}
        <div className="p-5 border-b-2 border-black flex items-center justify-between">
          <div>
            <h2 className="font-display text-lg text-black font-extrabold uppercase tracking-wider">Your Bag</h2>
            <p className="text-xs text-neutral-500 font-semibold">
              {itemCount} {itemCount === 1 ? "item" : "items"}
            </p>
          </div>
          <button
            onClick={() => setCartDrawerOpen(false)}
            className="w-8 h-8 rounded-full hover:bg-neutral-100 flex items-center justify-center text-black/70 transition-colors"
          >
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
 
        {cart.items?.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-4 bg-white">
            <div className="text-5xl">🛍️</div>
            <h3 className="font-display text-base text-black font-extrabold uppercase tracking-wider">Your bag is empty</h3>
            <p className="text-xs text-neutral-400 font-semibold max-w-[240px] leading-relaxed">
              Explore our micro-precision 3D-printed divine collections and fill your bag.
            </p>
            <button
              onClick={() => {
                setCartDrawerOpen(false);
                router.push("/products");
              }}
              className="bg-black hover:bg-gold hover:text-black text-white px-8 py-3 rounded-none text-xs font-extrabold border-2 border-black transition-all uppercase tracking-widest"
            >
              Shop Collection
            </button>
          </div>
        ) : (
          <>
            {/* 100% Free Shipping Banner */}
            <div className="px-5 py-3.5 border-b-2 border-neutral-100">
              <div className="bg-green-50 border-2 border-green-600 p-3 rounded-none text-xs text-green-800 font-bold uppercase tracking-wider flex items-center gap-2.5">
                <span className="text-base">🚚</span>
                <span><strong>100% FREE SHIPPING</strong> ON ALL ORDERS ACROSS INDIA</span>
              </div>
            </div>
 
            {/* Drawer Items (Scrollable List) */}
            <div className="flex-1 overflow-y-auto divide-y-2 divide-neutral-100 px-5">
              {cart.items.map((item) => (
                <div key={item._id} className="flex gap-4 py-5 relative overflow-hidden">
                  {/* Inline removal choice overlay */}
                  {confirmRemoveId === item._id && (
                    <div className="absolute inset-0 bg-white/95 z-20 flex flex-col justify-center items-center gap-2 animate-fadeIn p-4 border-2 border-black rounded-none">
                      <p className="text-[11px] font-bold text-black text-center uppercase tracking-wide">Remove this item from your bag?</p>
                      <div className="flex gap-2 w-full max-w-[280px]">
                        <button
                          onClick={() => {
                            removeItem(item._id);
                            setConfirmRemoveId(null);
                          }}
                          className="flex-1 bg-neutral-100 hover:bg-red-50 hover:text-red-600 text-black text-[10px] uppercase font-bold py-2.5 rounded-none transition-all border-2 border-black"
                        >
                          🗑️ Remove
                        </button>
                        <button
                          onClick={async () => {
                            await toggleFavorite(item.product._id);
                            removeItem(item._id);
                            setConfirmRemoveId(null);
                          }}
                          className="flex-1 bg-black text-white hover:bg-gold hover:text-black text-[10px] uppercase font-bold py-2.5 rounded-none transition-all border-2 border-black"
                        >
                          ❤️ Save to Fav
                        </button>
                      </div>
                      <button
                        onClick={() => setConfirmRemoveId(null)}
                        className="text-[9px] text-neutral-400 hover:text-black hover:underline uppercase tracking-wider font-semibold"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
 
                  {/* Product Thumbnail */}
                  <div className="relative w-20 h-20 bg-neutral-100 rounded-none overflow-hidden flex-shrink-0 border border-neutral-200">
                    {item.product?.images?.[0]?.url && (
                      <ImageWithSkeleton
                        src={item.product.images[0].url}
                        alt={item.product.title}
                        fill
                        className="object-cover"
                      />
                    )}
                  </div>
 
                  {/* Product Info */}
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start gap-2">
                        <h4 className="text-xs font-extrabold text-black uppercase tracking-wider truncate font-display">
                          {item.product?.title}
                        </h4>
                        <button
                          onClick={() => setConfirmRemoveId(item._id)}
                          className="text-black/40 hover:text-red-600 transition-colors"
                        >
                          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                      <p className="text-[10px] text-neutral-400 font-semibold uppercase tracking-wider">SKU: {item.variantSku}</p>
                      <span className="inline-block bg-neutral-100 border border-neutral-200 px-2 py-0.5 rounded-none text-[8.5px] font-extrabold text-neutral-600 mt-1 uppercase tracking-wider">
                        {item.size} / {item.finish}
                      </span>
                    </div>
 
                    {/* Modifiers & Price */}
                    <div className="flex justify-between items-center mt-2">
                      <div className="flex items-center border-2 border-black rounded-none overflow-hidden bg-white">
                        <button
                          onClick={() => updateItem(item._id, Math.max(1, item.quantity - 1))}
                          className="w-6 h-6 hover:bg-neutral-100 text-xs font-bold"
                        >
                          −
                        </button>
                        <span className="w-6 text-center text-xs font-bold">{item.quantity}</span>
                        <button
                          onClick={() => updateItem(item._id, item.quantity + 1)}
                          className="w-6 h-6 hover:bg-neutral-100 text-xs font-bold"
                        >
                          +
                        </button>
                      </div>
                      <p className="text-xs font-extrabold text-black">
                        ₹{item.priceAtAdd * item.quantity}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Drawer Footer */}
            <div className="p-5 border-t-2 border-black bg-white space-y-4 font-display">
              <div className="space-y-2 text-xs text-black/70 font-semibold">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-extrabold text-black">₹{subtotal}</span>
                </div>
                
                {calculations.comboDiscount > 0 && (
                  <div className="flex justify-between text-green-700 font-bold uppercase tracking-wider text-[10px]">
                    <span className="flex items-center gap-1">
                      🎁 Combo Discount
                      {calculations.appliedCombos?.length > 0 && (
                        <span className="text-[8.5px] bg-green-50 border border-green-200 text-green-800 px-1.5 py-0.5 rounded-none font-extrabold">
                          {calculations.appliedCombos[0].title}
                        </span>
                      )}
                    </span>
                    <span>-₹{calculations.comboDiscount}</span>
                  </div>
                )}
 
                {calculations.autoOfferDiscount > 0 && (
                  <div className="flex justify-between text-green-700 font-bold uppercase tracking-wider text-[10px]">
                    <span className="flex items-center gap-1">
                      🎉 Special Offer
                      {calculations.appliedOffers?.length > 0 && (
                        <span className="text-[8.5px] bg-green-50 border border-green-200 text-green-800 px-1.5 py-0.5 rounded-none font-extrabold">
                          {calculations.appliedOffers[0].title}
                        </span>
                      )}
                    </span>
                    <span>-₹{calculations.autoOfferDiscount}</span>
                  </div>
                )}

                {calculations.couponDiscount > 0 && (
                  <div className="flex justify-between text-green-700 font-bold uppercase tracking-wider text-[10px]">
                    <span className="flex items-center gap-1">
                      🎟️ Coupon ({calculations.appliedCouponCode || couponCode})
                    </span>
                    <span>-₹{calculations.couponDiscount}</span>
                  </div>
                )}
 
                <div className="flex justify-between">
                  <span>Shipping Fee</span>
                  <span className="font-extrabold text-black">
                    {calculations.shippingFee === 0 ? "FREE" : `₹${calculations.shippingFee}`}
                  </span>
                </div>
 
                <div className="flex justify-between">
                  <span>GST (18%)</span>
                  <span className="font-extrabold text-black">₹{calculations.tax}</span>
                </div>
              </div>
 
              <div className="flex justify-between items-baseline pt-3 border-t-2 border-black/10">
                <span className="text-black font-extrabold text-xs uppercase tracking-widest">Estimated Total</span>
                <span className="font-extrabold text-xl text-black">₹{calculations.totalAmount}</span>
              </div>
 
              <button
                onClick={() => {
                  setCartDrawerOpen(false);
                  router.push("/checkout");
                }}
                className="w-full bg-black hover:bg-gold hover:text-black text-white py-4 rounded-none font-extrabold border-2 border-black transition-all text-xs tracking-widest uppercase flex items-center justify-center gap-2"
              >
                Checkout Securely (Prepaid) →
              </button>
 
              {/* Trust Banner strip */}
              <div className="flex justify-around items-center pt-3 border-t-2 border-black/10 text-[9.5px] text-neutral-400 font-extrabold uppercase tracking-widest text-center">
                <div>🛡️ Prepaid Only</div>
                <div>🔄 7-day returns</div>
                <div>🔬 100% Authentic</div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
