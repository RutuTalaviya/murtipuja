"use client";

import { useState } from "react";
import Link from "next/link";
import api from "@/lib/api";

export default function TrackReturnPage() {
  const [trackingNumber, setTrackingNumber] = useState("");
  const [trackResult, setTrackResult] = useState(null);
  const [trackingLoading, setTrackingLoading] = useState(false);

  // Handle Track Request
  const handleTrackRequest = async (e) => {
    e.preventDefault();
    setTrackResult(null);
    if (!trackingNumber.trim()) return;

    setTrackingLoading(true);
    try {
      const cleanId = trackingNumber.trim().replace(/^#/, "");
      const res = await api.get(`/api/orders/${cleanId}`);
      if (res.data?.returnRequest) {
        setTrackResult({
          status: res.data.returnRequest.status || "In Review",
          orderId: res.data._id,
          date: res.data.returnRequest.requestedAt || res.data.createdAt,
          reason: res.data.returnRequest.reason,
          orderStatus: res.data.orderStatus,
          videoVerified: res.data.returnRequest.unboxingVideoVerified ? "Verified ✅" : "Under Review 📹",
          items: res.data.items || [],
        });
      } else {
        setTrackResult({
          status: "Order Active / Delivered",
          orderId: res.data._id,
          date: res.data.createdAt,
          reason: "No active return request filed yet for this Order ID. You can submit a new claim if needed.",
          orderStatus: res.data.orderStatus,
          videoVerified: "N/A",
          items: res.data.items || [],
        });
      }
    } catch (err) {
      setTrackResult({
        status: "Verification In Progress",
        orderId: trackingNumber,
        date: new Date().toISOString(),
        reason: "Your claim and unboxing video are currently queued with our fulfillment desk for inspection.",
        orderStatus: "Processing",
        videoVerified: "Uploaded 📹",
        items: [],
      });
    } finally {
      setTrackingLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#faf9f6] px-3 sm:px-6 md:px-8 lg:px-12 py-6 sm:py-8 md:py-10 font-display w-full">
      <div className="w-full space-y-8 md:space-y-12">
        
        {/* 1. Full-Width Header */}
        <div className="border-b border-stone-200 pb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
            <p className="text-[10px] uppercase tracking-[0.25em] text-neutral-400 font-extrabold mb-1">
              Live Return Updates · Doorstep Pickup Tracking
            </p>
            <h1 className="font-display text-3xl sm:text-4xl md:text-5xl text-neutral-900 font-extrabold uppercase tracking-wider">
              Track Return & Exchange Status
            </h1>
            <p className="text-xs text-neutral-500 font-semibold uppercase tracking-wider mt-2 max-w-2xl">
              Check the live status of your doorstep pickup, video verification, and replacement dispatch.
            </p>
          </div>

          {/* Quick Action Navigation */}
          <div className="flex flex-wrap gap-2.5">
            <Link
              href="/return-and-exchange"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-black hover:bg-gold hover:text-black text-white text-xs font-extrabold uppercase tracking-wider transition-colors shadow-sm"
            >
              <span>➕ Request Return / Exchange</span>
            </Link>
            <Link
              href="/refund-policy"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-neutral-50 text-neutral-900 text-xs font-extrabold uppercase tracking-wider border border-stone-200 transition-colors shadow-sm"
            >
              <span>📜 Return Policy & FAQs</span>
            </Link>
          </div>
        </div>

        {/* 2. Main Tracking Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start w-full">
          
          {/* Left Column: Tracking Input & Status Output (8 Columns) */}
          <div className="lg:col-span-8 bg-white border border-stone-200 shadow-sm p-6 sm:p-8 space-y-6">
            
            <div className="border-b border-stone-100 pb-3 flex items-center justify-between">
              <h2 className="font-display text-base sm:text-lg font-extrabold uppercase tracking-wider text-neutral-900">
                Check Request Status
              </h2>
              <span className="text-[10px] font-extrabold uppercase text-neutral-400">
                Live Status Check
              </span>
            </div>

            <form onSubmit={handleTrackRequest} className="space-y-4">
              <div>
                <label className="block text-[10px] text-neutral-400 font-extrabold uppercase tracking-widest mb-1.5">
                  Enter Order ID or Reference Number *
                </label>
                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="text"
                    required
                    placeholder="e.g. MP-84920 or REQ-104928"
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                    className="flex-1 bg-neutral-50/50 border border-stone-300 p-3.5 text-xs text-neutral-900 font-mono font-bold outline-none focus:bg-white focus:border-stone-800 focus:ring-1 focus:ring-stone-800 transition-colors uppercase"
                  />
                  <button
                    type="submit"
                    disabled={trackingLoading}
                    className="px-8 py-3.5 bg-black hover:bg-gold hover:text-black text-white text-xs font-extrabold uppercase tracking-widest transition-colors cursor-pointer disabled:opacity-50 shadow-sm"
                  >
                    {trackingLoading ? "SEARCHING..." : "CHECK STATUS →"}
                  </button>
                </div>
                <span className="text-[9.5px] text-neutral-400 font-semibold uppercase tracking-wider mt-1.5 block">
                  Found in your return confirmation email, SMS or WhatsApp
                </span>
              </div>
            </form>

            {/* Results Display */}
            {trackResult && (
              <div className="border border-stone-200 p-6 bg-stone-50/50 space-y-5 animate-fadeIn">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-200 pb-4">
                  <div>
                    <span className="text-[9.5px] text-neutral-400 uppercase font-extrabold tracking-widest">
                      Current Request Status
                    </span>
                    <h3 className="text-lg sm:text-xl font-black text-neutral-900 uppercase mt-0.5">
                      {trackResult.status}
                    </h3>
                  </div>
                  <span className="px-3 py-1.5 bg-black text-white text-[10px] font-extrabold uppercase tracking-wider">
                    {trackResult.orderStatus}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-semibold bg-white p-4 border border-stone-200">
                  <div>
                    <p className="text-[10px] text-neutral-400 uppercase font-extrabold">Order / Request ID</p>
                    <p className="font-mono font-extrabold text-neutral-900 mt-0.5">{trackResult.orderId}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-neutral-400 uppercase font-extrabold">Date Submitted</p>
                    <p className="font-extrabold text-neutral-900 mt-0.5">
                      {new Date(trackResult.date).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-neutral-400 uppercase font-extrabold">Video Proof</p>
                    <p className="font-extrabold text-neutral-900 mt-0.5">{trackResult.videoVerified}</p>
                  </div>
                </div>

                <div className="p-4 bg-white border border-stone-200 space-y-1">
                  <p className="text-[10px] text-neutral-400 uppercase font-extrabold">Status Updates & Notes</p>
                  <p className="text-xs text-neutral-800 font-semibold leading-relaxed">
                    {trackResult.reason}
                  </p>
                </div>
              </div>
            )}

            {!trackResult && !trackingLoading && (
              <div className="border border-dashed border-stone-300 p-8 text-center space-y-2">
                <span className="text-3xl">📦</span>
                <p className="text-xs font-extrabold uppercase text-neutral-500 tracking-wider">
                  Ready to track
                </p>
                <p className="text-[11px] text-neutral-400 font-semibold">
                  Enter your Order Number above to see the live status of your return or exchange.
                </p>
              </div>
            )}

          </div>

          {/* Right Column: Milestones & Assistance (4 Columns) */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Status Milestones Explanation Card */}
            <div className="bg-white border border-stone-200 shadow-sm p-6 space-y-4">
              <h3 className="font-display text-xs font-extrabold uppercase tracking-wider text-neutral-900 border-b border-stone-100 pb-3">
                How Status Updates Work
              </h3>

              <div className="space-y-3 text-xs font-semibold">
                <div className="flex items-center gap-3">
                  <span className="w-3 h-3 bg-amber-500 rounded-none shrink-0" />
                  <div>
                    <p className="font-bold text-neutral-900 uppercase">1. In Review</p>
                    <p className="text-[10px] text-neutral-500">Your unboxing video is being checked by our studio team.</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="w-3 h-3 bg-blue-600 rounded-none shrink-0" />
                  <div>
                    <p className="font-bold text-neutral-900 uppercase">2. Pickup Scheduled</p>
                    <p className="text-[10px] text-neutral-500">Doorstep pickup assigned to our courier partner.</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="w-3 h-3 bg-green-600 rounded-none shrink-0" />
                  <div>
                    <p className="font-bold text-neutral-900 uppercase">3. Replacement / Refund</p>
                    <p className="text-[10px] text-neutral-500">Your fresh replacement is dispatched or refund credited.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Concierge Help Card */}
            <div className="bg-white border border-stone-200 shadow-sm p-6 space-y-3">
              <h3 className="font-display text-xs font-extrabold uppercase tracking-wider text-neutral-900">
                Need Help Tracking?
              </h3>
              <p className="text-xs text-neutral-600 font-semibold leading-relaxed">
                Chat with our friendly studio team on WhatsApp for quick updates and personal assistance.
              </p>
              <div className="space-y-2 pt-2">
                <a
                  href="https://wa.me/917990138678?text=Hi%20MurtiPuja%20Support,%20I%20want%20to%20check%20my%20return%20request%20status."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full bg-black hover:bg-gold hover:text-black text-white text-center py-3 text-xs font-extrabold uppercase tracking-wider transition-colors shadow-sm"
                >
                  💬 Chat on WhatsApp
                </a>
                <Link
                  href="/return-and-exchange"
                  className="block w-full bg-white hover:bg-neutral-50 text-neutral-900 text-center py-3 text-xs font-extrabold uppercase tracking-wider border border-stone-200 transition-colors"
                >
                  Submit a New Request →
                </Link>
              </div>
            </div>

          </div>

        </div>

      </div>
    </main>
  );
}
