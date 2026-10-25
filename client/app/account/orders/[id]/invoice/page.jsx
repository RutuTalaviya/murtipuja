"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getOrderById } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";

// Number to words converter for Indian currency (INR)
function numberToWordsINR(amount) {
  const num = Math.round(Number(amount) || 0);
  if (num === 0) return "Zero Rupees Only";

  const a = [
    "", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten",
    "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"
  ];
  const b = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

  function inWords(n) {
    if (n < 20) return a[n];
    if (n < 100) return b[Math.floor(n / 10)] + (n % 10 !== 0 ? " " + a[n % 10] : "");
    if (n < 1000) return a[Math.floor(n / 100)] + " Hundred" + (n % 100 !== 0 ? " and " + inWords(n % 100) : "");
    if (n < 100000) return inWords(Math.floor(n / 1000)) + " Thousand" + (n % 1000 !== 0 ? " " + inWords(n % 1000) : "");
    if (n < 10000000) return inWords(Math.floor(n / 100000)) + " Lakh" + (n % 100000 !== 0 ? " " + inWords(n % 100000) : "");
    return inWords(Math.floor(n / 10000000)) + " Crore" + (n % 10000000 !== 0 ? " " + inWords(n % 10000000) : "");
  }

  return "Rupees " + inWords(num) + " Only";
}

