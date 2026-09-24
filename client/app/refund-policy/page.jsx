"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { getPageContent } from "@/lib/api";

const DEFAULT_RETURN_FAQS = [
  {
    q: "What is the return and exchange window for MurtiPuja idols?",
    a: "We provide a 7-Day Hassle-Free Window starting from the exact calendar day your shipment is marked as delivered by the courier partner. You can request a size exchange, finish swap, or transit damage claim within this 7-day period.",
  },
  {
    q: "Why is an unboxing video strictly mandatory for all returns and exchanges?",
    a: "Spiritual murtis are precision 3D-sculpted, consecrated, and feature delicate micro-carvings (e.g. Trishul, Bansuri, Mukut). An unedited, single continuous unboxing video starting from before opening the sealed package is strictly compulsory to verify transit handling and authorize instant replacement or refund approvals.",
  },
  {
    q: "Is reverse doorstep pickup free across India?",
    a: "Yes, 100% Free! Once your unboxing video claim is verified, our logistics partners (Blue Dart, Delhivery, DTDC) will collect the safely packed parcel directly from your doorstep with zero reverse shipping fees.",
  },
  {
    q: "How fast will my exchange item be dispatched?",
    a: "Once your reverse pickup is initiated or damage claim verified with unboxing video proof, your fresh replacement murti is dispatched via Express Air Courier within 24 hours with live WhatsApp tracking updates.",
  },
  {
    q: "How and when are refunds processed?",
    a: "All MurtiPuja orders are 100% prepaid. Approved refunds are processed directly via Razorpay back to your original source payment method (Bank Account, UPI, or Card) within 24 to 48 hours of warehouse inspection.",
  },
  {
    q: "Can I exchange for a larger size or a different deity sculpture?",
    a: "Yes! You can exchange for any available size or finish variant. If there is a price difference, our concierge team will share a direct secure Razorpay payment link or instantly refund any surplus amount.",
  },
];

