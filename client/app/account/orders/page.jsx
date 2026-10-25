"use client";

import { useEffect, useState, useMemo } from "react";
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

  // Filters state
  const [statusFilter, setStatusFilter] = useState("all"); // "all" | "active" | "delivered" | "cancelled" | "returned"
  const [timeFilter, setTimeFilter] = useState("all"); // "all" | "30d" | "2m" | "3m" | "6m" | "year"
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setLoading(false);
      return;
    }

    getMyOrders()
      .then((res) => {
        setOrders(res.data || []);
      })
      .catch((err) => {
        setError("Failed to fetch orders. Please try again.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [user, authLoading]);

  // Status counters
  const statusCounts = useMemo(() => {
    const counts = { all: orders.length, active: 0, delivered: 0, cancelled: 0, returned: 0 };
    orders.forEach((o) => {
      if (o.orderStatus === "delivered") counts.delivered++;
      else if (o.orderStatus === "cancelled") counts.cancelled++;
      else if (o.orderStatus === "returned" || o.returnRequest?.isRequested) counts.returned++;
      else counts.active++;
    });
    return counts;
  }, [orders]);

  // Filtered orders list
  const filteredOrders = useMemo(() => {
    const now = Date.now();

    return orders.filter((order) => {
      // 1. Status Filter
      if (statusFilter === "active") {
        if (["delivered", "cancelled", "returned"].includes(order.orderStatus)) return false;
      } else if (statusFilter === "delivered") {
        if (order.orderStatus !== "delivered") return false;
      } else if (statusFilter === "cancelled") {
        if (order.orderStatus !== "cancelled") return false;
      } else if (statusFilter === "returned") {
        if (order.orderStatus !== "returned" && !order.returnRequest?.isRequested) return false;
      }

      // 2. Time Period Filter
      const orderDate = new Date(order.createdAt).getTime();
      const diffMs = now - orderDate;
      const diffDays = diffMs / (1000 * 60 * 60 * 24);

      if (timeFilter === "30d" && diffDays > 30) return false;
      if (timeFilter === "2m" && diffDays > 60) return false;
      if (timeFilter === "3m" && diffDays > 90) return false;
      if (timeFilter === "6m" && diffDays > 180) return false;
      if (timeFilter === "year") {
        const orderYear = new Date(order.createdAt).getFullYear();
        const currentYear = new Date().getFullYear();
        if (orderYear !== currentYear) return false;
      }

      // 3. Search Query Filter (Order ID or item title)
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchNumber = order.orderNumber?.toLowerCase().includes(query);
        const matchItem = order.items?.some((i) => i.title?.toLowerCase().includes(query));
        if (!matchNumber && !matchItem) return false;
      }

      return true;
    });
  }, [orders, statusFilter, timeFilter, searchQuery]);

  if (authLoading || loading) {
    return (
      <main className="min-h-screen bg-white flex items-center justify-center font-display">
        <p className="text-xs text-neutral-400 font-extrabold uppercase tracking-widest animate-pulse">
          Loading orders...
        </p>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center font-display">
        <h1 className="font-display text-2xl text-black font-extrabold uppercase tracking-wider mb-2">Access Denied</h1>
        <p className="text-neutral-500 text-xs font-semibold mb-6 uppercase tracking-wider">Please log in to view your orders.</p>
        <Link href="/login" className="bg-black hover:bg-gold hover:text-black text-white px-8 py-3.5 border-2 border-black rounded-none text-xs font-extrabold uppercase tracking-widest transition-all shadow-sm">
          Login with OTP
        </Link>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white px-4 md:px-8 lg:px-12 py-8 md:py-12 font-display w-full">
      <div className="w-full space-y-6">
        
        {/* Header Bar */}
        <div className="border-b-2 border-black pb-6">
          <p className="text-[10px] uppercase tracking-[0.25em] text-neutral-400 font-extrabold mb-1">Account History</p>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="font-display text-3xl sm:text-4xl text-black font-extrabold uppercase tracking-wider">
                My Orders
              </h1>
              <p className="text-xs text-neutral-500 font-semibold uppercase tracking-wider mt-1.5">
                Manage, review GST invoices, track courier milestones, and request exchanges.
              </p>
            </div>

            <Link
              href="/account/addresses"
              className="bg-neutral-100 hover:bg-neutral-200 text-black border-2 border-black px-5 py-2.5 text-xs font-extrabold uppercase tracking-widest transition-colors shadow-sm self-start sm:self-auto"
            >
              📍 Manage Saved Addresses →
            </Link>
          </div>

          {/* Account Sub-Navigation Tabs */}
          <div className="flex gap-4 mt-6 border-t border-neutral-200 pt-4 text-xs font-black uppercase tracking-wider">
            <span className="text-black border-b-2 border-black pb-1">
              My Orders ({orders.length})
            </span>
            <Link
              href="/account/addresses"
              className="text-neutral-400 hover:text-black transition-colors pb-1"
            >
              Saved Addresses
            </Link>
          </div>
        </div>

        {error && <p className="text-red-600 text-xs font-bold bg-red-50 border border-red-200 p-3 uppercase tracking-wider">{error}</p>}

        {orders.length > 0 && (
          <div className="space-y-4 bg-neutral-50 border-2 border-black p-4 sm:p-5">
            {/* Row 1: Search & Time Filter */}
            <div className="flex flex-col md:flex-row gap-3 justify-between items-stretch md:items-center">
              {/* Search Bar */}
              <div className="relative flex-1">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="SEARCH BY ORDER ID OR ITEM NAME..."
                  className="w-full bg-white border-2 border-black pl-9 pr-8 py-2.5 text-xs font-bold uppercase tracking-wider focus:outline-hidden placeholder:text-neutral-400"
                />
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 text-xs font-black">
                  🔍
                </span>
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-black text-xs font-bold p-1 cursor-pointer"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Time Period Filter Dropdown */}
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-[10px] uppercase font-black tracking-widest text-neutral-500 whitespace-nowrap">
                  Period:
                </span>
                <select
                  value={timeFilter}
                  onChange={(e) => setTimeFilter(e.target.value)}
                  className="bg-white border-2 border-black py-2.5 px-3 text-xs font-extrabold uppercase tracking-wider focus:outline-hidden cursor-pointer"
                >
                  <option value="all">All Orders</option>
                  <option value="30d">Last 30 Days</option>
                  <option value="2m">Last 2 Months</option>
                  <option value="3m">Last 3 Months</option>
                  <option value="6m">Last 6 Months</option>
                  <option value="year">This Year ({new Date().getFullYear()})</option>
                </select>
              </div>
            </div>

            {/* Row 2: Status Filter Tabs */}
            <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-neutral-200">
              {[
                { id: "all", label: "All Orders", count: statusCounts.all },
                { id: "active", label: "Active / In-Transit", count: statusCounts.active },
                { id: "delivered", label: "Delivered", count: statusCounts.delivered },
                { id: "cancelled", label: "Cancelled", count: statusCounts.cancelled },
                { id: "returned", label: "Return / Exchange", count: statusCounts.returned },
              ].map((tab) => {
                const isActive = statusFilter === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setStatusFilter(tab.id)}
                    className={`px-3 py-1.5 text-[11px] font-black uppercase tracking-wider border transition-all cursor-pointer flex items-center gap-1.5 ${
                      isActive
                        ? "bg-black text-white border-black shadow-xs"
                        : "bg-white text-neutral-700 border-neutral-300 hover:border-black hover:text-black"
                    }`}
                  >
                    <span>{tab.label}</span>
                    <span className={`text-[9px] px-1.5 py-0.2 rounded-none font-bold ${
                      isActive ? "bg-white/20 text-white" : "bg-neutral-100 text-neutral-600"
                    }`}>
                      {tab.count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Orders Listing */}
        {orders.length === 0 ? (
          <div className="bg-white rounded-none p-16 text-center border-2 border-black max-w-xl mx-auto space-y-4">
            <p className="text-neutral-500 text-xs font-bold uppercase tracking-wider">You haven&apos;t placed any orders yet.</p>
            <Link href="/products" className="inline-block bg-black hover:bg-gold hover:text-black text-white px-6 py-3 border-2 border-black rounded-none text-xs font-extrabold uppercase tracking-widest transition-all">
              Browse Drops
            </Link>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="bg-white rounded-none p-12 text-center border-2 border-black space-y-3">
            <p className="text-neutral-500 text-xs font-bold uppercase tracking-wider">
              No orders found matching your selected filters.
            </p>
            <button
              onClick={() => {
                setStatusFilter("all");
                setTimeFilter("all");
                setSearchQuery("");
              }}
              className="text-xs font-black underline uppercase tracking-wider text-black hover:text-gold cursor-pointer"
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredOrders.map((order) => (
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
                          : order.paymentStatus === "refunded"
                          ? "bg-purple-100 text-purple-900 border-purple-700"
                          : "bg-amber-100 text-amber-900 border-amber-700"
                      }`}
                    >
                      {order.paymentStatus}
                    </span>
                    <span className="text-[9px] font-extrabold px-2.5 py-0.5 border border-black bg-gold text-black uppercase tracking-wider">
                      {order.orderStatus.replace(/_/g, " ")}
                    </span>
                    {order.returnRequest?.isRequested && (
                      <span className="text-[9px] font-extrabold px-2.5 py-0.5 border border-black bg-neutral-900 text-white uppercase tracking-wider">
                        {order.returnRequest.requestType}
                      </span>
                    )}
                  </div>
                </div>

                {/* Items Preview */}
                <div className="p-6 divide-y divide-neutral-100">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex gap-4 py-3 first:pt-0 last:pb-0 items-center">
                      <div className="relative w-14 h-14 bg-neutral-100 rounded-none overflow-hidden border border-neutral-200 flex-shrink-0">
                        {item.image && (
                          <ImageWithSkeleton
                            src={item.image}
                            alt={item.title}
                            fill
                            className="object-cover"
                          />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-extrabold text-black uppercase tracking-wider truncate">{item.title}</p>
                        <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">SKU: {item.variantSku}</p>
                        <p className="text-[10px] text-neutral-600 font-semibold uppercase tracking-wider">
                          Qty: {item.quantity} · Size: {item.size} · Finish: {item.finish}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-extrabold text-black">₹{item.price * item.quantity}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Tracking & Invoice Footer Strip */}
                <div className="px-6 py-2.5 bg-neutral-50 border-t border-neutral-200 flex flex-wrap justify-between items-center text-[10px] text-neutral-500 font-bold uppercase tracking-wider">
                  <div className="flex items-center gap-3">
                    {order.awbNumber ? (
                      <span>🚚 Delhivery AWB: <strong className="font-mono text-black">{order.awbNumber}</strong></span>
                    ) : (
                      <span>📦 Standard Insured Transit</span>
                    )}
                  </div>
                  <span className="text-black font-extrabold group-hover:text-gold transition-colors flex items-center gap-1">
                    View Order Details & Tax Invoice →
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
