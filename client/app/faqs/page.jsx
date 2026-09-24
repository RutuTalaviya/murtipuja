"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { getPageContent } from "@/lib/api";

const DEFAULT_FAQ_SECTIONS = [
  {
    id: "crafting-materials",
    name: "Crafting, Materials & 3D Tech",
    description: "Materials, 0.1mm micro-layer precision, Vedic iconography, and sustainability.",
    questions: [
      {
        q: "What materials are used to sculpt MurtiPuja idols?",
        a: "Our divine sculptures are 3D-crafted using high-density engineering bio-PLA derived from renewable plant starches, achieving 0.1mm micro-layer precision. After printing, each idol is manually polished and hand-detailed by traditional artisans using premium obsidian black, metallic bronze, copper, and matte stone finishes.",
      },
      {
        q: "Can I perform Abhishek (bathing with water/milk) on these idols?",
        a: "While our high-density polymer is water-resistant, we recommend dry dusting with a soft microfiber cloth or gentle wiping with a lightly damp cloth. Avoiding full water/milk submersions preserves the artisan matte texture, metallic pigments, and micro-layer surface luster indefinitely.",
      },
      {
        q: "How are MurtiPuja idols designed and developed?",
        a: "Every sculpture begins with extensive study of traditional Vedic iconography and Dhyana Shlokas. Our digital sculptors create high-polygon 3D meshes that capture subtle muscle anatomy, ornaments, and sacred postures. These are brought to life via multi-axis precision 3D printing and finished by hand in our Surat studio.",
      },
      {
        q: "Are MurtiPuja materials eco-friendly and non-toxic?",
        a: "Yes, 100%. Our bio-polymers are plant-derived, non-toxic, and free from heavy metals or harsh chemical binders. Unlike conventional Plaster of Paris (PoP) idols that harm water bodies, our idols are durable, heirloom-quality, and environmentally sustainable.",
      },
    ],
  },
  {
    id: "dimensions-sizing",
    name: "Dimensions & Sizing",
    description: "Standard dimensions, custom sizing up to 24 inches, and temple setups.",
    questions: [
      {
        q: "What sizes and proportions are available?",
        a: "Our collector drops typically come in 6-inch (compact mandir/desk edition), 9-inch (standard pooja room edition), and 12-inch (grand centerpiece edition). Exact dimensions (Height × Width × Depth) and weight in grams are listed on each product's page.",
      },
      {
        q: "Do you accept custom deity or custom size commissions?",
        a: "Yes! We create bespoke commissioned murtis ranging from 6 inches up to 24 inches for home sanctums, corporate installations, and overseas temples. Contact our concierge team with your required deity form and dimensions to receive a 3D preview and timeline.",
      },
      {
        q: "Do you offer premium gift packaging and personalized notes?",
        a: "Every MurtiPuja idol arrives securely housed in luxury shockproof rigid foam packaging suitable for gifting. During checkout, you can also add a personalized gift message printed on a sacred blessing card.",
      },
    ],
  },
  {
    id: "limited-drops",
    name: "Limited Drops & The Vault",
    description: "Drop cycles, serialized collector editions, and vault releases.",
    questions: [
      {
        q: "What are MurtiPuja Drops?",
        a: "Drops are strictly limited production batches of exclusive deity designs and rare artisanal finishes. Each drop has a capped unit quantity. Once sold out, that exact edition is archived in The Vault and is never re-manufactured in that exact variant.",
      },
      {
        q: "How do I get early access to upcoming drops?",
        a: "You can sign up for drop alerts via our WhatsApp concierge or newsletter on the homepage. VIP subscribers receive a 1-hour early access window before drops open to the general public.",
      },
    ],
  },
  {
    id: "orders-payments",
    name: "Orders & Secure Payments (Prepaid Only)",
    description: "Payment options, 256-bit SSL Razorpay security, 100% prepaid model, and GST invoices.",
    questions: [
      {
        q: "Which payment methods does MurtiPuja accept?",
        a: "We accept all 100% secure online payment methods powered by 256-bit SSL encrypted Razorpay checkout: UPI (Google Pay, PhonePe, Paytm, BHIM, Cred), Credit/Debit cards (Visa, MasterCard, RuPay, Amex), and Net Banking across 50+ banks. All orders are 100% prepaid.",
      },
      {
        q: "Does MurtiPuja offer Cash on Delivery (COD)?",
        a: "No, MurtiPuja operates exclusively on a 100% Prepaid Model. Because each sacred murti is precision 3D-crafted, consecrated, and hand-finished, eliminating COD ensures zero transit cancellations and guarantees 100% Free Insured Express Air Delivery on every single order.",
      },
      {
        q: "Can I modify or cancel my order after placing it?",
        a: "You can modify your shipping address or cancel your order within 12 hours of placing it before it enters our dispatch queue. Simply email support@murtipuja.com or message our WhatsApp concierge with your Order ID.",
      },
      {
        q: "Will I receive a tax invoice with my order?",
        a: "Yes, a GST tax invoice with full itemized details and HSN codes is automatically emailed to your registered email upon dispatch and included inside the parcel.",
      },
    ],
  },
  {
    id: "shipping-delivery",
    name: "Shipping & Delivery — India",
    description: "Dispatch timelines, zero shipping charges, and package tracking.",
    questions: [
      {
        q: "How long does delivery take across India?",
        a: "Orders are dispatched within 24 to 48 hours from our Surat studio. Metro cities (Mumbai, Delhi NCR, Bengaluru, Hyderabad, Chennai, Pune, Ahmedabad, Surat) receive delivery within 2–3 business days. All other Indian cities and towns take 3–5 business days.",
      },
      {
        q: "Is shipping free?",
        a: "Yes! We provide 100% Free Insured Express Shipping across India on all prepaid orders. There are zero hidden courier fees.",
      },
      {
        q: "How can I track my shipment in real-time?",
        a: "Once dispatched, you will receive an SMS and WhatsApp containing your tracking number and AWB link. You can also visit our public Track Order page anytime to check live delivery milestones without needing an account.",
      },
      {
        q: "Is my shipment insured against transit damages?",
        a: "Yes. Every MurtiPuja parcel is 100% transit-insured. If your package arrives damaged, our concierge team will immediately send a fresh replacement at no extra charge.",
      },
    ],
  },
  {
    id: "returns-replacements",
    name: "Returns, Exchanges & Claims",
    description: "7-day return window, damage claims, and mandatory unboxing video policy.",
    questions: [
      {
        q: "What is your return & exchange policy?",
        a: "We offer a 7-day hassle-free return and replacement policy from the date of delivery. If your item arrives damaged, defective, or incorrect, we arrange a free reverse pickup and dispatch a brand new unit immediately.",
      },
      {
        q: "Why is an unboxing video strictly mandatory for all returns & exchanges?",
        a: "Divine sculptures feature delicate 0.1mm micro-sculpted details and hand-gilded finishes. An unedited, continuous unboxing video starting from the sealed outer box to revealing the idol is strictly compulsory to prevent false claims and enable instant replacement or refund approvals.",
      },
      {
        q: "How long do refunds take to reflect in my bank account?",
        a: "Once an approved return is received at our facility, refunds are initiated immediately and credited back to your original payment method (Bank/UPI/Card) within 24–48 hours via Razorpay.",
      },
    ],
  },
  {
    id: "support-contact",
    name: "Support & Studio Contact",
    description: "Customer service timings, WhatsApp helpline, and studio location.",
    questions: [
      {
        q: "How do I contact customer support?",
        a: "Our studio concierge team in Surat is available Monday to Saturday from 10:00 AM to 7:00 PM IST. You can reach us via Phone/WhatsApp at +91 79901 38678 / +91 96647 37035, or via email at support@murtipuja.com.",
      },
      {
        q: "Do you have an offline showroom or store?",
        a: "MurtiPuja operates primarily as a direct-to-devotee online studio to ensure pristine quality control and direct pricing. Studio visits in Surat are available by prior appointment for bespoke corporate and large temple idol consultations.",
      },
    ],
  },
];

