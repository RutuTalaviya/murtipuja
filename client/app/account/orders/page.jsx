"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import ImageWithSkeleton from "@/components/ImageWithSkeleton";
import { getMyOrders } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

export default function MyOrdersPage() {
  const { user, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setLoading(false);
      return;
    }

    getMyOrders()
      .then((res) => {
        setOrders(res.data);
      })
      .catch((err) => {
        setError("Failed to fetch orders. Please try again.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [user, authLoading]);

  if (authLoading || loading) {
    return (
      <main className="min-h-screen bg-white flex items-center justify-center font-display">
        <p className="text-xs text-neutral-400 font-extrabold uppercase tracking-widest animate-pulse">Loading orders...</p>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center font-display">
        <h1 className="font-display text-2xl text-black font-extrabold uppercase tracking-wider mb-2">Access Denied</h1>
        <p className="text-neutral-500 text-xs font-semibold mb-6 uppercase tracking-wider">Please log in to view your orders.</p>
        <Link href="/login" className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3.5 border-2 border-orange-500 rounded-none text-xs font-extrabold uppercase tracking-widest transition-all shadow-sm">
          Login with OTP
        </Link>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white px-4 md:px-8 lg:px-12 py-8 md:py-12 font-display w-full">
      <div className="w-full space-y-8">
        <div className="border-b-2 border-black pb-6">
          <p className="text-[10px] uppercase tracking-[0.25em] text-neutral-400 font-extrabold mb-1">Account History</p>
          <h1 className="font-display text-3xl sm:text-4xl md:text-5xl text-black font-extrabold uppercase tracking-wider">My Orders</h1>
          <p className="text-xs text-neutral-500 font-semibold uppercase tracking-wider mt-1.5">
            Manage, review invoices, and track your recent MurtiPuja order shipments.
          </p>
        </div>

        {error && <p className="text-red-600 text-xs font-bold bg-red-50 border border-red-200 p-3 uppercase tracking-wider">{error}</p>}

        {orders.length === 0 ? (
          <div className="bg-white rounded-none p-16 text-center border-2 border-black max-w-xl mx-auto space-y-4">
            <p className="text-neutral-500 text-xs font-bold uppercase tracking-wider">You haven&apos;t placed any orders yet.</p>
            <Link href="/products" className="inline-block bg-black hover:bg-gold hover:text-black text-white px-6 py-3 border-2 border-black rounded-none text-xs font-extrabold uppercase tracking-widest transition-all">
              Browse Drops
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <Link
                key={order._id}
                href={`/account/orders/${order._id}`}
                className="bg-white rounded-none border-2 border-black overflow-hidden hover:border-gold hover:shadow-xl transition-all duration-200 block group cursor-pointer"
              >
                {/* Order Top Bar */}
                <div className="bg-neutral-100 group-hover:bg-amber-50/50 transition-colors px-6 py-4 flex flex-wrap justify-between items-center gap-4 border-b-2 border-black text-xs font-extrabold uppercase tracking-wider">
                  <div className="flex flex-wrap gap-6">
                    <div>
                      <p className="text-[9px] text-neutral-400 font-bold">Order ID</p>
                      <p className="text-black group-hover:text-gold transition-colors font-mono">{order.orderNumber}</p>
                    </div>
                    <div>
                      <p className="text-[9px] text-neutral-400 font-bold">Date Placed</p>
                      <p className="text-black">{new Date(order.createdAt).toLocaleDateString("en-IN")}</p>
                    </div>
                    <div>
                      <p className="text-[9px] text-neutral-400 font-bold">Total Amount</p>
                      <p className="text-black font-bold">₹{order.totalAmount}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[9px] font-extrabold px-2.5 py-0.5 border border-black uppercase tracking-wider ${
                        order.paymentStatus === "paid"
                          ? "bg-green-100 text-green-900 border-green-700"
                          : "bg-amber-100 text-amber-900 border-amber-700"
                      }`}
                    >
                      {order.paymentStatus}
                    </span>
                    <span
                      className="text-[9px] font-extrabold px-2.5 py-0.5 border border-black bg-gold text-black uppercase tracking-wider"
                    >
                      {order.orderStatus.replace(/_/g, " ")}
                    </span>
                  </div>
                </div>

                {/* Order Items */}
                <div className="p-6 divide-y-2 divide-neutral-100">
                  {order.items.map((item) => (
                    <div key={item._id} className="flex gap-4 py-4 first:pt-0 last:pb-0">
                      <div className="relative w-16 h-16 bg-neutral-100 rounded-none overflow-hidden border border-neutral-200 flex-shrink-0">
                        {item.image && (
                          <ImageWithSkeleton src={item.image} alt={item.title} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-display font-extrabold text-black group-hover:text-gold transition-colors uppercase tracking-wider text-xs md:text-sm">{item.title}</h3>
                        <p className="text-[10px] text-neutral-400 font-semibold uppercase tracking-wider">SKU: {item.variantSku}</p>
                        <p className="text-[10px] text-neutral-600 font-semibold uppercase tracking-wider mt-1">
                          Size: {item.size} | Finish: {item.finish} | Qty: {item.quantity}
                        </p>
                      </div>
                      <p className="text-xs md:text-sm font-extrabold text-black self-center">₹{item.price * item.quantity}</p>
                    </div>
                  ))}
                </div>

                {/* Details Footer Bar */}
                <div className="bg-neutral-50 group-hover:bg-neutral-100 transition-colors px-6 py-3.5 flex flex-wrap justify-between items-center gap-2 border-t-2 border-black">
                  <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider flex items-center gap-1.5">
                    <span>📦</span>
                    <span>Click anywhere on this card to view details</span>
                  </span>
                  <span className="text-xs font-extrabold text-black group-hover:text-gold uppercase tracking-widest flex items-center gap-1.5 transition-colors">
                    View Details & Tracking <span className="group-hover:translate-x-1 transition-transform">→</span>
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
