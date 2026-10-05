"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import {
  getCart as apiGetCart,
  addToCart as apiAddToCart,
  updateCartItem as apiUpdateCartItem,
  removeCartItem as apiRemoveCartItem,
} from "@/lib/api";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [cart, setCart] = useState({ items: [] });
  const [couponCode, setCouponCodeState] = useState("");
  const [appliedOfferId, setAppliedOfferIdState] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isCartDrawerOpen, setCartDrawerOpen] = useState(false);

  const refreshCart = useCallback(async (code = couponCode, offerId = appliedOfferId) => {
    try {
      const res = await apiGetCart(code, offerId);
      setCart(res.data);
      if (res.data.calculations?.appliedCouponCode) {
        setCouponCodeState(res.data.calculations.appliedCouponCode);
      }
      if (res.data.calculations?.appliedOfferId) {
        setAppliedOfferIdState(res.data.calculations.appliedOfferId);
      }
    } catch (err) {
      console.error("Failed to load cart", err);
    } finally {
      setLoading(false);
    }
  }, [couponCode, appliedOfferId]);

  useEffect(() => {
    refreshCart();
  }, []);

  async function addItem(productId, variantSku, quantity = 1) {
    setError("");
    try {
      const res = await apiAddToCart(productId, variantSku, quantity, couponCode, appliedOfferId);
      setCart(res.data);
      setCartDrawerOpen(true); // Auto-open cart drawer on success
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.message || "Could not add item to cart";
      setError(message);
      return { success: false, message };
    }
  }

  async function updateItem(itemId, quantity) {
    setError("");
    try {
      const res = await apiUpdateCartItem(itemId, quantity, couponCode, appliedOfferId);
      setCart(res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Could not update quantity");
    }
  }

  async function removeItem(itemId) {
    try {
      const res = await apiRemoveCartItem(itemId, couponCode, appliedOfferId);
      setCart(res.data);
    } catch (err) {
      console.error("Failed to remove item", err);
    }
  }

  // Strictly ONLY 1 offer policy: Applying a coupon clears any applied special offer
  async function applyCoupon(code) {
    setError("");
    try {
      const res = await apiGetCart(code, "");
      setCart(res.data);
      setCouponCodeState(code);
      setAppliedOfferIdState("");
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.message || "Invalid or expired coupon code";
      setError(message);
      return { success: false, message };
    }
  }

  async function removeCoupon() {
    setCouponCodeState("");
    try {
      const res = await apiGetCart("", appliedOfferId);
      setCart(res.data);
    } catch (err) {
      console.error("Failed to remove coupon", err);
    }
  }

  // Strictly ONLY 1 offer policy: Applying a special offer clears any applied coupon code
  async function applySpecialOffer(offerId) {
    setError("");
    try {
      const res = await apiGetCart("", offerId);
      setCart(res.data);
      setAppliedOfferIdState(offerId);
      setCouponCodeState("");
      return { success: true };
    } catch (err) {
      const message = err.response?.data?.message || "Could not apply special offer";
      setError(message);
      return { success: false, message };
    }
  }

  async function removeSpecialOffer() {
    setAppliedOfferIdState("");
    try {
      const res = await apiGetCart(couponCode, "");
      setCart(res.data);
    } catch (err) {
      console.error("Failed to remove special offer", err);
    }
  }

  const clearCart = () => {
    setCart({ items: [] });
    setCouponCodeState("");
    setAppliedOfferIdState("");
  };

  const itemCount = cart.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;
  
  // calculations object from server
  const calculations = cart.calculations || {
    subtotal: cart.items?.reduce((sum, item) => sum + item.priceAtAdd * item.quantity, 0) || 0,
    comboDiscount: 0,
    autoOfferDiscount: 0,
    couponDiscount: 0,
    totalDiscount: 0,
    taxableAmount: 0,
    tax: 0,
    shippingFee: 0,
    totalAmount: 0,
    appliedCombos: [],
    appliedOffers: [],
    appliedOfferId: "",
    appliedCouponCode: "",
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        loading,
        error,
        itemCount,
        subtotal: calculations.subtotal,
        calculations,
        couponCode,
        appliedOfferId,
        addItem,
        updateItem,
        removeItem,
        applyCoupon,
        removeCoupon,
        applySpecialOffer,
        removeSpecialOffer,
        refreshCart,
        clearCart,
        isCartDrawerOpen,
        setCartDrawerOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}

