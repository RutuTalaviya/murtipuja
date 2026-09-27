"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import SearchModal from "./SearchModal";
import api, { getCategories, getCategoryTree, getNavMenu, getActiveCoupons, getActiveOffers } from "@/lib/api";

export default function Navbar() {
  const pathname = usePathname();
  const { itemCount, setCartDrawerOpen } = useCart();
  const { user, logout, openLoginModal } = useAuth();
  const [isSearchOpen, setSearchOpen] = useState(false);
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);

  // User Account Popover Dropdown state & ref
  const [isUserMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);

  // Dynamic Navigation & Dropdown states (handled 100% from backend)
  const [navItems, setNavItems] = useState([]);
  const [activeDropdownId, setActiveDropdownId] = useState(null);
  const [categories, setCategories] = useState([]);
  const [isLogoutConfirmOpen, setLogoutConfirmOpen] = useState(false);
  const [openMobileAccordions, setOpenMobileAccordions] = useState({});

  // Close User Menu on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, []);

  // Fetch categories with nested subcategories dynamically from backend
  useEffect(() => {
    async function loadNavAndCategories() {
      try {
        const [treeRes, catRes, navRes] = await Promise.allSettled([
          getCategoryTree(),
          getCategories(),
          getNavMenu(),
        ]);

        let dynamicItems = [];

        if (treeRes.status === "fulfilled" && Array.isArray(treeRes.value?.data) && treeRes.value.data.length > 0) {
          const categoryTree = treeRes.value.data;
          setCategories(categoryTree);

          // Build dynamic navigation directly from categories & subcategories
          dynamicItems.push({
            _id: "nav-all",
            title: "All Murtis",
            url: "/products",
            isDropdown: false,
          });

          categoryTree.forEach((cat) => {
            const hasSubs = cat.subcategories && cat.subcategories.length > 0;
            dynamicItems.push({
              _id: cat._id,
              title: cat.name,
              url: `/products?category=${encodeURIComponent(cat.slug || cat.name)}`,
              isDropdown: hasSubs,
              dropdownType: "subcategories",
              subcategories: hasSubs
                ? cat.subcategories.map((sub) => ({
                    _id: sub._id,
                    title: sub.name,
                    url: `/products?category=${encodeURIComponent(cat.slug || cat.name)}&subCategory=${encodeURIComponent(sub.slug || sub.name)}`,
                  }))
                : [],
            });
          });

          // Append quick tags / curated highlights
          dynamicItems.push({
            _id: "nav-bestsellers",
            title: "Bestsellers",
            url: "/products?tag=Bestseller",
            badge: "HOT",
            isDropdown: false,
          });
          dynamicItems.push({
            _id: "nav-offers",
            title: "Sale",
            url: "/products?onsale=true",
            badge: "OFFER",
            isDropdown: false,
          });

          setNavItems(dynamicItems);
        } else if (navRes.status === "fulfilled") {
          // Fallback to nav menu collection if tree is empty
          const items = navRes.value?.data?.data || navRes.value?.data;
          if (Array.isArray(items) && items.length > 0) {
            setNavItems(items.filter((item) => item.isActive !== false));
          }
        }

        if (catRes.status === "fulfilled" && catRes.value?.data) {
          const catList = catRes.value.data?.data || catRes.value.data;
          if (Array.isArray(catList)) {
            setCategories((prev) => (prev.length > 0 ? prev : catList));
          }
        }
      } catch (err) {
        console.error("Failed to load nav/categories in navbar:", err);
      }
    }
    loadNavAndCategories();
  }, []);

  const toggleMobileAccordion = (id) => {
    setOpenMobileAccordions((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // Dynamic Offers & Announcement State
  const [offersList, setOffersList] = useState([
    { type: "general", text: "⚡ FESTIVE OFFER: EXPLORE PRECISION 3D HANDCRAFTED DIVINE IDOLS ⚡", link: "/products" },
    { type: "shipping", text: "🚚 100% FREE SHIPPING & INSURED DISPATCH ON ALL ORDERS ACROSS INDIA", link: "/products" },
  ]);
  const [activeOfferIdx, setActiveOfferIdx] = useState(0);
  const [copiedCode, setCopiedCode] = useState("");

  // Fetch active coupons & offers dynamically for the top bar
  useEffect(() => {
    async function loadOffers() {
      try {
        const [couponsRes, offersRes] = await Promise.allSettled([
          getActiveCoupons(),
          getActiveOffers(),
        ]);

        const items = [];

        // 1. Coupons (Promo codes with discount)
        if (couponsRes.status === "fulfilled" && Array.isArray(couponsRes.value?.data)) {
          couponsRes.value.data.forEach((c) => {
            const discount = c.discountType === "percentage" ? `${c.discountValue}% OFF` : `₹${c.discountValue} FLAT OFF`;
            const minCond = c.minOrderValue > 0 ? ` on orders above ₹${c.minOrderValue}` : "";
            items.push({
              type: "coupon",
              code: c.code,
              text: `🎟️ USE PROMO CODE "${c.code}": GET ${discount}${minCond}`,
              link: "/products",
            });
          });
        }

        // 2. Special Store Offers
        if (offersRes.status === "fulfilled" && Array.isArray(offersRes.value?.data)) {
          offersRes.value.data.forEach((o) => {
            const discount = o.discountType === "percentage" ? `${o.discountValue}% OFF` : `₹${o.discountValue} FLAT OFF`;
            const minCond = o.minOrderValue > 0 ? ` on orders above ₹${o.minOrderValue}` : "";
            const deityCond = o.applicableDeity ? ` on ${o.applicableDeity} Idols` : "";
            items.push({
              type: "offer",
              text: `🎉 SPECIAL OFFER: ${o.title} — GET ${discount}${deityCond}${minCond} (AUTO APPLIED)`,
              link: "/products",
            });
          });
        }

        // 3. Always include standard shipping offer
        items.push({
          type: "shipping",
          text: "🚚 100% FREE SHIPPING & SECURE INSURED DISPATCH ON ALL ORDERS ACROSS INDIA",
          link: "/products",
        });

        if (items.length > 0) {
          setOffersList(items);
        }
      } catch (err) {
        console.error("Failed to load offers in navbar top bar:", err);
      }
    }
    loadOffers();
  }, []);

  // Timing for offers rotation
  useEffect(() => {
    if (offersList.length <= 1) return;
    const timer = setInterval(() => {
      setActiveOfferIdx((prev) => (prev + 1) % offersList.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [offersList.length]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMobileMenuOpen]);

  return (
    <div className="sticky top-0 z-40 w-full flex flex-col font-display">
      {/* 1. TOP OFFERS BANNER (Orange Background) */}
      <div className="bg-[#FF5722] text-white text-[9.5px] md:text-[11px] uppercase tracking-wider font-extrabold h-[36px] flex items-center justify-between px-3 md:px-8 border-b border-black/20 shadow-xs relative overflow-hidden select-none">
        {/* Prev Arrow */}
        <button
          type="button"
          onClick={() => setActiveOfferIdx((prev) => (prev - 1 + offersList.length) % offersList.length)}
          className="z-10 p-1 hover:bg-black/20 text-white/90 hover:text-white transition-colors rounded"
          aria-label="Previous Offer"
        >
          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </button>

        {/* Center Rotating Offers List */}
        <div className="relative flex-1 h-full flex items-center justify-center overflow-hidden mx-2">
          {offersList.map((offer, index) => (
            <div
              key={index}
              className={`absolute inset-0 flex items-center justify-center gap-2 transition-all duration-500 ease-in-out px-2 text-center truncate ${
                index === activeOfferIdx
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 -translate-y-3 pointer-events-none"
              }`}
            >
              <Link
                href={offer.link || "/products"}
                className="hover:underline flex items-center gap-2 truncate max-w-[80vw] md:max-w-[70vw]"
              >
                <span className="truncate">{offer.text}</span>
                <span className="hidden sm:inline-block bg-white text-[#FF5722] text-[8.5px] px-1.5 py-0.5 font-black uppercase tracking-widest rounded-none border border-black/10 flex-shrink-0">
                  Shop Now →
                </span>
              </Link>

              {offer.code && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigator.clipboard.writeText(offer.code);
                    setCopiedCode(offer.code);
                    setTimeout(() => setCopiedCode(""), 2000);
                  }}
                  className="bg-black text-white hover:bg-white hover:text-black border border-white/40 text-[8px] md:text-[9px] font-black px-1.5 py-0.5 uppercase tracking-wider rounded-none transition-all flex-shrink-0"
                  title="Click to copy coupon code"
                >
                  {copiedCode === offer.code ? "✓ Copied!" : "Copy Code"}
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Next Arrow */}
        <button
          type="button"
          onClick={() => setActiveOfferIdx((prev) => (prev + 1) % offersList.length)}
          className="z-10 p-1 hover:bg-black/20 text-white/90 hover:text-white transition-colors rounded"
          aria-label="Next Offer"
        >
          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
          </svg>
        </button>
      </div>

      {/* 2. Main Header Band */}
      <header className="bg-white border-b-2 border-black px-4 md:px-8 lg:px-10 py-3.5 md:py-4 w-full">
        <div className="w-full flex justify-between items-center">

          {/* Left: Mobile Hamburger & Brand Logo */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Hamburger Button (Mobile Only) */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-1.5 text-black hover:text-gold transition-colors"
              aria-label="Open Menu"
            >
              <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            {/* Brand Logo */}
            <Link href="/" className="flex items-center gap-2 group flex-shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/logo.png"
                alt="MURTIPUJA"
                className="h-6 sm:h-7 md:h-8 w-auto object-contain mix-blend-multiply transition-opacity hover:opacity-80"
              />
            </Link>
          </div>

          {/* Center: Desktop Navigation Links (Fully Dynamic with Orange Hover & Active Highlight) */}
          <nav className="hidden md:flex items-center gap-6 lg:gap-8 text-[11.5px] font-bold uppercase tracking-widest text-neutral-600">
            {navItems.map((item) => {
              const isItemActive =
                item.url &&
                item.url !== "#" &&
                (pathname === item.url || (item.url !== "/" && pathname?.startsWith(item.url)));

              if (item.isDropdown) {
                const isCatDropdown = item.dropdownType === "categories";
                const isSubItemsDropdown = item.subItems && item.subItems.length > 0;
                const isItemDropdownOpen = activeDropdownId === item._id;

                return (
                  <div
                    key={item._id}
                    className="relative py-2 cursor-pointer"
                    onMouseEnter={() => setActiveDropdownId(item._id)}
                    onMouseLeave={() => setActiveDropdownId(null)}
                  >
                    <button
                      className={`flex items-center gap-1 transition-colors uppercase ${
                        isItemDropdownOpen || isItemActive
                          ? "text-orange-600 font-black"
                          : "text-neutral-700 hover:text-orange-500 font-bold"
                      }`}
                    >
                      <span>{item.title}</span>
                      {item.badge && (
                        <span className="bg-orange-500 text-white text-[8px] font-extrabold px-1.5 py-0.5 border border-black shadow-sm">
                          {item.badge}
                        </span>
                      )}
                      <svg
                        width="10"
                        height="10"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="3"
                        className={`transition-transform duration-300 ${
                          isItemDropdownOpen ? "rotate-180 text-orange-500" : ""
                        }`}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                      </svg>
                    </button>

                    {/* Dropdown Menu */}
                    {isItemDropdownOpen && (
                      <div className="absolute top-full left-0 mt-1 w-60 bg-white border-2 border-black py-2 z-50 normal-case font-medium animate-fadeIn shadow-2xl">
                        {item.subcategories && item.subcategories.length > 0 ? (
                          <>
                            <Link
                              href={item.url || "/products"}
                              className="flex items-center justify-between px-4 py-2 hover:bg-orange-500 hover:text-white text-black text-xs font-black transition-colors uppercase tracking-wider bg-neutral-50 border-b border-black/10"
                            >
                              <span>All {item.title}</span>
                              <span className="text-sm font-bold">→</span>
                            </Link>
                            {item.subcategories.map((sub) => (
                              <Link
                                key={sub._id}
                                href={sub.url}
                                className="block px-4 py-2 hover:bg-orange-500 hover:text-white text-black text-xs font-bold transition-colors uppercase tracking-wider"
                              >
                                {sub.title}
                              </Link>
                            ))}
                          </>
                        ) : isCatDropdown ? (
                          <>
                            {categories.length > 0 ? (
                              categories.slice(0, 8).map((cat) => (
                                <Link
                                  key={cat._id}
                                  href={`/products?category=${encodeURIComponent(cat.slug || cat.name)}`}
                                  className="block px-4 py-2 hover:bg-orange-500 hover:text-white text-black text-xs font-bold transition-colors uppercase tracking-wider"
                                >
                                  {cat.name}
                                </Link>
                              ))
                            ) : (
                              <span className="block px-4 py-2 text-neutral-400 text-xs font-semibold">Loading...</span>
                            )}
                            <div className="h-[2px] bg-black my-1" />
                            <Link
                              href="/products"
                              className="flex items-center justify-between px-4 py-2.5 bg-neutral-50 hover:bg-orange-500 hover:text-white text-black font-extrabold text-xs transition-colors uppercase tracking-wider"
                            >
                              <span>View All Categories</span>
                              <span className="text-sm font-bold">→</span>
                            </Link>
                          </>
                        ) : isSubItemsDropdown ? (
                          item.subItems.map((sub, idx) => (
                            <Link
                              key={sub._id || idx}
                              href={sub.url || "#"}
                              className="flex items-center justify-between px-4 py-2 hover:bg-orange-500 hover:text-white text-black text-xs font-bold transition-colors uppercase tracking-wider"
                            >
                              <span>{sub.title}</span>
                              {sub.badge && (
                                <span className="bg-orange-500 text-white text-[7.5px] font-extrabold px-1 py-0.2 border border-black">
                                  {sub.badge}
                                </span>
                              )}
                            </Link>
                          ))
                        ) : (
                          <Link
                            href={item.url || "/products"}
                            className="block px-4 py-2 hover:bg-orange-500 hover:text-white text-black text-xs font-bold transition-colors uppercase tracking-wider"
                          >
                            Explore {item.title}
                          </Link>
                        )}
                      </div>
                    )}
                  </div>
                );
              }

              // Normal link with Orange Hover and Active Highlight
              return (
                <Link
                  key={item._id}
                  href={item.url || "#"}
                  className={`relative flex items-center gap-1 transition-colors py-2 uppercase tracking-widest ${
                    isItemActive
                      ? "text-orange-600 font-black border-b-2 border-orange-500 -mb-[2px]"
                      : "text-neutral-700 hover:text-orange-500 font-bold"
                  }`}
                >
                  <span>{item.title}</span>
                  {item.badge && (
                    <span className="bg-orange-500 text-white text-[8px] font-extrabold px-1.5 py-0.5 border border-black shadow-sm">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right: Controls & Utilities */}
          <div className="flex items-center gap-1 sm:gap-2 md:gap-3 text-sm font-semibold">

            {/* Search Trigger Icon */}
            <button
              onClick={() => setSearchOpen(true)}
              className="p-2 text-black/80 hover:text-orange-500 hover:bg-orange-50 rounded-full transition-colors"
              aria-label="Search"
            >
              <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
            </button>

            {/* User Account Dropdown Menu */}
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setUserMenuOpen((prev) => !prev)}
                className={`p-2 transition-colors rounded-full flex items-center justify-center ${
                  isUserMenuOpen
                    ? "text-orange-600 bg-orange-50 ring-1 ring-orange-400"
                    : "text-black/80 hover:text-orange-500 hover:bg-orange-50"
                }`}
                aria-label="Account Menu"
                aria-expanded={isUserMenuOpen}
              >
                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                </svg>
              </button>

              {/* Popover Dropdown Card */}
              {isUserMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-[280px] sm:w-[320px] bg-white border-2 border-black shadow-2xl p-5 sm:p-6 z-50 text-left animate-fadeIn font-sans">
                  {!user ? (
                    <>
                      {/* Welcome Section */}
                      <h3 className="font-bold text-neutral-900 text-base sm:text-lg tracking-tight">
                        Welcome
                      </h3>
                      <p className="text-xs sm:text-[13px] text-neutral-500 font-medium mt-1 mb-4 leading-relaxed">
                        To access account and manage orders
                      </p>

                      {/* Vibrant Orange LOGIN / SIGNUP Button (Opens Comet-style Modal) */}
                      <button
                        type="button"
                        onClick={() => {
                          setUserMenuOpen(false);
                          openLoginModal();
                        }}
                        className="block w-full bg-orange-500 hover:bg-orange-600 text-white font-extrabold text-xs sm:text-sm py-3 px-4 text-center tracking-wider transition-colors shadow-sm uppercase font-sans border-2 border-orange-500 hover:border-orange-600 cursor-pointer"
                      >
                        LOGIN / SIGNUP
                      </button>

                      {/* Divider */}
                      <div className="h-[1px] bg-neutral-200 my-4" />

                      {/* Menu Navigation Links */}
                      <nav className="space-y-2.5 text-xs sm:text-sm font-bold text-neutral-800">
                        <Link
                          href="/track-order"
                          onClick={() => setUserMenuOpen(false)}
                          className="block hover:text-orange-500 hover:translate-x-1 transition-all py-0.5"
                        >
                          Track your Order
                        </Link>
                        <Link
                          href="/return-and-exchange"
                          onClick={() => setUserMenuOpen(false)}
                          className="block hover:text-orange-500 hover:translate-x-1 transition-all py-0.5"
                        >
                          File Return / Exchange
                        </Link>
                        <Link
                          href="/track-return"
                          onClick={() => setUserMenuOpen(false)}
                          className="block hover:text-orange-500 hover:translate-x-1 transition-all py-0.5"
                        >
                          Track Return Status
                        </Link>
                        <Link
                          href="/refund-policy"
                          onClick={() => setUserMenuOpen(false)}
                          className="block hover:text-orange-500 hover:translate-x-1 transition-all py-0.5"
                        >
                          Return Policy & Rules
                        </Link>
                        <Link
                          href="/about"
                          onClick={() => setUserMenuOpen(false)}
                          className="block hover:text-orange-500 hover:translate-x-1 transition-all py-0.5"
                        >
                          About Us
                        </Link>
                        <Link
                          href="/contact"
                          onClick={() => setUserMenuOpen(false)}
                          className="block hover:text-orange-500 hover:translate-x-1 transition-all py-0.5"
                        >
                          Contact Us
                        </Link>
                        <Link
                          href="/faqs"
                          onClick={() => setUserMenuOpen(false)}
                          className="block hover:text-orange-500 hover:translate-x-1 transition-all py-0.5"
                        >
                          FAQ
                        </Link>
                      </nav>
                    </>
                  ) : (
                    <>
                      {/* Logged-In User Details */}
                      <div className="flex items-center justify-between">
                        <h3 className="font-bold text-neutral-900 text-base tracking-tight truncate">
                          Welcome, <span className="text-black font-extrabold">{user.name || "Devotee"}</span>
                        </h3>
                        {user.role === "admin" && (
                          <span className="bg-orange-500 text-white text-[8.5px] font-extrabold px-1.5 py-0.5 uppercase tracking-wider ml-1">
                            Admin
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-neutral-500 font-medium mt-0.5 mb-3.5 truncate">
                        {user.email || user.phone || "Logged in"}
                      </p>

                      {/* Action Button */}
                      <Link
                        href="/account/orders"
                        onClick={() => setUserMenuOpen(false)}
                        className="block w-full bg-orange-500 hover:bg-orange-600 text-white font-extrabold text-xs sm:text-sm py-3 px-4 text-center tracking-wider transition-colors shadow-sm uppercase font-sans mb-3 border-2 border-orange-500 hover:border-orange-600"
                      >
                        MY ORDERS
                      </Link>

                      {/* Divider */}
                      <div className="h-[1px] bg-neutral-200 my-3" />

                      {/* Menu Navigation Links */}
                      <nav className="space-y-2 text-xs sm:text-sm font-bold text-neutral-800">
                        {user.role === "admin" && (
                          <Link
                            href="/admin"
                            onClick={() => setUserMenuOpen(false)}
                            className="block bg-neutral-900 hover:bg-orange-500 hover:text-white text-white py-2 px-3 text-xs font-extrabold uppercase tracking-wider flex items-center justify-between mb-2.5 transition-colors shadow-sm"
                          >
                            <span>Admin Panel</span>
                            <span>⚡</span>
                          </Link>
                        )}
                        <Link
                          href="/account/orders"
                          onClick={() => setUserMenuOpen(false)}
                          className="block hover:text-orange-500 hover:translate-x-1 transition-all py-0.5"
                        >
                          My Orders & History
                        </Link>
                        <Link
                          href="/track-order"
                          onClick={() => setUserMenuOpen(false)}
                          className="block hover:text-orange-500 hover:translate-x-1 transition-all py-0.5"
                        >
                          Track your Order
                        </Link>
                        <Link
                          href="/return-and-exchange"
                          onClick={() => setUserMenuOpen(false)}
                          className="block hover:text-orange-500 hover:translate-x-1 transition-all py-0.5"
                        >
                          File Return / Exchange
                        </Link>
                        <Link
                          href="/track-return"
                          onClick={() => setUserMenuOpen(false)}
                          className="block hover:text-orange-500 hover:translate-x-1 transition-all py-0.5"
                        >
                          Track Return Status
                        </Link>
                        <Link
                          href="/refund-policy"
                          onClick={() => setUserMenuOpen(false)}
                          className="block hover:text-orange-500 hover:translate-x-1 transition-all py-0.5"
                        >
                          Return Policy & Rules
                        </Link>
                        <Link
                          href="/about"
                          onClick={() => setUserMenuOpen(false)}
                          className="block hover:text-orange-500 hover:translate-x-1 transition-all py-0.5"
                        >
                          About Us
                        </Link>
                        <Link
                          href="/contact"
                          onClick={() => setUserMenuOpen(false)}
                          className="block hover:text-orange-500 hover:translate-x-1 transition-all py-0.5"
                        >
                          Contact Us
                        </Link>
                        <Link
                          href="/faqs"
                          onClick={() => setUserMenuOpen(false)}
                          className="block hover:text-orange-500 hover:translate-x-1 transition-all py-0.5"
                        >
                          FAQ
                        </Link>
                      </nav>

                      {/* Divider */}
                      <div className="h-[1px] bg-neutral-200 my-3" />

                      {/* Logout Trigger */}
                      <button
                        onClick={() => {
                          setUserMenuOpen(false);
                          setLogoutConfirmOpen(true);
                        }}
                        className="w-full text-left text-xs font-extrabold text-red-600 hover:text-red-700 uppercase tracking-wider py-1 flex items-center justify-between group cursor-pointer"
                      >
                        <span>Log Out</span>
                        <span className="group-hover:translate-x-1 transition-transform">→</span>
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Slide-out Cart Trigger (Icon with Orange Hover & Top-Right Count Badge) */}
            <button
              onClick={() => setCartDrawerOpen(true)}
              className="relative p-2 text-black hover:text-orange-500 hover:bg-orange-50 rounded-full transition-colors flex items-center justify-center cursor-pointer"
              aria-label="Cart Bag"
            >
              <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
              </svg>
              {itemCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-orange-500 text-white text-[9px] font-extrabold w-4 h-4 rounded-full flex items-center justify-center border border-white shadow-sm pointer-events-none">
                  {itemCount}
                </span>
              )}
            </button>

          </div>
        </div>
      </header>

      {/* Mobile Hamburger Slide-out Drawer */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          {/* Backdrop */}
          <div
            onClick={() => setMobileMenuOpen(false)}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300"
          />

          {/* Drawer Menu Body */}
          <div className="relative w-72 max-w-[85vw] h-full bg-white border-r-2 border-black flex flex-col z-10 animate-slide-right">
            {/* Header of Drawer */}
            <div className="p-4 border-b-2 border-black flex items-center justify-between">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/logo.png"
                alt="MURTIPUJA"
                className="h-6 w-auto object-contain mix-blend-multiply"
              />
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="w-8 h-8 rounded-none border border-black hover:bg-orange-500 hover:text-white hover:border-orange-500 flex items-center justify-center text-black transition-colors cursor-pointer"
              >
                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Drawer Navigation Links (Dynamic with Orange Highlight) */}
            <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
              {navItems.map((item) => {
                const isItemActive =
                  item.url &&
                  item.url !== "#" &&
                  (pathname === item.url || (item.url !== "/" && pathname?.startsWith(item.url)));

                if (item.isDropdown) {
                  const isCatDropdown = item.dropdownType === "categories";
                  const isSubItemsDropdown = item.subItems && item.subItems.length > 0;
                  const isAccordionOpen = Boolean(openMobileAccordions[item._id]);

                  return (
                    <div key={item._id} className="space-y-1">
                      <button
                        onClick={() => toggleMobileAccordion(item._id)}
                        className={`w-full flex justify-between items-center text-xs font-bold uppercase tracking-wider py-2 transition-all ${
                          isAccordionOpen || isItemActive
                            ? "text-orange-600 font-extrabold"
                            : "text-black hover:text-orange-500"
                        }`}
                      >
                        <span className="flex items-center gap-1.5">
                          <span>{item.title}</span>
                          {item.badge && (
                            <span className="bg-orange-500 text-white text-[7.5px] font-extrabold px-1 py-0.2 border border-black">
                              {item.badge}
                            </span>
                          )}
                        </span>
                        <svg
                          width="12"
                          height="12"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="3"
                          className={`transition-transform duration-300 ${
                            isAccordionOpen ? "rotate-180 text-orange-500" : ""
                          }`}
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                        </svg>
                      </button>

                      {isAccordionOpen && (
                        <div className="pl-4 space-y-2.5 pt-1.5 border-l-2 border-orange-200 ml-1 animate-fadeIn">
                          {item.subcategories && item.subcategories.length > 0 ? (
                            <>
                              <Link
                                href={item.url || "/products"}
                                onClick={() => setMobileMenuOpen(false)}
                                className="block text-xs font-black text-orange-600 hover:text-black uppercase tracking-wider py-0.5 border-b border-neutral-100 pb-1"
                              >
                                All {item.title} →
                              </Link>
                              {item.subcategories.map((sub) => (
                                <Link
                                  key={sub._id}
                                  href={sub.url}
                                  onClick={() => setMobileMenuOpen(false)}
                                  className="block text-xs text-black/80 hover:text-orange-500 transition-colors uppercase tracking-wider py-0.5"
                                >
                                  {sub.title}
                                </Link>
                              ))}
                            </>
                          ) : isCatDropdown ? (
                            <>
                              {categories.length > 0 ? (
                                categories.slice(0, 8).map((cat) => (
                                  <Link
                                    key={cat._id}
                                    href={`/products?category=${encodeURIComponent(cat.slug || cat.name)}`}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="block text-xs text-black/80 hover:text-orange-500 transition-colors uppercase tracking-wider py-0.5"
                                  >
                                    {cat.name}
                                  </Link>
                                ))
                              ) : (
                                <span className="block text-xs text-black/40 font-semibold">Loading...</span>
                              )}
                              <div className="h-[1px] bg-neutral-200 my-1" />
                              <Link
                                href="/products"
                                onClick={() => setMobileMenuOpen(false)}
                                className="flex items-center justify-between text-xs text-black font-extrabold hover:text-orange-500 transition-colors uppercase tracking-wider py-1"
                              >
                                <span>View All Categories</span>
                                <span>→</span>
                              </Link>
                            </>
                          ) : isSubItemsDropdown ? (
                            item.subItems.map((sub, idx) => (
                              <Link
                                key={sub._id || idx}
                                href={sub.url || "#"}
                                onClick={() => setMobileMenuOpen(false)}
                                className="flex items-center justify-between text-xs text-black/80 hover:text-orange-500 transition-colors uppercase tracking-wider"
                              >
                                <span>{sub.title}</span>
                                {sub.badge && (
                                  <span className="bg-orange-500 text-white text-[7px] font-bold px-1 py-0.2 border border-black">
                                    {sub.badge}
                                  </span>
                                )}
                              </Link>
                            ))
                          ) : (
                            <Link
                              href={item.url || "/products"}
                              onClick={() => setMobileMenuOpen(false)}
                              className="block text-xs text-black/80 hover:text-orange-500 transition-colors uppercase tracking-wider"
                            >
                              Explore {item.title}
                            </Link>
                          )}
                        </div>
                      )}
                    </div>
                  );
                }

                // Simple Nav Link
                return (
                  <Link
                    key={item._id}
                    href={item.url || "#"}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center justify-between text-xs font-bold uppercase tracking-wider py-2 transition-colors ${
                      isItemActive
                        ? "text-orange-600 font-extrabold border-l-2 border-orange-500 pl-2"
                        : "text-black hover:text-orange-500"
                    }`}
                  >
                    <span>{item.title}</span>
                    {item.badge && (
                      <span className="bg-orange-500 text-white text-[7.5px] font-extrabold px-1.5 py-0.5 border border-black uppercase">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}

              {/* Support & Account details in mobile drawer */}
              <div className="pt-6 border-t-2 border-black space-y-4">
                <div className="space-y-1">
                  <p className="text-[10px] uppercase font-bold tracking-widest text-black font-extrabold">Need Help?</p>
                  <p className="text-xs flex flex-wrap gap-1 text-black/70">
                    <span>Call:</span>
                    <a href="tel:+917990138678" className="font-semibold text-black hover:text-orange-500 underline">
                      +91 79901 38678
                    </a>
                  </p>
                  <p className="text-xs text-black/70 truncate">
                    <span>Email: </span>
                    <a href="mailto:support@murtipuja.com" className="hover:text-orange-500 underline">
                      support@murtipuja.com
                    </a>
                  </p>
                </div>

                <div className="pt-2 flex flex-col gap-2">
                  <Link
                    href="/track-order"
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-xs font-extrabold uppercase tracking-wider text-black hover:text-orange-500"
                  >
                    Track Shipment →
                  </Link>
                </div>

                {user ? (
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      setLogoutConfirmOpen(true);
                    }}
                    className="w-full text-left text-xs font-bold text-red-600 hover:text-red-700 uppercase tracking-wider pt-2 cursor-pointer"
                  >
                    Logout Account
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      openLoginModal();
                    }}
                    className="block w-full bg-orange-500 text-white text-center py-3 text-xs font-extrabold uppercase tracking-wider border-2 border-orange-500 hover:bg-orange-600 hover:text-white transition-colors shadow-sm cursor-pointer"
                  >
                    Sign In / Register
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Logout Confirmation Modal */}
      {isLogoutConfirmOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white border-2 border-black rounded-none p-6 max-w-sm w-full space-y-4 animate-fadeIn">
            <h3 className="font-display text-base font-extrabold uppercase tracking-wider text-black">Sign Out</h3>
            <p className="text-xs text-neutral-600 font-semibold">Are you sure you want to log out from MurtiPuja?</p>
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setLogoutConfirmOpen(false)}
                className="px-4 py-2 border-2 border-neutral-300 text-xs font-bold uppercase tracking-wider hover:border-black rounded-none cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  logout();
                  setLogoutConfirmOpen(false);
                }}
                className="px-4 py-2 bg-black text-white border-2 border-black text-xs font-extrabold uppercase tracking-wider hover:bg-orange-500 hover:border-orange-500 rounded-none cursor-pointer"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Search Modal */}
      <SearchModal isOpen={isSearchOpen} onClose={() => setSearchOpen(false)} />
    </div>
  );
}
