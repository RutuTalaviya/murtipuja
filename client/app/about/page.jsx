"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getPageContent } from "@/lib/api";

export default function AboutUsPage() {
  const [pageData, setPageData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await getPageContent("about");
        if (res.data?.success && res.data?.data) {
          setPageData(res.data.data);
        }
      } catch (err) {
        console.error("Failed to load dynamic about page:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const hero = pageData?.hero || {
    badge: "✦ About MurtiPuja · Studio Surat",
    headline: "Where Sacred Devotion Meets 0.1mm Precision",
    description:
      "Preserving Sanatana Dharma's eternal iconography through next-generation 3D additive sculpting and handcrafted sacred finishes. Designed, consecrated, and made in India.",
  };

  const originSection = pageData?.sections?.[0] || {
    title: "Our Origin & Vision",
    subtitle: "Reimagining Divine Sculptures for Modern Sanctuaries",
    content:
      "Founded in the historic cultural hub of Surat, Gujarat, MurtiPuja was born out of deep devotion and an engineering passion for micro-perfection. For generations, sacred murtis have inspired temples and homes across India.\n\nHowever, traditional mass-molding processes often lose the intricate micro-details of a deity's expression, ornamentation, or sacred mudras. We set out to change this by combining ancient Shilpa Shastra proportions with state-of-the-art 0.1mm micro-precision 3D printing technology.\n\nEvery single murti that leaves our studio is meticulously calibrated, cured, hand-detailed by skilled artisans, and rigorously inspected before insured dispatch to your doorstep.",
    items: [
      "Sub-millimeter facial & ornamental sharpness",
      "100% shatter-resistant durable engineering",
      "Authentic sandstone, obsidian & antique finishes",
    ],
    metrics: [
      { value: "0.1 mm", label: "Micro-Precision" },
      { value: "100%", label: "Crafted in India" },
      { value: "19,000+", label: "Pincodes Served" },
    ],
  };

  const pledgeSection = pageData?.sections?.[1] || {
    title: "The MurtiPuja Pledge",
    subtitle: "Devotion in Every Micron",
    content:
      "We don't just print sculptures; we craft timeless representations of the divine that elevate your pooja room, home sanctuary, and spiritual meditation space.",
  };

  const contactInfo = pageData?.contactInfo || {
    phone: "+91 79901 38678",
    email: "support@murtipuja.com",
    address: "MurtiPuja Studio, Ring Road, Surat, Gujarat - 395002",
  };

  return (
    <main className="min-h-screen bg-[#faf9f6] px-4 sm:px-6 md:px-8 lg:px-12 py-8 sm:py-12 md:py-16 font-display w-full">
      <div className="w-full space-y-12 md:space-y-16">

        {/* 1. Hero Section */}
        <div className="border-b border-stone-200 pb-10 sm:pb-12 text-center md:text-left flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div className="max-w-3xl space-y-3">
            <span className="text-[10px] uppercase tracking-[0.3em] text-neutral-400 font-extrabold">
              {hero.badge || "✦ About MurtiPuja · Studio Surat"}
            </span>
            <h1 className="font-display text-3xl sm:text-4xl md:text-6xl text-neutral-900 font-black uppercase tracking-tight leading-tight">
              {hero.headline || pageData?.title || "Where Sacred Devotion Meets 0.1mm Precision"}
            </h1>
            <p className="text-xs sm:text-sm text-neutral-600 font-semibold leading-relaxed max-w-2xl">
              {hero.description || pageData?.subtitle || "Preserving Sanatana Dharma's eternal iconography through next-generation 3D additive sculpting and handcrafted sacred finishes. Designed, consecrated, and made in India."}
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/products"
              className="px-6 py-3.5 bg-black hover:bg-gold hover:text-black text-white text-xs font-extrabold uppercase tracking-widest transition-all shadow-sm"
            >
              Explore Collection →
            </Link>
            <Link
              href="/contact"
              className="px-6 py-3.5 bg-white hover:bg-neutral-50 text-neutral-900 text-xs font-extrabold uppercase tracking-widest border border-stone-200 transition-all shadow-sm"
            >
              Contact Studio
            </Link>
          </div>
        </div>

        {/* 2. Brand Story Grid (2 Columns) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center w-full">
          {/* Left Text Block */}
          <div className="lg:col-span-7 bg-white border border-stone-200 shadow-sm p-6 sm:p-10 space-y-5">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-neutral-400">
              {originSection.title || "Our Origin & Vision"}
            </span>
            <h2 className="font-display text-xl sm:text-2xl md:text-3xl font-extrabold uppercase tracking-wide text-neutral-900 leading-snug">
              {originSection.subtitle || "Reimagining Divine Sculptures for Modern Sanctuaries"}
            </h2>
            <div className="space-y-4 text-xs sm:text-sm text-neutral-600 font-medium leading-relaxed whitespace-pre-line">
              {originSection.content}
            </div>

            {/* Quick Metrics */}
            {originSection.metrics && originSection.metrics.length > 0 && (
              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-stone-100 text-center sm:text-left">
                {originSection.metrics.map((m, idx) => (
                  <div key={idx}>
                    <p className="font-display text-xl sm:text-2xl font-black text-neutral-900">{m.value}</p>
                    <p className="text-[10px] font-extrabold uppercase tracking-wider text-neutral-400 mt-0.5">{m.label}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right Highlight Box */}
          <div className="lg:col-span-5 bg-neutral-900 text-white p-8 sm:p-10 border border-neutral-900 shadow-sm space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-400">
                ✦ {pledgeSection.title || "The MurtiPuja Pledge"}
              </span>
              <h3 className="font-display text-xl sm:text-2xl font-extrabold uppercase tracking-wider text-white">
                {pledgeSection.subtitle || "Devotion in Every Micron"}
              </h3>
              <p className="text-xs sm:text-sm text-neutral-300 font-medium leading-relaxed">
                &ldquo;{pledgeSection.content}&rdquo;
              </p>
            </div>

            {originSection.items && originSection.items.length > 0 && (
              <div className="border-t border-white/10 pt-6 space-y-3 text-xs text-neutral-300 font-semibold">
                {originSection.items.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <span className="text-gold">✓</span>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 3. The 4 Pillars of Excellence */}
        <div className="space-y-6">
          <div className="border-b border-stone-200 pb-4">
            <span className="text-[10px] uppercase tracking-[0.25em] text-neutral-400 font-extrabold">
              Why Devotees Choose MurtiPuja
            </span>
            <h2 className="font-display text-2xl sm:text-3xl text-neutral-900 font-extrabold uppercase tracking-wider mt-1">
              The 4 Pillars of Our Craft
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
            <div className="bg-white border border-stone-200 shadow-sm p-6 sm:p-7 space-y-3 group hover:border-black transition-all">
              <span className="text-3xl">📐</span>
              <h3 className="font-display text-sm font-extrabold uppercase tracking-wider text-neutral-900">
                0.1mm Micro-Precision
              </h3>
              <p className="text-xs text-neutral-600 font-semibold leading-relaxed">
                Layer-by-layer high-density resin and polymer fabrication capturing every micro detail like Trishul, Bansuri, and Mukut.
              </p>
            </div>

            <div className="bg-white border border-stone-200 shadow-sm p-6 sm:p-7 space-y-3 group hover:border-black transition-all">
              <span className="text-3xl">🪔</span>
              <h3 className="font-display text-sm font-extrabold uppercase tracking-wider text-neutral-900">
                Shilpa Shastra Proportions
              </h3>
              <p className="text-xs text-neutral-600 font-semibold leading-relaxed">
                Sculpted in strict adherence to Vedic iconography, mudras, balance, and classical spiritual aesthetics.
              </p>
            </div>

            <div className="bg-white border border-stone-200 shadow-sm p-6 sm:p-7 space-y-3 group hover:border-black transition-all">
              <span className="text-3xl">🎨</span>
              <h3 className="font-display text-sm font-extrabold uppercase tracking-wider text-neutral-900">
                Hand-Detailed Finishes
              </h3>
              <p className="text-xs text-neutral-600 font-semibold leading-relaxed">
                Expert artisans apply antique bronze, matte sandstone, and raw obsidian coatings for a luxurious tactile presence.
              </p>
            </div>

            <div className="bg-white border border-stone-200 shadow-sm p-6 sm:p-7 space-y-3 group hover:border-black transition-all">
              <span className="text-3xl">📦</span>
              <h3 className="font-display text-sm font-extrabold uppercase tracking-wider text-neutral-900">
                Safe & Insured Delivery
              </h3>
              <p className="text-xs text-neutral-600 font-semibold leading-relaxed">
                Custom-molded foam packaging with zero transit damage risk and 100% free doorstep pickup if needed.
              </p>
            </div>
          </div>
        </div>

        {/* 4. The 4-Step Making Process */}
        <div className="bg-white border border-stone-200 shadow-sm p-6 sm:p-10 space-y-8">
          <div className="border-b border-stone-100 pb-4 text-center sm:text-left">
            <span className="text-[10px] uppercase tracking-[0.25em] text-neutral-400 font-extrabold">
              Behind the Scenes
            </span>
            <h2 className="font-display text-2xl sm:text-3xl text-neutral-900 font-extrabold uppercase tracking-wider mt-1">
              How Every Murti is Born
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="space-y-3">
              <div className="w-8 h-8 bg-black text-white font-extrabold text-xs flex items-center justify-center">
                1
              </div>
              <h4 className="text-xs sm:text-sm font-extrabold uppercase text-neutral-900 tracking-wider">
                Digital 3D Sculpting
              </h4>
              <p className="text-xs text-neutral-600 font-semibold leading-relaxed">
                Master 3D artists recreate divine forms using digital clay, ensuring mathematical symmetry and expressive features.
              </p>
            </div>

            <div className="space-y-3">
              <div className="w-8 h-8 bg-black text-white font-extrabold text-xs flex items-center justify-center">
                2
              </div>
              <h4 className="text-xs sm:text-sm font-extrabold uppercase text-neutral-900 tracking-wider">
                Additive 3D Printing
              </h4>
              <p className="text-xs text-neutral-600 font-semibold leading-relaxed">
                High-end industrial printers sculpt layer-by-layer at 0.1mm thickness over several hours without imperfections.
              </p>
            </div>

            <div className="space-y-3">
              <div className="w-8 h-8 bg-black text-white font-extrabold text-xs flex items-center justify-center">
                3
              </div>
              <h4 className="text-xs sm:text-sm font-extrabold uppercase text-neutral-900 tracking-wider">
                Artisan Hand-Finishing
              </h4>
              <p className="text-xs text-neutral-600 font-semibold leading-relaxed">
                Surface post-curing, precision smoothing, and multi-layered patina painting by Gujarat&apos;s seasoned craftsmen.
              </p>
            </div>

            <div className="space-y-3">
              <div className="w-8 h-8 bg-black text-white font-extrabold text-xs flex items-center justify-center">
                4
              </div>
              <h4 className="text-xs sm:text-sm font-extrabold uppercase text-neutral-900 tracking-wider">
                Consecration & Dispatch
              </h4>
              <p className="text-xs text-neutral-600 font-semibold leading-relaxed">
                Each idol is cleaned, quality certified, and nestled into custom shockproof foam before air dispatch across India.
              </p>
            </div>
          </div>
        </div>

        {/* 5. Studio & Customer Contact CTA Bar */}
        <div className="border border-stone-200 bg-neutral-50 p-8 sm:p-12 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <h3 className="font-display text-xl sm:text-2xl font-extrabold uppercase tracking-wider text-neutral-900">
              Have Questions or Custom Murti Inquiries?
            </h3>
            <p className="text-xs sm:text-sm text-neutral-600 font-medium max-w-xl">
              Our Surat studio team is happy to assist you with idol dimensions, custom finishes, pooja room placements, and bulk orders.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <a
              href={`https://wa.me/${(contactInfo.whatsapp || contactInfo.phone || "").replace(/\D/g, "")}?text=Hi%20MurtiPuja,%20I%20would%20like%20to%20know%20more%20about%20your%20idols.`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3.5 bg-black hover:bg-gold hover:text-black text-white text-xs font-extrabold uppercase tracking-widest transition-all shadow-sm flex items-center gap-2"
            >
              <span>💬 WhatsApp Concierge</span>
            </a>
            <Link
              href="/contact"
              className="px-6 py-3.5 bg-white hover:bg-neutral-100 text-neutral-900 text-xs font-extrabold uppercase tracking-widest border border-stone-200 transition-all shadow-sm"
            >
              Contact Us →
            </Link>
          </div>
        </div>

      </div>
    </main>
  );
}
