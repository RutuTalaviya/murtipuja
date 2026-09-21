"use client";

import { useState } from "react";

export default function ReturnPolicyModal({ isOpen, onClose, onConfirm, onCancel }) {
  const [checked, setChecked] = useState(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-[#FDFBF7] border-t-4 border-maroon w-full max-w-lg rounded-2xl shadow-2xl p-6 md:p-8 animate-fade-in">
        {/* Lotus/Warning header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-maroon/10 flex items-center justify-center text-maroon">
            {/* Simple video camera icon */}
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </div>
          <h2 className="font-display text-xl text-maroon font-semibold">
            Unboxing Video Policy Acknowledgment
          </h2>
        </div>

        <div className="space-y-4 text-charcoal/80 text-sm leading-relaxed mb-6">
          <p>
            Please read our damage claim policy carefully before placing your order. Since spiritual idols are delicate and breakable, we insure all packages.
          </p>
          <div className="bg-maroon/5 border-l-2 border-gold p-4 rounded-r-xl">
            <p className="font-semibold text-maroon mb-1">📹 Compulsory Unboxing Video:</p>
            <p className="text-xs text-charcoal/70">
              Please record a <strong>clear, continuous, unedited unboxing video</strong> from the moment you start opening the sealed package until the product is fully unpacked and inspected.
            </p>
            <p className="text-xs text-charcoal/70 mt-2">
              If the murti arrives broken or damaged, this video is <strong>mandatory</strong> to process a refund or replacement. Requests without a valid unboxing video will <strong>NOT</strong> be accepted.
            </p>
          </div>
          <p className="text-xs text-charcoal/50">
            *This policy does not apply to other return reasons (e.g. wrong item sent), which follow standard return processes.
          </p>
        </div>

        {/* Checkbox Agreement */}
        <label className="flex items-start gap-3 cursor-pointer select-none mb-6">
          <input
            type="checkbox"
            checked={checked}
            onChange={(e) => setChecked(e.target.checked)}
            className="w-5 h-5 mt-0.5 accent-maroon border-charcoal/30 rounded focus:ring-maroon"
          />
          <span className="text-sm text-charcoal/90">
            I understand and agree that an unboxing video is <strong>compulsory</strong> for any damage-based return/refund.
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
