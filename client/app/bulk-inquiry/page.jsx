"use client";

import { useState } from "react";
import Link from "next/link";
import axios from "axios";

const DEITIES = [
  "Shree Ram Lalla (Ayodhya)",
  "Lord Ganesha (Vighnaharta)",
  "Mahadev Shiva (Adiyogi / Meditative)",
  "Sankat Mochan Hanuman Ji",
  "Lord Krishna / Radha Krishna",
  "Custom 3D Sculpture Design",
  "Multiple / Mixed Sculptures",
  "Other / Open to Recommendations",
];

const QUANTITY_OPTIONS = ["10-25", "25-50", "50-100", "100+", "500+", "Custom"];

const SIZES = [
  "6 Inch (Ideal for Desks & Festive Gifts)",
  "9 Inch (Most Popular for Home Mandir)",
  "12 Inch (Grand Luxury Altar Edition)",
  "15+ Inch (Bespoke Monumental Editions)",
  "Assorted Mix of Sizes",
];

const FINISHES = [
  "Antique Bronze",
  "Sacred Saffron",
  "Pure White Marble",
  "Glossy Gold Accent",
  "Custom / Mixed Finishes",
];

const OCCASIONS = [
  "Corporate Gifting & Annual Milestones",
  "Wedding Return Favors & Festivities",
  "Diwali / Festive Corporate Boxes",
  "Temple Consecration / Trust Distribution",
  "Housewarming / Gruh Pravesh",
  "Real Estate / Executive Client Gifting",
  "Other Spiritual Occasion",
];

const BULK_FAQS = [
  {
    q: "What is the Minimum Order Quantity (MOQ) for bulk orders?",
    a: "Our tiered bulk wholesale pricing begins at just 10 pieces. Special volume discounts scale as your order quantity increases to 25, 50, 100, or 500+ units.",
  },
  {
    q: "Can we laser engrave our company logo or event name?",
    a: "Yes! For orders of 25+ units, we provide complimentary laser engraving on the idol pedestal — including company logos, event dates, couple names, or sacred Sanskrit mantras.",
  },
  {
    q: "Do you provide custom luxury gift boxes and packaging?",
    a: "Every bulk order comes with rigid presentation boxes cushioned with premium foam or velvet lining. Custom gold-foil branded box sleeves and personalized greeting cards are also available upon request.",
  },
  {
    q: "What is the turnaround and delivery timeline?",
    a: "Orders between 10–50 units typically dispatch within 5–7 business days. Larger orders (100+ units) dispatch within 10–14 days. Express expedited production is available on request.",
  },
  {
    q: "Do you ship to multiple employee/client addresses across India?",
    a: "Yes! We offer multi-destination insured pan-India dropshipping. Simply provide your recipient address spreadsheet, and we handle individual tracking and delivery.",
  },
  {
    q: "Do you provide GST tax invoices for corporate claims?",
    a: "Absolutely. All bulk corporate orders are accompanied by official GST tax invoices for seamless input tax credit.",
  },
];

