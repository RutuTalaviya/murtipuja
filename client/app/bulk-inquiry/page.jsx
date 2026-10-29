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
    notes: "",
  });

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
    <main className="min-h-screen bg-[#faf9f6] px-4 sm:px-6 py-8 sm:py-14 font-display flex flex-col items-center justify-center">
      <div className="w-full max-w-2xl">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center justify-center gap-2 text-[11px] text-neutral-400 font-semibold uppercase tracking-wider mb-6">
          <Link href="/" className="hover:text-gold transition-colors">
            Home
          </Link>
          <span>/</span>
          <span className="text-neutral-800">Custom & Bulk Orders</span>
        </div>

        {/* Clean Header */}
        <div className="text-center space-y-2 mb-8">
          <p className="text-[10px] uppercase tracking-[0.25em] text-neutral-400 font-extrabold">
            MurtiPuja Studio
          </p>
          <h1 className="font-display text-2xl sm:text-3xl md:text-4xl text-neutral-900 font-extrabold uppercase tracking-wider">
            Bulk & Corporate Inquiry
          </h1>
          <p className="text-xs sm:text-sm text-neutral-600 font-normal max-w-lg mx-auto">
            Fill the form below to receive exclusive tiered bulk pricing, bespoke pedestal engraving, and custom luxury gift packaging.
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white border border-stone-200 p-6 sm:p-10 shadow-sm">
          {isSuccess ? (
            <div className="py-10 text-center space-y-6">
              <div className="w-14 h-14 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-full flex items-center justify-center text-2xl mx-auto">
                ✓
              </div>
              <div className="space-y-2">
                <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-emerald-700 bg-emerald-50 px-3 py-1 border border-emerald-200">
                  Inquiry Received
                </span>
                <h2 className="font-display text-2xl font-extrabold uppercase tracking-wider text-neutral-900 pt-2">
                  Thank You, {formData.name}
                </h2>
                <p className="text-xs sm:text-sm text-neutral-600 max-w-md mx-auto leading-relaxed">
                  Your inquiry has been received. Our Surat studio coordinator will provide an official tiered quotation and digital mockup on WhatsApp within 2 hours.
                </p>
              </div>

              <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
                <a
                  href={`https://wa.me/917990138678?text=${encodeURIComponent(
                    `🙏 Namaste MurtiPuja, following up on bulk inquiry for ${formData.deity} (${formData.quantity} units).`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto px-6 py-3 bg-[#0a5c36] hover:bg-[#074729] text-white text-xs font-bold uppercase tracking-wider inline-flex items-center justify-center gap-2 shadow-sm transition-all"
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
                  className="w-full sm:w-auto px-6 py-3 bg-neutral-100 hover:bg-neutral-200 text-neutral-900 text-xs font-bold uppercase tracking-wider transition-all"
                >
                  Submit Another Inquiry
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {errorMsg && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
                  ⚠️ {errorMsg}
                </div>
              )}

              {/* 1. Contact Details */}
              <div className="space-y-4">
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
                      placeholder="Your full name"
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
                      placeholder="e.g. Corporate / Wedding"
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
                        placeholder="10-digit number"
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
                      placeholder="email@example.com"
                      className="w-full px-3.5 py-2.5 text-xs bg-stone-50 border border-stone-200 focus:border-neutral-900 focus:bg-white outline-none transition-all font-sans"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-700 mb-1">
                      City / State
                    </label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      placeholder="e.g. Surat, Gujarat"
                      className="w-full px-3.5 py-2.5 text-xs bg-stone-50 border border-stone-200 focus:border-neutral-900 focus:bg-white outline-none transition-all font-sans"
                    />
                  </div>
                </div>
              </div>

              {/* 2. Sculpture, Quantity & Occasion */}
              <div className="space-y-4 pt-2 border-t border-stone-100">
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
                        className={`px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider border transition-all ${
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
                    <div className="mt-2.5">
                      <input
                        type="text"
                        value={formData.customQuantity}
                        onChange={(e) =>
                          setFormData({ ...formData, customQuantity: e.target.value })
                        }
                        placeholder="Enter quantity (e.g. 250 units)"
                        className="w-full sm:w-60 px-3 py-2 text-xs bg-stone-50 border border-stone-200 focus:border-neutral-900 focus:bg-white outline-none font-sans"
                      />
                    </div>
                  )}
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-700 mb-1">
                    Customization & Packaging Notes
                  </label>
                  <textarea
                    rows={3}
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Mention any custom logo engraving on pedestal, velvet gift box preferences, target delivery date, etc."
                    className="w-full px-3.5 py-2.5 text-xs bg-stone-50 border border-stone-200 focus:border-neutral-900 focus:bg-white outline-none transition-all font-sans resize-y"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 bg-neutral-900 hover:bg-black text-white text-xs font-extrabold uppercase tracking-widest transition-all disabled:opacity-50 inline-flex items-center justify-center gap-2 shadow-sm"
                >
                  {isSubmitting ? (
                    <span>Submitting Inquiry...</span>
                  ) : (
                    <span>💬 Submit Inquiry & Connect on WhatsApp</span>
                  )}
                </button>
                <p className="text-[11px] text-neutral-400 font-medium text-center mt-2.5">
                  Direct response on WhatsApp within 2 hours · No spam guaranteed
                </p>
              </div>
            </form>
          )}
        </div>

        {/* Small WhatsApp Direct Chat Link */}
        <div className="text-center mt-6">
          <a
            href="https://wa.me/917990138678?text=Hi%20MurtiPuja,%20I%20have%20an%20urgent%20bulk%20inquiry."
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-neutral-600 hover:text-neutral-900 transition-colors"
          >
            <span>Prefer to chat directly? Contact WhatsApp: +91 79901 38678 →</span>
          </a>
        </div>
      </div>
    </main>
  );
}
