"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getPageContent } from "@/lib/api";

export default function ShippingPolicyPage() {
  const [pageData, setPageData] = useState(null);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await getPageContent("shipping-policy");
        if (res.data?.success && res.data?.data) {
          setPageData(res.data.data);
        }
      } catch (err) {
        console.error("Failed to load dynamic shipping policy:", err);
      }
    }
    loadData();
  }, []);

  const badge = pageData?.hero?.badge || "Logistics & Dispatch Standards";
  const title = pageData?.hero?.headline || pageData?.title || "Shipping & Delivery Policy";
  const description =
    pageData?.hero?.description ||
    pageData?.subtitle ||
    "100% Insured express transit across 19,000+ Indian pincodes · Dispatched from our Surat design lab · Zero shipping fees.";

  const sections = pageData?.sections || [];
  const bodyText = pageData?.body;

  return (
    <main className="min-h-screen bg-[#faf9f6] px-3 sm:px-6 md:px-8 lg:px-12 py-6 sm:py-8 md:py-10 font-display w-full">
      <div className="w-full space-y-8 md:space-y-12">
        {/* 1. Full-Width Header */}
        <div className="border-b border-stone-200 pb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
            <p className="text-[10px] uppercase tracking-[0.25em] text-neutral-400 font-extrabold mb-1">
              {badge}
            </p>
            <h1 className="font-display text-3xl sm:text-4xl md:text-5xl text-neutral-900 font-extrabold uppercase tracking-wider">
              {title}
            </h1>
            <p className="text-xs text-neutral-500 font-semibold uppercase tracking-wider mt-2 max-w-2xl">
              {description}
            </p>
          </div>

          {/* Status Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-stone-200 shadow-sm text-xs font-extrabold uppercase tracking-wider text-neutral-900 flex-shrink-0">
            <span className="w-2.5 h-2.5 rounded-full bg-green-600 animate-pulse" />
            <span>Pan-India Express Active</span>
          </div>
        </div>

        {/* 2. Full-Width Top Feature Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 w-full">
          <div className="bg-white border border-stone-200 shadow-sm p-6 space-y-2 group hover:bg-neutral-50 transition-all">
            <div className="text-3xl">🚚</div>
            <h3 className="font-display text-sm font-extrabold uppercase tracking-wider text-neutral-900">
              100% Free Shipping
            </h3>
            <p className="text-xs text-neutral-600 font-semibold leading-relaxed">
              Zero delivery charges on all prepaid orders across India with no minimum cart requirement.
            </p>
          </div>

          <div className="bg-white border border-stone-200 shadow-sm p-6 space-y-2 group hover:bg-neutral-50 transition-all">
            <div className="text-3xl">⚡</div>
            <h3 className="font-display text-sm font-extrabold uppercase tracking-wider text-neutral-900">
              24-48 Hours Dispatch
            </h3>
            <p className="text-xs text-neutral-600 font-semibold leading-relaxed">
              Every sacred sculpture is quality-inspected, hand-polished, and dispatched from Surat within 48h.
            </p>
          </div>

          <div className="bg-white border border-stone-200 shadow-sm p-6 space-y-2 group hover:bg-neutral-50 transition-all">
            <div className="text-3xl">🛡️</div>
            <h3 className="font-display text-sm font-extrabold uppercase tracking-wider text-neutral-900">
              Transit Insured
            </h3>
            <p className="text-xs text-neutral-600 font-semibold leading-relaxed">
              5-ply shockproof packaging with 100% free instant replacement guarantee in case of courier mishandling.
            </p>
          </div>
        </div>

        {/* 3. Main Full-Width Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start w-full">
          {/* Left Main Content (8 Columns) */}
          <div className="lg:col-span-8 space-y-6">
            {/* If dynamic sections are present, render them */}
            {sections.length > 0 ? (
              sections.map((sec, idx) => (
                <div key={idx} className="bg-white border border-stone-200 shadow-sm p-6 sm:p-8 space-y-3">
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 bg-neutral-900 text-white font-extrabold text-xs flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <h2 className="font-display text-base sm:text-lg text-neutral-900 font-extrabold uppercase tracking-wider">
                      {sec.title}
                    </h2>
                  </div>
                  <div className="text-xs sm:text-sm text-neutral-600 font-semibold leading-relaxed pl-0 sm:pl-10 whitespace-pre-line">
                    {sec.content}
                  </div>
                </div>
              ))
            ) : bodyText ? (
              <div className="bg-white border border-stone-200 shadow-sm p-6 sm:p-8 space-y-4">
                <div className="text-xs sm:text-sm text-neutral-700 leading-relaxed font-sans whitespace-pre-line">
                  {bodyText}
                </div>
              </div>
            ) : (
              <>
                {/* Section 1: Dispatch */}
                <div className="bg-white border border-stone-200 shadow-sm p-6 sm:p-8 space-y-3">
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 bg-neutral-900 text-white font-extrabold text-xs flex items-center justify-center">
                      1
                    </span>
                    <h2 className="font-display text-base sm:text-lg text-neutral-900 font-extrabold uppercase tracking-wider">
                      Order Processing & Dispatch Timelines
                    </h2>
                  </div>
                  <p className="text-xs sm:text-sm text-neutral-600 font-semibold leading-relaxed pl-0 sm:pl-10">
                    All in-stock MurtiPuja drops undergo multi-stage optical surface inspection, manual micro-layer detailing, and protective sealing before leaving our Surat facility. Orders are dispatched within <strong>24 to 48 working hours</strong> after payment verification.
                  </p>
                </div>

                {/* Section 2: Regional Estimates */}
                <div className="bg-white border border-stone-200 shadow-sm p-6 sm:p-8 space-y-4">
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 bg-neutral-900 text-white font-extrabold text-xs flex items-center justify-center">
                      2
                    </span>
                    <h2 className="font-display text-base sm:text-lg text-neutral-900 font-extrabold uppercase tracking-wider">
                      Estimated Delivery Timelines Across India
                    </h2>
                  </div>
                  
                  <div className="pl-0 sm:pl-10 grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
                    <div className="bg-stone-50/70 border border-stone-200 p-4 space-y-1">
                      <span className="text-[10px] font-extrabold uppercase tracking-widest text-neutral-400">Within Gujarat</span>
                      <p className="font-display text-xl font-extrabold text-neutral-900">1 – 2 Days</p>
                      <p className="text-[11px] text-neutral-500 font-semibold">Surat, Ahmedabad, Vadodara, Rajkot</p>
                    </div>

                    <div className="bg-stone-50/70 border border-stone-200 p-4 space-y-1">
                      <span className="text-[10px] font-extrabold uppercase tracking-widest text-neutral-400">Metro Cities</span>
                      <p className="font-display text-xl font-extrabold text-neutral-900">2 – 3 Days</p>
                      <p className="text-[11px] text-neutral-500 font-semibold">Mumbai, Delhi NCR, Bengaluru, Hyderabad, Pune</p>
                    </div>

                    <div className="bg-stone-50/70 border border-stone-200 p-4 space-y-1">
                      <span className="text-[10px] font-extrabold uppercase tracking-widest text-neutral-400">Rest of India</span>
                      <p className="font-display text-xl font-extrabold text-neutral-900">3 – 5 Days</p>
                      <p className="text-[11px] text-neutral-500 font-semibold">All Tier 2, Tier 3 & Rural Pin Codes</p>
                    </div>
                  </div>
                </div>

                {/* Section 3: Packaging & Courier Partners */}
                <div className="bg-white border border-stone-200 shadow-sm p-6 sm:p-8 space-y-4">
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 bg-neutral-900 text-white font-extrabold text-xs flex items-center justify-center">
                      3
                    </span>
                    <h2 className="font-display text-base sm:text-lg text-neutral-900 font-extrabold uppercase tracking-wider">
                      Transit Couriers & Sacred Packaging
                    </h2>
                  </div>
                  <p className="text-xs sm:text-sm text-neutral-600 font-semibold leading-relaxed pl-0 sm:pl-10">
                    We partner exclusively with air express logistics providers including <strong>Blue Dart Express</strong> and <strong>Delhivery Air</strong>. Each divine idol is encapsulated in custom-molded high-density foam, encased in tamper-evident sealed packaging with sacred unboxing documentation.
                  </p>
                </div>

                {/* Section 4: Real-Time Tracking */}
                <div className="bg-white border border-stone-200 shadow-sm p-6 sm:p-8 space-y-4">
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 bg-neutral-900 text-white font-extrabold text-xs flex items-center justify-center">
                      4
                    </span>
                    <h2 className="font-display text-base sm:text-lg text-neutral-900 font-extrabold uppercase tracking-wider">
                      Real-Time Tracking & Notifications
                    </h2>
                  </div>
                  <p className="text-xs sm:text-sm text-neutral-600 font-semibold leading-relaxed pl-0 sm:pl-10">
                    As soon as your shipment is scanned at the hub, an SMS & WhatsApp notification containing your AWB tracking link is triggered. You can also track transit milestones directly on our portal via your registered phone number.
                  </p>
                </div>

                {/* Section 5: Transit Damage Policy */}
                <div className="bg-white border border-stone-200 shadow-sm p-6 sm:p-8 space-y-4">
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 bg-neutral-900 text-white font-extrabold text-xs flex items-center justify-center">
                      5
                    </span>
                    <h2 className="font-display text-base sm:text-lg text-neutral-900 font-extrabold uppercase tracking-wider">
                      Transit Damage Policy
                    </h2>
                  </div>
                  <p className="text-xs sm:text-sm text-neutral-600 font-semibold leading-relaxed pl-0 sm:pl-10">
                    In the rare event of transit damage, MurtiPuja provides a <strong>100% free instant replacement</strong> or refund. Simply file a claim within 7 days of delivery with your continuous unboxing video via our dedicated <Link href="/return-and-exchange" className="text-neutral-900 underline font-extrabold hover:text-gold">Claims Portal</Link>.
                  </p>
                </div>
              </>
            )}
          </div>

          {/* Right Column / Quick Action Sidebar (4 Columns) */}
          <div className="lg:col-span-4 space-y-6">
            {/* Track Order Card */}
            <Link
              href="/track-order"
              className="block p-6 bg-stone-50 border border-stone-200 hover:bg-neutral-100 transition-colors shadow-sm group"
            >
              <div className="flex justify-between items-center">
                <div className="space-y-1">
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-neutral-400">Live Logistics</span>
                  <h4 className="font-display text-sm font-extrabold uppercase tracking-wider text-neutral-900">
                    Track Existing Shipment
                  </h4>
                  <p className="text-xs text-neutral-500 font-semibold">
                    Enter Order ID & mobile number for real-time status.
                  </p>
                </div>
                <span className="text-xl font-extrabold text-neutral-900 group-hover:translate-x-1 transition-transform">
                  →
                </span>
              </div>
            </Link>

            {/* Contact Concierge Card */}
            <div className="p-6 bg-white border border-stone-200 shadow-sm space-y-4">
              <div className="space-y-1">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-neutral-400">Concierge Desk</span>
                <h3 className="font-display text-base font-extrabold uppercase tracking-wider text-neutral-900">
                  Need Delivery Help?
                </h3>
                <p className="text-xs text-neutral-500 font-semibold">
                  Our team in Surat is available Mon-Sat, 10 AM – 7 PM.
                </p>
              </div>

              <div className="space-y-2 text-xs font-bold pt-2 border-t border-stone-100">
                <p className="flex items-center justify-between">
                  <span className="text-neutral-500">Phone / WhatsApp:</span>
                  <a href="tel:+917990138678" className="text-neutral-900 hover:underline font-extrabold">
                    +91 79901 38678
                  </a>
                </p>
                <p className="flex items-center justify-between">
                  <span className="text-neutral-500">Email:</span>
                  <a href="mailto:support@murtipuja.com" className="text-neutral-900 hover:underline font-extrabold">
                    support@murtipuja.com
                  </a>
                </p>
              </div>

              <a
                href="https://wa.me/917990138678"
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full py-3 bg-black hover:bg-gold hover:text-black text-white text-center text-xs font-extrabold uppercase tracking-wider transition-colors shadow-sm"
              >
                Chat on WhatsApp →
              </a>
            </div>

            {/* Related Policies */}
            <div className="p-6 bg-white border border-stone-200 shadow-sm space-y-3">
              <h4 className="font-display text-xs font-extrabold uppercase tracking-wider text-neutral-900">
                Related Policies
              </h4>
              <div className="space-y-2 text-xs font-bold text-neutral-700">
                <Link href="/refund-policy" className="block hover:text-black hover:translate-x-1 transition-all py-1 border-b border-stone-100">
                  Return & Refund Policy →
                </Link>
                <Link href="/terms" className="block hover:text-black hover:translate-x-1 transition-all py-1 border-b border-stone-100">
                  Terms & Conditions →
                </Link>
                <Link href="/faqs" className="block hover:text-black hover:translate-x-1 transition-all py-1">
                  Frequently Asked Questions →
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* 4. Full-Width Bottom Action Banner */}
        <div className="w-full bg-neutral-900 text-white border border-neutral-900 shadow-sm p-8 sm:p-10 md:p-12 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center md:text-left">
            <h3 className="font-display text-xl sm:text-2xl font-extrabold uppercase tracking-wider text-white">
              Questions About Your Dispatch?
            </h3>
            <p className="text-xs sm:text-sm text-neutral-400 font-medium">
              Check live milestones via our tracking portal or speak with our client support team.
            </p>
          </div>

          <div className="flex flex-wrap sm:flex-nowrap gap-3 w-full sm:w-auto justify-center">
            <Link
              href="/track-order"
              className="w-full sm:w-auto px-6 py-3.5 bg-white hover:bg-gold hover:text-black text-black font-extrabold text-xs uppercase tracking-wider transition-colors text-center shadow-sm"
            >
              TRACK YOUR ORDER →
            </Link>
            <Link
              href="/contact"
              className="w-full sm:w-auto px-6 py-3.5 bg-transparent hover:bg-white/10 text-white font-extrabold text-xs uppercase tracking-wider border border-white transition-colors text-center"
            >
              HELP DESK
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