export default function BulkInquiryPage() {
  const [formData, setFormData] = useState({
    name: "",
    company: "",
    phone: "",
    email: "",
    city: "",
    deity: DEITIES[0],
    size: SIZES[1],
    finish: FINISHES[0],
    quantity: "25-50",
    customQuantity: "",
    occasion: OCCASIONS[0],
    neededBy: "",
    notes: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [activeFaq, setActiveFaq] = useState(null);

  const cleanPhone = formData.phone.replace(/\D/g, "");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      setErrorMsg("Please enter your full name.");
      return;
    }

    if (cleanPhone.length !== 10) {
      setErrorMsg("Please enter a valid 10-digit WhatsApp/mobile number.");
      return;
    }

    if (!formData.email.trim() || !formData.email.includes("@")) {
      setErrorMsg("Please enter a valid email address.");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg("");

    const finalQuantity =
      formData.quantity === "Custom"
        ? formData.customQuantity || "Custom Quantity"
        : formData.quantity;

    const variantDesc = `${formData.size} • ${formData.finish}`;

    // 1. Save lead to Backend API
    try {
      const apiUrl =
        typeof window !== "undefined" && window.location.hostname !== "localhost"
          ? "https://api.murtipuja.com/api/inquiries"
          : "/api/inquiries";

      await axios.post(apiUrl, {
        name: formData.name.trim(),
        phone: cleanPhone,
        email: formData.email.trim(),
        productTitle: formData.deity,
        productSlug: "",
        variantDetails: `${variantDesc}${formData.company ? ` | Org: ${formData.company}` : ""}`,
        quantity: finalQuantity,
        occasion: formData.occasion,
        notes: [
          formData.city ? `City: ${formData.city}` : null,
          formData.neededBy ? `Timeline: ${formData.neededBy}` : null,
          formData.notes.trim() ? `Notes: ${formData.notes.trim()}` : null,
        ]
          .filter(Boolean)
          .join(" | "),
      }).catch((err) => {
        console.warn("Backend lead save warning:", err.message);
      });
    } catch (err) {
      console.warn("Inquiry save fallback:", err);
    }

    // 2. Format WhatsApp Message
    const waText = [
      `🙏 *Namaste MurtiPuja! I want to place a Bulk / Corporate Inquiry.*`,
      ``,
      `👤 *Name:* ${formData.name.trim()}`,
      formData.company ? `🏢 *Company / Org:* ${formData.company.trim()}` : null,
      `📱 *WhatsApp:* ${cleanPhone}`,
      `✉️ *Email:* ${formData.email.trim()}`,
      formData.city ? `📍 *Location:* ${formData.city.trim()}` : null,
      ``,
      `📦 *Sculpture / Deity:* ${formData.deity}`,
      `📏 *Size Preference:* ${formData.size}`,
      `✨ *Finish:* ${formData.finish}`,
      `🔢 *Quantity Required:* ${finalQuantity} units`,
      `🎉 *Occasion:* ${formData.occasion}`,
      formData.neededBy ? `⏳ *Needed By:* ${formData.neededBy}` : null,
      formData.notes ? `📝 *Custom Requirements:* ${formData.notes.trim()}` : null,
    ]
      .filter(Boolean)
      .join("\n");

    const waUrl = `https://wa.me/917990138678?text=${encodeURIComponent(waText)}`;

    // Open WhatsApp in new tab
    if (typeof window !== "undefined") {
      window.open(waUrl, "_blank", "noopener,noreferrer");
    }

    setIsSubmitting(false);
    setIsSuccess(true);
  };

  return (
    <main className="min-h-screen bg-[#faf9f6] px-3 sm:px-6 md:px-8 lg:px-12 py-6 sm:py-8 md:py-10 font-display w-full">
      <div className="w-full space-y-8 md:space-y-12">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-2 text-xs text-neutral-400 font-semibold uppercase tracking-wider">
          <Link href="/" className="hover:text-gold transition-colors">Home</Link>
          <span>/</span>
          <span className="text-neutral-800">Custom & Bulk Orders</span>
        </div>

        {/* 1. Header / Hero Section */}
        <div className="border-b border-stone-200 pb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div className="max-w-3xl">
            <p className="text-[10px] uppercase tracking-[0.25em] text-neutral-400 font-extrabold mb-1">
              Bespoke Commissions & Corporate Gifting
            </p>
            <h1 className="font-display text-3xl sm:text-4xl md:text-5xl text-neutral-900 font-extrabold uppercase tracking-wider">
              Sacred Gifting, Crafted In Volume
            </h1>
            <p className="text-xs sm:text-sm text-neutral-600 font-medium leading-relaxed mt-2">
              From corporate milestones and wedding favors to temple events and festive celebrations — we craft precision 3D-printed sacred sculptures with bespoke pedestal engraving, custom luxury packaging, and insured pan-India delivery.
            </p>
          </div>

          {/* Quick Concierge Direct Contact Badge */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-shrink-0">
            <a
              href="https://wa.me/917990138678?text=Hi%20MurtiPuja,%20I%20have%20an%20urgent%20bulk%20inquiry."
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-[#0a5c36] hover:bg-[#074729] text-white text-xs font-bold uppercase tracking-wider rounded-none shadow-sm transition-all"
            >
              <span>💬 Direct WhatsApp Concierge</span>
            </a>
          </div>
        </div>

        {/* 2. Key Pillars / Benefits Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 w-full">
          <div className="bg-white border border-stone-200 p-6 space-y-2.5 shadow-sm">
            <div className="text-2xl">🏷️</div>
            <h3 className="font-display text-sm font-extrabold uppercase tracking-wider text-neutral-900">
              Tiered Wholesale Pricing
            </h3>
            <p className="text-xs text-neutral-600 leading-relaxed font-normal">
              Direct artisan-to-client pricing with attractive volume discounts starting from 10+ pieces.
            </p>
          </div>

          <div className="bg-white border border-stone-200 p-6 space-y-2.5 shadow-sm">
            <div className="text-2xl">✍️</div>
            <h3 className="font-display text-sm font-extrabold uppercase tracking-wider text-neutral-900">
              Custom Pedestal Engraving
            </h3>
            <p className="text-xs text-neutral-600 leading-relaxed font-normal">
              Laser engrave your company logo, recipient name, event date, or sacred shlokas on the idol base.
            </p>
          </div>

          <div className="bg-white border border-stone-200 p-6 space-y-2.5 shadow-sm">
            <div className="text-2xl">🎁</div>
            <h3 className="font-display text-sm font-extrabold uppercase tracking-wider text-neutral-900">
              Luxury Velvet Packaging
            </h3>
            <p className="text-xs text-neutral-600 leading-relaxed font-normal">
              Presentation-ready rigid gift boxes lined with premium velvet and gold foil accents.
            </p>
          </div>

          <div className="bg-white border border-stone-200 p-6 space-y-2.5 shadow-sm">
            <div className="text-2xl">🚚</div>
            <h3 className="font-display text-sm font-extrabold uppercase tracking-wider text-neutral-900">
              Pan-India Insured Transit
            </h3>
            <p className="text-xs text-neutral-600 leading-relaxed font-normal">
              Single-destination or multi-address corporate dispatch across 19,000+ pin codes with 100% insurance.
            </p>
          </div>
        </div>

        {/* 3. Main Form Section & Side Studio Card */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Form Column */}
          <div className="lg:col-span-8 bg-white border border-stone-200 p-6 sm:p-10 shadow-sm">
            {isSuccess ? (
              <div className="py-12 px-4 text-center space-y-6">
                <div className="w-16 h-16 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-full flex items-center justify-center text-3xl mx-auto">
                  ✓
                </div>
                <div className="space-y-2">
                  <span className="text-[11px] font-bold tracking-[0.2em] uppercase text-emerald-700 bg-emerald-50 px-3 py-1 border border-emerald-200">
                    Inquiry Submitted Successfully
                  </span>
                  <h2 className="font-display text-2xl sm:text-3xl font-extrabold uppercase tracking-wider text-neutral-900 pt-2">
                    Thank You, {formData.name}
                  </h2>
                  <p className="text-xs sm:text-sm text-neutral-600 max-w-lg mx-auto leading-relaxed">
                    Your bulk inquiry has been recorded in our production system and your WhatsApp conversation is ready. Our Surat studio coordinator will provide an official tiered quotation and digital mockup within 2 business hours.
                  </p>
                </div>

                <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
                  <a
                    href={`https://wa.me/917990138678?text=${encodeURIComponent(
                      `🙏 Namaste MurtiPuja, following up on bulk inquiry for ${formData.deity} (${formData.quantity} units).`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full sm:w-auto px-6 py-3.5 bg-[#0a5c36] hover:bg-[#074729] text-white text-xs font-bold uppercase tracking-wider inline-flex items-center justify-center gap-2 shadow-sm transition-all"
                  >
                    <span>💬 Open WhatsApp Chat (+91 79901 38678)</span>
                  </a>

                  <button
                    onClick={() => {
                      setIsSuccess(false);
                      setFormData({
                        name: "",
                        company: "",
                        phone: "",
                        email: "",
                        city: "",
                        deity: DEITIES[0],
                        size: SIZES[1],
                        finish: FINISHES[0],
                        quantity: "25-50",
                        customQuantity: "",
                        occasion: OCCASIONS[0],
                        neededBy: "",
                        notes: "",
                      });
                    }}
                    className="w-full sm:w-auto px-6 py-3.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-900 text-xs font-bold uppercase tracking-wider transition-all"
                  >
                    Submit Another Inquiry
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-8">
                <div>
                  <h2 className="font-display text-xl sm:text-2xl font-extrabold uppercase tracking-wider text-neutral-900">
                    Bulk Order Quotation Request
                  </h2>
                  <p className="text-xs text-neutral-500 font-semibold uppercase tracking-wider mt-1">
                    Fill the details below — we will prepare tailored pricing and timeline options.
                  </p>
                </div>

                {errorMsg && (
                  <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
                    ⚠️ {errorMsg}
                  </div>
                )}

                {/* Section 1: Contact Details */}
                <div className="space-y-4 pt-2">
                  <h3 className="text-xs font-extrabold uppercase tracking-widest text-neutral-400 border-b border-stone-100 pb-1">
                    1. Client & Contact Details
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-700 mb-1">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="e.g. Rajesh Sharma"
                        className="w-full px-3.5 py-2.5 text-xs bg-stone-50 border border-stone-200 focus:border-neutral-900 focus:bg-white outline-none transition-all font-sans"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-700 mb-1">
                        Company / Event Name (Optional)
                      </label>
                      <input
                        type="text"
                        value={formData.company}
                        onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                        placeholder="e.g. Tata Consultancy Services / Sharma Wedding"
                        className="w-full px-3.5 py-2.5 text-xs bg-stone-50 border border-stone-200 focus:border-neutral-900 focus:bg-white outline-none transition-all font-sans"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-700 mb-1">
                        WhatsApp Number *
                      </label>
                      <div className="flex">
                        <span className="inline-flex items-center px-2.5 bg-stone-200 border border-r-0 border-stone-200 text-neutral-700 text-xs font-bold">
                          +91
                        </span>
                        <input
                          type="tel"
                          required
                          maxLength={10}
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          placeholder="98765 43210"
                          className="w-full px-3.5 py-2.5 text-xs bg-stone-50 border border-stone-200 focus:border-neutral-900 focus:bg-white outline-none transition-all font-sans"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-700 mb-1">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="name@company.com"
                        className="w-full px-3.5 py-2.5 text-xs bg-stone-50 border border-stone-200 focus:border-neutral-900 focus:bg-white outline-none transition-all font-sans"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-700 mb-1">
                        City & State
                      </label>
                      <input
                        type="text"
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        placeholder="e.g. Mumbai, Maharashtra"
                        className="w-full px-3.5 py-2.5 text-xs bg-stone-50 border border-stone-200 focus:border-neutral-900 focus:bg-white outline-none transition-all font-sans"
                      />
                    </div>
                  </div>
                </div>

                {/* Section 2: Order Specifications */}
                <div className="space-y-4 pt-2">
                  <h3 className="text-xs font-extrabold uppercase tracking-widest text-neutral-400 border-b border-stone-100 pb-1">
                    2. Sculpture & Quantity Specifications
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-700 mb-1">
                        Sculpture / Deity of Interest *
                      </label>
                      <select
                        value={formData.deity}
                        onChange={(e) => setFormData({ ...formData, deity: e.target.value })}
                        className="w-full px-3 py-2.5 text-xs bg-stone-50 border border-stone-200 focus:border-neutral-900 focus:bg-white outline-none transition-all font-sans cursor-pointer"
                      >
                        {DEITIES.map((d) => (
                          <option key={d} value={d}>
                            {d}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-700 mb-1">
                        Preferred Size
                      </label>
                      <select
                        value={formData.size}
                        onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                        className="w-full px-3 py-2.5 text-xs bg-stone-50 border border-stone-200 focus:border-neutral-900 focus:bg-white outline-none transition-all font-sans cursor-pointer"
                      >
                        {SIZES.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-700 mb-1">
                        Preferred Finish
                      </label>
                      <select
                        value={formData.finish}
                        onChange={(e) => setFormData({ ...formData, finish: e.target.value })}
                        className="w-full px-3 py-2.5 text-xs bg-stone-50 border border-stone-200 focus:border-neutral-900 focus:bg-white outline-none transition-all font-sans cursor-pointer"
                      >
                        {FINISHES.map((f) => (
                          <option key={f} value={f}>
                            {f}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-700 mb-1">
                        Occasion / Event Purpose
                      </label>
                      <select
                        value={formData.occasion}
                        onChange={(e) => setFormData({ ...formData, occasion: e.target.value })}
                        className="w-full px-3 py-2.5 text-xs bg-stone-50 border border-stone-200 focus:border-neutral-900 focus:bg-white outline-none transition-all font-sans cursor-pointer"
                      >
                        {OCCASIONS.map((o) => (
                          <option key={o} value={o}>
                            {o}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Quantity Pills */}
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-700 mb-2">
                      Estimated Quantity Required *
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {QUANTITY_OPTIONS.map((q) => (
                        <button
                          key={q}
                          type="button"
                          onClick={() => setFormData({ ...formData, quantity: q })}
                          className={`px-4 py-2 text-xs font-bold uppercase tracking-wider border transition-all ${
                            formData.quantity === q
                              ? "bg-neutral-900 text-white border-neutral-900 shadow-sm"
                              : "bg-white text-neutral-700 border-stone-200 hover:border-neutral-400"
                          }`}
                        >
                          {q}
                        </button>
                      ))}
                    </div>

                    {formData.quantity === "Custom" && (
                      <div className="mt-3">
                        <input
                          type="text"
                          value={formData.customQuantity}
                          onChange={(e) =>
                            setFormData({ ...formData, customQuantity: e.target.value })
                          }
                          placeholder="Enter exact count (e.g. 250 units)"
                          className="w-full sm:w-64 px-3.5 py-2 text-xs bg-stone-50 border border-stone-200 focus:border-neutral-900 focus:bg-white outline-none font-sans"
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Section 3: Customization & Timeline */}
                <div className="space-y-4 pt-2">
                  <h3 className="text-xs font-extrabold uppercase tracking-widest text-neutral-400 border-b border-stone-100 pb-1">
                    3. Custom Engraving, Packaging & Timeline
                  </h3>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-700 mb-1">
                      Target Delivery Date / Timeline
                    </label>
                    <input
                      type="text"
                      value={formData.neededBy}
                      onChange={(e) => setFormData({ ...formData, neededBy: e.target.value })}
                      placeholder="e.g. Need delivery by Diwali (Oct 25) or Within 2 weeks"
                      className="w-full px-3.5 py-2.5 text-xs bg-stone-50 border border-stone-200 focus:border-neutral-900 focus:bg-white outline-none transition-all font-sans"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-700 mb-1">
                      Customization Notes / Special Requests
                    </label>
                    <textarea
                      rows={3}
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      placeholder="Mention any custom logo engraving on pedestal, velvet box colors, individual greeting cards, or multi-address delivery needs..."
                      className="w-full px-3.5 py-2.5 text-xs bg-stone-50 border border-stone-200 focus:border-neutral-900 focus:bg-white outline-none transition-all font-sans resize-y"
                    />
                  </div>
                </div>

                {/* Submit Action */}
                <div className="pt-4 border-t border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full sm:w-auto px-8 py-4 bg-neutral-900 hover:bg-black text-white text-xs font-extrabold uppercase tracking-widest transition-all disabled:opacity-50 inline-flex items-center justify-center gap-2 shadow-sm"
                  >
                    {isSubmitting ? (
                      <span>Submitting Inquiry...</span>
                    ) : (
                      <span>💬 Submit Inquiry & Connect on WhatsApp</span>
                    )}
                  </button>

                  <p className="text-[11px] text-neutral-400 font-medium text-center sm:text-right">
                    🔒 Zero spam. We respond within 2 working hours.
                  </p>
                </div>
              </form>
            )}
          </div>

          {/* Right Information & Studio Concierge Column */}
          <div className="lg:col-span-4 space-y-6">
            {/* Quick Contact Card */}
            <div className="bg-white border border-stone-200 p-6 shadow-sm space-y-4">
              <span className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-neutral-400">
                Direct Studio Concierge
              </span>
              <h3 className="font-display text-base font-extrabold uppercase tracking-wider text-neutral-900">
                Prefer To Talk Directly?
              </h3>
              <p className="text-xs text-neutral-600 leading-relaxed font-normal">
                Have architectural CAD files, need bespoke dimensional modifications, or require urgent express fulfillment? Speak directly with our studio lead.
              </p>

              <div className="pt-2 space-y-2 border-t border-stone-100 text-xs">
                <div className="flex justify-between py-1">
                  <span className="text-neutral-500 font-semibold uppercase tracking-wider">WhatsApp Helpline:</span>
                  <a
                    href="https://wa.me/917990138678?text=Hi%20MurtiPuja,%20I%20have%20an%20inquiry."
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-bold text-neutral-900 hover:text-gold"
                  >
                    +91 79901 38678
                  </a>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-neutral-500 font-semibold uppercase tracking-wider">Corporate Email:</span>
                  <a
                    href="mailto:support@murtipuja.com"
                    className="font-bold text-neutral-900 hover:text-gold"
                  >
                    support@murtipuja.com
                  </a>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-neutral-500 font-semibold uppercase tracking-wider">Studio Working Hours:</span>
                  <span className="font-semibold text-neutral-700">Mon–Sat · 10am–7pm IST</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-neutral-500 font-semibold uppercase tracking-wider">Location:</span>
                  <span className="font-semibold text-neutral-700">Surat, Gujarat, India</span>
                </div>
              </div>

              <a
                href="https://wa.me/917990138678?text=Hi%20MurtiPuja%20Support,%20I%20would%20like%20to%20discuss%20a%20bulk%20corporate%20order."
                target="_blank"
                rel="noopener noreferrer"
                className="w-full mt-2 py-3 bg-stone-100 hover:bg-stone-200 text-neutral-900 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all"
              >
                <span>💬 Quick WhatsApp Chat →</span>
              </a>
            </div>

            {/* Past Gifting Highlights / Trust Card */}
            <div className="bg-[#111111] text-white p-6 shadow-sm space-y-4">
              <span className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-[#d4af37]">
                Craftsmanship Promise
              </span>
              <h3 className="font-display text-sm font-extrabold uppercase tracking-wider text-white">
                Why Corporates & Families Choose MurtiPuja
              </h3>
              <ul className="space-y-3 text-xs text-white/70">
                <li className="flex items-start gap-2">
                  <span className="text-[#d4af37]">✦</span>
                  <span><strong>Micro-Precision 0.1mm 3D Print:</strong> Every sacred curve and facial feature sculpted to Vedic perfection.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#d4af37]">✦</span>
                  <span><strong>Zero Breakage Transit:</strong> Custom high-density foam molds protect each idol through long-distance transit.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#d4af37]">✦</span>
                  <span><strong>Consecration Care:</strong> Clean, auspicious handling and blessing prior to final seal and dispatch.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* 4. Frequently Asked Questions Section */}
        <div className="border-t border-stone-200 pt-12 space-y-6">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <p className="text-[10px] uppercase tracking-[0.25em] text-neutral-400 font-extrabold">
              Questions & Guidance
            </p>
            <h2 className="font-display text-2xl sm:text-3xl font-extrabold uppercase tracking-wider text-neutral-900">
              Bulk Order FAQs
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-5xl mx-auto pt-4">
            {BULK_FAQS.map((faq, idx) => (
              <div
                key={idx}
                className="bg-white border border-stone-200 p-5 space-y-2 shadow-sm"
              >
                <h4 className="font-display text-xs font-extrabold uppercase tracking-wider text-neutral-900">
                  {faq.q}
                </h4>
                <p className="text-xs text-neutral-600 leading-relaxed font-normal">
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
