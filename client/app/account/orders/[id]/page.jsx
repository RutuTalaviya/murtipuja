"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import ImageWithSkeleton from "@/components/ImageWithSkeleton";
import { getOrderById, submitReturnRequest, payExchangeDifference, getProducts } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

const STATUS_STEPS = ["placed", "confirmed", "shipped", "out_for_delivery", "delivered"];

export default function OrderDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const { user, loading: authLoading } = useAuth();
  
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Return Form state
  const [requestType, setRequestType] = useState("exchange");
  const [claimReasonType, setClaimReasonType] = useState("size_color");
  const [returnReason, setReturnReason] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [selectedItemSku, setSelectedItemSku] = useState("");
  const [exchangeVariantSku, setExchangeVariantSku] = useState("");
  const [selectedProductDetails, setSelectedProductDetails] = useState(null);
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");
  const [formLoading, setFormLoading] = useState(false);

  async function fetchProductVariants(productId) {
    try {
      const res = await getProducts({ ids: productId });
      const prod = res.data.products?.[0];
      if (prod) {
        setSelectedProductDetails(prod);
        setExchangeVariantSku(prod.variants?.[0]?.sku || "");
      }
    } catch (err) {
      console.error("Failed to load replacement variants:", err);
    }
  }

  useEffect(() => {
    if (order && order.items && order.items.length > 0) {
      const firstItem = order.items[0];
      setSelectedItemSku(firstItem.variantSku);
      fetchProductVariants(firstItem.product);
    }
  }, [order]);

  const showSuccessAlert = searchParams.get("success") === "true";

  function fetchOrder() {
    getOrderById(params.id)
      .then((res) => {
        setOrder(res.data);
      })
      .catch((err) => {
        setError(err.response?.data?.message || "Failed to load order details.");
      })
      .finally(() => {
        setLoading(false);
      });
  }

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setLoading(false);
      return;
    }
    fetchOrder();
  }, [user, authLoading, params.id]);

  const loadRazorpay = () => {
    return new Promise((resolve) => {
      if (typeof window !== "undefined" && window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  async function handleReturnSubmit(e) {
    e.preventDefault();
    setFormError("");
    setFormSuccess("");

    if (!returnReason.trim()) {
      setFormError("Please explain the reason for your request.");
      return;
    }

    if (claimReasonType === "damage" && !videoUrl.trim()) {
      setFormError("Continuous unboxing video proof is strictly mandatory for damage claims. Without video proof, returns and exchanges cannot be processed.");
      return;
    }

    if (requestType === "exchange" && !exchangeVariantSku) {
      setFormError("Please select a replacement size/finish variant.");
      return;
    }

    setFormLoading(true);
    try {
      const payload = {
        selectedItemSku,
        requestType,
        claimReasonType,
        condition: claimReasonType === "damage" ? "broken_damaged" : "good_condition",
        reason: returnReason,
        unboxingVideoUrl: claimReasonType === "damage" ? videoUrl : undefined,
        exchangeVariantSku: requestType === "exchange" ? exchangeVariantSku : undefined,
      };

      const res = await submitReturnRequest(order._id, payload);
      const { order: updatedOrder, razorpayOrder, razorpayKeyId, priceDifference } = res.data;
      setOrder(updatedOrder || res.data);

      if (priceDifference > 0 && razorpayOrder) {
        // Upgrade: Customer needs to pay the price difference
        const loaded = await loadRazorpay();
        if (!loaded || !window.Razorpay) {
          setFormSuccess(`Exchange request registered! Please complete difference payment of ₹${priceDifference} to confirm dispatch.`);
          return;
        }

        const options = {
          key: razorpayKeyId || "rzp_live_TcNNAglqRPpV08",
          amount: razorpayOrder.amount,
          currency: "INR",
          name: "MurtiPuja",
          description: `Exchange Upgrade Difference (+₹${priceDifference})`,
          order_id: razorpayOrder.id,
          prefill: {
            name: user?.name || "Customer",
            email: user?.email || "",
            contact: user?.phone || "",
          },
          theme: { color: "#800000" },
          handler: async function (response) {
            try {
              await payExchangeDifference(order._id, {
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
              });
              fetchOrder();
              setFormSuccess(`Payment of ₹${priceDifference} received! Your exchange request is confirmed.`);
            } catch (pErr) {
              setFormError("Payment verification failed. Please contact support.");
            }
          },
          modal: {
            ondismiss: function () {
              setFormError(`Difference payment of ₹${priceDifference} was not completed. Your exchange request is pending difference payment.`);
              fetchOrder();
            },
          },
        };
        const rzp = new window.Razorpay(options);
        rzp.open();
      } else if (priceDifference < 0) {
        setFormSuccess(`Exchange request submitted! A surplus refund of ₹${Math.abs(priceDifference)} will be processed back to your account once original item is safely received.`);
      } else {
        setFormSuccess("Your claim request has been successfully submitted for review!");
      }

      setReturnReason("");
      setVideoUrl("");
    } catch (err) {
      setFormError(err.response?.data?.message || "Failed to submit request.");
    } finally {
      setFormLoading(false);
    }
  }

  async function handlePayPendingDifference() {
    if (!order?.returnRequest?.priceDifference || !order?.returnRequest?.differencePaymentInfo?.razorpayOrderId) return;
    setFormLoading(true);
    try {
      const loaded = await loadRazorpay();
      if (!loaded || !window.Razorpay) {
        alert("Razorpay gateway could not be loaded. Please refresh.");
        return;
      }

      const diff = order.returnRequest.priceDifference;
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_live_TcNNAglqRPpV08",
        amount: Math.round(diff * 100),
        currency: "INR",
        name: "MurtiPuja",
        description: `Pay Exchange Difference (+₹${diff})`,
        order_id: order.returnRequest.differencePaymentInfo.razorpayOrderId,
        prefill: {
          name: user?.name || "Customer",
          email: user?.email || "",
          contact: user?.phone || "",
        },
        theme: { color: "#800000" },
        handler: async function (response) {
          try {
            await payExchangeDifference(order._id, {
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            });
            fetchOrder();
            setFormSuccess(`Payment of ₹${diff} received! Your exchange request is confirmed.`);
          } catch (pErr) {
            setFormError("Payment verification failed.");
          }
        },
      };
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      setFormError("Failed to initiate difference payment.");
    } finally {
      setFormLoading(false);
    }
  }

  function handleFillMockVideo() {
    setVideoUrl("https://res.cloudinary.com/demo/video/upload/sample_unboxing.mp4");
  }

  // Live calculation of price difference
  const currentSelectedItem = order?.items?.find((i) => i.variantSku === selectedItemSku) || order?.items?.[0];
  const currentOriginalPrice = currentSelectedItem?.price || 0;
  const currentReplacementVariant = selectedProductDetails?.variants?.find((v) => v.sku === exchangeVariantSku);
  const currentReplacementPrice = currentReplacementVariant ? (currentReplacementVariant.discountPrice || currentReplacementVariant.price || 0) : 0;
  const livePriceDiff = requestType === "exchange" && currentReplacementPrice ? (currentReplacementPrice - currentOriginalPrice) : 0;

  if (authLoading || loading) {
    return (
      <main className="min-h-screen bg-white flex items-center justify-center font-display">
        <p className="text-xs text-neutral-400 font-extrabold uppercase tracking-widest animate-pulse">Loading order details...</p>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center font-display">
        <h1 className="font-display text-2xl text-black font-extrabold uppercase tracking-wider mb-2">Access Denied</h1>
        <p className="text-neutral-500 text-xs font-semibold mb-6 uppercase tracking-wider">Please log in to view order details.</p>
        <Link href="/login" className="bg-black hover:bg-gold hover:text-black text-white px-8 py-3.5 border-2 border-black rounded-none text-xs font-extrabold uppercase tracking-widest transition-all">
          Login with OTP
        </Link>
      </main>
    );
  }

  if (error || !order) {
    return (
      <main className="min-h-screen bg-white px-6 py-12 text-center font-display">
        <div className="max-w-md mx-auto space-y-4">
          <p className="text-red-600 text-xs font-bold uppercase tracking-wider">{error || "Order not found."}</p>
          <Link href="/account/orders" className="text-black hover:text-gold uppercase tracking-wider text-xs font-extrabold underline inline-block">
            ← Back to My Orders
          </Link>
        </div>
      </main>
    );
  }

  const activeStepIndex = STATUS_STEPS.indexOf(order.orderStatus);

  return (
    <main className="min-h-screen bg-white px-4 md:px-8 lg:px-12 py-8 md:py-12 font-display w-full">
      <div className="w-full space-y-8">
        
        {/* Back Link */}
        <Link href="/account/orders" className="text-black hover:text-gold uppercase tracking-wider text-xs font-extrabold flex items-center gap-1">
          ← Back to My Orders
        </Link>

        {/* Success Banner */}
        {showSuccessAlert && (
          <div className="bg-green-50 border-2 border-green-600 text-green-900 p-4 rounded-none">
            <h3 className="font-extrabold text-sm uppercase tracking-wider mb-0.5">🎉 Payment Successful!</h3>
            <p className="text-xs font-semibold">Your order has been placed and confirmed. We will dispatch it within 48 hours.</p>
          </div>
        )}

        {/* Order Header Card */}
        <div className="bg-white rounded-none p-6 border-2 border-black flex flex-col md:flex-row md:justify-between md:items-center gap-4">
          <div>
            <span className="text-[9px] uppercase font-extrabold tracking-widest bg-gold text-black px-2 py-0.5 border border-black inline-block">
              Order Specification
            </span>
            <h1 className="font-display text-2xl sm:text-3xl text-black font-extrabold uppercase tracking-wider mt-2 mb-1">
              Order #{order.orderNumber}
            </h1>
            <p className="text-xs text-neutral-400 font-semibold uppercase tracking-wider">
              Placed on {new Date(order.createdAt).toLocaleString("en-IN")}
            </p>
          </div>
          
          <div className="flex gap-2">
            <span className={`text-[9.5px] font-extrabold px-3 py-1 border border-black uppercase tracking-wider ${
              order.paymentStatus === "paid" ? "bg-green-100 text-green-900" : "bg-amber-100 text-amber-900"
            }`}>
              {order.paymentStatus}
            </span>
            <span className="text-[9.5px] font-extrabold px-3 py-1 border border-black bg-gold text-black uppercase tracking-wider">
              {order.orderStatus.replace(/_/g, " ")}
            </span>
          </div>
        </div>

        {/* Order Progress Tracker */}
        {order.orderStatus !== "cancelled" && order.orderStatus !== "returned" && (
          <div className="bg-white rounded-none p-6 md:p-8 border-2 border-black">
            <h2 className="font-display text-lg text-black font-extrabold uppercase tracking-wider mb-6">Shipment Timeline</h2>
            
            <div className="relative flex flex-col md:flex-row md:justify-between items-start md:items-center gap-6 md:gap-2">
              <div className="hidden md:block absolute top-[18px] left-[5%] right-[5%] h-[2px] bg-neutral-200 -z-10">
                <div
                  className="h-full bg-black transition-all duration-500"
                  style={{ width: `${(Math.max(0, activeStepIndex) / (STATUS_STEPS.length - 1)) * 100}%` }}
                />
              </div>

              {STATUS_STEPS.map((step, index) => {
                const isPassed = index <= activeStepIndex;
                const isCurrent = index === activeStepIndex;
                return (
                  <div key={step} className="flex md:flex-col items-center gap-3 md:gap-2 md:w-1/5 text-center">
                    <div className={`w-9 h-9 rounded-none flex items-center justify-center font-extrabold text-xs border-2 transition-all ${
                      isPassed 
                        ? "bg-black border-black text-white" 
                        : "bg-white border-neutral-300 text-neutral-400"
                    } ${isCurrent ? "ring-2 ring-gold" : ""}`}>
                      {isPassed ? "✓" : index + 1}
                    </div>
                    <div>
                      <p className={`text-xs font-extrabold uppercase tracking-wider ${isPassed ? "text-black" : "text-neutral-400"}`}>
                        {step.replace(/_/g, " ")}
                      </p>
                      {isCurrent && (
                        <span className="text-[9px] bg-gold text-black font-extrabold px-1.5 py-0.2 border border-black mt-0.5 inline-block">
                          Live Stage
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Return Claims Section */}
        <div className="bg-white rounded-none p-6 border-2 border-black">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b-2 border-black pb-4 mb-4">
            <div>
              <span className="text-[9px] uppercase font-extrabold tracking-widest bg-black text-white px-2 py-0.5 inline-block mb-1">
                Policy Protected
              </span>
              <h2 className="font-display text-lg text-black font-extrabold uppercase tracking-wider">
                Returns & Exchange Center
              </h2>
            </div>
            <span className="text-[10px] text-neutral-500 font-extrabold uppercase tracking-wider">
              7-Day Window · Doorstep Pickup
            </span>
          </div>
          
          {order.returnRequest?.isRequested ? (
            <div className="space-y-4">
              <div className="p-5 border-2 border-black text-xs font-semibold bg-neutral-50 uppercase tracking-wider space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-neutral-300 pb-3">
                  <span className="font-extrabold text-sm text-black">
                    {order.returnRequest.requestType === "return" ? "💰 Return & Full Refund" : "🔄 Product Exchange"}
                  </span>
                  <span className="px-2.5 py-1 bg-black text-white font-extrabold text-[10px] tracking-widest">
                    Status: {order.returnRequest.status.replace(/_/g, " ")}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px] leading-relaxed">
                  <div>
                    <span className="text-neutral-400 font-extrabold block text-[9.5px]">Claim Reason</span>
                    <p className="font-bold text-black capitalize">
                      {order.returnRequest.claimReasonType === "damage"
                        ? "🛡️ Transit Damaged / Broken Idol"
                        : order.returnRequest.claimReasonType === "size_color"
                        ? "📦 Good Condition (Size / Finish Swap)"
                        : order.returnRequest.claimReasonType}
                    </p>
                  </div>

                  <div>
                    <span className="text-neutral-400 font-extrabold block text-[9.5px]">Product Condition</span>
                    <p className="font-bold text-black">
                      {order.returnRequest.condition === "broken_damaged" ? "Broken on Arrival" : "Good Condition (Safe)"}
                    </p>
                  </div>

                  {order.returnRequest.exchangeVariantSku && (
                    <div className="sm:col-span-2 bg-white p-3 border border-neutral-300 space-y-1">
                      <span className="text-neutral-400 font-extrabold block text-[9.5px]">Replacement Item</span>
                      <p className="font-mono text-xs font-bold text-black">
                        SKU: {order.returnRequest.exchangeVariantSku} (Replacement Price: ₹{order.returnRequest.replacementPrice || "—"})
                      </p>
                    </div>
                  )}

                  {order.returnRequest.priceDifference !== 0 && (
                    <div className="sm:col-span-2 bg-neutral-100 p-3 border border-neutral-300 space-y-1.5">
                      <span className="text-neutral-400 font-extrabold block text-[9.5px]">Price Difference Accounting</span>
                      {order.returnRequest.priceDifference > 0 ? (
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <p className="font-bold text-black">
                            Upgrade Amount: <span className="text-rose-700 font-extrabold">+₹{order.returnRequest.priceDifference}</span>
                            <span className="ml-2 text-[10px] uppercase font-extrabold px-1.5 py-0.5 rounded bg-black text-white">
                              {order.returnRequest.differencePaymentStatus}
                            </span>
                          </p>
                          {order.returnRequest.differencePaymentStatus === "pending" && (
                            <button
                              type="button"
                              onClick={handlePayPendingDifference}
                              className="px-3.5 py-1.5 bg-black hover:bg-gold hover:text-black text-white text-[10px] font-extrabold uppercase tracking-wider transition-all"
                            >
                              💳 Pay ₹{order.returnRequest.priceDifference} Online Now
                            </button>
                          )}
                        </div>
                      ) : (
                        <p className="font-bold text-green-800">
                          Surplus Refund Due: <span className="font-extrabold">₹{Math.abs(order.returnRequest.priceDifference)}</span>
                          <span className="ml-2 text-[10px] text-neutral-600">
                            (Will be credited back after original item is received at warehouse)
                          </span>
                        </p>
                      )}
                    </div>
                  )}

                  {order.returnRequest.transitDamageCompensationAmount > 0 && (
                    <div className="sm:col-span-2 bg-amber-50 border border-amber-300 p-3 text-amber-900">
                      <span className="font-extrabold block text-[10px]">⚠️ 50% Reverse Transit Damage Policy Applied</span>
                      <p className="text-[11px] mt-0.5">
                        Product arrived broken during return courier transit. 50% compensation (<strong>₹{order.returnRequest.transitDamageCompensationAmount}</strong>) has been refunded to your payment method.
                      </p>
                    </div>
                  )}
                </div>

                <div className="border-t border-neutral-300 pt-2">
                  <span className="text-neutral-400 font-extrabold block text-[9.5px]">Customer Notes</span>
                  <p className="text-neutral-700 normal-case">{order.returnRequest.reason}</p>
                </div>

                {order.returnRequest.unboxingVideoUrl && (
                  <div className="border-t border-neutral-300 pt-2">
                    <span className="text-neutral-400 font-extrabold block text-[9.5px]">Unboxing Proof</span>
                    <a
                      href={order.returnRequest.unboxingVideoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline font-extrabold text-gold text-xs"
                    >
                      View Attached Video Proof ↗
                    </a>
                  </div>
                )}
              </div>
            </div>
          ) : order.orderStatus === "delivered" ? (
            <div className="space-y-6">
              {/* Policy Quick Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-neutral-50 p-4 border border-neutral-200 text-xs font-semibold uppercase tracking-wider">
                <div className="space-y-1">
                  <span className="text-lg">🛡️</span>
                  <p className="font-extrabold text-black">Transit Damage</p>
                  <p className="text-[10px] text-neutral-500 normal-case">
                    Continuous unboxing video strictly mandatory. Exchange (recommended) or Return.
                  </p>
                </div>
                <div className="space-y-1">
                  <span className="text-lg">🔄</span>
                  <p className="font-extrabold text-black">Good Condition</p>
                  <p className="text-[10px] text-neutral-500 normal-case">
                    100% Free Size & Finish Exchange. (Refunds are not applicable for good idols).
                  </p>
                </div>
                <div className="space-y-1">
                  <span className="text-lg">⚖️</span>
                  <p className="font-extrabold text-black">Reverse Transit</p>
                  <p className="text-[10px] text-neutral-500 normal-case">
                    If returned idol breaks during reverse courier transit, 50% compensation policy applies.
                  </p>
                </div>
              </div>

              <form onSubmit={handleReturnSubmit} className="space-y-5 pt-1">
                {formError && (
                  <div className="p-3 bg-red-50 border-2 border-red-300 text-red-800 text-xs font-bold leading-relaxed">
                    {formError}
                  </div>
                )}
                {formSuccess && (
                  <div className="p-3 bg-green-50 border-2 border-green-300 text-green-900 text-xs font-bold leading-relaxed">
                    {formSuccess}
                  </div>
                )}

                {/* Step 1: Select Item & Claim Reason */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-extrabold uppercase tracking-widest text-neutral-400 mb-1.5">
                      Select Item from Order *
                    </label>
                    <select
                      value={selectedItemSku}
                      onChange={(e) => {
                        setSelectedItemSku(e.target.value);
                        const item = order.items.find((i) => i.variantSku === e.target.value);
                        if (item) fetchProductVariants(item.product);
                      }}
                      className="w-full px-3.5 py-3 border-2 border-neutral-300 rounded-none bg-white text-xs font-bold text-black outline-none focus:border-black"
                    >
                      {order.items.map((item) => (
                        <option key={item.variantSku} value={item.variantSku}>
                          {item.title} ({item.size} / {item.finish}) — ₹{item.price}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-extrabold uppercase tracking-widest text-neutral-400 mb-1.5">
                      Reason for Claim / Product Condition *
                    </label>
                    <select
                      value={claimReasonType}
                      onChange={(e) => {
                        const val = e.target.value;
                        setClaimReasonType(val);
                        if (val === "size_color") {
                          setRequestType("exchange");
                        }
                      }}
                      className="w-full px-3.5 py-3 border-2 border-neutral-300 rounded-none bg-white text-xs font-bold text-black outline-none focus:border-black"
                    >
                      <option value="damage">🛡️ Product arrived damaged / broken</option>
                      <option value="size_color">📦 Good condition, but want another product / size / color</option>
                      <option value="wrong_item">🔄 Wrong product received</option>
                    </select>
                  </div>
                </div>

                {/* Step 2: Unboxing Video Proof Gating (Mandatory if damage) */}
                {claimReasonType === "damage" && (
                  <div className={`p-4 border-2 transition-all space-y-3 ${
                    !videoUrl.trim() ? "bg-red-50/70 border-red-300" : "bg-neutral-50 border-neutral-300"
                  }`}>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <div>
                        <span className="text-xs font-black uppercase tracking-wider text-black flex items-center gap-1.5">
                          <span>📹</span> Continuous Unboxing Video Proof *
                        </span>
                        <p className="text-[10px] text-neutral-600 font-semibold mt-0.5 normal-case">
                          Video must start before cutting the outer courier box tape and show the idol unboxing continuously.
                        </p>
                      </div>
                      <span className="text-[9.5px] font-black uppercase tracking-widest px-2 py-0.5 bg-red-600 text-white self-start sm:self-auto">
                        Strictly Mandatory *
                      </span>
                    </div>

                    {!videoUrl.trim() && (
                      <div className="p-2.5 bg-red-100 border border-red-200 text-red-900 text-[11px] font-bold">
                        ⚠️ <strong>No Video?</strong> As per store policy, transit damage claims cannot be processed without an unboxing video. If you do not have a video, returns and exchanges are blocked. Please contact WhatsApp support.
                      </div>
                    )}

                    <div className="flex gap-2">
                      <input
                        type="url"
                        required={claimReasonType === "damage"}
                        placeholder="Paste Google Drive, Dropbox or YouTube link to unboxing video"
                        value={videoUrl}
                        onChange={(e) => setVideoUrl(e.target.value)}
                        className="flex-1 px-3.5 py-2.5 border-2 border-neutral-300 rounded-none bg-white text-xs font-bold text-black outline-none focus:border-black"
                      />
                      <button
                        type="button"
                        onClick={handleFillMockVideo}
                        className="text-xs border-2 border-black text-black hover:bg-neutral-100 px-3 font-extrabold uppercase tracking-wider shrink-0"
                      >
                        Fill Test Link
                      </button>
                    </div>
                  </div>
                )}

                {/* Step 3: Preferred Solution & Replacement Selector */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-extrabold uppercase tracking-widest text-neutral-400 mb-1.5">
                      Preferred Solution *
                    </label>
                    <select
                      value={requestType}
                      disabled={claimReasonType === "damage" && !videoUrl.trim()}
                      onChange={(e) => setRequestType(e.target.value)}
                      className="w-full px-3.5 py-3 border-2 border-neutral-300 rounded-none bg-white text-xs font-bold text-black outline-none focus:border-black disabled:bg-neutral-100 disabled:text-neutral-400"
                    >
                      <option value="exchange">
                        🔄 Exchange for Replacement (Recommended · Free Swap)
                      </option>
                      {claimReasonType === "damage" && videoUrl.trim() && (
                        <option value="return">💰 Return & Full Refund</option>
                      )}
                    </select>

                    {claimReasonType === "size_color" && (
                      <span className="text-[10px] text-green-700 font-extrabold uppercase tracking-wider block mt-1">
                        ✓ Exchange Only (Refund not applicable for good condition idols)
                      </span>
                    )}
                  </div>

                  {requestType === "exchange" && selectedProductDetails && (
                    <div>
                      <label className="block text-[10px] font-extrabold uppercase tracking-widest text-neutral-400 mb-1.5">
                        Choose Replacement Variant *
                      </label>
                      <select
                        value={exchangeVariantSku}
                        onChange={(e) => setExchangeVariantSku(e.target.value)}
                        className="w-full px-3.5 py-3 border-2 border-neutral-300 rounded-none bg-white text-xs font-bold text-black outline-none focus:border-black"
                      >
                        {selectedProductDetails.variants?.map((v) => (
                          <option key={v.sku} value={v.sku}>
                            {v.size} / {v.finish} — ₹{v.discountPrice || v.price}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                {/* Step 4: Live Price Difference Box (When Exchange selected) */}
                {requestType === "exchange" && currentReplacementVariant && (
                  <div className="p-4 border-2 border-black bg-neutral-50 space-y-2">
                    <span className="text-[9.5px] uppercase font-black tracking-widest bg-gold text-black px-2 py-0.5 border border-black inline-block">
                      Exchange Price Accounting
                    </span>
                    <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-bold">
                      <div>
                        <span className="text-neutral-400 block text-[10px]">Original Item Value</span>
                        <span className="text-black text-sm">₹{currentOriginalPrice}</span>
                      </div>
                      <span className="text-neutral-400 text-lg">→</span>
                      <div>
                        <span className="text-neutral-400 block text-[10px]">Replacement Item Value</span>
                        <span className="text-black text-sm">₹{currentReplacementPrice}</span>
                      </div>
                      <span className="text-neutral-400 text-lg">=</span>
                      <div>
                        <span className="text-neutral-400 block text-[10px]">Difference</span>
                        <span className={`text-sm ${
                          livePriceDiff > 0 ? "text-rose-700 font-black" : livePriceDiff < 0 ? "text-green-700 font-black" : "text-black"
                        }`}>
                          {livePriceDiff > 0 ? `+₹${livePriceDiff} (Customer Pays)` : livePriceDiff < 0 ? `-₹${Math.abs(livePriceDiff)} (Refund Due)` : "₹0 (Free Swap)"}
                        </span>
                      </div>
                    </div>

                    {livePriceDiff > 0 && (
                      <p className="text-[11px] text-rose-800 font-semibold leading-relaxed border-t border-neutral-200 pt-2 normal-case">
                        ⚡ <strong>Upgrade Difference:</strong> You will be prompted to complete an online payment of <strong>₹{livePriceDiff}</strong> via Razorpay upon clicking submit to confirm this replacement.
                      </p>
                    )}

                    {livePriceDiff < 0 && (
                      <p className="text-[11px] text-green-800 font-semibold leading-relaxed border-t border-neutral-200 pt-2 normal-case">
                        💰 <strong>Surplus Refund:</strong> The balance of <strong>₹{Math.abs(livePriceDiff)}</strong> will be credited directly back to your payment account via Razorpay once the original idol is safely received at our studio.
                      </p>
                    )}
                  </div>
                )}

                {/* Step 5: Notes */}
                <div>
                  <label className="block text-[10px] font-extrabold uppercase tracking-widest text-neutral-400 mb-1.5">
                    Please describe what you need (Reason / Notes) *
                  </label>
                  <textarea
                    required
                    rows={3}
                    placeholder="Provide additional details about your return or exchange request..."
                    value={returnReason}
                    onChange={(e) => setReturnReason(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-neutral-300 rounded-none bg-white text-xs font-bold text-black outline-none focus:border-black"
                  />
                </div>

                {/* Submit Action Button */}
                <button
                  type="submit"
                  disabled={formLoading || (claimReasonType === "damage" && !videoUrl.trim())}
                  className="w-full sm:w-auto bg-black hover:bg-gold hover:text-black text-white px-8 py-3.5 rounded-none text-xs font-extrabold uppercase tracking-widest border-2 border-black transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {formLoading
                    ? "Processing Request..."
                    : claimReasonType === "damage" && !videoUrl.trim()
                    ? "❌ Unboxing Video Proof Required to Submit"
                    : livePriceDiff > 0
                    ? `Submit & Pay Difference of ₹${livePriceDiff} →`
                    : "Submit Claim Request →"}
                </button>
              </form>
            </div>
          ) : (
            <p className="text-xs text-neutral-500 font-semibold uppercase tracking-wider">
              Claim requests can only be filed once the order status is marked as <strong>Delivered</strong>.
            </p>
          )}
        </div>

        {/* Invoice Summary Grid */}
        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-white rounded-none p-6 border-2 border-black space-y-6">
            <div>
              <h3 className="font-display font-extrabold text-black uppercase tracking-wider text-sm mb-2">Shipping Address</h3>
              <div className="text-xs text-neutral-600 space-y-0.5 font-semibold uppercase tracking-wider leading-relaxed">
                <p className="font-bold text-black">{user.name}</p>
                <p>{order.shippingAddress.addressLine1}</p>
                {order.shippingAddress.addressLine2 && <p>{order.shippingAddress.addressLine2}</p>}
                <p>
                  {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}
                </p>
                <p>{order.shippingAddress.country}</p>
                <p className="text-neutral-400 mt-1">Contact: +91 {user.phone}</p>
              </div>
            </div>

            <div className="border-t-2 border-neutral-100 pt-4">
              <h3 className="font-display font-extrabold text-black uppercase tracking-wider text-sm mb-2">Billing Address</h3>
              <div className="text-xs text-neutral-600 space-y-0.5 font-semibold uppercase tracking-wider leading-relaxed">
                <p>{order.billingAddress.addressLine1}</p>
                {order.billingAddress.addressLine2 && <p>{order.billingAddress.addressLine2}</p>}
                <p>
                  {order.billingAddress.city}, {order.billingAddress.state} - {order.billingAddress.pincode}
                </p>
                <p>{order.billingAddress.country}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-none p-6 border-2 border-black flex flex-col justify-between">
            <div>
              <h3 className="font-display font-extrabold text-black uppercase tracking-wider text-sm mb-4">Payment Summary</h3>
              <div className="space-y-3 text-xs font-semibold uppercase tracking-wider border-b-2 border-neutral-100 pb-4">
                <div className="flex justify-between text-neutral-500">
                  <span>Subtotal</span>
                  <span className="text-black font-extrabold">₹{order.subtotal}</span>
                </div>
                {order.discount > 0 && (
                  <div className="flex justify-between text-green-700 font-extrabold">
                    <span>Discount Applied</span>
                    <span>-₹{order.discount}</span>
                  </div>
                )}
                <div className="flex justify-between text-neutral-500">
                  <span>Shipping Fee</span>
                  <span className="text-black font-extrabold">₹{order.shippingFee}</span>
                </div>
                <div className="flex justify-between text-neutral-500">
                  <span>GST (18% Included)</span>
                  <span className="text-black font-extrabold">₹{order.tax}</span>
                </div>
              </div>
            </div>

            <div className="pt-4">
              <div className="flex justify-between font-display text-sm font-extrabold text-black uppercase tracking-wider">
                <span>Grand Total</span>
                <span>₹{order.totalAmount}</span>
              </div>
              <div className="mt-4 text-[10px] text-neutral-400 font-semibold uppercase tracking-wider space-y-0.5">
                <p>Method: {order.paymentMethod.toUpperCase()}</p>
                {order.paymentInfo?.razorpayPaymentId && (
                  <p>Transaction ID: {order.paymentInfo.razorpayPaymentId}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Order Items Details */}
        <div className="bg-white rounded-none p-6 border-2 border-black">
          <h2 className="font-display text-lg text-black font-extrabold uppercase tracking-wider mb-4">Items in Order</h2>
          <div className="divide-y-2 divide-neutral-100">
            {order.items.map((item) => (
              <div key={item._id} className="flex gap-4 py-4 first:pt-0 last:pb-0">
                <div className="relative w-16 h-16 bg-neutral-100 rounded-none overflow-hidden border border-neutral-200 flex-shrink-0">
                  {item.image && (
                    <ImageWithSkeleton src={item.image} alt={item.title} fill className="object-cover" />
                  )}
                </div>
                <div className="flex-1 font-display">
                  <h3 className="font-extrabold text-black uppercase tracking-wider text-xs md:text-sm">{item.title}</h3>
                  <p className="text-[10px] text-neutral-400 font-semibold uppercase tracking-wider">SKU: {item.variantSku}</p>
                  <p className="text-[10px] text-neutral-600 font-semibold uppercase tracking-wider mt-1">
                    Size: {item.size} | Finish: {item.finish} | Qty: {item.quantity}
                  </p>
                </div>
                <p className="text-xs md:text-sm font-extrabold text-black self-center">₹{item.price * item.quantity}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </main>
  );
}