export default function OrderInvoicePage() {
  const params = useParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push(`/login?redirect=/account/orders/${params.id}/invoice`);
      return;
    }

    getOrderById(params.id)
      .then((res) => {
        setOrder(res.data);
      })
      .catch((err) => {
        console.error("Invoice fetch failed:", err);
        setError("Unable to load invoice. Please verify your order access.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [params.id, user, authLoading, router]);

  if (authLoading || loading) {
    return (
      <main className="min-h-screen bg-neutral-100 flex items-center justify-center font-sans">
        <p className="text-xs uppercase font-extrabold tracking-widest text-neutral-500 animate-pulse">
          Generating Tax Invoice...
        </p>
      </main>
    );
  }

  if (error || !order) {
    return (
      <main className="min-h-screen bg-neutral-100 flex flex-col items-center justify-center p-6 text-center font-sans">
        <p className="text-sm font-bold text-red-600 mb-4">{error || "Order not found"}</p>
        <Link href="/account/orders" className="text-xs font-bold underline uppercase tracking-wider text-black">
          ← Back to My Orders
        </Link>
      </main>
    );
  }

  const invoiceNumber = `INV-${order.orderNumber}`;
  const invoiceDate = new Date(order.createdAt).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  const isGujarat = (order.shippingAddress?.state || "").toLowerCase().includes("gujarat");

  // GST Calculation breakdown (18% inclusive)
  const taxableValue = Math.round((order.subtotal / 1.18) * 100) / 100;
  const totalTax = order.tax || Math.round((order.subtotal - taxableValue) * 100) / 100;
  const cgst = isGujarat ? Math.round((totalTax / 2) * 100) / 100 : 0;
  const sgst = isGujarat ? Math.round((totalTax / 2) * 100) / 100 : 0;
  const igst = !isGujarat ? totalTax : 0;

  return (
    <div className="min-h-screen bg-neutral-200 py-6 sm:py-10 px-2 sm:px-4 font-sans text-neutral-900 print:bg-white print:p-0 print:m-0">
      
      {/* Print / Action Bar (Hidden on print) */}
      <div className="max-w-4xl mx-auto mb-6 flex flex-wrap items-center justify-between gap-3 bg-white p-4 border border-neutral-300 shadow-sm print:hidden">
        <div className="flex items-center gap-2">
          <Link
            href={`/account/orders/${order._id}`}
            className="px-3.5 py-2 bg-neutral-100 hover:bg-neutral-200 text-xs font-bold uppercase tracking-wider text-neutral-800 transition-colors"
          >
            ← Back to Order
          </Link>
          <span className="text-xs text-neutral-500 font-semibold">
            Invoice: <strong className="text-black font-mono">{invoiceNumber}</strong>
          </span>
        </div>

        <button
          onClick={() => window.print()}
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-black hover:bg-amber-600 text-white text-xs font-black uppercase tracking-widest shadow-md transition-colors cursor-pointer"
        >
          <span>🖨️</span>
          <span>Print / Save as PDF</span>
        </button>
      </div>

      {/* Standard Tax Invoice Document Sheet */}
      <div className="max-w-4xl mx-auto bg-white border border-neutral-400 p-8 sm:p-12 shadow-lg print:border-none print:shadow-none print:p-6 print:w-full">
        
        {/* 1. Header with Brand & Document Type */}
        <div className="border-b-2 border-black pb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-black tracking-wider uppercase text-black">MURTIPUJA</span>
              <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 bg-neutral-900 text-white">
                Studio
              </span>
            </div>
            <p className="text-[11px] text-neutral-600 font-medium mt-1">Divine Gifts for a Better Life · 0.1mm Precision Icons</p>
            <p className="text-[10px] text-neutral-500 mt-0.5">
              Surat Studio: C-504 Yamuna Palace, Satellite Rd, Mota Varachha, Surat - 394101, Gujarat, India
            </p>
            <p className="text-[10px] text-neutral-500">
              Email: support@murtipuja.com | Phone: +91 79901 38678 | Web: https://murtipuja.com
            </p>
          </div>

          <div className="text-right sm:self-center">
            <h1 className="text-xl sm:text-2xl font-black uppercase tracking-wider text-neutral-900">TAX INVOICE</h1>
            <p className="text-xs font-bold text-neutral-500 uppercase tracking-widest mt-0.5">(Original for Recipient)</p>
            <p className="text-[11px] font-mono font-bold text-black mt-1">GSTIN: 24AAECM1234F1Z5</p>
            <p className="text-[10px] text-neutral-500">State Code: 24 (Gujarat, India)</p>
          </div>
        </div>

        {/* 2. Invoice Meta Details Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-4 border-b border-neutral-200 text-xs">
          <div>
            <p className="text-[10px] text-neutral-500 font-bold uppercase">Invoice No.</p>
            <p className="font-mono font-extrabold text-black">{invoiceNumber}</p>
          </div>
          <div>
            <p className="text-[10px] text-neutral-500 font-bold uppercase">Invoice Date</p>
            <p className="font-bold text-black">{invoiceDate}</p>
          </div>
          <div>
            <p className="text-[10px] text-neutral-500 font-bold uppercase">Order Reference</p>
            <p className="font-mono font-bold text-black">#{order.orderNumber}</p>
          </div>
          <div>
            <p className="text-[10px] text-neutral-500 font-bold uppercase">Payment Status</p>
            <p className="font-bold text-emerald-800 uppercase tracking-wide">
              {order.paymentStatus === "paid" ? "PREPAID - FULLY PAID" : order.paymentStatus.toUpperCase()}
            </p>
          </div>
        </div>

        {/* 3. Bill To & Ship To Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 py-5 border-b border-neutral-200 text-xs leading-relaxed">
          <div>
            <h3 className="font-extrabold uppercase tracking-wider text-neutral-400 text-[10px] mb-1.5">
              Billed To (Customer Details)
            </h3>
            <p className="font-bold text-black text-sm">{user.name || order.shippingAddress?.fullName || "Valued Devotee"}</p>
            <p className="text-neutral-700">{order.billingAddress?.addressLine1 || order.shippingAddress?.addressLine1}</p>
            {(order.billingAddress?.addressLine2 || order.shippingAddress?.addressLine2) && (
              <p className="text-neutral-700">{order.billingAddress?.addressLine2 || order.shippingAddress?.addressLine2}</p>
            )}
            <p className="text-neutral-700">
              {order.billingAddress?.city || order.shippingAddress?.city},{" "}
              {order.billingAddress?.state || order.shippingAddress?.state} -{" "}
              {order.billingAddress?.pincode || order.shippingAddress?.pincode}
            </p>
            <p className="text-neutral-600 mt-1">Phone: +91 {user.phone || order.shippingAddress?.phone}</p>
          </div>

          <div>
            <h3 className="font-extrabold uppercase tracking-wider text-neutral-400 text-[10px] mb-1.5">
              Shipped To (Delivery Destination)
            </h3>
            <p className="font-bold text-black text-sm">{user.name || order.shippingAddress?.fullName || "Valued Devotee"}</p>
            <p className="text-neutral-700">{order.shippingAddress?.addressLine1}</p>
            {order.shippingAddress?.addressLine2 && (
              <p className="text-neutral-700">{order.shippingAddress?.addressLine2}</p>
            )}
            <p className="text-neutral-700">
              {order.shippingAddress?.city}, {order.shippingAddress?.state} - {order.shippingAddress?.pincode}
            </p>
            <p className="text-neutral-600 mt-1">Courier: {order.courierPartner || "Delhivery Express"}</p>
            {order.delhiveryWaybill && (
              <p className="text-neutral-600 font-mono text-[11px]">AWB: {order.delhiveryWaybill}</p>
            )}
          </div>
        </div>

        {/* 4. Itemized Product Table */}
        <div className="py-6">
          <table className="w-full text-left text-xs border border-neutral-300">
            <thead>
              <tr className="bg-neutral-100 border-b border-neutral-300 font-black text-neutral-800 uppercase tracking-wider text-[10px]">
                <th className="p-3 w-10 text-center">#</th>
                <th className="p-3">Product Description & Specs</th>
                <th className="p-3 text-center">HSN/SAC</th>
                <th className="p-3 text-center">Qty</th>
                <th className="p-3 text-right">Unit Price</th>
                <th className="p-3 text-right">Taxable Amt</th>
                <th className="p-3 text-right">Total (INR)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {order.items.map((item, idx) => {
                const itemTotal = item.price * item.quantity;
                const itemTaxable = Math.round((itemTotal / 1.18) * 100) / 100;
                return (
                  <tr key={item._id || idx} className="hover:bg-neutral-50/50">
                    <td className="p-3 text-center text-neutral-400 font-bold">{idx + 1}</td>
                    <td className="p-3">
                      <p className="font-extrabold text-neutral-900">{item.title}</p>
                      <p className="text-[10px] text-neutral-500 font-semibold uppercase mt-0.5">
                        Size: {item.size} | Finish: {item.finish}
                      </p>
                      <p className="text-[10px] font-mono text-neutral-400">SKU: {item.variantSku}</p>
                    </td>
                    <td className="p-3 text-center font-mono text-neutral-600">69139000</td>
                    <td className="p-3 text-center font-extrabold">{item.quantity}</td>
                    <td className="p-3 text-right font-mono">₹{item.price}</td>
                    <td className="p-3 text-right font-mono">₹{itemTaxable}</td>
                    <td className="p-3 text-right font-mono font-extrabold text-black">₹{itemTotal}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* 5. Summary & Tax Calculation Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2 pb-6 border-b border-neutral-200">
          {/* Amount In Words & Notes */}
          <div className="space-y-3 text-xs">
            <div>
              <p className="text-[10px] uppercase font-bold text-neutral-400">Amount in Words:</p>
              <p className="font-extrabold text-neutral-900 italic mt-0.5">
                {numberToWordsINR(order.totalAmount)}
              </p>
            </div>

            <div className="bg-neutral-50 p-3.5 border border-neutral-200 space-y-1 text-[11px] text-neutral-600">
              <p className="font-bold text-neutral-800 uppercase tracking-wide text-[10px]">Tax & Payment Reference:</p>
              <p>Payment Gateway: <strong>Razorpay (100% Prepaid)</strong></p>
              {order.paymentInfo?.razorpayPaymentId && (
                <p className="font-mono text-[10px]">Payment ID: {order.paymentInfo.razorpayPaymentId}</p>
              )}
              <p className="text-[10px] text-neutral-500 pt-1">
                GST is charged at 18% on sacred handicraft idols as per Government of India statutory norms.
              </p>
            </div>
          </div>

          {/* Numerical Totals Breakdown */}
          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-neutral-100">
              <span className="text-neutral-600">Taxable Value:</span>
              <span className="font-mono font-bold">₹{taxableValue}</span>
            </div>

            {isGujarat ? (
              <>
                <div className="flex justify-between py-1 border-b border-neutral-100 text-neutral-600">
                  <span>Central GST (CGST 9%):</span>
                  <span className="font-mono">₹{cgst}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-neutral-100 text-neutral-600">
                  <span>State GST (SGST 9%):</span>
                  <span className="font-mono">₹{sgst}</span>
                </div>
              </>
            ) : (
              <div className="flex justify-between py-1 border-b border-neutral-100 text-neutral-600">
                <span>Integrated GST (IGST 18%):</span>
                <span className="font-mono">₹{igst}</span>
              </div>
            )}

            {order.discount > 0 && (
              <div className="flex justify-between py-1 border-b border-neutral-100 text-emerald-800 font-bold">
                <span>Coupon / Offer Discount:</span>
                <span className="font-mono">-₹{order.discount}</span>
              </div>
            )}

            <div className="flex justify-between py-1 border-b border-neutral-100 text-neutral-600">
              <span>Reverse Insurance & Doorstep Delivery:</span>
              <span className="font-bold text-emerald-700 uppercase text-[10px]">FREE (₹0)</span>
            </div>

            <div className="flex justify-between pt-2 border-t-2 border-black text-sm sm:text-base font-black">
              <span className="uppercase">Grand Total:</span>
              <span className="font-mono text-black">₹{order.totalAmount}</span>
            </div>
          </div>
        </div>

        {/* 6. Footer Declaration & Signature */}
        <div className="pt-6 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 text-[10px] text-neutral-500">
          <div className="max-w-md space-y-1">
            <p className="font-bold uppercase text-neutral-700">Declaration & Terms:</p>
            <p>1. We declare that this invoice shows the actual price of the goods described and that all particulars are true and correct.</p>
            <p>2. Idol sculptures are covered by MurtiPuja 7-Day policy subject to unboxing video proof.</p>
            <p>3. This is a computer-authenticated tax invoice generated via MurtiPuja Studio Surat.</p>
          </div>

          <div className="text-right sm:self-end">
            <div className="w-36 border-b border-neutral-400 mb-1 inline-block pb-6">
              <span className="text-[9px] font-black uppercase tracking-widest text-neutral-400">MURTIPUJA STUDIO</span>
            </div>
            <p className="font-bold text-neutral-800 uppercase tracking-wider">Authorized Signatory</p>
            <p className="text-[9px] text-neutral-400">Surat, Gujarat, India</p>
          </div>
        </div>

      </div>

    </div>
  );
}