export default function RefundPolicyPage() {
  const [pageData, setPageData] = useState(null);
  const [openFaq, setOpenFaq] = useState(null);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await getPageContent("refund-policy");
        if (res.data?.success && res.data?.data) {
          setPageData(res.data.data);
        }
      } catch (err) {
        console.error("Failed to load dynamic refund policy:", err);
      }
    }
    loadData();
  }, []);

  const toggleFaq = (idx) => {
    setOpenFaq(openFaq === idx ? null : idx);
  };

  const badge = pageData?.hero?.badge || "Customer Protection & Devotee Satisfaction";
  const title = pageData?.hero?.headline || pageData?.title || "Return & Exchange Rules & Policy";
  const description =
    pageData?.hero?.description ||
    pageData?.subtitle ||
    "Official guidelines · 7-Day trial guarantee · Mandatory unboxing video protocol · 100% free doorstep reverse pickup.";

  const faqsList = useMemo(() => {
    if (pageData?.faqs && pageData.faqs.length > 0) {
      return pageData.faqs.map((f) => ({
        q: f.question,
        a: f.answer,
      }));
    }
    return DEFAULT_RETURN_FAQS;
  }, [pageData?.faqs]);

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

          {/* Action Button to File Request */}
          <div className="flex flex-wrap gap-2.5">
            <Link
              href="/return-and-exchange"
              className="inline-flex items-center gap-2 px-5 py-3 bg-black hover:bg-gold hover:text-black text-white text-xs font-extrabold uppercase tracking-wider transition-colors shadow-sm"
            >
              <span>🔄 Request Return / Exchange →</span>
            </Link>
            <Link
              href="/track-return"
              className="inline-flex items-center gap-2 px-4 py-3 bg-white hover:bg-neutral-50 text-neutral-900 text-xs font-extrabold uppercase tracking-wider border border-stone-200 transition-colors shadow-sm"
            >
              <span>🔍 Track Return Status</span>
            </Link>
          </div>
        </div>

        {/* 2. Top Policy Highlights Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 w-full">
          <div className="bg-white border border-stone-200 shadow-sm p-6 space-y-2 group hover:bg-neutral-50 transition-all">
            <div className="text-3xl">🗓️</div>
            <h3 className="font-display text-sm font-extrabold uppercase tracking-wider text-neutral-900">
              7-Day Safe Window
            </h3>
            <p className="text-xs text-neutral-600 font-semibold leading-relaxed">
              Initiate any size swap, finish exchange, or damage claim within 7 calendar days of delivery.
            </p>
          </div>

          <div className="bg-white border border-stone-200 shadow-sm p-6 space-y-2 group hover:bg-neutral-50 transition-all">
            <div className="text-3xl">📦</div>
            <h3 className="font-display text-sm font-extrabold uppercase tracking-wider text-neutral-900">
              100% Free Reverse Pickup
            </h3>
            <p className="text-xs text-neutral-600 font-semibold leading-relaxed">
              Zero return courier charges across 19,000+ Indian pincodes. Doorstep pickup arranged.
            </p>
          </div>

          <div className="bg-white border border-stone-200 shadow-sm p-6 space-y-2 group hover:bg-neutral-50 transition-all">
            <div className="text-3xl">📹</div>
            <h3 className="font-display text-sm font-extrabold uppercase tracking-wider text-red-600">
              Mandatory Video Proof
            </h3>
            <p className="text-xs text-neutral-600 font-semibold leading-relaxed">
              Continuous unboxing video proof required for all return and exchange approvals.
            </p>
          </div>

          <div className="bg-white border border-stone-200 shadow-sm p-6 space-y-2 group hover:bg-neutral-50 transition-all">
            <div className="text-3xl">⚡</div>
            <h3 className="font-display text-sm font-extrabold uppercase tracking-wider text-neutral-900">
              24-48h Razorpay Refund
            </h3>
            <p className="text-xs text-neutral-600 font-semibold leading-relaxed">
              Prepaid orders refunded directly back to your original bank/UPI account upon receipt.
            </p>
          </div>
        </div>

        {/* 3. Main Policy Structure (2 Columns) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start w-full">
          {/* Left Column: Detailed Policy Sections (8 Columns) */}
          <div className="lg:col-span-8 space-y-6">
            {sections.length > 0 ? (
              sections.map((sec, idx) => (
                <div key={idx} className="bg-white border border-stone-200 shadow-sm p-6 sm:p-8 space-y-3">
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 bg-black text-white font-extrabold text-xs flex items-center justify-center">
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
                {/* Section 1: 7-Day Window */}
                <div className="bg-white border border-stone-200 shadow-sm p-6 sm:p-8 space-y-3">
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 bg-black text-white font-extrabold text-xs flex items-center justify-center">
                      1
                    </span>
                    <h2 className="font-display text-base sm:text-lg text-neutral-900 font-extrabold uppercase tracking-wider">
                      7-Day Trial & Exchange Window
                    </h2>
                  </div>
                  <p className="text-xs sm:text-sm text-neutral-600 font-semibold leading-relaxed pl-0 sm:pl-10">
                    Every MurtiPuja sculpture is covered by our <strong>7-Day Trial & Exchange Guarantee</strong>. You have 7 full calendar days from the exact delivery timestamp to file an exchange for size, variant, or finish on our <Link href="/return-and-exchange" className="text-black font-extrabold underline hover:text-gold">Return Claim Portal</Link>.
                  </p>
                </div>

                {/* Section 2: Mandatory Unboxing Video Protocol */}
                <div className="bg-stone-50/70 border border-stone-200 shadow-sm p-6 sm:p-8 space-y-4">
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 bg-red-600 text-white font-extrabold text-xs flex items-center justify-center">
                      2
                    </span>
                    <h2 className="font-display text-base sm:text-lg text-neutral-900 font-extrabold uppercase tracking-wider flex items-center gap-2">
                      <span>📹</span>
                      <span>Compulsory Unboxing Video Guidelines</span>
                    </h2>
                  </div>
                  <p className="text-xs sm:text-sm text-neutral-700 font-semibold leading-relaxed pl-0 sm:pl-10">
                    Because sacred spiritual idols are precision 3D-sculpted with micro-fine details, an unboxing video is <strong>strictly mandatory</strong> to validate courier transit handling and approve claims immediately.
                  </p>
                  
                  <div className="pl-0 sm:pl-10 grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    <div className="bg-white p-4 border border-stone-200 space-y-1">
                      <p className="text-xs font-black uppercase text-neutral-900">1. Start Before Unsealing</p>
                      <p className="text-[11px] text-neutral-500 font-semibold">Video must start before cutting the outer courier tape.</p>
                    </div>
                    <div className="bg-white p-4 border border-stone-200 space-y-1">
                      <p className="text-xs font-black uppercase text-neutral-900">2. Show Shipping Label</p>
                      <p className="text-[11px] text-neutral-500 font-semibold">Ensure AWB barcode and recipient details are visible.</p>
                    </div>
                    <div className="bg-white p-4 border border-stone-200 space-y-1">
                      <p className="text-xs font-black uppercase text-neutral-900">3. Single Continuous Shot</p>
                      <p className="text-[11px] text-neutral-500 font-semibold">No video cuts, pauses, or edits permitted during unpacking.</p>
                    </div>
                    <div className="bg-white p-4 border border-stone-200 space-y-1">
                      <p className="text-xs font-black uppercase text-neutral-900">4. Inspect on Camera</p>
                      <p className="text-[11px] text-neutral-500 font-semibold">Carefully lift the idol from foam inserts and inspect.</p>
                    </div>
                  </div>
                </div>

                {/* Section 3: Free Reverse Doorstep Pickup */}
                <div className="bg-white border border-stone-200 shadow-sm p-6 sm:p-8 space-y-3">
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 bg-black text-white font-extrabold text-xs flex items-center justify-center">
                      3
                    </span>
                    <h2 className="font-display text-base sm:text-lg text-neutral-900 font-extrabold uppercase tracking-wider">
                      100% Free Doorstep Reverse Pickup
                    </h2>
                  </div>
                  <p className="text-xs sm:text-sm text-neutral-600 font-semibold leading-relaxed pl-0 sm:pl-10">
                    You never pay for reverse shipping on verified claims. Our logistics partners (Blue Dart, Delhivery, DTDC) will arrive at your address with a pre-printed AWB within 24–48 hours of claim registration.
                  </p>
                </div>

                {/* Section 4: Eligibility Criteria */}
                <div className="bg-white border border-stone-200 shadow-sm p-6 sm:p-8 space-y-3">
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 bg-black text-white font-extrabold text-xs flex items-center justify-center">
                      4
                    </span>
                    <h2 className="font-display text-base sm:text-lg text-neutral-900 font-extrabold uppercase tracking-wider">
                      Product Condition & Eligibility
                    </h2>
                  </div>
                  <ul className="list-disc pl-5 sm:pl-14 text-xs sm:text-sm text-neutral-600 font-semibold space-y-2 leading-relaxed">
                    <li>The deity sculpture must be unused, clean, and in original brand-new physical condition.</li>
                    <li>All original packaging materials, shockproof foam inserts, certificates, and accessories must be safely returned.</li>
                    <li>Custom bespoke deity orders with personalized devotional engravings cannot be returned for cash refunds unless transit-damaged.</li>
                  </ul>
                </div>

                {/* Section 5: 100% Prepaid Model & Razorpay Refund Settlement */}
                <div className="bg-white border border-stone-200 shadow-sm p-6 sm:p-8 space-y-3">
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 bg-black text-white font-extrabold text-xs flex items-center justify-center">
                      5
                    </span>
                    <h2 className="font-display text-base sm:text-lg text-neutral-900 font-extrabold uppercase tracking-wider">
                      100% Prepaid Model & Razorpay Refund Settlement
                    </h2>
                  </div>
                  <p className="text-xs sm:text-sm text-neutral-600 font-semibold leading-relaxed pl-0 sm:pl-10">
                    MurtiPuja operates exclusively on a 100% prepaid model to ensure expedited air dispatch. Approved refunds are credited directly back to the original source payment method (Bank Account, UPI, or Card via 256-bit SSL Razorpay) within <strong>24 to 48 hours</strong> of warehouse reception.
                  </p>
                </div>
              </>
            )}
          </div>

          {/* Right Column: Quick Action Box (4 Columns) */}
          <div className="lg:col-span-4 space-y-6">
            {/* Direct CTA Card */}
            <div className="bg-neutral-900 text-white border border-neutral-900 shadow-sm p-6 space-y-4">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-400">
                Self-Service Request
              </span>
              <h3 className="font-display text-base font-extrabold uppercase tracking-wider text-white">
                Ready to Start?
              </h3>
              <p className="text-xs text-neutral-300 font-semibold leading-relaxed">
                Submit your order number and unboxing video to arrange 100% free doorstep pickup.
              </p>
              <Link
                href="/return-and-exchange"
                className="block w-full bg-white hover:bg-gold hover:text-black text-black text-center py-3.5 text-xs font-extrabold uppercase tracking-wider transition-colors shadow-sm"
              >
                Request Return / Exchange →
              </Link>
            </div>

            {/* Track Card */}
            <div className="bg-white border border-stone-200 shadow-sm p-6 space-y-3">
              <h3 className="font-display text-xs font-extrabold uppercase tracking-wider text-neutral-900">
                Track Return Status
              </h3>
              <p className="text-xs text-neutral-600 font-semibold leading-relaxed">
                Check courier pickup, video verification, and replacement shipment progress.
              </p>
              <Link
                href="/track-return"
                className="block w-full bg-black hover:bg-gold hover:text-black text-white text-center py-3 text-xs font-extrabold uppercase tracking-wider transition-colors shadow-sm"
              >
                Track My Request →
              </Link>
            </div>

            {/* Concierge Help Card */}
            <div className="bg-white border border-stone-200 shadow-sm p-6 space-y-3">
              <h3 className="font-display text-xs font-extrabold uppercase tracking-wider text-neutral-900">
                Devotee Concierge Help
              </h3>
              <p className="text-xs text-neutral-600 font-semibold leading-relaxed">
                Connect directly with our Surat studio team on WhatsApp Mon–Sat (10 AM – 7 PM IST).
              </p>
              <a
                href="https://wa.me/917990138678?text=Hi%20MurtiPuja%20Support,%20I%20have%20questions%20about%20return%20rules."
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full bg-black hover:bg-gold hover:text-black text-white text-center py-3 text-xs font-extrabold uppercase tracking-wider transition-colors shadow-sm"
              >
                💬 Chat on WhatsApp
              </a>
            </div>
          </div>
        </div>

        {/* 4. Full-Width FAQ Accordions */}
        <div className="border-t border-stone-200 pt-8 space-y-6 w-full">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-200 pb-4">
            <div>
              <p className="text-[10px] uppercase tracking-[0.25em] text-neutral-400 font-extrabold">
                Frequently Asked Questions
              </p>
              <h2 className="font-display text-2xl sm:text-3xl text-neutral-900 font-extrabold uppercase tracking-wider">
                Policy Questions & Answers
              </h2>
            </div>
            <span className="text-xs font-extrabold uppercase text-neutral-500">
              {faqsList.length} Questions Configured
            </span>
          </div>

          <div className="border border-stone-200 divide-y divide-stone-200 bg-white shadow-sm w-full">
            {faqsList.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div key={idx} className="transition-colors">
                  <button
                    onClick={() => toggleFaq(idx)}
                    className="w-full text-left p-5 sm:p-6 flex items-center justify-between gap-4 hover:bg-neutral-50 transition-colors cursor-pointer"
                  >
                    <span className="text-xs sm:text-sm font-extrabold uppercase tracking-wide text-neutral-900">
                      {faq.q}
                    </span>
                    <span className="w-7 h-7 bg-neutral-900 text-white flex items-center justify-center text-xs font-extrabold shrink-0">
                      {isOpen ? "−" : "+"}
                    </span>
                  </button>
                  {isOpen && (
                    <div className="px-5 sm:px-6 pb-6 pt-1 text-xs sm:text-sm text-neutral-600 font-semibold leading-relaxed border-t border-stone-100 bg-stone-50/50">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </main>
  );
}
