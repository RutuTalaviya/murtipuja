"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getOrderById } from "@/lib/api";

// Pure JS Code 39 / simple 1D barcode generator component
function Barcode({ value }) {
  const encodings = {
    "0": "101001101101", "1": "110101100101", "2": "101011001011", "3": "110110100101",
    "4": "101001101011", "5": "110100110101", "6": "101100110101", "7": "101001011011",
    "8": "110100101101", "9": "101100101101", "A": "110101001011", "B": "101101001011",
    "C": "110110100101", "D": "101011001011", "E": "110101100101", "F": "101101100101",
    "G": "101001101101", "H": "110100110110", "I": "101100110110", "J": "101011011010",
    "K": "110101010011", "L": "101101010011", "M": "110110101001", "N": "101011010011",
    "O": "110101101001", "P": "101101101001", "Q": "101001101101", "R": "110100110110",
    "S": "101100110110", "T": "101011011010", "U": "110010101011", "V": "101100101011",
    "W": "110011010101", "X": "101101101001", "Y": "110010110101", "Z": "101100110101",
    "-": "100101011011", ".": "110010101101", " ": "100110101101", "*": "100101101101",
    "$": "100100100101", "/": "100100101001", "+": "100101001001", "%": "101001001001"
  };

  const cleanValue = `*${(value || "").toUpperCase().replace(/[^0-9A-Z\-\.\s\$\/\+\%]/g, "")}*`;
  let binaryString = "";
  for (let char of cleanValue) {
    binaryString += encodings[char] || encodings["*"];
    binaryString += "0"; // gap between characters
  }

  const bars = [];
  let x = 0;
  const barWidth = 2.0;
  const height = 48;

  for (let i = 0; i < binaryString.length; i++) {
    if (binaryString[i] === "1") {
      let width = 1;
      while (i + 1 < binaryString.length && binaryString[i + 1] === "1") {
        width++;
        i++;
      }
      bars.push(
        <rect
          key={x}
          x={x * barWidth}
          y={0}
          width={width * barWidth}
          height={height}
          fill="black"
        />
      );
      x += width;
    } else {
      let width = 1;
      while (i + 1 < binaryString.length && binaryString[i + 1] === "0") {
        width++;
        i++;
      }
      x += width;
    }
  }

  const totalWidth = x * barWidth;
  return (
    <div className="flex flex-col items-center justify-center mt-1">
      <svg width={totalWidth} height={height} viewBox={`0 0 ${totalWidth} ${height}`}>
        {bars}
      </svg>
      <span className="text-[9px] font-mono mt-0.5 tracking-[4px] text-black font-bold uppercase">{value}</span>
    </div>
  );
}

