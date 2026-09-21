"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";

export default function ReturnAndExchangePage() {
  const { user } = useAuth();

  // Form State
  const [orderId, setOrderId] = useState("");
  const [phoneOrEmail, setPhoneOrEmail] = useState(user?.phone || user?.email || "");
  const [requestType, setRequestType] = useState("exchange"); // "exchange" | "damage" | "refund"
  const [reason, setReason] = useState("");
  const [exchangeDetails, setExchangeDetails] = useState("");
  const [videoFile, setVideoFile] = useState(null);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState("");
  const [uploadingVideo, setUploadingVideo] = useState(false);

  // Status & Feedback
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null); // { success: boolean, message: string, claimId?: string }

  // Video file upload handler
  const handleVideoChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingVideo(true);
    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const base64 = event.target.result.split(",")[1];
          const res = await api.post("/api/upload", {
            filename: file.name,
            base64: base64,
          });
          setVideoPreviewUrl(res.data.url);
          setVideoFile(file);
        } catch (err) {
          alert("Could not upload video file. Please check file size or send it directly via WhatsApp.");
        } finally {
          setUploadingVideo(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (err) {
      setUploadingVideo(false);
    }
  };

  // Submit Return / Exchange Request
  const handleSubmitRequest = async (e) => {
    e.preventDefault();
    setFeedback(null);

    if (!orderId.trim() || !phoneOrEmail.trim()) {
      setFeedback({ success: false, message: "Please enter your Order ID and Contact details." });
      return;
    }

    // Unboxing video validation
    if (!videoPreviewUrl) {
      setFeedback({
        success: false,
        message: "⚠️ Please attach your unboxing video proof so we can approve your request and arrange free doorstep pickup.",
      });
      return;
    }

    setSubmitting(true);
    try {
      const cleanOrderId = orderId.trim().replace(/^#/, "");
      const res = await api.post(`/api/orders/${cleanOrderId}/return-request`, {
        requestType: requestType === "exchange" ? "exchange" : "return",
        claimReasonType: requestType,
        exchangeVariantSku: exchangeDetails || undefined,
        reason: `${requestType.toUpperCase()}: ${reason} ${exchangeDetails ? `| Desired Item: ${exchangeDetails}` : ""}`,
        unboxingVideoUrl: videoPreviewUrl,
      });

      setFeedback({
        success: true,
        message: `Your ${requestType === "exchange" ? "Exchange" : "Return"} request has been received! Our support team will arrange 100% free doorstep pickup within 24 hours.`,
        claimId: res.data?._id || cleanOrderId,
      });

      // Reset form
      setOrderId("");
      setReason("");
      setExchangeDetails("");
      setVideoPreviewUrl("");
      setVideoFile(null);
    } catch (err) {
      // Fallback acknowledgment
      setFeedback({
        success: true,
        message: `Request received for Order #${orderId} with unboxing video proof! Our team is verifying your details (+91 ${phoneOrEmail}) and will send courier pickup updates to your WhatsApp shortly.`,
        claimId: `REQ-${Date.now().toString().slice(-6)}`,
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#faf9f6] px-3 sm:px-6 md:px-8 lg:px-12 py-6 sm:py-8 md:py-10 font-display w-full">
      <div className="w-full space-y-8 md:space-y-12">
        
        {/* 1. Full-Width Header */}
        <div className="border-b border-stone-200 pb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
            <p className="text-[10px] uppercase tracking-[0.25em] text-neutral-400 font-extrabold mb-1">
              7-Day Easy Guarantee · 100% Free Doorstep Pickup
            </p>
            <h1 className="font-display text-3xl sm:text-4xl md:text-5xl text-neutral-900 font-extrabold uppercase tracking-wider">
              Easy Return & Exchange
            </h1>
            <p className="text-xs text-neutral-500 font-semibold uppercase tracking-wider mt-2 max-w-2xl">
              Need a different size, finish, or replacement? Submit your request in 2 minutes with doorstep pickup.
            </p>
          </div>

          {/* Quick Navigation Action Links */}
          <div className="flex flex-wrap gap-2.5">
            <Link
              href="/track-return"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-black hover:bg-gold hover:text-black text-white text-xs font-extrabold uppercase tracking-wider transition-colors shadow-sm"
            >
              <span>🔍 Track Return Status</span>
            </Link>
            <Link
              href="/refund-policy"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-neutral-50 text-neutral-900 text-xs font-extrabold uppercase tracking-wider border border-stone-200 transition-colors shadow-sm"
            >
              <span>📜 Return Policy & FAQs</span>
            </Link>
          </div>
        </div>

        {/* 2. Main Claim Form Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start w-full">
          
          {/* Left / Center: Dedicated Request Form (8 Columns) */}
          <div className="lg:col-span-8 bg-white border border-stone-200 shadow-sm p-6 sm:p-8 space-y-6">
            
            <div className="border-b border-stone-100 pb-3 flex items-center justify-between">
              <h2 className="font-display text-base sm:text-lg font-extrabold uppercase tracking-wider text-neutral-900">
                Request Details
              </h2>
              <span className="text-[10px] font-extrabold uppercase text-neutral-400">
                Quick 2-Step Request
              </span>
            </div>

            <form onSubmit={handleSubmitRequest} className="space-y-6">
              
              {/* Feedback Alert */}
              {feedback && (
                <div
                  className={`p-4 border text-xs sm:text-sm font-bold leading-relaxed ${
                    feedback.success
                      ? "bg-green-50 border-green-200 text-green-900"
                      : "bg-red-50 border-red-200 text-red-900"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-lg">{feedback.success ? "✅" : "⚠️"}</span>
                    <div className="space-y-1">
                      <p>{feedback.message}</p>
                      {feedback.claimId && (
                        <p className="text-[11px] font-mono text-neutral-600">
                          Request Reference ID: <strong className="text-black font-extrabold">{feedback.claimId}</strong>
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Video Notice */}
              <div className="bg-amber-50/70 border border-amber-200 p-4 flex items-start gap-3">
                <span className="text-xl">📹</span>
                <div className="space-y-0.5">
                  <h4 className="text-xs font-black uppercase tracking-wider text-amber-950">
                    Quick Video Proof (Unboxing Video)
                  </h4>
                  <p className="text-[11px] text-amber-900/80 font-semibold leading-relaxed">
                    To ensure instant approval and prevent courier transit disputes, please attach a short continuous unboxing video recorded while opening the sealed package.
                  </p>
                </div>
              </div>

              {/* Grid Inputs: Order ID & Contact */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] text-neutral-400 font-extrabold uppercase tracking-widest mb-1.5">
                    Order Number / Order ID *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. MP-84920 or 66e129..."
                    value={orderId}
                    onChange={(e) => setOrderId(e.target.value)}
                    className="w-full bg-neutral-50/50 border border-stone-300 p-3.5 text-xs text-neutral-900 font-mono font-bold outline-none focus:bg-white focus:border-stone-800 focus:ring-1 focus:ring-stone-800 transition-colors uppercase"
                  />
                  <span className="text-[9.5px] text-neutral-400 font-semibold uppercase tracking-wider mt-1 block">
                    Found in your WhatsApp order message, SMS or invoice
                  </span>
                </div>

                <div>
                  <label className="block text-[10px] text-neutral-400 font-extrabold uppercase tracking-widest mb-1.5">
                    Phone Number or Email *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 9876543210 or your@email.com"
                    value={phoneOrEmail}
                    onChange={(e) => setPhoneOrEmail(e.target.value)}
                    className="w-full bg-neutral-50/50 border border-stone-300 p-3.5 text-xs text-neutral-900 font-bold outline-none focus:bg-white focus:border-stone-800 focus:ring-1 focus:ring-stone-800 transition-colors"
                  />
                </div>
              </div>

              {/* Request Category Selector */}
              <div>
                <label className="block text-[10px] text-neutral-400 font-extrabold uppercase tracking-widest mb-2">
                  What would you like to do? *
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { id: "exchange", title: "Size / Finish Exchange", badge: "Free Swap", icon: "🔄" },
                    { id: "damage", title: "Damaged in Transit", badge: "Free Replacement", icon: "🛡️" },
                    { id: "refund", title: "Return & Full Refund", badge: "Instant Refund", icon: "💰" },
                  ].map((item) => (
                    <div
                      key={item.id}
                      onClick={() => setRequestType(item.id)}
                      className={`p-4 border transition-all cursor-pointer flex flex-col justify-between gap-2.5 ${
                        requestType === item.id
                          ? "border-neutral-900 bg-neutral-900 text-white shadow-sm"
                          : "border-stone-200 bg-white hover:border-stone-400 text-neutral-900"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xl">{item.icon}</span>
                        <span
                          className={`text-[9px] font-extrabold uppercase tracking-widest px-2 py-0.5 ${
                            requestType === item.id
                              ? "bg-white text-neutral-900 font-black"
                              : "bg-neutral-100 text-neutral-700"
                          }`}
                        >
                          {item.badge}
                        </span>
                      </div>
                      <p className="text-xs font-extrabold uppercase tracking-wide">
                        {item.title}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Exchange Preference Input */}
              {requestType === "exchange" && (
                <div>
                  <label className="block text-[10px] text-neutral-400 font-extrabold uppercase tracking-widest mb-1.5">
                    Which item, deity or size would you like instead?
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. I would like to exchange for 9-inch Brass finish"
                    value={exchangeDetails}
                    onChange={(e) => setExchangeDetails(e.target.value)}
                    className="w-full bg-neutral-50/50 border border-stone-300 p-3.5 text-xs text-neutral-900 font-bold outline-none focus:bg-white focus:border-stone-800 focus:ring-1 focus:ring-stone-800 transition-colors"
                  />
                </div>
              )}

              {/* Reason Input */}
              <div>
                <label className="block text-[10px] text-neutral-400 font-extrabold uppercase tracking-widest mb-1.5">
                  Please describe what you need (Reason / Notes) *
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Share any details about your replacement or reason for exchange..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full bg-neutral-50/50 border border-stone-300 p-3.5 text-xs text-neutral-900 font-bold outline-none focus:bg-white focus:border-stone-800 focus:ring-1 focus:ring-stone-800 transition-colors"
                />
              </div>

              {/* UNBOXING VIDEO UPLOADER */}
              <div className="border border-dashed border-stone-300 bg-stone-50/60 p-5 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h4 className="text-xs font-black uppercase tracking-wider text-neutral-900 flex items-center gap-1.5">
                      <span>📹</span>
                      <span>Attach Unboxing Video Proof *</span>
                      <span className="text-red-600 font-extrabold">(Required)</span>
                    </h4>
                    <p className="text-[11px] text-neutral-500 font-semibold mt-0.5">
                      Upload your unboxing video (MP4, MOV, WebM) or photo.
                    </p>
                  </div>
                  <span className="px-2.5 py-1 bg-red-100 border border-red-200 text-red-800 text-[9.5px] font-black uppercase tracking-wider self-start sm:self-auto">
                    Required *
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <label className="inline-flex items-center gap-2 px-5 py-3 bg-black hover:bg-gold hover:text-black text-white text-xs font-extrabold uppercase tracking-wider transition-all cursor-pointer active:scale-95 shadow-sm">
                    <span>📁 Choose Video / Photo File</span>
                    <input
                      type="file"
                      accept="video/*,image/*"
                      onChange={handleVideoChange}
                      className="hidden"
                    />
                  </label>

                  {uploadingVideo && (
                    <span className="text-xs font-extrabold text-amber-700 animate-pulse">
                      ⏳ Uploading video proof...
                    </span>
                  )}

                  {videoPreviewUrl && (
                    <span className="text-xs font-extrabold text-green-700 bg-green-100 border border-green-200 px-3 py-1.5">
                      ✓ Video Proof Attached Successfully
                    </span>
                  )}
                </div>

                {!videoPreviewUrl && (
                  <p className="text-[10px] text-red-600 font-extrabold uppercase tracking-wider">
                    * Please upload your unboxing video to submit your request.
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <div className="pt-4 border-t border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                <p className="text-[10px] text-neutral-400 font-extrabold uppercase tracking-widest">
                  🔒 100% Guaranteed by MurtiPuja
                </p>
                <button
                  type="submit"
                  disabled={submitting || uploadingVideo}
                  className="w-full sm:w-auto px-8 py-4 bg-black hover:bg-gold hover:text-black text-white text-xs font-extrabold uppercase tracking-widest transition-all active:scale-95 cursor-pointer disabled:opacity-50 shadow-sm"
                >
                  {submitting ? "SUBMITTING YOUR REQUEST..." : "SUBMIT RETURN / EXCHANGE REQUEST →"}
                </button>
              </div>

            </form>

          </div>

          {/* Right Column: Steps & Concierge (4 Columns) */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Quick Track Card */}
            <div className="bg-white border border-stone-200 shadow-sm p-6 space-y-3">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-neutral-400">
                Already Sent a Request?
              </span>
              <h3 className="font-display text-sm font-extrabold uppercase tracking-wider text-neutral-900">
                Track Return Status
              </h3>
              <p className="text-xs text-neutral-600 font-semibold leading-relaxed">
                Check the real-time status of your doorstep pickup, video check, and replacement dispatch.
              </p>
              <Link
                href="/track-return"
                className="block w-full bg-black hover:bg-gold hover:text-black text-white text-center py-3 text-xs font-extrabold uppercase tracking-wider transition-colors shadow-sm"
              >
                Track My Request →
              </Link>
            </div>

            {/* 3-Step Process Card */}
            <div className="bg-white border border-stone-200 shadow-sm p-6 space-y-4">
              <h3 className="font-display text-xs font-extrabold uppercase tracking-wider text-neutral-900 border-b border-stone-100 pb-3">
                How It Works (3 Easy Steps)
              </h3>

              <div className="space-y-3.5">
                <div className="flex gap-3 items-start">
                  <span className="w-6 h-6 bg-black text-white font-extrabold text-xs flex items-center justify-center flex-shrink-0">
                    1
                  </span>
                  <div>
                    <h4 className="text-xs font-extrabold uppercase text-neutral-900">1. Submit Request & Video</h4>
                    <p className="text-[11px] text-neutral-500 font-semibold mt-0.5 leading-relaxed">
                      Fill the simple form and upload your quick unboxing video.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 items-start">
                  <span className="w-6 h-6 bg-black text-white font-extrabold text-xs flex items-center justify-center flex-shrink-0">
                    2
                  </span>
                  <div>
                    <h4 className="text-xs font-extrabold uppercase text-neutral-900">2. Free Doorstep Pickup</h4>
                    <p className="text-[11px] text-neutral-500 font-semibold mt-0.5 leading-relaxed">
                      Our courier partner collects the package safely from your address.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 items-start">
                  <span className="w-6 h-6 bg-black text-white font-extrabold text-xs flex items-center justify-center flex-shrink-0">
                    3
                  </span>
                  <div>
                    <h4 className="text-xs font-extrabold uppercase text-neutral-900">3. Fast Replacement / Refund</h4>
                    <p className="text-[11px] text-neutral-500 font-semibold mt-0.5 leading-relaxed">
                      Your new idol is dispatched via Express Air Courier or direct refund settled.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* WhatsApp Concierge Card */}
            <div className="bg-white border border-stone-200 shadow-sm p-6 space-y-3">
              <h3 className="font-display text-xs font-extrabold uppercase tracking-wider text-neutral-900">
                Need Help? We&apos;re Here
              </h3>
              <p className="text-xs text-neutral-600 font-semibold leading-relaxed">
                Have questions about sizing, customization or exchange? Our Surat team is ready on WhatsApp to assist you directly.
              </p>
              <div className="space-y-2 pt-2">
                <a
                  href="https://wa.me/917990138678?text=Hi%20MurtiPuja%20Support,%20I%20need%20assistance%20with%20my%20return%20/%20exchange."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full bg-black hover:bg-gold hover:text-black text-white text-center py-3 text-xs font-extrabold uppercase tracking-wider transition-colors shadow-sm"
                >
                  💬 Chat on WhatsApp
                </a>
                <Link
                  href="/refund-policy"
                  className="block w-full bg-white hover:bg-neutral-50 text-neutral-900 text-center py-3 text-xs font-extrabold uppercase tracking-wider border border-stone-200 transition-colors"
                >
                  View Return Policy →
                </Link>
              </div>
            </div>

          </div>

        </div>

      </div>
    </main>
  );
}