export default function FaqsPage() {
  const [pageData, setPageData] = useState(null);
  const [activeCategory, setActiveCategory] = useState("all");
  const [openItems, setOpenItems] = useState({});
  const [searchQuery, setSearchQuery] = useState("");

  // Load dynamic data
  useEffect(() => {
    async function loadFaqs() {
      try {
        const res = await getPageContent("faqs");
        if (res.data?.success && res.data?.data) {
          setPageData(res.data.data);
        }
      } catch (err) {
        console.error("Failed to load dynamic faqs page:", err);
      }
    }
    loadFaqs();
  }, []);

  // Compute sections dynamically from database faqs, or fallback
  const faqSections = useMemo(() => {
    if (!pageData?.faqs || pageData.faqs.length === 0) {
      return DEFAULT_FAQ_SECTIONS;
    }

    // Group items by category
    const grouped = {};
    pageData.faqs.forEach((item) => {
      const cat = item.category || "General Questions";
      if (!grouped[cat]) {
        grouped[cat] = [];
      }
      grouped[cat].push({
        q: item.question,
        a: item.answer,
      });
    });

    return Object.entries(grouped).map(([categoryName, questions], idx) => ({
      id: `category-${idx}-${categoryName.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
      name: categoryName,
      description: `${questions.length} questions regarding ${categoryName}`,
      questions,
    }));
  }, [pageData?.faqs]);

  const toggleAccordion = (sectionId, qIndex) => {
    const key = `${sectionId}-${qIndex}`;
    setOpenItems((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  // Filter sections based on search query or selected category
  const filteredSections = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return faqSections
      .map((sec) => {
        if (activeCategory !== "all" && sec.id !== activeCategory && !query) {
          return null;
        }

        if (!query) {
          return sec;
        }

        // Filter questions by query
        const matchingQuestions = sec.questions.filter(
          (q) =>
            q.q.toLowerCase().includes(query) ||
            q.a.toLowerCase().includes(query) ||
            sec.name.toLowerCase().includes(query)
        );

        if (matchingQuestions.length === 0) return null;

        return {
          ...sec,
          questions: matchingQuestions,
        };
      })
      .filter(Boolean);
  }, [faqSections, activeCategory, searchQuery]);

  const totalQuestionsCount = useMemo(() => {
    return faqSections.reduce((acc, sec) => acc + sec.questions.length, 0);
  }, [faqSections]);

  const heroBadge = pageData?.hero?.badge || "Help Desk & Devotee Knowledge Base";
  const heroTitle = pageData?.hero?.headline || pageData?.title || "Frequently Asked Questions";
  const heroDescription =
    pageData?.hero?.description ||
    pageData?.subtitle ||
    "All the answers you need in one place. 0.1mm micro-precision 3D crafting, shipping, payments, returns, and care protocols.";

  return (
    <main className="min-h-screen bg-[#faf9f6] text-neutral-900 font-display w-full px-3 sm:px-6 md:px-8 lg:px-12 py-6 sm:py-8 md:py-10">
      <div className="w-full space-y-8 md:space-y-12">
        {/* 1. Full-Width Header */}
        <div className="border-b border-stone-200 pb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
            <p className="text-[10px] uppercase tracking-[0.25em] text-neutral-400 font-extrabold mb-1">
              {heroBadge}
            </p>
            <h1 className="font-display text-3xl sm:text-4xl md:text-5xl text-neutral-900 font-extrabold uppercase tracking-wider">
              {heroTitle}
            </h1>
            <p className="text-xs text-neutral-500 font-semibold uppercase tracking-wider mt-2 max-w-2xl">
              {heroDescription}
            </p>
          </div>

          {/* Quick Action Navigation Links */}
          <div className="flex flex-wrap gap-2.5">
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-black hover:bg-gold hover:text-black text-white text-xs font-extrabold uppercase tracking-wider transition-colors shadow-sm"
            >
              <span>💬 Contact Concierge</span>
            </Link>
            <Link
              href="/refund-policy"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-neutral-50 text-neutral-900 text-xs font-extrabold uppercase tracking-wider border border-stone-200 transition-colors shadow-sm"
            >
              <span>📜 Return Policy</span>
            </Link>
          </div>
        </div>

        {/* 2. Quick In-Page Search Bar */}
        <div className="w-full">
          <div className="relative max-w-2xl">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search topics (e.g., shipping, returns, PLA material, abhishek)..."
              className="w-full bg-white border border-stone-300 shadow-sm px-4 py-3.5 pl-11 text-xs sm:text-sm font-semibold text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-stone-800 focus:ring-1 focus:ring-stone-800 transition-colors"
            />
            <svg
              className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
              />
            </svg>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-neutral-400 hover:text-black cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* 3. Main Full-Width 12-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start w-full">
          {/* Left Column: Categories Sidebar (3 Columns) */}
          <aside className="lg:col-span-3 lg:sticky lg:top-24 space-y-6">
            <div className="bg-white border border-stone-200 shadow-sm p-4 space-y-2">
              <p className="text-[10px] font-extrabold uppercase tracking-widest text-neutral-400 px-2 pt-1">
                Categories
              </p>

              {/* Vertical Menu Buttons */}
              <div className="flex lg:flex-col gap-1.5 overflow-x-auto pb-2 lg:pb-0 no-scrollbar">
                {/* All Questions Tab */}
                <button
                  onClick={() => {
                    setActiveCategory("all");
                    setSearchQuery("");
                  }}
                  className={`text-left px-3.5 py-2.5 text-xs uppercase tracking-wider font-extrabold transition-all flex items-center justify-between whitespace-nowrap lg:whitespace-normal cursor-pointer ${
                    activeCategory === "all" && !searchQuery
                      ? "bg-neutral-900 text-white shadow-sm"
                      : "bg-stone-50/70 text-neutral-700 hover:text-black hover:bg-stone-100"
                  }`}
                >
                  <span>All Questions</span>
                  <span className="hidden lg:inline-block text-[10px] opacity-70">
                    ({totalQuestionsCount})
                  </span>
                </button>

                {/* Individual Category Tabs */}
                {faqSections.map((sec) => {
                  const isActive = activeCategory === sec.id && !searchQuery;
                  return (
                    <button
                      key={sec.id}
                      onClick={() => {
                        setActiveCategory(sec.id);
                        setSearchQuery("");
                      }}
                      className={`text-left px-3.5 py-2.5 text-xs uppercase tracking-wider font-bold transition-all flex items-center justify-between whitespace-nowrap lg:whitespace-normal cursor-pointer ${
                        isActive
                          ? "bg-neutral-900 text-white font-extrabold shadow-sm"
                          : "bg-stone-50/70 text-neutral-700 hover:text-black hover:bg-stone-100"
                      }`}
                    >
                      <span className="truncate">{sec.name}</span>
                      <span className="hidden lg:inline-block text-[10px] opacity-60">
                        ({sec.questions.length})
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Sidebar Bottom Contact Helper */}
            <div className="bg-white border border-stone-200 shadow-sm p-5 space-y-2">
              <p className="text-xs font-semibold text-neutral-600">
                Can&apos;t find what you&apos;re looking for?
              </p>
              <Link
                href="/contact"
                className="text-xs font-extrabold text-neutral-900 uppercase tracking-wider hover:text-amber-800 flex items-center gap-1.5 group"
              >
                <span>Speak with Concierge</span>
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </Link>
            </div>
          </aside>

          {/* Right Column: FAQ Questions & Accordions (9 Columns) */}
          <section className="lg:col-span-9 space-y-10 min-h-[400px]">
            {filteredSections.length === 0 ? (
              <div className="bg-white border border-stone-200 shadow-sm p-8 text-center space-y-3">
                <p className="font-extrabold text-sm uppercase tracking-wider text-neutral-900">
                  No matching questions found
                </p>
                <p className="text-xs text-neutral-500">
                  Try searching for different keywords or browse all categories from the sidebar.
                </p>
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setActiveCategory("all");
                  }}
                  className="px-5 py-2.5 bg-black text-white text-xs font-bold uppercase tracking-wider hover:bg-gold hover:text-black cursor-pointer transition-colors shadow-sm"
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              filteredSections.map((sec) => (
                <div key={sec.id} className="bg-white border border-stone-200 shadow-sm p-6 sm:p-8 space-y-6">
                  {/* Category Header */}
                  <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                    <div>
                      <h2 className="font-display text-sm sm:text-base font-extrabold uppercase tracking-wider text-neutral-900">
                        {sec.name}
                      </h2>
                      <p className="text-[11px] text-neutral-400 font-semibold mt-0.5">
                        {sec.description}
                      </p>
                    </div>
                    <span className="text-[11px] font-extrabold text-neutral-400 uppercase tracking-wider shrink-0">
                      {sec.questions.length} {sec.questions.length === 1 ? "Item" : "Items"}
                    </span>
                  </div>

                  {/* Accordion Questions List */}
                  <div className="divide-y divide-stone-100">
                    {sec.questions.map((qItem, qIdx) => {
                      const itemKey = `${sec.id}-${qIdx}`;
                      const isOpen = Boolean(openItems[itemKey]);

                      return (
                        <div key={qIdx} className="group transition-colors">
                          <button
                            onClick={() => toggleAccordion(sec.id, qIdx)}
                            className="w-full text-left py-4 sm:py-5 flex items-center justify-between gap-4 select-none cursor-pointer focus:outline-none"
                            aria-expanded={isOpen}
                          >
                            <span className="text-xs sm:text-sm font-bold text-neutral-900 group-hover:text-black tracking-normal leading-snug">
                              {qItem.q}
                            </span>
                            <span
                              className={`text-base font-extrabold flex-shrink-0 w-6 h-6 flex items-center justify-center transition-transform duration-300 ${
                                isOpen ? "rotate-45 text-neutral-900" : "text-neutral-400 group-hover:text-neutral-900"
                              }`}
                            >
                              +
                            </span>
                          </button>

                          {/* Expandable Answer */}
                          {isOpen && (
                            <div className="pb-5 pr-4 sm:pr-8 animate-fadeIn">
                              <p className="text-xs sm:text-[13.5px] text-neutral-600 leading-relaxed font-normal">
                                {qItem.a}
                              </p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))
            )}

            {/* 4. Bottom Banner Card */}
            <div className="bg-neutral-900 text-white p-8 sm:p-10 border border-neutral-900 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="space-y-1.5 max-w-md">
                <h3 className="font-display text-xl sm:text-2xl font-extrabold uppercase tracking-tight text-white">
                  Still Have Questions?
                </h3>
                <p className="text-xs sm:text-sm text-neutral-400 font-normal leading-relaxed">
                  Our divine concierge and support team in Surat is happy to assist you anytime.
                </p>
              </div>

              <div className="flex flex-wrap sm:flex-nowrap gap-3 w-full md:w-auto">
                <Link
                  href="/contact"
                  className="w-full sm:w-auto text-center px-6 py-3.5 bg-white hover:bg-gold hover:text-black text-black font-extrabold text-xs uppercase tracking-wider transition-colors shadow-sm"
                >
                  Contact Support
                </Link>
                <a
                  href="https://wa.me/917990138678"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto text-center px-6 py-3.5 bg-transparent hover:bg-white/10 text-white font-extrabold text-xs uppercase tracking-wider border border-white transition-colors"
                >
                  WhatsApp Us →
                </a>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
