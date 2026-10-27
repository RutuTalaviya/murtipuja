"use client";

import { useState } from "react";

export default function ReturnPolicyModal({ isOpen, onClose, onConfirm, onCancel, hasOfferApplied = false }) {
  const [checked, setChecked] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-[#FDFBF7] border-t-4 border-maroon w-full max-w-lg rounded-2xl shadow-2xl p-6 md:p-8 animate-fade-in max-h-[90vh] overflow-y-auto">
        {/* Lotus/Warning header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-full bg-maroon/10 flex items-center justify-center text-maroon shrink-0">
            {/* Simple video camera icon */}
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <h2 className="font-display text-xl text-maroon font-semibold">
              Policy & Unboxing Acknowledgment
            </h2>
            <p className="text-[11px] text-charcoal/60">Important terms before placing your sacred order</p>
          </div>
        </div>

        {/* Dynamic Highlight If Offer / Discount Applied */}
        {hasOfferApplied && (
          <div className="bg-amber-50 border-2 border-amber-300 p-3.5 rounded-xl mb-4 text-xs">
            <p className="font-bold text-amber-900 flex items-center gap-1.5 uppercase tracking-wide text-[11px]">
              <span>🏷️</span>
              <span>Offer / Coupon Applied — Final Sale</span>
            </p>
            <p className="text-[11px] text-amber-800 font-medium mt-1 leading-relaxed">
              This order includes a discount or promotional offer. Under MurtiPuja store policy, <strong>orders with applied offers cannot be returned for a refund</strong>. In the event of transit damage, an instant free <strong>Replacement Exchange</strong> is guaranteed with an unboxing video.
            </p>
          </div>
        )}

        <div className="space-y-3.5 text-charcoal/80 text-sm leading-relaxed mb-6">
          <p className="text-xs text-charcoal/70">
            Since sacred spiritual idols are delicate and breakable, every shipment is fully insured under our standard customer protection rules:
          </p>
          <div className="bg-maroon/5 border-l-2 border-gold p-4 rounded-r-xl">
            <p className="font-semibold text-maroon mb-1 text-xs uppercase tracking-wide">📹 Compulsory Unboxing Video:</p>
            <p className="text-xs text-charcoal/70">
              Please record a <strong>clear, continuous, unedited unboxing video</strong> from the moment you start opening the outer courier packaging until the idol is fully unpacked and inspected on camera.
            </p>
            <p className="text-xs text-charcoal/70 mt-2">
              If the murti arrives broken or damaged, this video is <strong>strictly mandatory</strong> for a free replacement exchange. Requests without valid unboxing video proof will not be accepted.
            </p>
          </div>
          <div className="bg-stone-100 p-3 rounded-xl border border-stone-200">
            <p className="font-bold text-stone-900 text-xs uppercase tracking-wide mb-1">
              🏷️ Promotional & Offer Orders (Final Sale):
            </p>
            <p className="text-xs text-stone-700 leading-relaxed">
              Any order purchased with a discount coupon, combo deal, or cart offer is <strong>strictly Non-Returnable</strong> for cash refund. Genuine transit damage is eligible for <strong>Replacement Exchange</strong> only.
            </p>
          </div>
        </div>

        {/* Checkbox Agreement */}
        <label className="flex items-start gap-3 cursor-pointer select-none mb-6">
          <input
            type="checkbox"
            checked={checked}
            onChange={(e) => setChecked(e.target.checked)}
            className="w-5 h-5 mt-0.5 accent-maroon border-charcoal/30 rounded focus:ring-maroon shrink-0"
          />
          <span className="text-xs sm:text-sm text-charcoal/90 leading-snug">
            I understand and accept that an <strong>unboxing video is mandatory</strong> for transit damage claims, and that <strong>orders with promotional offers cannot be returned for a refund</strong> (exchange only for damage).
          </span>
        </label>

        {/* Buttons */}
        <div className="flex gap-3 justify-end">
          <button
            type="button"
            onClick={onCancel}
            className="px-5 py-2.5 rounded-xl border border-charcoal/15 text-charcoal/70 hover:bg-charcoal/5 transition-colors text-sm"
          >
            Go Back
          </button>
          <button
            type="button"
            disabled={!checked}
            onClick={onConfirm}
            className="px-6 py-2.5 rounded-xl bg-maroon text-white hover:bg-maroon-dark transition-colors text-sm font-semibold disabled:opacity-50"
          >
            I Agree & Place Order
          </button>
        </div>
      </div>
    </div>
  );
}
