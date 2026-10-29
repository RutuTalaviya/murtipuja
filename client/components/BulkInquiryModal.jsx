"use client";

import { useState } from "react";
import { formatImageUrl } from "@/lib/api";
import axios from "axios";

export default function BulkInquiryModal({
  isOpen,
  onClose,
  product,
  selectedSize = "",
  selectedFinish = "",
}) {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    quantity: "10-25",
    customQuantity: "",
    occasion: "Corporate Gifting",
    notes: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  if (!isOpen) return null;

  const quickQuantities = ["10-25", "25-50", "50-100", "100+"];
  const occasions = [
    "Corporate Gifting",
    "Wedding & Return Favors",
    "Mandir / Temple Inauguration",
    "Sacred Housewarming (Griha Pravesh)",
    "Diwali & Festive Gifting",
    "Bespoke Idol Commission",
    "Other Special Event",
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errorMsg) setErrorMsg("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      setErrorMsg("Please enter your full name");
      return;
    }
    const cleanPhone = formData.phone.replace(/[^0-9]/g, "");
    if (cleanPhone.length < 10) {
      setErrorMsg("Please enter a valid 10-digit WhatsApp/mobile number");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg("");

    const finalQuantity = formData.quantity === "Custom" ? formData.customQuantity || "10+" : formData.quantity;
    const variantDesc = [selectedSize, selectedFinish].filter(Boolean).join(" • ");

    // 1. Submit lead to Backend API
    try {
      const apiUrl = typeof window !== "undefined" && window.location.hostname !== "localhost"
        ? "https://api.murtipuja.com/api/inquiries"
        : "/api/inquiries";

      await axios.post(apiUrl, {
        name: formData.name.trim(),
        phone: cleanPhone,
        email: formData.email.trim(),
        productTitle: product?.title || "Sacred Idol",
        productSlug: product?.slug || "",
        productId: product?._id || null,
        variantDetails: variantDesc,
        quantity: finalQuantity,
        occasion: formData.occasion,
        notes: formData.notes.trim(),
      }).catch((err) => {
        console.warn("Backend lead save fallback:", err.message);
      });
    } catch (err) {
      console.warn("Inquiry save notice:", err);
    }

    // 2. Format WhatsApp Message
    const waText = [
      `🙏 *Namaste MurtiPuja! I want to place a Bulk / Corporate Inquiry.*`,
      ``,
      `📦 *Product:* ${product?.title || "Sacred Idol"}${variantDesc ? ` (${variantDesc})` : ""}`,
      `👤 *Name:* ${formData.name.trim()}`,
      `📱 *Phone:* ${cleanPhone}`,
      formData.email ? `✉️ *Email:* ${formData.email.trim()}` : null,
      `🔢 *Quantity Required:* ${finalQuantity} units`,
      `🎉 *Occasion / Purpose:* ${formData.occasion}`,
      formData.notes ? `📝 *Requirements:* ${formData.notes.trim()}` : null,
      `🔗 *Product Link:* https://murtipuja.com/products/${product?.slug || ""}`,
    ].filter(Boolean).join("\n");

    const waUrl = `https://wa.me/917990138678?text=${encodeURIComponent(waText)}`;

    // Open WhatsApp in new tab
    if (typeof window !== "undefined") {
      window.open(waUrl, "_blank", "noopener,noreferrer");
    }

    setIsSubmitting(false);
    setIsSuccess(true);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-fade-in font-display"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg bg-white border-2 border-black rounded-none shadow-2xl p-5 sm:p-7 max-h-[92vh] overflow-y-auto my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          type="button"
          className="absolute top-3.5 right-3.5 w-8 h-8 rounded-none border border-black bg-white hover:bg-black hover:text-white flex items-center justify-center font-bold text-sm transition-colors cursor-pointer"
          aria-label="Close Modal"
        >
          ✕
        </button>

        {isSuccess ? (
          <div className="text-center py-8 space-y-4">
            <div className="w-16 h-16 bg-amber-50 border-2 border-black rounded-full flex items-center justify-center mx-auto text-2xl">
              ✓
            </div>
            <h3 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-neutral-900">
              Inquiry Sent Successfully!
            </h3>
            <p className="text-xs sm:text-sm text-neutral-600 max-w-sm mx-auto font-medium leading-relaxed">
              WhatsApp chat has opened with your inquiry details. Our Surat studio concierge will review your quantity and provide exclusive tiered pricing with custom packaging options within 2 hours.
            </p>
            <div className="pt-3 flex flex-col sm:flex-row gap-2.5 justify-center">
              <a
                href="https://wa.me/917990138678"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 bg-[#25D366] text-white px-5 py-3 border border-black font-extrabold uppercase tracking-widest text-xs hover:bg-[#1ebd5a] transition-colors"
              >
                <span>💬 Chat on WhatsApp (+91 79901 38678)</span>
              </a>
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-3 border-2 border-black text-black font-extrabold uppercase tracking-widest text-xs hover:bg-neutral-100 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        ) : (
          <div>
            {/* Header */}
            <div className="border-b border-neutral-200 pb-3.5 mb-4">
              <div className="flex items-center gap-1.5 mb-1">
                <span className="text-sm">🏢</span>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-800">
                  Bulk & Corporate Gifting
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold uppercase tracking-tight text-neutral-900">
                Request Bulk Pricing
              </h2>
              <p className="text-[11px] text-neutral-500 font-medium mt-0.5">
                Special tiered discounts & bespoke packaging available for 10+ idols.
              </p>
            </div>

            {/* Selected Product Banner */}
            {product && (
              <div className="flex items-center gap-3 bg-stone-50 border border-neutral-200 p-2.5 mb-4">
                <div className="w-12 h-12 bg-white border border-neutral-200 flex-shrink-0 relative overflow-hidden">
                  {product.images?.[0]?.url && (
                    <img
                      src={formatImageUrl(product.images[0].url)}
                      alt={product.title}
                      className="w-full h-full object-contain p-1"
                    />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-extrabold uppercase tracking-wider text-neutral-900 truncate">
                    {product.title}
                  </p>
                  {(selectedSize || selectedFinish) && (
                    <p className="text-[10.5px] text-neutral-500 font-semibold truncate">
                      {[selectedSize, selectedFinish].filter(Boolean).join(" • ")}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Error Notice */}
            {errorMsg && (
              <div className="p-2.5 mb-3.5 bg-red-50 border border-red-300 text-red-700 text-xs font-semibold">
                ⚠️ {errorMsg}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-3.5">
              {/* Name & Phone in 2 cols */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] uppercase tracking-wider font-extrabold text-neutral-700 mb-1">
                    Your Full Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="e.g. Rahul Sharma"
                    required
                    className="w-full px-3 py-2 border border-neutral-300 focus:border-black focus:outline-none text-xs rounded-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-wider font-extrabold text-neutral-700 mb-1">
                    WhatsApp Number *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="10-digit Mobile No."
                    required
                    className="w-full px-3 py-2 border border-neutral-300 focus:border-black focus:outline-none text-xs rounded-none"
                  />
                </div>
              </div>

              {/* Email Address */}
              <div>
                <label className="block text-[10px] uppercase tracking-wider font-extrabold text-neutral-700 mb-1">
                  Email Address (Optional)
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="e.g. rahul@company.com"
                  className="w-full px-3 py-2 border border-neutral-300 focus:border-black focus:outline-none text-xs rounded-none"
                />
              </div>

              {/* Quantity Selector */}
              <div>
                <label className="block text-[10px] uppercase tracking-wider font-extrabold text-neutral-700 mb-1.5">
                  Quantity Required *
                </label>
                <div className="grid grid-cols-4 gap-2 mb-2">
                  {quickQuantities.map((q) => (
                    <button
                      key={q}
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, quantity: q }))}
                      className={`py-1.5 text-xs font-extrabold uppercase border transition-all ${
                        formData.quantity === q
                          ? "bg-black text-white border-black"
                          : "bg-white text-neutral-700 border-neutral-300 hover:border-black"
                      }`}
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>

              {/* Occasion / Purpose Dropdown */}
              <div>
                <label className="block text-[10px] uppercase tracking-wider font-extrabold text-neutral-700 mb-1">
                  Occasion / Gifting Purpose
                </label>
                <select
                  name="occasion"
                  value={formData.occasion}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-neutral-300 focus:border-black focus:outline-none text-xs rounded-none bg-white cursor-pointer"
                >
                  {occasions.map((occ) => (
                    <option key={occ} value={occ}>
                      {occ}
                    </option>
                  ))}
                </select>
              </div>

              {/* Additional Notes */}
              <div>
                <label className="block text-[10px] uppercase tracking-wider font-extrabold text-neutral-700 mb-1">
                  Custom Requirements / Notes
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  rows={2}
                  placeholder="Mention custom base engraving, gift boxes, target delivery date..."
                  className="w-full px-3 py-2 border border-neutral-300 focus:border-black focus:outline-none text-xs rounded-none resize-none"
                />
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-black hover:bg-gold hover:text-black text-white border-2 border-black py-3.5 rounded-none font-extrabold uppercase tracking-widest text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <span>Submitting Inquiry...</span>
                  ) : (
                    <>
                      <span>💬 Submit & Connect on WhatsApp</span>
                      <span>→</span>
                    </>
                  )}
                </button>
                <p className="text-[9.5px] text-center text-neutral-400 font-semibold mt-2">
                  🔒 100% Confidential. Directly managed by MurtiPuja Studio founders in Surat.
                </p>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
