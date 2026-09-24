"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getPageContent } from "@/lib/api";

export default function TermsPage() {
  const [pageData, setPageData] = useState(null);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await getPageContent("terms");
        if (res.data?.success && res.data?.data) {
          setPageData(res.data.data);
        }
      } catch (err) {
        console.error("Failed to load dynamic terms page:", err);
      }
    }
    loadData();
  }, []);

  const title = pageData?.title || "Terms & Conditions";
  const subtitle = pageData?.subtitle || pageData?.hero?.description || "Last updated: August 2026";
  const badge = pageData?.hero?.badge || "Legal Agreements";
  const body = pageData?.body;

  return (
    <main className="min-h-screen bg-white px-4 md:px-8 lg:px-12 py-8 md:py-12 font-display w-full">
      <div className="w-full space-y-8">
        
        {/* Header */}
        <div className="border-b-2 border-black pb-6">
          <p className="text-[10px] uppercase tracking-[0.25em] text-neutral-400 font-extrabold mb-1">{badge}</p>
          <h1 className="font-display text-3xl sm:text-4xl md:text-5xl text-black font-extrabold uppercase tracking-wider">
            {title}
          </h1>
          <p className="text-xs text-neutral-500 font-semibold uppercase tracking-wider mt-1.5">{subtitle}</p>
        </div>

        {/* Dynamic Content */}
        <div className="text-xs md:text-sm text-neutral-700 space-y-6 leading-relaxed max-w-4xl font-semibold uppercase tracking-wider">
          {body ? (
            <div className="whitespace-pre-line space-y-4 font-normal font-sans normal-case text-sm leading-relaxed text-neutral-700">
              {body}
            </div>
          ) : (
            <>
              <p>
                Welcome to <strong>MurtiPuja</strong>. These Terms & Conditions govern your use of our digital store and purchase of our physical products. By accessing our platform, you agree to comply with these terms.
              </p>

              <section className="space-y-2 border-t-2 border-neutral-100 pt-4">
                <h2 className="font-display text-base text-black font-extrabold uppercase tracking-wider">1. Products & Craftsmanship</h2>
                <p className="text-neutral-600 text-xs">
                  Our spiritual idols are manufactured via digital 3D additive manufacturing and hand-detailed finishes. Minor surface texture variations are characteristic of artisan post-processing.
                </p>
              </section>

              <section className="space-y-2 border-t-2 border-neutral-100 pt-4">
                <h2 className="font-display text-base text-black font-extrabold uppercase tracking-wider">2. Pricing & Orders</h2>
                <p className="text-neutral-600 text-xs">
                  All prices listed on the website are in INR (₹) inclusive of applicable taxes. We accept all major Indian cards, UPI, and net banking via secured Razorpay infrastructure.
                </p>
              </section>

              <section className="space-y-2 border-t-2 border-neutral-100 pt-4">
                <h2 className="font-display text-base text-black font-extrabold uppercase tracking-wider">3. Governing Law</h2>
                <p className="text-neutral-600 text-xs">
                  These terms are governed by and construed in accordance with the laws of Surat, Gujarat, India.
                </p>
              </section>
            </>
          )}
        </div>

        {/* Back Button */}
        <div className="pt-6 border-t-2 border-black">
          <Link
            href="/"
            className="px-6 py-3 bg-black hover:bg-gold hover:text-black text-white text-xs font-extrabold uppercase tracking-widest border-2 border-black inline-block transition-all"
          >
            ← Back to Home
          </Link>
        </div>

      </div>
    </main>
  );
}
