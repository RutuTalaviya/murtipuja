"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { trackOrderPublic, getMyOrders, formatImageUrl } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

const STATUS_STEPS = [
  { key: "placed", label: "Order Placed", desc: "Order received & verified" },
  { key: "confirmed", label: "Confirmed", desc: "Sacred idol prepared in studio" },
  { key: "shipped", label: "Shipped", desc: "Handed over to courier partner" },
  { key: "out_for_delivery", label: "Out for Delivery", desc: "Reaching your doorstep today" },
  { key: "delivered", label: "Delivered", desc: "Safely received at destination" }
];

export default function TrackOrderPage() {
  const { user } = useAuth();
  const [orderNumber, setOrderNumber] = useState("");
  const [phone, setPhone] = useState("");
  const [userOrders, setUserOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [orderData, setOrderData] = useState(null);

  useEffect(() => {
    if (user?.phone) {
      setPhone(user.phone);
      getMyOrders()
        .then((res) => {
          if (Array.isArray(res.data)) {
            setUserOrders(res.data);
            if (res.data.length > 0 && !orderNumber) {
              setOrderNumber(res.data[0].orderNumber);
            }
          }
        })
        .catch(() => {});
    }
  }, [user]);

  async function handleTrack(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setOrderData(null);

    const targetPhone = user?.phone || phone;

    try {
      const res = await trackOrderPublic(orderNumber.trim(), targetPhone.trim());
      if (res.data && res.data.success) {
        setOrderData(res.data);
      } else {
        setError("Unable to find order details. Please verify your inputs.");
      }
    } catch (err) {
      console.error("Public track order error:", err);
      setError(err.response?.data?.message || "Order not found. Please verify the Order ID and Phone number.");
    } finally {
      setLoading(false);
    }
  }

  const getStepIndex = (status) => {
    const map = {
      placed: 0,
      confirmed: 1,
      shipped: 2,
      out_for_delivery: 3,
      delivered: 4,
      returned: 4,
      cancelled: -1
    };
    return map[status] !== undefined ? map[status] : 0;
  };

  const activeIndex = orderData ? getStepIndex(orderData.orderStatus) : -1;

  return (
    <main className="min-h-screen bg-[#faf9f6] px-3 sm:px-6 md:px-8 lg:px-12 py-6 sm:py-8 md:py-10 font-display w-full">
      <div className="w-full space-y-8 md:space-y-12">
        
        {/* 1. Full-Width Header */}
        <div className="border-b border-stone-200 pb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
            <p className="text-[10px] uppercase tracking-[0.25em] text-neutral-400 font-extrabold mb-1">
              Logistics & Dispatch Concierge
            </p>
            <h1 className="font-display text-3xl sm:text-4xl md:text-5xl text-neutral-900 font-extrabold uppercase tracking-wider">
              Track Your Order
            </h1>
            <p className="text-xs text-neutral-500 font-semibold uppercase tracking-wider mt-2 max-w-2xl">
              Enter your Order ID (e.g. MP-1002) and registered mobile number for real-time transit milestones & courier status.
            </p>
          </div>

          {/* Quick Action Navigation Links */}
          <div className="flex flex-wrap gap-2.5">
            <Link
              href="/return-and-exchange"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-black hover:bg-gold hover:text-black text-white text-xs font-extrabold uppercase tracking-wider transition-colors shadow-sm"
            >
              <span>🔄 File Return / Exchange</span>
            </Link>
            <Link
              href="/shipping-policy"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-neutral-50 text-neutral-900 text-xs font-extrabold uppercase tracking-wider border border-stone-200 transition-colors shadow-sm"
            >
              <span>📦 Shipping Policy</span>
            </Link>
          </div>
        </div>

        {/* 2. Main 12-Column Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start w-full">
          
          {/* Left Column: Form & Tracking Results (8 Columns) */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Form Input Card */}
            <div className="bg-white border border-stone-200 shadow-sm p-6 sm:p-8 space-y-6">
              <div className="border-b border-stone-100 pb-3 flex items-center justify-between">
                <h2 className="font-display text-base sm:text-lg font-extrabold uppercase tracking-wider text-neutral-900">
                  Enter Order Credentials
                </h2>
                <span className="text-[10px] font-extrabold uppercase text-neutral-400">
                  Instant Live Sync
                </span>
              </div>

              {user && (
                <div className="bg-stone-50 border border-stone-200 p-3.5 flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2 text-neutral-800">
                    <span className="text-sm">🔒</span>
                    <span className="font-semibold">
                      Tracking orders for account: <strong className="text-black font-mono">+91 {user.phone}</strong> {user.name ? `(${user.name})` : ""}
                    </span>
                  </div>
                  <Link
                    href="/account/orders"
                    className="text-black font-extrabold underline hover:text-gold uppercase text-[10px] tracking-wider"
                  >
                    View Order History →
                  </Link>
                </div>
              )}

              <form onSubmit={handleTrack} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Order ID Input */}
                  <div className="space-y-1.5 text-left">
                    <label className="block text-[10px] uppercase font-extrabold tracking-widest text-neutral-400">
                      Order ID / AWB Number <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        required
                        type="text"
                        placeholder="e.g. MP-2026-1002"
                        value={orderNumber}
                        onChange={(e) => setOrderNumber(e.target.value)}
                        className="w-full bg-neutral-50/50 border border-stone-300 px-4 py-3 text-xs sm:text-sm font-mono font-bold text-neutral-900 placeholder:text-neutral-400 outline-none focus:bg-white focus:border-stone-800 focus:ring-1 focus:ring-stone-800 transition-colors uppercase"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 text-xs pointer-events-none">
                        📦
                      </span>
                    </div>

                    {userOrders.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1.5 pt-1">
                        <span className="text-[9px] text-neutral-400 font-extrabold uppercase">Your Orders:</span>
                        {userOrders.slice(0, 3).map((o) => (
                          <button
                            key={o._id}
                            type="button"
                            onClick={() => setOrderNumber(o.orderNumber)}
                            className={`text-[10px] font-mono px-2 py-0.5 border transition-all ${
                              orderNumber === o.orderNumber
                                ? "bg-black text-white border-black font-bold"
                                : "bg-white text-neutral-700 border-stone-300 hover:border-black"
                            }`}
                          >
                            {o.orderNumber}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Mobile Phone Input */}
                  <div className="space-y-1.5 text-left">
                    <label className="block text-[10px] uppercase font-extrabold tracking-widest text-neutral-400">
                      Registered Mobile <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        required
                        type="tel"
                        placeholder="e.g. 9876543210"
                        value={user ? user.phone : phone}
                        onChange={(e) => { if (!user) setPhone(e.target.value); }}
                        readOnly={Boolean(user)}
                        className={`w-full border px-4 py-3 text-xs sm:text-sm font-bold transition-colors ${
                          user
                            ? "bg-neutral-100 border-stone-300 text-neutral-700 cursor-not-allowed select-none"
                            : "bg-neutral-50/50 border-stone-300 text-neutral-900 focus:bg-white focus:border-stone-800 focus:ring-1 focus:ring-stone-800"
                        }`}
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 text-xs pointer-events-none">
                        {user ? "🔒" : "📱"}
                      </span>
                    </div>
                    {user && (
                      <p className="text-[10px] text-neutral-400 font-semibold">
                        Locked to your logged-in account number.
                      </p>
                    )}
                  </div>
                </div>

                {/* Error message */}
                {error && (
                  <div className="bg-red-50 border border-red-200 p-4 text-left animate-fadeIn">
                    <p className="text-red-800 text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                      <span>⚠️</span>
                      <span>{error}</span>
                    </p>
                  </div>
                )}

                {/* Submit Button */}
                <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <p className="text-[10px] text-neutral-400 font-extrabold uppercase tracking-widest">
                    ⚡ Live connected with Blue Dart & Delhivery
                  </p>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full sm:w-auto px-8 py-3.5 bg-black hover:bg-gold hover:text-black text-white text-xs font-extrabold uppercase tracking-widest transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer shadow-sm active:scale-95"
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        <span>Fetching Tracking Details...</span>
                      </>
                    ) : (
                      <>
                        <span>Track Shipment</span>
                        <span>→</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* Live Tracking Results */}
            {orderData && (
              <div className="w-full bg-white border border-stone-200 shadow-sm p-6 sm:p-8 space-y-8 animate-fadeIn">
                {/* Header info */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-stone-200 pb-5">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-extrabold text-neutral-500 uppercase tracking-wider">Status:</span>
                      <span className="bg-black text-white px-2.5 py-0.5 text-xs font-extrabold uppercase tracking-wider">
                        {orderData.orderStatus.replace("_", " ")}
                      </span>
                    </div>
                    <p className="text-[11px] sm:text-xs text-neutral-500 font-semibold uppercase tracking-wider pt-0.5">
                      Placed on {new Date(orderData.createdAt).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric"
                      })} · Destination: {orderData.shippingAddress?.city || "India"}, {orderData.shippingAddress?.state || ""}
                    </p>
                  </div>

                  <div className="text-left sm:text-right space-y-0.5">
                    <p className="text-xs sm:text-sm font-extrabold text-neutral-900 uppercase tracking-wider">
                      Order ID: {orderData.orderNumber}
                    </p>
                    {orderData.awbNumber && (
                      <p className="text-[11px] text-neutral-500 font-semibold uppercase tracking-wider">
                        AWB: {orderData.awbNumber} ({orderData.courierPartner || "Express Courier"})
                      </p>
                    )}
                  </div>
                </div>

                {/* Live Delhivery Details Strip */}
                {(orderData.delhiveryWaybill || orderData.awbNumber || orderData.delhiveryStatus || orderData.delhiveryLastLocation) && (
                  <div className="bg-gradient-to-r from-amber-50 via-stone-50 to-amber-50/40 border border-amber-200 p-4 sm:p-5 space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-amber-500 text-white text-xs font-bold">
                          🚚
                        </span>
                        <div>
                          <p className="text-xs font-black uppercase tracking-wider text-amber-950">
                            Courier: {orderData.courierPartner || "Delhivery Express"}
                          </p>
                          <p className="text-[10.5px] font-mono font-bold text-amber-800">
                            Waybill / AWB: {orderData.delhiveryWaybill || orderData.awbNumber}
                          </p>
                        </div>
                      </div>

                      {orderData.trackingUrl && (
                        <a
                          href={orderData.trackingUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 bg-neutral-900 hover:bg-gold hover:text-black text-white px-3.5 py-1.5 text-[10.5px] font-extrabold uppercase tracking-wider transition-colors shadow-xs"
                        >
                          <span>Track on Delhivery</span>
                          <span>↗</span>
                        </a>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-amber-200/60 text-xs">
                      {orderData.delhiveryLastLocation && (
                        <div>
                          <span className="text-[9.5px] uppercase font-bold text-neutral-500 tracking-wider block">Current Location:</span>
                          <span className="font-extrabold text-neutral-900">{orderData.delhiveryLastLocation}</span>
                        </div>
                      )}
                      {orderData.delhiveryExpectedDelivery && (
                        <div>
                          <span className="text-[9.5px] uppercase font-bold text-neutral-500 tracking-wider block">Estimated Delivery:</span>
                          <span className="font-extrabold text-neutral-900">
                            {new Date(orderData.delhiveryExpectedDelivery).toLocaleDateString("en-IN", {
                              weekday: "short",
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Real-time Transit Scan Log History */}
                {Array.isArray(orderData.delhiveryScans) && orderData.delhiveryScans.length > 0 && (
                  <div className="space-y-3 text-left">
                    <h4 className="text-[10px] sm:text-[11px] uppercase font-extrabold tracking-widest text-neutral-400">
                      Live Courier Activity & Scan Trail
                    </h4>
                    <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                      {orderData.delhiveryScans.map((scan, sIdx) => (
                        <div
                          key={sIdx}
                          className="bg-stone-50 border border-stone-200 p-3 text-xs flex flex-col sm:flex-row justify-between sm:items-center gap-1"
                        >
                          <div>
                            <p className="font-extrabold text-neutral-900 uppercase tracking-wider text-[11px]">
                              {scan.activity || scan.status}
                            </p>
                            {scan.location && (
                              <p className="text-[10.5px] text-neutral-500 font-semibold">
                                📍 {scan.location}
                              </p>
                            )}
                          </div>
                          {scan.scanDateTime && (
                            <span className="text-[10px] text-neutral-400 font-mono">
                              {new Date(scan.scanDateTime).toLocaleString("en-IN", {
                                day: "2-digit",
                                month: "short",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Stepper Logic */}
                {orderData.orderStatus === "cancelled" ? (
                  <div className="bg-red-50 border border-red-200 p-5 text-center text-red-800 text-xs font-bold uppercase tracking-wider">
                    🚫 This order was cancelled. Please reach out to customer care at support@murtipuja.com if you have any questions.
                  </div>
                ) : (
                  <div className="space-y-6">
                    <h4 className="text-[10px] sm:text-[11px] uppercase font-extrabold tracking-widest text-neutral-400">
                      Shipment Journey
                    </h4>
                    
                    {/* Horizontal timeline on Desktop */}
                    <div className="hidden md:flex justify-between items-start relative px-4 pt-2">
                      <div className="absolute top-6 left-[10%] right-[10%] h-[2px] bg-stone-200 z-0 w-[80%] mx-auto" />
                      <div
                        className="absolute top-6 left-[10%] h-[2px] bg-neutral-900 transition-all duration-700 z-0"
                        style={{ width: `${(activeIndex / 4) * 80}%` }}
                      />

                      {STATUS_STEPS.map((step, idx) => {
                        const isCompleted = idx <= activeIndex;
                        const isActive = idx === activeIndex;

                        return (
                          <div key={step.key} className="flex flex-col items-center text-center z-10 w-1/5 space-y-2 relative">
                            <div
                              className={`w-9 h-9 rounded-full flex items-center justify-center border transition-all font-extrabold text-xs shadow-sm ${
                                isCompleted
                                  ? "bg-neutral-900 border-neutral-900 text-white"
                                  : "bg-white border-stone-300 text-neutral-400"
                              }`}
                            >
                              {isCompleted ? "✓" : idx + 1}
                            </div>
                            <div className="space-y-0.5 px-1">
                              <p className={`text-[11px] font-extrabold uppercase tracking-wider ${isActive ? "text-neutral-900" : isCompleted ? "text-neutral-700" : "text-neutral-400"}`}>
                                {step.label}
                              </p>
                              <p className="text-[9px] text-neutral-400 font-semibold uppercase tracking-wider leading-tight">
                                {step.desc}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Vertical timeline on Mobile screens */}
                    <div className="flex md:hidden flex-col gap-5 relative pl-6">
                      <div className="absolute top-2 bottom-2 left-2.5 w-[2px] bg-stone-200 z-0" />
                      <div
                        className="absolute top-2 left-2.5 w-[2px] bg-neutral-900 transition-all duration-700 z-0"
                        style={{ height: `${(activeIndex / 4) * 88}%` }}
                      />

                      {STATUS_STEPS.map((step, idx) => {
                        const isCompleted = idx <= activeIndex;
                        const isActive = idx === activeIndex;

                        return (
                          <div key={step.key} className="flex gap-3.5 items-start z-10 relative">
                            <div
                              className={`w-6 h-6 rounded-full flex items-center justify-center border text-[10px] font-extrabold flex-shrink-0 transition-all ${
                                isCompleted
                                  ? "bg-neutral-900 border-neutral-900 text-white"
                                  : "bg-white border-stone-300 text-neutral-400"
                              }`}
                            >
                              {isCompleted ? "✓" : idx + 1}
                            </div>
                            <div className="space-y-0.5 text-left">
                              <p className={`text-xs font-extrabold uppercase tracking-wider ${isActive ? "text-neutral-900" : isCompleted ? "text-neutral-700" : "text-neutral-400"}`}>
                                {step.label}
                              </p>
                              <p className="text-[10px] text-neutral-500 font-medium leading-tight">
                                {step.desc}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Items in order */}
                {orderData.items && orderData.items.length > 0 && (
                  <div className="border-t border-stone-200 pt-6 space-y-4 text-left">
                    <h4 className="text-[10px] sm:text-[11px] uppercase font-extrabold tracking-widest text-neutral-400">
                      Items in Shipment
                    </h4>
                    <div className="divide-y divide-stone-100">
                      {orderData.items.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-4 py-3.5 first:pt-0 last:pb-0">
                          <div className="w-14 h-14 bg-neutral-100 overflow-hidden border border-stone-200 flex-shrink-0 relative">
                            {item.image ? (
                              <img src={formatImageUrl(item.image)} alt={item.title} className="object-cover w-full h-full" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-[9px] text-neutral-400 font-bold uppercase">Idol</div>
                            )}
                          </div>
                          <div className="flex-1 text-left min-w-0">
                            <p className="text-xs sm:text-sm font-extrabold text-neutral-900 uppercase tracking-wider truncate" title={item.title}>
                              {item.title}
                            </p>
                            <p className="text-[11px] text-neutral-500 font-semibold uppercase tracking-wider mt-0.5">
                              Qty: {item.quantity} · Size: {item.size || "Standard"} · Finish: {item.finish || "Matte Obsidian"}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {!orderData && !loading && (
              <div className="border border-dashed border-stone-300 p-8 text-center space-y-2 bg-white shadow-sm">
                <span className="text-3xl">📦</span>
                <p className="text-xs font-extrabold uppercase text-neutral-600 tracking-wider">
                  No active tracking query
                </p>
                <p className="text-[11px] text-neutral-400 font-semibold">
                  Enter your Order ID & phone number above to pull live dispatch milestones.
                </p>
              </div>
            )}

          </div>

          {/* Right Column: Information & Help (4 Columns) */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* 3 Key Guarantees Card */}
            <div className="bg-white border border-stone-200 shadow-sm p-6 space-y-4">
              <h3 className="font-display text-xs font-extrabold uppercase tracking-wider text-neutral-900 border-b border-stone-100 pb-3">
                Transit Standards
              </h3>

              <div className="space-y-3.5">
                <div className="flex gap-3 items-start">
                  <span className="text-xl">🚚</span>
                  <div>
                    <h4 className="text-xs font-extrabold uppercase text-neutral-900">100% Free Express Shipping</h4>
                    <p className="text-[11px] text-neutral-500 font-semibold mt-0.5 leading-relaxed">
                      Zero delivery charges across 19,000+ Indian pincodes.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 items-start">
                  <span className="text-xl">⚡</span>
                  <div>
                    <h4 className="text-xs font-extrabold uppercase text-neutral-900">24-48 Hours Dispatch</h4>
                    <p className="text-[11px] text-neutral-500 font-semibold mt-0.5 leading-relaxed">
                      Every sculpture is quality-inspected before air shipping.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 items-start">
                  <span className="text-xl">🛡️</span>
                  <div>
                    <h4 className="text-xs font-extrabold uppercase text-neutral-900">Transit Insured</h4>
                    <p className="text-[11px] text-neutral-500 font-semibold mt-0.5 leading-relaxed">
                      Free instant replacement if courier transit damage occurs.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Concierge Help Card */}
            <div className="bg-white border border-stone-200 shadow-sm p-6 space-y-3">
              <h3 className="font-display text-xs font-extrabold uppercase tracking-wider text-neutral-900">
                Need Help with Your Order?
              </h3>
              <p className="text-xs text-neutral-600 font-semibold leading-relaxed">
                Connect directly with our Surat studio team on WhatsApp Mon–Sat (10 AM – 7 PM IST).
              </p>
              <div className="space-y-2 pt-2">
                <a
                  href="https://wa.me/917990138678?text=Hi%20MurtiPuja%20Support,%20I%20want%20to%20check%20my%20order%20status."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full bg-black hover:bg-gold hover:text-black text-white text-center py-3 text-xs font-extrabold uppercase tracking-wider transition-colors shadow-sm"
                >
                  💬 Chat on WhatsApp
                </a>
                <Link
                  href="/contact"
                  className="block w-full bg-white hover:bg-neutral-50 text-neutral-900 text-center py-3 text-xs font-extrabold uppercase tracking-wider border border-stone-200 transition-colors"
                >
                  Contact Support Desk →
                </Link>
              </div>
            </div>

          </div>

        </div>

      </div>
    </main>
  );
}
