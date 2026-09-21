"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import ImageWithSkeleton from "@/components/ImageWithSkeleton";
import { getOrderById, submitReturnRequest, getProducts } from "@/lib/api";
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

  async function handleReturnSubmit(e) {
    e.preventDefault();
    setFormError("");
    setFormSuccess("");

    if (!returnReason.trim()) {
      setFormError("Please explain the reason for your request.");
      return;
    }

    if (claimReasonType === "damage" && !videoUrl.trim()) {
      setFormError("A link to your unboxing video is compulsory for damage claims.");
      return;
    }

    if (requestType === "exchange" && !exchangeVariantSku) {
      setFormError("Please select a replacement size/finish variant.");
      return;
    }

    setFormLoading(true);
    try {
      const payload = {
        requestType,
        claimReasonType,
        reason: returnReason,
        unboxingVideoUrl: claimReasonType === "damage" ? videoUrl : undefined,
        exchangeVariantSku: requestType === "exchange" ? exchangeVariantSku : undefined,
      };
      const res = await submitReturnRequest(order._id, payload);
      setOrder(res.data);
      setFormSuccess("Your claim request has been successfully submitted for review!");
      setReturnReason("");
      setVideoUrl("");
    } catch (err) {
      setFormError(err.response?.data?.message || "Failed to submit request.");
    } finally {
      setFormLoading(false);
    }
  }

  function handleFillMockVideo() {
    setVideoUrl("https://res.cloudinary.com/demo/video/upload/sample_unboxing.mp4");
  }

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
          <h2 className="font-display text-lg text-black font-extrabold uppercase tracking-wider mb-4">Damage / Return Claims</h2>
          
          {order.returnRequest?.isRequested ? (
            <div className="space-y-4">
              <div className="p-4 border-2 border-black text-xs font-semibold bg-neutral-50 uppercase tracking-wider space-y-1.5">
                <p className="font-extrabold">
                  Request Type: {order.returnRequest.requestType === "return" ? "Return & Refund" : "Exchange"}
                </p>
                <p className="font-extrabold">
                  Claim Status: {order.returnRequest.status}
                </p>
                <p>Reason: {order.returnRequest.reason}</p>
                {order.returnRequest.exchangeVariantSku && (
                  <p>Replacement Variant: {order.returnRequest.exchangeVariantSku}</p>
                )}
                {order.returnRequest.unboxingVideoUrl && (
                  <p className="mt-1">
                    Unboxing Video:{" "}
                    <a href={order.returnRequest.unboxingVideoUrl} target="_blank" rel="noopener noreferrer" className="underline font-extrabold text-gold">
                      View Video ↗
                    </a>
                  </p>
                )}
              </div>
            </div>
          ) : order.orderStatus === "delivered" ? (
            <div className="space-y-4">
              <div className="bg-neutral-50 border-2 border-black p-4 text-xs font-semibold uppercase tracking-wider space-y-1">
                <p className="font-extrabold text-black">📹 Returns & Exchange Policy:</p>
                <p>• Returns & Refunds: Only for transit damaged idols (Unboxing video mandatory).</p>
                <p>• Exchanges: Available for size or finish preference.</p>
              </div>

              <form onSubmit={handleReturnSubmit} className="space-y-4 pt-2">
                {formError && <p className="text-red-600 text-xs font-bold">{formError}</p>}
                {formSuccess && <p className="text-green-700 text-xs font-bold">{formSuccess}</p>}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-extrabold uppercase tracking-widest text-neutral-400 mb-1">Select Item *</label>
                    <select
                      value={selectedItemSku}
                      onChange={(e) => {
                        setSelectedItemSku(e.target.value);
                        const item = order.items.find(i => i.variantSku === e.target.value);
                        if (item) fetchProductVariants(item.product);
                      }}
                      className="w-full px-3 py-2.5 border-2 border-neutral-300 rounded-none bg-white text-xs font-bold text-black outline-none focus:border-black"
                    >
                      {order.items.map(item => (
                        <option key={item.variantSku} value={item.variantSku}>
                          {item.title} ({item.size} / {item.finish})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-extrabold uppercase tracking-widest text-neutral-400 mb-1">Reason for Claim *</label>
                    <select
                      value={claimReasonType}
                      onChange={(e) => {
                        const val = e.target.value;
                        setClaimReasonType(val);
                        if (val === "size_color") setRequestType("exchange");
                      }}
                      className="w-full px-3 py-2.5 border-2 border-neutral-300 rounded-none bg-white text-xs font-bold text-black outline-none focus:border-black"
                    >
                      <option value="size_color">Size or Color Issue</option>
                      <option value="damage">Transit Damage / Broken Product</option>
                      <option value="other">Other / Incorrect Item Sent</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-extrabold uppercase tracking-widest text-neutral-400 mb-1">Preferred Solution *</label>
                    <select
                      value={requestType}
                      onChange={(e) => setRequestType(e.target.value)}
                      className="w-full px-3 py-2.5 border-2 border-neutral-300 rounded-none bg-white text-xs font-bold text-black outline-none focus:border-black"
                    >
                      <option value="exchange">Exchange for Replacement</option>
                      {claimReasonType === "damage" && (
                        <option value="return">Return & Refund</option>
                      )}
                    </select>
                  </div>

                  {requestType === "exchange" && selectedProductDetails && (
                    <div>
                      <label className="block text-[10px] font-extrabold uppercase tracking-widest text-neutral-400 mb-1">Choose Replacement Variant *</label>
                      <select
                        value={exchangeVariantSku}
                        onChange={(e) => setExchangeVariantSku(e.target.value)}
                        className="w-full px-3 py-2.5 border-2 border-neutral-300 rounded-none bg-white text-xs font-bold text-black outline-none focus:border-black"
                      >
                        {selectedProductDetails.variants?.map(v => (
                          <option key={v.sku} value={v.sku}>
                            {v.size} / {v.finish} (₹{v.price})
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                {claimReasonType === "damage" && (
                  <div className="space-y-1">
                    <label className="block text-[10px] font-extrabold uppercase tracking-widest text-neutral-400 mb-1">Unboxing Video URL *</label>
                    <div className="flex gap-2">
                      <input
                        type="url"
                        required
                        placeholder="Google Drive, Dropbox, YouTube video link"
                        value={videoUrl}
                        onChange={(e) => setVideoUrl(e.target.value)}
                        className="flex-1 px-4 py-2.5 border-2 border-neutral-300 rounded-none bg-white text-xs font-bold text-black outline-none focus:border-black"
                      />
                      <button
                        type="button"
                        onClick={handleFillMockVideo}
                        className="text-xs border-2 border-black text-black hover:bg-neutral-100 px-3 font-extrabold uppercase tracking-wider"
                      >
                        Fill Mock Link
                      </button>
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-[10px] font-extrabold uppercase tracking-widest text-neutral-400 mb-1">Describe the Issue *</label>
                  <textarea
                    required
                    rows={3}
                    placeholder="Enter details about your request..."
                    value={returnReason}
                    onChange={(e) => setReturnReason(e.target.value)}
                    className="w-full px-4 py-2.5 border-2 border-neutral-300 rounded-none bg-white text-xs font-bold text-black outline-none focus:border-black"
                  />
                </div>

                <button
                  type="submit"
                  disabled={formLoading}
                  className="bg-black hover:bg-gold hover:text-black text-white px-8 py-3 rounded-none text-xs font-extrabold uppercase tracking-widest border-2 border-black transition-all disabled:opacity-50"
                >
                  {formLoading ? "Submitting Request..." : "Submit Claim Request →"}
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
