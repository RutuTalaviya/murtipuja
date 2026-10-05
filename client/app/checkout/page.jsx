"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import ImageWithSkeleton from "@/components/ImageWithSkeleton";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import ReturnPolicyModal from "@/components/ReturnPolicyModal";
import api, { sendOtp, verifyOtp, getActiveCoupons, getActiveOffers } from "@/lib/api";

const STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa",
  "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala",
  "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland",
  "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura",
  "Uttar Pradesh", "Uttarakhand", "West Bengal", "Delhi", "Jammu and Kashmir", "Ladakh"
];

export default function CheckoutPage() {
  const router = useRouter();
  const {
    cart,
    itemCount,
    subtotal,
    calculations,
    couponCode: appliedCouponCode,
    appliedOfferId,
    applyCoupon,
    removeCoupon,
    applySpecialOffer,
    removeSpecialOffer,
    clearCart,
  } = useCart();
  const { user, login } = useAuth();

  // Address State
  const [shippingAddress, setShippingAddress] = useState({
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    pincode: "",
    country: "India",
  });
  const [sameAsBilling, setSameAsBilling] = useState(true);
  const [billingAddress, setBillingAddress] = useState({
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    pincode: "",
    country: "India",
  });

  // Auth State for Guest Users
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [authError, setAuthError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);

  // Coupon & Offer State
  const [couponCode, setCouponCode] = useState("");
  const [couponError, setCouponError] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);
  const [offerError, setOfferError] = useState("");
  const [offerLoading, setOfferLoading] = useState(false);
  const [availableCoupons, setAvailableCoupons] = useState([]);
  const [availableOffers, setAvailableOffers] = useState([]);

  // Fetch active public coupons and offers
  useEffect(() => {
    getActiveCoupons()
      .then((res) => setAvailableCoupons(res.data || []))
      .catch((err) => console.error("Could not fetch coupons:", err));
    getActiveOffers()
      .then((res) => setAvailableOffers(res.data || []))
      .catch((err) => console.error("Could not fetch offers:", err));
  }, []);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState("");

  // Extract from calculations
  const shippingFee = calculations.shippingFee;
  const tax = calculations.tax;
  const totalAmount = calculations.totalAmount;

  // Load user default address if available
  useEffect(() => {
    if (user?.addresses?.length > 0) {
      const defaultAddr = user.addresses.find(a => a.isDefault) || user.addresses[0];
      setShippingAddress({
        addressLine1: defaultAddr.addressLine1 || "",
        addressLine2: defaultAddr.addressLine2 || "",
        city: defaultAddr.city || "",
        state: defaultAddr.state || "",
        pincode: defaultAddr.pincode || "",
        country: defaultAddr.country || "India",
      });
      if (user.phone) {
        setPhone(user.phone);
      }
    }
  }, [user]);

  if (itemCount === 0 && !checkoutLoading) {
    return (
      <main className="min-h-screen bg-white flex flex-col items-center justify-center px-6 text-center py-20 font-display">
        <div className="text-5xl mb-4">🛍️</div>
        <h1 className="font-display text-2xl text-black font-extrabold uppercase tracking-wider mb-2">Your checkout bag is empty</h1>
        <p className="text-neutral-500 text-xs font-semibold mb-6 max-w-[280px] uppercase tracking-wider">Please add some divine collections to your cart before checking out.</p>
        <Link href="/products" className="bg-black hover:bg-gold hover:text-black text-white px-8 py-3.5 border-2 border-black rounded-none font-extrabold tracking-widest text-xs uppercase transition-all">
          Shop Collection
        </Link>
      </main>
    );
  }

  // Apply Coupon
  async function handleApplyCoupon(e) {
    if (e) e.preventDefault();
    setCouponError("");
    setOfferError("");
    if (!couponCode) return;

    setCouponLoading(true);
    const result = await applyCoupon(couponCode);
    setCouponLoading(false);
    if (!result.success) {
      setCouponError(result.message);
    }
  }

  // Apply Special Offer directly
  async function handleApplyOffer(offerId) {
    setCouponError("");
    setOfferError("");
    setOfferLoading(true);
    const result = await applySpecialOffer(offerId);
    setOfferLoading(false);
    if (!result.success) {
      setOfferError(result.message);
    }
  }

  // Handle Guest Auth Send OTP
  async function handleSendOtp(e) {
    e.preventDefault();
    setAuthError("");
    if (!/^[6-9]\d{9}$/.test(phone)) {
      setAuthError("Enter a valid 10-digit mobile number");
      return;
    }
    setAuthLoading(true);
    try {
      await sendOtp(phone);
      setOtpSent(true);
    } catch (err) {
      setAuthError("Could not send OTP. Try again.");
    } finally {
      setAuthLoading(false);
    }
  }

  // Handle Guest Auth Verify OTP
  async function handleVerifyOtp(e) {
    e.preventDefault();
    setAuthError("");
    if (otp.length !== 6) {
      setAuthError("Enter 6-digit OTP");
      return;
    }
    setAuthLoading(true);
    try {
      const res = await verifyOtp(phone, otp);
      login(res.data.token, res.data.user);
    } catch (err) {
      setAuthError("Incorrect OTP");
    } finally {
      setAuthLoading(false);
    }
  }

  // Validate form before open modal
  function handlePlaceOrderClick(e) {
    e.preventDefault();
    setCheckoutError("");

    if (!user) {
      setCheckoutError("Please verify your phone number to continue.");
      return;
    }

    if (
      !shippingAddress.addressLine1 ||
      !shippingAddress.city ||
      !shippingAddress.state ||
      !shippingAddress.pincode
    ) {
      setCheckoutError("Please fill out the complete shipping address.");
      return;
    }

    if (
      !sameAsBilling &&
      (!billingAddress.addressLine1 || !billingAddress.city || !billingAddress.state || !billingAddress.pincode)
    ) {
      setCheckoutError("Please fill out the complete billing address.");
      return;
    }

    setIsModalOpen(true);
  }

  // Handle Agreement and Place Order with Razorpay
  async function handleConfirmOrder() {
    setIsModalOpen(false);
    setCheckoutLoading(true);
    setCheckoutError("");

    const billing = sameAsBilling ? shippingAddress : billingAddress;

    try {
      // 1. Create order on server and get Razorpay Order ID
      const orderPayload = {
        shippingAddress,
        billingAddress: billing,
        couponCode: appliedCouponCode || null,
        offerId: appliedOfferId || null,
        returnPolicyAcknowledged: true,
      };

      const res = await api.post("/api/orders/create", orderPayload);
      const { order, razorpayOrder, razorpayKeyId } = res.data;

      const rzpKey = razorpayKeyId || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_live_TcNNAglqRPpV08";

      // 2. Load Razorpay SDK Script safely
      const loadRazorpay = () => {
        return new Promise((resolve) => {
          if (typeof window !== "undefined" && window.Razorpay) {
            resolve(true);
            return;
          }
          const script = document.createElement("script");
          script.src = "https://checkout.razorpay.com/v1/checkout.js";
          script.async = true;
          script.onload = () => resolve(true);
          script.onerror = () => resolve(false);
          document.body.appendChild(script);
        });
      };

      const loaded = await loadRazorpay();
      if (!loaded || !window.Razorpay) {
        setCheckoutError("Payment gateway failed to load. Please check your internet connection.");
        setCheckoutLoading(false);
        return;
      }

      // 3. Open Razorpay payment gateway
      const options = {
        key: rzpKey,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency || "INR",
        name: "MurtiPuja",
        description: `Order #${order.orderNumber}`,
        order_id: razorpayOrder.id,
        handler: async function (response) {
          try {
            // 4. Verify payment signature on backend
            const verifyRes = await api.post("/api/payment/razorpay/verify", {
              orderId: order._id,
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            });

            if (verifyRes.data.success) {
              clearCart();
              router.push(`/account/orders/${order._id}?success=true`);
            } else {
              setCheckoutError("Payment verification failed. Please contact support.");
            }
          } catch (err) {
            setCheckoutError("Verification error: " + (err.response?.data?.message || err.message));
          } finally {
            setCheckoutLoading(false);
          }
        },
        prefill: {
          name: user.name || "Customer",
          email: user.email || "",
          contact: user.phone || "",
        },
        theme: {
          color: "#000000",
        },
        modal: {
          ondismiss: function () {
            setCheckoutLoading(false);
            setCheckoutError("Payment was cancelled by the user.");
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", function (response) {
        setCheckoutError(response.error?.description || "Payment failed. Please try again.");
        setCheckoutLoading(false);
      });
      rzp.open();
    } catch (err) {
      setCheckoutError(err.response?.data?.message || "Failed to create order. Please try again.");
      setCheckoutLoading(false);
    }
  }

  if (itemCount === 0) {
    return (
      <main className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center font-display">
        <h1 className="font-display text-2xl text-black font-extrabold uppercase tracking-wider mb-2">No items to checkout</h1>
        <p className="text-neutral-500 text-xs font-semibold mb-6 uppercase tracking-wider">Your cart is empty. Add products before checkout.</p>
        <Link href="/products" className="bg-black hover:bg-gold hover:text-black text-white px-8 py-3.5 border-2 border-black rounded-none font-extrabold tracking-widest text-xs uppercase transition-all">
          Browse Products
        </Link>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white px-4 md:px-8 lg:px-12 py-8 md:py-12 font-display w-full">
      <div className="w-full grid lg:grid-cols-12 gap-8 md:gap-12">
        {/* Checkout Forms (Left side) */}
        <div className="lg:col-span-7 space-y-8">
          {/* Step 1: User Verification */}
          <div className="bg-white rounded-none p-6 border-2 border-black">
            <h2 className="font-display text-lg text-black font-extrabold uppercase tracking-wider mb-4 flex items-center gap-2">
              <span className="w-6 h-6 rounded-none border-2 border-black bg-gold text-black text-xs flex items-center justify-center font-extrabold">1</span>
              Verification (OTP Login)
            </h2>
            {user ? (
              <div className="bg-green-50 text-green-800 p-4 border-2 border-green-600 rounded-none text-xs font-bold uppercase tracking-wider">
                <p className="font-extrabold flex items-center gap-1.5 text-green-900">
                  <span>✓</span> Verified Mobile Number
                </p>
                <p className="text-[11px] text-green-800 mt-1 font-mono font-bold">+91 {user.phone}</p>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-xs text-neutral-500 font-semibold uppercase tracking-wider">
                  Quick OTP verification is required to place your order. No passwords needed.
                </p>
                {!otpSent ? (
                  <form onSubmit={handleSendOtp} className="flex gap-2">
                    <div className="flex-1 flex items-center border-2 border-black rounded-none bg-white overflow-hidden">
                      <span className="px-3 text-black text-sm border-r-2 border-black font-bold">+91</span>
                      <input
                        type="tel"
                        maxLength={10}
                        placeholder="Mobile number"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                        className="w-full px-3 py-2.5 outline-none bg-transparent text-sm font-bold text-black focus:bg-neutral-50"
                        required
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={authLoading}
                      className="bg-black text-white hover:bg-gold hover:text-black border-2 border-black px-5 py-2.5 rounded-none text-xs font-extrabold uppercase tracking-widest disabled:opacity-50"
                    >
                      {authLoading ? "..." : "Send OTP"}
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleVerifyOtp} className="space-y-3">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        maxLength={6}
                        placeholder="Enter 6-digit OTP"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                        className="flex-1 text-center tracking-[0.2em] px-3 py-2.5 border-2 border-black rounded-none outline-none focus:bg-neutral-50 text-sm font-bold text-black"
                        required
                      />
                      <button
                        type="submit"
                        disabled={authLoading}
                        className="bg-black text-white hover:bg-gold hover:text-black border-2 border-black px-5 py-2.5 rounded-none text-xs font-extrabold uppercase tracking-widest disabled:opacity-50"
                      >
                        {authLoading ? "Verifying..." : "Verify"}
                      </button>
                    </div>
                    <div className="flex justify-between text-[10px] text-neutral-400 font-extrabold uppercase tracking-widest">
                      <span>Sent to +91 {phone}</span>
                      <button type="button" onClick={() => setOtpSent(false)} className="hover:underline text-black font-extrabold">Change Number</button>
                    </div>
                  </form>
                )}
                {authError && <p className="text-red-600 text-xs mt-1 font-semibold">{authError}</p>}
                <p className="text-[10.5px] text-neutral-500 bg-neutral-50 p-2.5 border border-neutral-200 rounded-none font-semibold">
                  💡 <strong>Demo tip:</strong> OTP will be logged inside the Server backend console since the MSG91 API key is empty.
                </p>
              </div>
            )}
          </div>

          {/* Step 2: Shipping Address */}
          <div className="bg-white rounded-none p-6 border-2 border-black">
            <h2 className="font-display text-lg text-black font-extrabold uppercase tracking-wider mb-4 flex items-center gap-2">
              <span className="w-6 h-6 rounded-none border-2 border-black bg-gold text-black text-xs flex items-center justify-center font-extrabold">2</span>
              Shipping Address
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-[9.5px] text-neutral-400 font-extrabold uppercase tracking-widest mb-1.5">Address Line 1 *</label>
                <input
                  type="text"
                  required
                  placeholder="House No, Building, Street Name"
                  value={shippingAddress.addressLine1}
                  onChange={(e) => setShippingAddress({ ...shippingAddress, addressLine1: e.target.value })}
                  className="w-full px-4 py-2.5 border-2 border-neutral-200 rounded-none bg-transparent outline-none focus:border-black text-xs font-bold text-black"
                />
              </div>

              <div>
                <label className="block text-[9.5px] text-neutral-400 font-extrabold uppercase tracking-widest mb-1.5">Address Line 2 (Optional)</label>
                <input
                  type="text"
                  placeholder="Apartment, Suite, Landmark"
                  value={shippingAddress.addressLine2}
                  onChange={(e) => setShippingAddress({ ...shippingAddress, addressLine2: e.target.value })}
                  className="w-full px-4 py-2.5 border-2 border-neutral-200 rounded-none bg-transparent outline-none focus:border-black text-xs font-bold text-black"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[9.5px] text-neutral-400 font-extrabold uppercase tracking-widest mb-1.5">City *</label>
                  <input
                    type="text"
                    required
                    placeholder="City"
                    value={shippingAddress.city}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })}
                    className="w-full px-4 py-2.5 border-2 border-neutral-200 rounded-none bg-transparent outline-none focus:border-black text-xs font-bold text-black"
                  />
                </div>

                <div>
                  <label className="block text-[9.5px] text-neutral-400 font-extrabold uppercase tracking-widest mb-1.5">State *</label>
                  <select
                    required
                    value={shippingAddress.state}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, state: e.target.value })}
                    className="w-full px-4 py-2.5 border-2 border-neutral-200 rounded-none bg-white outline-none focus:border-black text-xs font-bold text-black"
                  >
                    <option value="">Select State</option>
                    {STATES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[9.5px] text-neutral-400 font-extrabold uppercase tracking-widest mb-1.5">Pincode *</label>
                  <input
                    type="text"
                    maxLength={6}
                    required
                    placeholder="6-digit PIN"
                    value={shippingAddress.pincode}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, pincode: e.target.value.replace(/\D/g, "") })}
                    className="w-full px-4 py-2.5 border-2 border-neutral-200 rounded-none bg-transparent outline-none focus:border-black text-xs font-bold text-black"
                  />
                </div>

                <div>
                  <label className="block text-[9.5px] text-neutral-400 font-extrabold uppercase tracking-widest mb-1.5">Country</label>
                  <input
                    type="text"
                    disabled
                    value="India"
                    className="w-full px-4 py-2.5 border border-neutral-200 rounded-none bg-neutral-50 text-neutral-400 font-bold text-xs"
                  />
                </div>
              </div>

              {/* Same as billing check */}
              <label className="flex items-center gap-2 cursor-pointer mt-4 select-none">
                <input
                  type="checkbox"
                  checked={sameAsBilling}
                  onChange={(e) => setSameAsBilling(e.target.checked)}
                  className="w-4 h-4 accent-black border-2 border-black rounded-none focus:ring-black"
                />
                <span className="text-xs text-neutral-600 font-bold uppercase tracking-wider">Billing address is same as shipping</span>
              </label>
            </div>
          </div>

          {/* Step 3: Billing Address (Conditionally Shown) */}
          {!sameAsBilling && (
            <div className="bg-white rounded-none p-6 border-2 border-black animate-fade-in">
              <h2 className="font-display text-lg text-black mb-4 font-extrabold uppercase tracking-wider">Billing Address</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-[9.5px] text-neutral-400 font-extrabold uppercase tracking-widest mb-1.5">Address Line 1 *</label>
                  <input
                    type="text"
                    required
                    placeholder="House No, Building, Street"
                    value={billingAddress.addressLine1}
                    onChange={(e) => setBillingAddress({ ...billingAddress, addressLine1: e.target.value })}
                    className="w-full px-4 py-2.5 border-2 border-neutral-200 rounded-none bg-transparent outline-none focus:border-black text-xs font-bold text-black"
                  />
                </div>
                <div>
                  <label className="block text-[9.5px] text-neutral-400 font-extrabold uppercase tracking-widest mb-1.5">Address Line 2</label>
                  <input
                    type="text"
                    placeholder="Apartment, Landmark"
                    value={billingAddress.addressLine2}
                    onChange={(e) => setBillingAddress({ ...billingAddress, addressLine2: e.target.value })}
                    className="w-full px-4 py-2.5 border-2 border-neutral-200 rounded-none bg-transparent outline-none focus:border-black text-xs font-bold text-black"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[9.5px] text-neutral-400 font-extrabold uppercase tracking-widest mb-1.5">City *</label>
                    <input
                      type="text"
                      required
                      placeholder="City"
                      value={billingAddress.city}
                      onChange={(e) => setBillingAddress({ ...billingAddress, city: e.target.value })}
                      className="w-full px-4 py-2.5 border-2 border-neutral-200 rounded-none bg-transparent outline-none focus:border-black text-xs font-bold text-black"
                    />
                  </div>
                  <div>
                    <label className="block text-[9.5px] text-neutral-400 font-extrabold uppercase tracking-widest mb-1.5">State *</label>
                    <select
                      required
                      value={billingAddress.state}
                      onChange={(e) => setBillingAddress({ ...billingAddress, state: e.target.value })}
                      className="w-full px-4 py-2.5 border-2 border-neutral-200 rounded-none bg-white outline-none focus:border-black text-xs font-bold text-black"
                    >
                      <option value="">Select State</option>
                      {STATES.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[9.5px] text-neutral-400 font-extrabold uppercase tracking-widest mb-1.5">Pincode *</label>
                    <input
                      type="text"
                      maxLength={6}
                      required
                      placeholder="6-digit PIN"
                      value={billingAddress.pincode}
                      onChange={(e) => setBillingAddress({ ...billingAddress, pincode: e.target.value.replace(/\D/g, "") })}
                      className="w-full px-4 py-2.5 border-2 border-neutral-200 rounded-none bg-transparent outline-none focus:border-black text-xs font-bold text-black"
                    />
                  </div>
                  <div>
                    <label className="block text-[9.5px] text-neutral-400 font-extrabold uppercase tracking-widest mb-1.5">Country</label>
                    <input
                      type="text"
                      disabled
                      value="India"
                      className="w-full px-4 py-2.5 border border-neutral-200 rounded-none bg-neutral-50 text-neutral-400 font-bold text-xs"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Order Summary (Right side) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-none p-6 border-2 border-black sticky top-6 font-display">
            <h2 className="font-display text-lg text-black mb-6 font-extrabold uppercase tracking-wider">Order Summary</h2>

            {/* Cart Items List */}
            <div className="max-h-60 overflow-y-auto divide-y-2 divide-neutral-100 pr-2 mb-6">
              {cart.items.map((item) => (
                <div key={item._id} className="flex gap-4 py-3 first:pt-0 last:pb-0">
                  <div className="relative w-12 h-12 bg-neutral-100 rounded-none overflow-hidden flex-shrink-0 border border-neutral-200">
                    {item.product?.images?.[0]?.url && (
                      <ImageWithSkeleton src={item.product.images[0].url} alt={item.product.title} fill className="object-cover" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-black uppercase tracking-wider truncate font-display">{item.product?.title}</p>
                    <p className="text-[9.5px] text-neutral-400 font-semibold uppercase tracking-wider truncate">Size: {item.size} | Finish: {item.finish}</p>
                    <p className="text-[9.5px] text-neutral-500 font-semibold uppercase tracking-wider mt-0.5">Qty: {item.quantity}</p>
                  </div>
                  <p className="text-xs font-extrabold text-black">₹{item.priceAtAdd * item.quantity}</p>
                </div>
              ))}
            </div>

            {/* Coupon Code Form & Available Offers */}
            <div className="mb-6 space-y-3">
              {calculations.comboDiscount > 0 ? (
                <div className="bg-amber-50 border-2 border-amber-400 p-4 text-xs space-y-1.5">
                  <div className="flex items-center justify-between">
                    <p className="text-[11px] font-black uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
                      <span>🎁</span> Combo Deal Active (Priority 1)
                    </p>
                    <span className="bg-amber-200 text-amber-950 font-extrabold text-[10px] px-2 py-0.5 uppercase tracking-wider border border-amber-300">
                      -₹{calculations.comboDiscount} OFF
                    </span>
                  </div>
                  <p className="text-[10.5px] text-amber-800 font-medium leading-relaxed">
                    A special Combo Offer is active in your cart. Combo Deals take 1st priority, and additional coupons or special offers cannot be combined with combo orders.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {/* Single Offer Policy Notice */}
                  <div className="bg-neutral-50 border border-neutral-200 p-2 text-[9.5px] text-neutral-500 font-bold uppercase tracking-wider flex items-center gap-1.5">
                    <span>💡</span>
                    <span>1 Offer Policy: Apply a Coupon OR select a Special Offer below.</span>
                  </div>

                  {/* Active Coupon Banner */}
                  {appliedCouponCode && (
                    <div className="bg-green-50 border-2 border-green-600 p-3 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="text-base">🎟️</span>
                        <div>
                          <p className="font-extrabold text-green-900 uppercase tracking-wider text-[11px]">
                            Coupon Applied: <span className="bg-green-200 px-1.5 py-0.5 text-green-950 font-mono font-black border border-green-300">{appliedCouponCode}</span>
                          </p>
                          <p className="text-[10px] text-green-700 font-semibold mt-0.5">Discount: -₹{calculations.couponDiscount}</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          removeCoupon();
                          setCouponCode("");
                        }}
                        className="bg-white hover:bg-red-50 text-red-600 border border-red-300 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider transition-colors cursor-pointer"
                      >
                        Remove
                      </button>
                    </div>
                  )}

                  {/* Active Special Offer Banner */}
                  {calculations.autoOfferDiscount > 0 && calculations.appliedOffers?.length > 0 && (
                    <div className="bg-green-50 border-2 border-green-600 p-3 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="text-base">🎉</span>
                        <div>
                          <p className="font-extrabold text-green-900 uppercase tracking-wider text-[11px]">
                            Special Offer Applied: <span className="text-green-950 font-black">{calculations.appliedOffers[0]?.title}</span>
                          </p>
                          <p className="text-[10px] text-green-700 font-semibold mt-0.5">Discount: -₹{calculations.autoOfferDiscount}</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          removeSpecialOffer();
                        }}
                        className="bg-white hover:bg-red-50 text-red-600 border border-red-300 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider transition-colors cursor-pointer"
                      >
                        Remove
                      </button>
                    </div>
                  )}

                  {/* Promo Code Form */}
                  <form onSubmit={handleApplyCoupon} className="space-y-1">
                    <label className="block text-[9.5px] font-extrabold text-neutral-400 uppercase tracking-widest">Apply Promo/Coupon Code</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="e.g. FESTIVE10"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                        className="flex-1 px-3 py-2 border-2 border-neutral-200 rounded-none bg-transparent outline-none focus:border-black text-xs font-bold text-black font-mono"
                      />
                      <button
                        type="submit"
                        disabled={couponLoading}
                        className="bg-black hover:bg-gold hover:text-black border-2 border-black text-white px-5 py-2.5 rounded-none text-xs font-extrabold uppercase tracking-widest disabled:opacity-50 transition-colors cursor-pointer"
                      >
                        {couponLoading ? "..." : "Apply"}
                      </button>
                    </div>
                    {couponError && <p className="text-red-600 text-xs mt-1 font-semibold">{couponError}</p>}
                  </form>

                  {/* Available Active Coupons & Special Offers in the Same Row */}
                  {(availableCoupons.length > 0 || availableOffers.length > 0) && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      {/* Column 1: Available Coupons */}
                      {availableCoupons.length > 0 ? (
                        <div className="bg-neutral-50 p-3 border border-neutral-200 flex flex-col justify-between space-y-2">
                          <div>
                            <p className="text-[9px] font-extrabold uppercase tracking-widest text-neutral-400 mb-2 flex items-center gap-1.5">
                              <span>🎟️</span> Available Coupons
                            </p>
                            <div className="space-y-1.5">
                              {availableCoupons.map((c) => {
                                const isApplied = appliedCouponCode === c.code;
                                return (
                                  <div
                                    key={c.code}
                                    className={`border p-2 text-xs flex items-center justify-between gap-1.5 transition-all ${
                                      isApplied ? "border-green-600 bg-green-50/70" : "border-neutral-200 bg-white hover:border-black/40"
                                    }`}
                                  >
                                    <div className="min-w-0 flex-1">
                                      <div className="flex items-center gap-1 flex-wrap">
                                        <span className="font-mono font-black text-maroon text-[10.5px] tracking-wider truncate">{c.code}</span>
                                        <span className="text-[9px] font-bold text-neutral-600 shrink-0">
                                          ({c.discountType === "percentage" ? `${c.discountValue}% OFF` : `₹${c.discountValue} OFF`})
                                        </span>
                                      </div>
                                      {c.minOrderValue > 0 && (
                                        <p className="text-[8px] text-neutral-400 font-semibold truncate">Min cart: ₹{c.minOrderValue}</p>
                                      )}
                                    </div>
                                    {isApplied ? (
                                      <button
                                        type="button"
                                        onClick={() => removeCoupon()}
                                        className="text-[8.5px] font-extrabold uppercase text-red-600 hover:underline cursor-pointer shrink-0"
                                      >
                                        Remove
                                      </button>
                                    ) : (
                                      <button
                                        type="button"
                                        onClick={async () => {
                                          setCouponCode(c.code);
                                          setCouponLoading(true);
                                          setCouponError("");
                                          setOfferError("");
                                          const result = await applyCoupon(c.code);
                                          setCouponLoading(false);
                                          if (!result.success) {
                                            setCouponError(result.message);
                                          }
                                        }}
                                        className="bg-black hover:bg-gold hover:text-black text-white text-[8.5px] font-extrabold uppercase px-2.5 py-1 transition-colors cursor-pointer shrink-0"
                                      >
                                        Apply
                                      </button>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      ) : null}

                      {/* Column 2: Available Special Offers */}
                      {availableOffers.length > 0 ? (
                        <div className="bg-gold/10 border border-gold/40 p-3 flex flex-col justify-between space-y-2">
                          <div>
                            <p className="text-[9px] font-extrabold uppercase tracking-widest text-gold-dark mb-2 flex items-center gap-1.5">
                              <span>✨</span> Available Special Offers
                            </p>
                            <div className="space-y-1.5">
                              {availableOffers.map((o) => {
                                const isApplied = appliedOfferId === o._id?.toString() || (calculations.appliedOffers?.some(ao => ao._id === o._id?.toString()));
                                return (
                                  <div
                                    key={o._id}
                                    className={`p-2 border text-xs flex items-center justify-between gap-1.5 transition-all ${
                                      isApplied ? "border-green-600 bg-green-50" : "border-gold/30 bg-white hover:border-gold"
                                    }`}
                                  >
                                    <div className="min-w-0 flex-1">
                                      <p className="font-extrabold text-neutral-900 text-[10.5px] truncate">{o.title}</p>
                                      <p className="text-[9px] text-neutral-500 font-semibold truncate">
                                        {o.discountType === "percentage" ? `${o.discountValue}% OFF` : `₹${o.discountValue} OFF`}
                                        {o.minOrderValue > 0 ? ` on ₹${o.minOrderValue}+` : " store-wide"}
                                      </p>
                                    </div>
                                    {isApplied ? (
                                      <button
                                        type="button"
                                        onClick={() => removeSpecialOffer()}
                                        className="text-[8.5px] font-extrabold uppercase text-red-600 hover:underline cursor-pointer shrink-0"
                                      >
                                        Remove
                                      </button>
                                    ) : (
                                      <button
                                        type="button"
                                        disabled={offerLoading}
                                        onClick={() => handleApplyOffer(o._id)}
                                        className="bg-black hover:bg-gold hover:text-black text-white text-[8.5px] font-extrabold uppercase px-2.5 py-1 transition-colors cursor-pointer disabled:opacity-50 shrink-0"
                                      >
                                        Apply
                                      </button>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                          {offerError && <p className="text-red-600 text-[9px] font-semibold">{offerError}</p>}
                        </div>
                      ) : null}
                    </div>
                  )}

                </div>
              )}
            </div>


            {/* Calculations */}
            <div className="border-t-2 border-neutral-100 pt-4 space-y-2.5 text-xs text-neutral-600 font-semibold">
              <div className="flex justify-between text-neutral-500 font-bold uppercase tracking-wider">
                <span>Subtotal</span>
                <span className="font-extrabold text-black">₹{subtotal}</span>
              </div>

              {calculations.comboDiscount > 0 && (
                <div className="flex justify-between text-green-700 font-bold uppercase tracking-wider text-[10px]">
                  <span className="flex items-center gap-1">
                    🎁 Combo Discount
                    {calculations.appliedCombos?.length > 0 && (
                      <span className="text-[8.5px] bg-green-50 border border-green-200 text-green-800 px-1.5 py-0.5 rounded-none font-extrabold">
                        {calculations.appliedCombos[0].title}
                      </span>
                    )}
                  </span>
                  <span>-₹{calculations.comboDiscount}</span>
                </div>
              )}

              {calculations.autoOfferDiscount > 0 && (
                <div className="flex justify-between text-green-700 font-bold uppercase tracking-wider text-[10px]">
                  <span className="flex items-center gap-1">
                    🎉 Special Offer
                    {calculations.appliedOffers?.length > 0 && (
                      <span className="text-[8.5px] bg-green-50 border border-green-200 text-green-800 px-1.5 py-0.5 rounded-none font-extrabold">
                        {calculations.appliedOffers[0].title}
                      </span>
                    )}
                  </span>
                  <span>-₹{calculations.autoOfferDiscount}</span>
                </div>
              )}

              {calculations.couponDiscount > 0 && (
                <div className="flex justify-between text-green-700 font-bold uppercase tracking-wider text-[10px]">
                  <span>Coupon Discount</span>
                  <span>-₹{calculations.couponDiscount}</span>
                </div>
              )}

              <div className="flex justify-between text-neutral-500 font-bold uppercase tracking-wider">
                <span>Shipping Fee</span>
                <span className="font-extrabold text-black">{shippingFee === 0 ? "FREE" : `₹${shippingFee}`}</span>
              </div>
              <div className="flex justify-between text-neutral-500 font-bold uppercase tracking-wider">
                <span>GST (18% Added)</span>
                <span className="font-extrabold text-black">₹{tax}</span>
              </div>

              <div className="border-t-2 border-black pt-4 flex justify-between font-display text-sm text-black font-extrabold uppercase tracking-wider">
                <span>Total Amount</span>
                <span>₹{totalAmount}</span>
              </div>
            </div>

            {/* Place Order Trigger */}
            <div className="mt-8">
              {checkoutError && (
                <div className="bg-red-50 border-l-2 border-red-500 text-red-700 text-xs p-3 rounded-none mb-4 font-semibold uppercase tracking-wider">
                  {checkoutError}
                </div>
              )}
              <button
                onClick={handlePlaceOrderClick}
                disabled={checkoutLoading}
                className="w-full bg-black hover:bg-gold hover:text-black border-2 border-black text-white py-4 rounded-none font-extrabold tracking-widest disabled:opacity-50 text-xs uppercase transition-colors"
              >
                {checkoutLoading ? "Processing Payment..." : "Place Order (Prepaid)"}
              </button>
              <p className="text-[9px] text-neutral-400 text-center mt-3.5 leading-relaxed font-semibold uppercase tracking-wider">
                🔒 Secured Razorpay gateway. No Cash on Delivery (COD) offered. <br />
                📹 Unboxing video required for transit damage claims.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Mandatory Unboxing Video policy acknowledgement modal */}
      <ReturnPolicyModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCancel={() => setIsModalOpen(false)}
        onConfirm={handleConfirmOrder}
      />
    </main>
  );
}
