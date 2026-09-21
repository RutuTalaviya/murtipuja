"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import ImageWithSkeleton from "@/components/ImageWithSkeleton";
import { getCategories } from "@/lib/api";

const POPULAR_KEYWORDS = [
  "Diwali Gifts",
  "Ganesha",
  "Brass Diyas",
  "Wedding Return Gifts",
  "Shiva",
  "Durga",
  "Hanuman",
];

export default function SearchModal({ isOpen, onClose }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const inputRef = useRef(null);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    async function loadCategories() {
      try {
        const res = await getCategories();
        const allCategories = res.data || [];
        const randomCategories = [...allCategories]
          .sort(() => 0.5 - Math.random())
          .slice(0, 4);
        setCategories(randomCategories);
      } catch (err) {
        console.error("Failed to load categories in search modal:", err);
      }
    }
    if (isOpen) {
      loadCategories();
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === "Escape") {
        onClose();
      }
    }
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  function handleSearchSubmit(searchVal) {
    if (searchVal.trim()) {
      onClose();
      router.push(`/products?search=${encodeURIComponent(searchVal.trim())}`);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/70 backdrop-blur-sm p-3 sm:p-4 pt-6 sm:pt-12 md:pt-16 overflow-y-auto">
      {/* Backdrop Close Handler */}
      <div className="fixed inset-0" onClick={onClose} />

      {/* Modal Container with Vertical Scroll */}
      <div className="relative bg-white w-full max-w-3xl rounded-none shadow-2xl border border-stone-200 p-4 sm:p-6 md:p-8 z-10 space-y-6 max-h-[88vh] overflow-y-auto no-scrollbar animate-fadeIn my-auto">
        
        {/* Search input header */}
        <div className="relative flex items-center border border-stone-300 bg-neutral-50 rounded-none overflow-hidden focus-within:ring-2 focus-within:ring-gold transition-all">
          <span className="pl-3.5 sm:pl-4 text-black">
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </span>
          <input
            ref={inputRef}
            type="text"
            placeholder="Search drops, deities, occasions..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearchSubmit(query)}
            className="w-full pl-3 pr-10 sm:pr-12 py-3.5 sm:py-4 bg-transparent text-xs sm:text-sm text-black outline-none font-bold uppercase tracking-wider"
          />
          <button
            onClick={onClose}
            className="absolute right-2 sm:right-3 w-8 h-8 rounded-none hover:bg-black hover:text-white flex items-center justify-center text-black font-bold transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Info hints */}
        <div className="flex justify-between items-center text-[10px] text-neutral-400 font-extrabold uppercase tracking-widest px-1">
          <span>⏎ press Enter to search</span>
          <span>ESC to close</span>
        </div>

        {/* Section 1: Popular Keywords */}
        <div className="space-y-2.5">
          <h4 className="text-[10px] uppercase font-extrabold tracking-widest text-black/60">
            ⚡ Popular Searches
          </h4>
          <div className="flex flex-wrap gap-1.5 sm:gap-2">
            {POPULAR_KEYWORDS.map((kw) => (
              <button
                key={kw}
                onClick={() => handleSearchSubmit(kw)}
                className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-none text-[11px] bg-neutral-100 border border-neutral-300 hover:border-black hover:bg-black hover:text-white text-black font-extrabold uppercase tracking-wider transition-all"
              >
                ✦ {kw}
              </button>
            ))}
          </div>
        </div>

        {/* Section 2: Explore Quick Hubs */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            onClick={() => { onClose(); router.push("/products"); }}
            className="bg-neutral-50 hover:bg-black hover:text-white p-4 rounded-none border border-stone-200 text-left transition-all group flex justify-between items-center"
          >
            <div>
              <p className="text-[9px] uppercase tracking-wider text-neutral-400 font-extrabold group-hover:text-gold">Catalog</p>
              <h5 className="font-display font-extrabold text-xs sm:text-sm text-black group-hover:text-white uppercase tracking-wider mt-0.5">All Sculptures</h5>
            </div>
            <span className="text-black group-hover:text-gold group-hover:translate-x-1.5 transition-transform">→</span>
          </button>

          <button
            onClick={() => { onClose(); router.push("/products?purpose=pooja-room"); }}
            className="bg-neutral-50 hover:bg-black hover:text-white p-4 rounded-none border border-stone-200 text-left transition-all group flex justify-between items-center"
          >
            <div>
              <p className="text-[9px] uppercase tracking-wider text-neutral-400 font-extrabold group-hover:text-gold">Sanctum</p>
              <h5 className="font-display font-extrabold text-xs sm:text-sm text-black group-hover:text-white uppercase tracking-wider mt-0.5">Pooja Essentials</h5>
            </div>
            <span className="text-black group-hover:text-gold group-hover:translate-x-1.5 transition-transform">→</span>
          </button>

          <button
            onClick={() => { onClose(); router.push("/track-order"); }}
            className="bg-neutral-50 hover:bg-black hover:text-white p-4 rounded-none border border-stone-200 text-left transition-all group flex justify-between items-center"
          >
            <div>
              <p className="text-[9px] uppercase tracking-wider text-neutral-400 font-extrabold group-hover:text-gold">Logistics</p>
              <h5 className="font-display font-extrabold text-xs sm:text-sm text-black group-hover:text-white uppercase tracking-wider mt-0.5">Track Order</h5>
            </div>
            <span className="text-black group-hover:text-gold group-hover:translate-x-1.5 transition-transform">→</span>
          </button>
        </div>

        {/* Section 3: Featured Categories */}
        <div className="space-y-3 pt-2">
          <h4 className="text-[10px] uppercase font-extrabold tracking-widest text-black/60">
            ⭐ Featured Collections
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {categories.length > 0 ? (
              categories.map((cat) => {
                const image = cat.slug === "shiva" ? "/images/shiva.png" : "/images/ganesh.png";
                return (
                  <button
                    key={cat._id}
                    onClick={() => {
                      onClose();
                      router.push(`/products?category=${encodeURIComponent(cat.name)}`);
                    }}
                    className="group text-center space-y-2 focus:outline-none border border-neutral-200 hover:border-black p-2 bg-neutral-50 transition-colors"
                  >
                    <div className="relative aspect-square w-full bg-white rounded-none overflow-hidden border border-neutral-200">
                      <ImageWithSkeleton
                        src={image}
                        alt={cat.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <p className="text-[11px] font-extrabold text-black uppercase tracking-wider truncate">
                      {cat.name}
                    </p>
                  </button>
                );
              })
            ) : (
              <span className="text-xs text-neutral-400 font-semibold px-1">Loading collections...</span>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
