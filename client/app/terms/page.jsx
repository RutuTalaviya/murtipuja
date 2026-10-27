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
                Welcome to <strong>MurtiPuja</strong>. These Terms & Conditions govern your use of our digital store and purchase of our physical products. By accessing our platform or placing an order, you agree to comply with and be bound by these terms.
              </p>

              <section className="space-y-2 border-t-2 border-neutral-100 pt-4">
                <h2 className="font-display text-base text-black font-extrabold uppercase tracking-wider">1. Products & Craftsmanship</h2>
                <p className="text-neutral-600 text-xs normal-case leading-relaxed">
                  Our sacred spiritual idols are precision crafted using advanced 3D additive manufacturing and hand-detailed finishes. Minor surface texture variations or micro-sculptural details are characteristic of artisan post-processing.
                </p>
              </section>

              <section className="space-y-2 border-t-2 border-neutral-100 pt-4">
                <h2 className="font-display text-base text-black font-extrabold uppercase tracking-wider">2. Pricing & Orders</h2>
                <p className="text-neutral-600 text-xs normal-case leading-relaxed">
                  All prices listed on the website are in INR (₹) inclusive of applicable taxes. MurtiPuja operates exclusively on a 100% secure prepaid model. We accept major UPI, credit/debit cards, and net banking via 256-bit SSL encrypted Razorpay gateway.
                </p>
              </section>

              <section className="space-y-2 border-t-2 border-neutral-100 pt-4">
                <h2 className="font-display text-base text-black font-extrabold uppercase tracking-wider">3. Damage on Arrival & Compulsory Unboxing Video</h2>
                <div className="text-neutral-600 text-xs normal-case leading-relaxed space-y-2">
                  <p>
                    Because sacred idols possess delicate micro-carvings (such as Trishul, Bansuri, and Mukut), <strong>an uncut, single continuous unboxing video</strong> starting before opening the outer courier seal is <strong>strictly mandatory</strong> for any damaged or broken product claim.
                  </p>
                  <p className="font-bold text-red-600">
                    ⚠️ Important: If a product arrives damaged but no unboxing video evidence is provided, neither a return nor an exchange claim can be processed.
                  </p>
                  <p>
                    Where valid unboxing video evidence is provided, an <strong>Exchange</strong> will be offered as the primary and recommended option, with Return & Refund available as a secondary option.
                  </p>
                </div>
              </section>

              <section className="space-y-2 border-t-2 border-neutral-100 pt-4">
                <h2 className="font-display text-base text-black font-extrabold uppercase tracking-wider">4. Good Condition Product: Exchange Only</h2>
                <p className="text-neutral-600 text-xs normal-case leading-relaxed">
                  If the idol has arrived safely in intact, undamaged condition and the customer wishes to change the size, finish, or deity, only an <strong>Exchange</strong> is permitted. Cash refunds or returns for non-damaged goods are not applicable.
                </p>
              </section>

              <section className="space-y-2 border-t-2 border-neutral-100 pt-4">
                <h2 className="font-display text-base text-black font-extrabold uppercase tracking-wider">5. 50% Reverse Courier Transit Damage Compensation Rule</h2>
                <div className="text-neutral-600 text-xs normal-case leading-relaxed space-y-2">
                  <p>
                    When a customer initiates an exchange for an item that was delivered intact and ships it back to our warehouse, if the idol suffers accidental breakage or damage during the reverse courier journey before reaching the seller/warehouse:
                  </p>
                  <div className="bg-amber-50 border-l-4 border-amber-500 p-3 text-neutral-800">
                    <p className="font-bold text-xs uppercase tracking-wide">The 50% Transit Damage Rule:</p>
                    <p className="text-xs mt-1">
                      Upon physical inspection by our warehouse team verifying reverse transit damage, the customer is granted a <strong>50% compensation refund</strong> of the original product purchase value, credited directly to their original payment source via Razorpay.
                    </p>
                  </div>
                </div>
              </section>

              <section className="space-y-2 border-t-2 border-neutral-100 pt-4">
                <h2 className="font-display text-base text-black font-extrabold uppercase tracking-wider">6. Exchange Price Difference Settlement</h2>
                <div className="text-neutral-600 text-xs normal-case leading-relaxed space-y-2">
                  <ul className="list-disc pl-5 space-y-1">
                    <li>
                      <strong>Upgrade (Higher Value Replacement):</strong> If the replacement item price exceeds the original item (e.g. swapping a ₹1,500 idol for a ₹2,000 idol), the difference of ₹500 must be paid by the customer via secure online checkout before the replacement order is confirmed and dispatched.
                    </li>
                    <li>
                      <strong>Downgrade (Lower Value Replacement):</strong> If the replacement item price is less than the original item (e.g. swapping a ₹1,500 idol for a ₹1,000 idol), the surplus balance of ₹500 will be refunded to the customer's source payment account via Razorpay after safe warehouse reception and inspection of the original idol.
                    </li>
                    <li>
                      <strong>Even Swap:</strong> No price difference applies when exchanging for an item of identical price.
                    </li>
                  </ul>
                </div>
              </section>

              <section className="space-y-2 border-t-2 border-neutral-100 pt-4">
                <h2 className="font-display text-base text-black font-extrabold uppercase tracking-wider">
                  7. Promotional Offers, Coupons & Combo Deals (Final Sale & Non-Returnable)
                </h2>
                <div className="text-neutral-600 text-xs normal-case leading-relaxed space-y-2">
                  <p>
                    All orders placed using promotional discount coupons, combo offers, automated cart discounts, or seasonal campaign pricing are treated as <strong>Final Sale</strong>.
                  </p>
                  <div className="bg-amber-50 border-l-4 border-amber-500 p-3 text-neutral-800">
                    <p className="font-bold text-xs uppercase tracking-wide">Strict No-Return Policy on Offer Orders:</p>
                    <p className="text-xs mt-1">
                      Orders purchased with any discount or promotional offer are <strong>strictly non-returnable</strong> for cash refunds. If an item from an offer order arrives physically broken or damaged during courier transit, it is eligible exclusively for a <strong>Replacement Exchange</strong> of the identical deity sculpture, subject to providing the mandatory uncut unboxing video.
                    </p>
                  </div>
                </div>
              </section>

              <section className="space-y-2 border-t-2 border-neutral-100 pt-4">
                <h2 className="font-display text-base text-black font-extrabold uppercase tracking-wider">8. Governing Law & Jurisdiction</h2>
                <p className="text-neutral-600 text-xs normal-case leading-relaxed">
                  These terms are governed by and construed in accordance with the laws of India, and any disputes shall be subject to the exclusive jurisdiction of the competent courts in Surat, Gujarat, India.
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
