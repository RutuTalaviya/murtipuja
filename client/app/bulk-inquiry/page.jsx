"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
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

function BulkInquiryContent() {
  const searchParams = useSearchParams();
  const queryProduct = searchParams.get("product");
  const querySize = searchParams.get("size");
  const queryFinish = searchParams.get("finish");

  const [formData, setFormData] = useState({
    name: "",
    company: "",
    phone: "",
    email: "",
    city: "",
    deity: queryProduct || DEITIES[0],
    size: querySize || SIZES[1],
    finish: queryFinish || FINISHES[0],
    quantity: "25-50",
    customQuantity: "",
    occasion: OCCASIONS[0],
    notes: "",
  });

  // If URL query parameters are present, update state
  useEffect(() => {
    if (queryProduct) {
      setFormData((prev) => ({
        ...prev,
        deity: queryProduct,
        size: querySize || prev.size,
        finish: queryFinish || prev.finish,
      }));
    }
  }, [queryProduct, querySize, queryFinish]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

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
      formData.city ? `📍 *City / State:* ${formData.city.trim()}` : null,
      ``,
      `📦 *Sculpture / Deity:* ${formData.deity}`,
      `📏 *Size Preference:* ${formData.size}`,
      `✨ *Finish:* ${formData.finish}`,
      `🔢 *Quantity Required:* ${finalQuantity} units`,
      `🎉 *Occasion:* ${formData.occasion}`,
      formData.notes ? `📝 *Requirements:* ${formData.notes.trim()}` : null,
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
    <main className="min-h-screen bg-[#faf9f6] px-4 sm:px-6 md:px-8 lg:px-12 py-6 sm:py-8 md:py-10 font-display w-full">
      <div className="w-full space-y-6 md:space-y-8">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-2 text-[11px] text-neutral-400 font-semibold uppercase tracking-wider">
          <Link href="/" className="hover:text-gold transition-colors">
            Home
          </Link>
          <span>/</span>
          <span className="text-neutral-800">Custom & Bulk Orders</span>
        </div>

        {/* Full-Width Header */}
        <div className="border-b border-stone-200 pb-6 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
            <p className="text-[10px] uppercase tracking-[0.25em] text-neutral-400 font-extrabold mb-1">
              MurtiPuja Studio
            </p>
            <h1 className="font-display text-2xl sm:text-3xl md:text-4xl text-neutral-900 font-extrabold uppercase tracking-wider">
              Bulk & Corporate Inquiry
            </h1>
            <p className="text-xs sm:text-sm text-neutral-600 font-medium mt-1">
              Fill the form below to receive exclusive volume discounts, bespoke dimensions, laser engraving & custom luxury packaging.
            </p>
          </div>

          {/* Quick Direct WhatsApp Chat */}
          <a
            href="https://wa.me/917990138678?text=Hi%20MurtiPuja,%20I%20have%20an%20urgent%20bulk%20inquiry."
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#0a5c36] hover:bg-[#074729] text-white text-xs font-bold uppercase tracking-wider shadow-sm transition-all flex-shrink-0"
          >
            <span>💬 Direct WhatsApp Support: +91 79901 38678</span>
          </a>
        </div>

        {/* Selected Product Banner (if coming from product page) */}
        {queryProduct && (
          <div className="p-3.5 bg-amber-50/80 border border-amber-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-base">📦</span>
              <p className="font-semibold text-neutral-800">
                Inquiring For: <span className="font-extrabold text-amber-950">{queryProduct}</span>
                {querySize || queryFinish ? (
                  <span className="text-neutral-500 font-medium"> ({[querySize, queryFinish].filter(Boolean).join(" • ")})</span>
                ) : null}
              </p>
            </div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800">
              ✓ Pre-filled in form below
            </span>
          </div>
        )}

        {/* Full-Screen Form Container */}
        <div className="w-full bg-white border border-stone-200 p-6 sm:p-10 lg:p-12 shadow-sm">
          {isSuccess ? (
            <div className="py-12 text-center space-y-6 max-w-xl mx-auto">
              <div className="w-16 h-16 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-full flex items-center justify-center text-3xl mx-auto">
                ✓
              </div>
              <div className="space-y-2">
                <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-emerald-700 bg-emerald-50 px-3 py-1 border border-emerald-200">
                  Inquiry Received With Gratitude
                </span>
                <h2 className="font-display text-2xl sm:text-3xl font-extrabold uppercase tracking-wider text-neutral-900 pt-2">
                  Thank You, {formData.name}
                </h2>
                <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
                  Your inquiry has been recorded in our production system and your WhatsApp conversation is ready. Our Surat studio coordinator will provide an official tiered quotation and digital mockup within 2 business hours.
                </p>
              </div>

              <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
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
                  type="button"
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
              {errorMsg && (
                <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
                  ⚠️ {errorMsg}
                </div>
              )}

              {/* 1. Contact Information Row */}
              <div className="space-y-4">
                <h3 className="text-xs font-extrabold uppercase tracking-widest text-neutral-400 border-b border-stone-100 pb-2">
                  1. Contact Information
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Your full name"
                      className="w-full px-3.5 py-2.5 text-xs bg-stone-50 border border-stone-200 focus:border-neutral-900 focus:bg-white outline-none transition-all font-sans"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
                      WhatsApp Number *
                    </label>
                    <div className="flex">
                      <span className="inline-flex items-center px-3 bg-stone-200 border border-r-0 border-stone-200 text-neutral-700 text-xs font-bold">
                        +91
                      </span>
                      <input
                        type="tel"
                        required
                        maxLength={10}
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="10-digit number"
                        className="w-full px-3.5 py-2.5 text-xs bg-stone-50 border border-stone-200 focus:border-neutral-900 focus:bg-white outline-none transition-all font-sans"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="name@example.com"
                      className="w-full px-3.5 py-2.5 text-xs bg-stone-50 border border-stone-200 focus:border-neutral-900 focus:bg-white outline-none transition-all font-sans"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
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

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
                      City & State (Optional)
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

              {/* 2. Sculpture & Customization Specifications */}
              <div className="space-y-4 pt-2">
                <h3 className="text-xs font-extrabold uppercase tracking-widest text-neutral-400 border-b border-stone-100 pb-2">
                  2. Sculpture & Quantity Specifications
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
                      Sculpture / Deity *
                    </label>
                    <select
                      value={formData.deity}
                      onChange={(e) => setFormData({ ...formData, deity: e.target.value })}
                      className="w-full px-3 py-2.5 text-xs bg-stone-50 border border-stone-200 focus:border-neutral-900 focus:bg-white outline-none transition-all font-sans cursor-pointer"
                    >
                      {DEITIES.includes(formData.deity) ? null : (
                        <option value={formData.deity}>{formData.deity}</option>
                      )}
                      {DEITIES.map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
                      Preferred Size
                    </label>
                    <select
                      value={formData.size}
                      onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                      className="w-full px-3 py-2.5 text-xs bg-stone-50 border border-stone-200 focus:border-neutral-900 focus:bg-white outline-none transition-all font-sans cursor-pointer"
                    >
                      {SIZES.includes(formData.size) ? null : (
                        <option value={formData.size}>{formData.size}</option>
                      )}
                      {SIZES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
                      Preferred Finish
                    </label>
                    <select
                      value={formData.finish}
                      onChange={(e) => setFormData({ ...formData, finish: e.target.value })}
                      className="w-full px-3 py-2.5 text-xs bg-stone-50 border border-stone-200 focus:border-neutral-900 focus:bg-white outline-none transition-all font-sans cursor-pointer"
                    >
                      {FINISHES.includes(formData.finish) ? null : (
                        <option value={formData.finish}>{formData.finish}</option>
                      )}
                      {FINISHES.map((f) => (
                        <option key={f} value={f}>
                          {f}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
                      Occasion / Purpose
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

                {/* Quantity Selection */}
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-700 mb-2">
                    Estimated Quantity Required *
                  </label>
                  <div className="flex flex-wrap gap-2.5">
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
                        placeholder="Enter quantity (e.g. 250 units)"
                        className="w-full sm:w-64 px-3.5 py-2.5 text-xs bg-stone-50 border border-stone-200 focus:border-neutral-900 focus:bg-white outline-none font-sans"
                      />
                    </div>
                  )}
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-700 mb-1.5">
                    Customization, Engraving & Delivery Notes
                  </label>
                  <textarea
                    rows={3}
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Mention custom logo engraving on pedestal, velvet gift box preferences, target delivery date, multi-address dispatch, etc."
                    className="w-full px-4 py-3 text-xs bg-stone-50 border border-stone-200 focus:border-neutral-900 focus:bg-white outline-none transition-all font-sans resize-y"
                  />
                </div>
              </div>

              {/* Submit Action Bar */}
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

                <p className="text-[11px] text-neutral-500 font-medium text-center sm:text-right">
                  🔒 Zero spam. Formal quotation & mockup provided within 2 business hours.
                </p>
              </div>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}

export default function BulkInquiryPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#faf9f6] flex items-center justify-center p-8 font-display">
          <p className="text-xs text-neutral-400 font-extrabold uppercase tracking-widest animate-pulse">
            Loading Inquiry Portal...
          </p>
        </div>
      }
    >
      <BulkInquiryContent />
    </Suspense>
  );
}
