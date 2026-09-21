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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isCartDrawerOpen, setCartDrawerOpen] = useState(false);

  const refreshCart = useCallback(async (code = couponCode) => {
    try {
      const res = await apiGetCart(code);
      setCart(res.data);
      if (code && res.data.calculations?.appliedCouponCode) {
        setCouponCodeState(res.data.calculations.appliedCouponCode);
      }
    } catch (err) {
      console.error("Failed to load cart", err);
    } finally {
      setLoading(false);
    }
  }, [couponCode]);

  useEffect(() => {
    refreshCart();
  }, []);

  async function addItem(productId, variantSku, quantity = 1) {
    setError("");
    try {
      const res = await apiAddToCart(productId, variantSku, quantity, couponCode);
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
      const res = await apiUpdateCartItem(itemId, quantity, couponCode);
      setCart(res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Could not update quantity");
    }
  }

  async function removeItem(itemId) {
    try {
      const res = await apiRemoveCartItem(itemId, couponCode);
      setCart(res.data);
    } catch (err) {
      console.error("Failed to remove item", err);
    }
  }

  async function applyCoupon(code) {
    setError("");
    try {
      const res = await apiGetCart(code);
      setCart(res.data);
      setCouponCodeState(code);
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
      const res = await apiGetCart("");
      setCart(res.data);
    } catch (err) {
      console.error("Failed to remove coupon", err);
    }
  }

  const clearCart = () => {
    setCart({ items: [] });
    setCouponCodeState("");
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
        addItem,
        updateItem,
        removeItem,
        applyCoupon,
        removeCoupon,
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