export default function PrintLabelPage() {
  const { id } = useParams();
  const router = useRouter();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    document.body.classList.add("print-mode-active");
    return () => {
      document.body.classList.remove("print-mode-active");
    };
  }, []);

  useEffect(() => {
    async function fetchOrder() {
      try {
        const res = await getOrderById(id);
        setOrder(res.data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load order details.");
      } finally {
        setLoading(false);
      }
    }
    if (id) {
      fetchOrder();
    }
  }, [id]);

  useEffect(() => {
    if (order && !loading && !error) {
      // Auto trigger print after layout is stable
      const timer = setTimeout(() => {
        window.print();
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [order, loading, error]);

  if (loading) {
    return (
      <div className="min-h-screen bg-charcoal/5 flex flex-col items-center justify-center font-sans text-charcoal">
        <div className="w-10 h-10 border-4 border-maroon border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-sm font-semibold">Generating Shipping Label...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-charcoal/5 flex flex-col items-center justify-center font-sans p-6 text-center">
        <div className="bg-white border border-red-200 rounded-2xl p-8 max-w-md shadow-sm">
          <p className="text-red-600 text-3xl">⚠️</p>
          <h2 className="text-lg font-bold mt-3 text-charcoal">Error Loading Order</h2>
          <p className="text-sm text-charcoal/70 mt-1">{error || "Order not found."}</p>
          <button
            onClick={() => router.push("/admin")}
            className="mt-6 px-4 py-2 bg-maroon text-white rounded-lg text-xs font-semibold hover:bg-maroon/90 transition-all"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const isPrepaid = order.paymentStatus === "paid";
  const labelValue = order.awbNumber || order.orderNumber;

  return (
    <div className="min-h-screen bg-charcoal/10 flex flex-col items-center py-8 font-sans print:bg-white print:py-0 print:min-h-0">
      {/* Top Toolbar (Hidden on Print) */}
      <div className="w-[4.2in] mb-4 flex justify-between items-center bg-white px-4 py-3 rounded-xl border border-charcoal/10 shadow-sm print:hidden">
        <div>
          <h1 className="text-xs font-bold text-charcoal">Murtipuja Print Tool</h1>
          <p className="text-[10px] text-charcoal/50">Order: {order.orderNumber}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => window.print()}
            className="px-3 py-1.5 bg-green-600 text-white rounded-lg text-[10px] font-bold hover:bg-green-700 transition-all flex items-center gap-1 shadow-sm"
          >
            🖨️ Print
          </button>
          <button
            onClick={() => window.close()}
            className="px-3 py-1.5 bg-charcoal/10 text-charcoal rounded-lg text-[10px] font-bold hover:bg-charcoal/20 transition-all"
          >
            Close
          </button>
        </div>
      </div>

      {/* 4x6 Thermal Label Container */}
      <div className="print-page w-[4in] min-h-[6in] bg-white border border-charcoal/30 shadow-md p-4 flex flex-col text-black font-sans leading-tight print:border-none print:shadow-none print:w-[4in] print:h-[6in] print:m-0 print:p-3 overflow-hidden select-none">
        
        {/* Style tag for print spacing overrides */}
        <style jsx global>{`
          @media print {
            body {
              background: white !important;
              color: black !important;
              margin: 0 !important;
              padding: 0 !important;
            }
            .print-page {
              width: 4in !important;
              height: 6in !important;
              page-break-inside: avoid;
              page-break-after: always;
            }
          }
          @page {
            size: 4in 6in;
            margin: 0;
          }
        `}</style>

        {/* Brand & Payment Header */}
        <div className="flex justify-between items-center border-2 border-black p-2 rounded-md">
          <div className="flex flex-col">
            <span className="font-serif text-lg font-black tracking-wide text-black leading-none">MURTIPUJA</span>
            <span className="text-[7px] font-mono tracking-widest text-black mt-0.5">DEVOTION MEETS ART</span>
          </div>
          <div className="flex flex-col items-end">
            <div className={`px-3 py-1 border-2 border-black rounded font-black text-sm tracking-wider text-black uppercase ${
              isPrepaid ? "bg-black text-white" : ""
            }`}>
              {isPrepaid ? "PREPAID" : "COD"}
            </div>
            {!isPrepaid && (
              <span className="text-[9px] font-black text-black mt-1">
                Collect: ₹{order.totalAmount}
              </span>
            )}
          </div>
        </div>

        {/* Courier Routing Info */}
        <div className="mt-3 flex justify-between items-center text-black">
          <div className="flex flex-col">
            <span className="text-[8px] font-bold text-black/60 uppercase">Courier Partner</span>
            <span className="text-xs font-black uppercase tracking-wide">
              {order.courierPartner || "Self Deliver"}
            </span>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-[8px] font-bold text-black/60 uppercase">Order Date</span>
            <span className="text-[10px] font-bold">
              {new Date(order.createdAt).toLocaleDateString("en-IN", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric"
              })}
            </span>
          </div>
        </div>

        {/* Barcode Block */}
        <div className="mt-2 py-2 border-y border-dashed border-black/50 flex flex-col items-center">
          <Barcode value={labelValue} />
        </div>

        {/* Delivery Address (To) */}
        <div className="mt-3 flex flex-col flex-grow text-black">
          <span className="text-[8px] font-black text-black/60 tracking-wider">DELIVER TO:</span>
          <span className="text-xs font-black uppercase mt-0.5 text-black">
            {order.user?.name || "Customer"}
          </span>
          <span className="text-[13px] font-black mt-0.5 block">
            📞 +91 {order.shippingAddress?.phone || order.user?.phone || ""}
          </span>
          <div className="text-[10px] font-bold mt-1 uppercase leading-snug text-black flex-grow">
            <p>{order.shippingAddress?.addressLine1}</p>
            {order.shippingAddress?.addressLine2 && <p>{order.shippingAddress.addressLine2}</p>}
            <p className="mt-0.5">
              {order.shippingAddress?.city}, {order.shippingAddress?.state} - <span className="text-xs font-black">{order.shippingAddress?.pincode}</span>
            </p>
            <p className="text-[8px] mt-0.5 font-black text-black/80">India</p>
          </div>
        </div>

        {/* Return Address (From) */}
        <div className="mt-3 pt-2 border-t border-black/50 text-black">
          <div className="flex justify-between text-[8px] font-black text-black/60">
            <span>RETURN ADDRESS:</span>
            <span>ORDER ID: {order.orderNumber}</span>
          </div>
          <div className="text-[9px] font-bold leading-tight mt-0.5">
            <span className="font-extrabold uppercase">Murtipuja Studio</span>, Ring Road, Textile & Diamond Hub, Surat, Gujarat - 395007. (Ph: +91 79901 38678)
          </div>
        </div>

        {/* Packing Slip Details (Warehouse helper) */}
        <div className="mt-3 pt-2 border-t-2 border-black text-black">
          <span className="text-[8px] font-black text-black/60 tracking-wider block mb-1">PACKING LIST / ITEM DETAILS:</span>
          <table className="w-full text-left text-[9px] font-bold border-collapse">
            <thead>
              <tr className="border-b border-black text-black/70">
                <th className="pb-0.5 font-bold">Item Description</th>
                <th className="pb-0.5 text-center font-bold">Finish</th>
                <th className="pb-0.5 text-center font-bold">Qty</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/20">
              {order.items?.map((item) => (
                <tr key={item._id} className="text-black">
                  <td className="py-1 uppercase">
                    <p className="font-extrabold leading-none">{item.title}</p>
                    <p className="text-[8px] font-mono text-black/70 mt-0.5 leading-none">SKU: {item.variantSku} | Size: {item.size}</p>
                  </td>
                  <td className="py-1 text-center uppercase text-[8px]">{item.finish}</td>
                  <td className="py-1 text-center font-extrabold text-xs">{item.quantity}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
