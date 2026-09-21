"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";
import { toggleWishlist as apiToggleWishlist } from "@/lib/api";

const WishlistContext = createContext(null);

export function WishlistProvider({ children }) {
  const { user } = useAuth();
  const [wishlist, setWishlist] = useState([]);

  // Initialize wishlist based on Auth status
  useEffect(() => {
    if (user) {
      setWishlist(user.wishlist || []);
    } else {
      const localWishlist = localStorage.getItem("mp_wishlist");
      if (localWishlist) {
        try {
          setWishlist(JSON.parse(localWishlist));
        } catch (e) {
          setWishlist([]);
        }
      } else {
        setWishlist([]);
      }
    }
  }, [user]);

  async function toggleFavorite(productId) {
    if (user) {
      try {
        const res = await apiToggleWishlist(productId);
        setWishlist(res.data);
      } catch (err) {
        console.error("Failed to toggle wishlist on server:", err);
      }
    } else {
      // Guest local storage update
      const index = wishlist.indexOf(productId);
      let updated = [...wishlist];
      if (index === -1) {
        updated.push(productId);
      } else {
        updated.splice(index, 1);
      }
      setWishlist(updated);
      localStorage.setItem("mp_wishlist", JSON.stringify(updated));
    }
  }

  function isInWishlist(productId) {
    return wishlist.includes(productId);
  }

  return (
    <WishlistContext.Provider value={{ wishlist, toggleFavorite, isInWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used within WishlistProvider");
  return ctx;
}
