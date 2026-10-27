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
    q: "Why is an unboxing video strictly mandatory for damaged item claims?",
    a: "Spiritual murtis are precision 3D-sculpted, consecrated, and feature delicate micro-carvings (e.g. Trishul, Bansuri, Mukut). An unedited, single continuous unboxing video starting from before opening the sealed package is strictly compulsory to verify transit handling. Without video proof, returns or exchanges cannot be processed.",
  },
  {
    q: "Can I return an item for a refund if it arrived in good, undamaged condition?",
    a: "Items received in good, undamaged condition are eligible for Exchange Only (size, deity, or finish swap). Direct return for cash refund is only available for transit-damaged items supported by unboxing video proof.",
  },
  {
    q: "Can I return an order for a refund if I used a discount coupon, combo offer, or promotional deal?",
    a: "No. All orders placed with discount coupons, combo offers, automated cart discounts, or seasonal promotions are treated as Final Sale and are strictly Non-Returnable for cash refunds. If an item from an offer order arrives physically damaged, you can request a free Replacement Exchange of the identical idol with a mandatory unboxing video.",
  },
  {
    q: "What is the 50% Reverse Transit Damage Rule ('Apply 50% Rule')?",
    a: "When you return a good-condition item for an exchange, if the idol accidentally suffers breakage or damage during reverse courier transit before reaching our warehouse, MurtiPuja provides a 50% compensation refund of the original item value credited directly back to your payment account via Razorpay upon warehouse inspection.",
  },
  {
    q: "How does the price difference work during an exchange?",
    a: "If you exchange for a higher-priced idol (e.g. ₹1,500 to ₹2,000), you pay the remaining ₹500 via secure Razorpay checkout before the replacement is dispatched. If you exchange for a lower-priced idol (e.g. ₹1,500 to ₹1,000), the surplus ₹500 will be refunded to your original payment method via Razorpay once your return safely reaches our warehouse.",
  },
  {
    q: "Is reverse doorstep pickup free across India?",
    a: "Yes, 100% Free! Once your claim or exchange is verified, our logistics partners (Delhivery, Blue Dart, DTDC) will collect the safely packed parcel directly from your doorstep with zero reverse shipping fees.",
  },
  {
    q: "How and when are refunds processed?",
    a: "All MurtiPuja refunds are processed directly via Razorpay back to your original source payment method (Bank Account, UPI, or Card) within 24 to 48 hours of warehouse inspection.",
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

                {/* Section 6: 50% Reverse Transit Damage Rule */}
                <div className="bg-amber-50/70 border border-amber-200 shadow-sm p-6 sm:p-8 space-y-3">
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 bg-amber-600 text-white font-extrabold text-xs flex items-center justify-center">
                      6
                    </span>
                    <h2 className="font-display text-base sm:text-lg text-neutral-900 font-extrabold uppercase tracking-wider">
                      50% Reverse Courier Transit Damage Compensation Rule
                    </h2>
                  </div>
                  <div className="text-xs sm:text-sm text-neutral-700 font-semibold leading-relaxed pl-0 sm:pl-10 space-y-2">
                    <p>
                      If a customer initiates an exchange for an item received in good condition, and during reverse courier transit back to our workshop the sculpture suffers accidental damage or breakage:
                    </p>
                    <div className="bg-white p-4 border border-amber-300">
                      <p className="font-bold text-amber-900 uppercase text-xs">Warehouse 50% Compensation Policy:</p>
                      <p className="text-neutral-700 text-xs mt-1">
                        Upon physical inspection and recording of courier transit damage, a <strong>50% compensation refund</strong> of the product value is immediately issued back to the customer's original payment method via Razorpay.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Section 7: Exchange Price Difference Handling */}
                <div className="bg-white border border-stone-200 shadow-sm p-6 sm:p-8 space-y-3">
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 bg-black text-white font-extrabold text-xs flex items-center justify-center">
                      7
                    </span>
                    <h2 className="font-display text-base sm:text-lg text-neutral-900 font-extrabold uppercase tracking-wider">
                      Exchange Price Difference (Upgrade vs. Downgrade)
                    </h2>
                  </div>
                  <ul className="list-disc pl-5 sm:pl-14 text-xs sm:text-sm text-neutral-600 font-semibold space-y-2 leading-relaxed">
                    <li>
                      <strong>Upgrade:</strong> If you select a higher-priced product variant (e.g. ₹1,500 to ₹2,000), the difference (+₹500) must be paid online via Razorpay before the replacement product order is confirmed.
                    </li>
                    <li>
                      <strong>Downgrade:</strong> If you select a lower-priced product variant (e.g. ₹1,500 to ₹1,000), the surplus balance (-₹500) will be refunded to your original payment account via Razorpay once your returned idol is safely inspected at our warehouse.
                    </li>
                  </ul>
                </div>

                {/* Section 8: Promotional Offers & Discounted Orders (Final Sale) */}
                <div className="bg-stone-50 border border-stone-200 shadow-sm p-6 sm:p-8 space-y-3">
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 bg-black text-white font-extrabold text-xs flex items-center justify-center">
                      8
                    </span>
                    <h2 className="font-display text-base sm:text-lg text-neutral-900 font-extrabold uppercase tracking-wider">
                      Promotional Offers, Coupons & Combo Deals (Final Sale)
                    </h2>
                  </div>
                  <div className="text-xs sm:text-sm text-neutral-700 font-semibold leading-relaxed pl-0 sm:pl-10 space-y-2">
                    <p>
                      Orders purchased using coupons, combo discounts, or promotional pricing are designated as <strong>Final Sale</strong>:
                    </p>
                    <div className="bg-amber-50 p-4 border border-amber-300 space-y-1">
                      <p className="font-bold text-amber-900 uppercase text-xs">🏷️ Strict Non-Returnable Condition:</p>
                      <p className="text-neutral-700 text-xs mt-1">
                        Promotional orders are strictly <strong>non-returnable</strong> and non-refundable. If an idol from an offer order sustains verified transit damage, it is eligible exclusively for a <strong>Replacement Exchange</strong> with the mandatory uncut unboxing video.
                      </p>
                    </div>
                  </div>
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
