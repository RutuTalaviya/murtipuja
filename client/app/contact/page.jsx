"use client";

import { useState, useEffect } from "react";
import { getPageContent } from "@/lib/api";

const DEFAULT_FAQS = [
  {
    q: "How do I return or exchange a product?",
    a: "We offer a 7-day hassle-free return and exchange policy from the date of delivery. You can initiate a request directly from our returns portal or reach out to us via WhatsApp/email with your Order ID. Please note that an unedited unboxing video is mandatory for transit damage claims.",
  },
  {
    q: "How can I track my order?",
    a: "Once dispatched, you will receive a tracking link via WhatsApp, SMS, and Email. You can also use our public Track Order page to check real-time updates instantly using your Order ID and registered phone number.",
  },
  {
    q: "Can I order in bulk, and are there discounts?",
    a: "Yes! We accept bulk orders for corporate gifting, wedding favors, and festive occasions. We offer customized packaging and special tiered discounts on large orders. Please email us at support@murtipuja.com or call us to discuss your requirements.",
  },
  {
    q: "How do I explore a brand partnership or collaboration?",
    a: "We are always excited to collaborate with designers, spiritual portals, and retail brands. Please send us your proposal or design portfolio at support@murtipuja.com, and our partnerships coordinator will reach out to you.",
  },
  {
    q: "What are your shipping timelines? Do you ship internationally?",
    a: "We dispatch orders within 48 hours. Standard shipping takes 1-3 working days for metro cities, and 3-5 days for other states. Currently, we ship primarily across India, but you can contact us for special international inquiries.",
  },
  {
    q: "Do you offer customisation and gift packaging?",
    a: "Yes, we do! We can customize the size of your murtis (from 6 inches up to 24 inches) and print custom finishes (e.g., Gold Leaf, Antique Bronze). We also provide premium gift wrapping with handwritten personalized notes.",
  },
];

export default function ContactPage() {
  const [pageData, setPageData] = useState(null);
  const [openFaqIndex, setOpenFaqIndex] = useState(null);
  const [statusText, setStatusText] = useState("We're closed now · Opens Monday 10 AM");
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await getPageContent("contact");
        if (res.data?.success && res.data?.data) {
          setPageData(res.data.data);
        }
      } catch (err) {
        console.error("Failed to load dynamic contact page:", err);
      }
    }
    loadData();
  }, []);

  useEffect(() => {
    const getOfficeStatus = () => {
      const now = new Date();
      const day = now.getDay();
      const hour = now.getHours();

      const open = day >= 1 && day <= 6 && hour >= 10 && hour < 19;

      if (open) {
        return { open: true, text: "We're open now · Closes 7 PM" };
      } else {
        if (day === 0 || (day === 6 && hour >= 19)) {
          return { open: false, text: "We're closed now · Opens Monday 10 AM" };
        } else if (hour < 10) {
          return { open: false, text: "We're closed now · Opens today 10 AM" };
        } else {
          return { open: false, text: "We're closed now · Opens tomorrow 10 AM" };
        }
      }
    };

    const status = getOfficeStatus();
    setStatusText(status.text);
    setIsOpen(status.open);
  }, []);

  const toggleFaq = (idx) => {
    setOpenFaqIndex(openFaqIndex === idx ? null : idx);
  };

  const hero = pageData?.hero || {
    badge: "Customer Support & Concierge",
    headline: "Contact MurtiPuja",
    description:
      "Questions about a drop, bulk orders, or custom dimensions — our team in Surat is here to assist.",
  };

  const contactInfo = pageData?.contactInfo || {
    email: "support@murtipuja.com",
    phone: "+91 79901 38678",
    whatsapp: "+91 79901 38678",
    address: "MurtiPuja Headquarters, Ring Road, Textile & Diamond City, Surat - 395007, Gujarat, India",
    openingHours: "Mon–Sat · 10am–7pm IST",
    supportHours: "Replies within 24 working hours",
  };

  const faqs = pageData?.faqs && pageData.faqs.length > 0
    ? pageData.faqs.map(f => ({ q: f.question, a: f.answer }))
    : DEFAULT_FAQS;

  return (
    <main className="min-h-screen bg-[#faf9f6] px-3 sm:px-6 md:px-8 lg:px-12 py-6 sm:py-8 md:py-10 font-display w-full">
      <div className="w-full space-y-8 md:space-y-12">
        
        {/* Header Section */}
        <div className="border-b border-stone-200 pb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
            <p className="text-[10px] uppercase tracking-[0.25em] text-neutral-400 font-extrabold mb-1">
              {hero.badge || "Customer Support & Concierge"}
            </p>
            <h1 className="font-display text-3xl sm:text-4xl md:text-5xl text-neutral-900 font-extrabold uppercase tracking-wider">
              {hero.headline || pageData?.title || "Contact MurtiPuja"}
            </h1>
            <p className="text-xs text-neutral-500 font-semibold uppercase tracking-wider mt-2 max-w-xl">
              {hero.description || pageData?.subtitle || "Questions about a drop, bulk orders, or custom dimensions — our team in Surat is here to assist."}
            </p>
          </div>

          {/* Dynamic Status Pill */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-stone-200 shadow-sm text-xs font-extrabold uppercase tracking-wider text-neutral-900">
            <span className={`w-2.5 h-2.5 rounded-full ${isOpen ? "bg-green-600 animate-pulse" : "bg-amber-500"}`} />
            <span>{statusText}</span>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start w-full">
          
          {/* Left Column: Support Cards (6 Columns) */}
          <div className="lg:col-span-6 space-y-4">
            
            {/* Track Order Card */}
            <a
              href="/track-order"
              className="flex items-center justify-between p-6 bg-white border border-stone-200 shadow-sm hover:border-stone-400 transition-all group cursor-pointer"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-stone-100 text-stone-900 border border-stone-200 flex items-center justify-center flex-shrink-0 font-bold text-lg group-hover:bg-black group-hover:text-gold transition-colors">
                  📦
                </div>
                <div className="text-left">
                  <h3 className="font-display text-base text-neutral-900 font-extrabold uppercase tracking-wider">Track Your Shipment</h3>
                  <p className="text-sm font-extrabold text-neutral-900 mt-0.5">Real-time Order Status</p>
                  <p className="text-[10px] text-neutral-400 font-semibold uppercase tracking-wider mt-0.5">Enter registered phone & Order ID</p>
                </div>
              </div>
              <span className="text-neutral-900 font-bold text-lg group-hover:translate-x-1.5 transition-transform duration-300">→</span>
            </a>

            {/* Call Card (Commented out) */}
            {/* <a
              href={`tel:${(contactInfo.phone || "").replace(/\s+/g, "")}`}
              className="flex items-center justify-between p-6 bg-white border border-stone-200 shadow-sm hover:border-stone-400 transition-all group cursor-pointer"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-stone-100 text-stone-900 border border-stone-200 flex items-center justify-center flex-shrink-0 font-bold text-lg group-hover:bg-black group-hover:text-gold transition-colors">
                  📞
                </div>
                <div className="text-left">
                  <h3 className="font-display text-base text-neutral-900 font-extrabold uppercase tracking-wider">Call Customer Care</h3>
                  <p className="text-sm font-extrabold text-neutral-900 mt-0.5">{contactInfo.phone}</p>
                  <p className="text-[10px] text-neutral-400 font-semibold uppercase tracking-wider mt-0.5">{contactInfo.openingHours || "Mon–Sat · 10am–7pm IST"}</p>
                </div>
              </div>
              <span className="text-neutral-900 font-bold text-lg group-hover:translate-x-1.5 transition-transform duration-300">→</span>
            </a> */}

            {/* Email Card */}
            <a
              href={`mailto:${contactInfo.email}`}
              className="flex items-center justify-between p-6 bg-white border border-stone-200 shadow-sm hover:border-stone-400 transition-all group cursor-pointer"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-stone-100 text-stone-900 border border-stone-200 flex items-center justify-center flex-shrink-0 font-bold text-lg group-hover:bg-black group-hover:text-gold transition-colors">
                  ✉️
                </div>
                <div className="text-left">
                  <h3 className="font-display text-base text-neutral-900 font-extrabold uppercase tracking-wider">Email Concierge</h3>
                  <p className="text-sm font-extrabold text-neutral-900 mt-0.5">{contactInfo.email}</p>
                  <p className="text-[10px] text-neutral-400 font-semibold uppercase tracking-wider mt-0.5">{contactInfo.supportHours || "Replies within 24 working hours"}</p>
                </div>
              </div>
              <span className="text-neutral-900 font-bold text-lg group-hover:translate-x-1.5 transition-transform duration-300">→</span>
            </a>

            {/* Head Office Address Card */}
            <div className="p-6 bg-white border border-stone-200 shadow-sm space-y-4">
              <p className="text-[10px] uppercase font-extrabold tracking-widest text-neutral-400 leading-none">Studio & Lab Office</p>
              <h3 className="font-display text-lg text-neutral-900 font-extrabold uppercase tracking-wider">MurtiPuja Headquarters</h3>
              <div className="text-xs text-neutral-600 space-y-0.5 font-semibold uppercase tracking-wider leading-relaxed whitespace-pre-line">
                <p>{contactInfo.address}</p>
              </div>
              <p className="flex items-center gap-1.5 text-[10px] text-neutral-400 font-extrabold uppercase tracking-widest pt-2 border-t border-stone-100">
                <span>⏰ Working Hours: {contactInfo.openingHours || "Mon–Sat · 10am–7pm IST"}</span>
              </p>
            </div>

          </div>

          {/* Right Column: FAQs Accordion (6 Columns) */}
          <div className="lg:col-span-6 space-y-4">
            <div className="space-y-1">
              <p className="text-[10px] uppercase tracking-[0.25em] text-neutral-400 font-extrabold">Instant Help</p>
              <h2 className="font-display text-2xl text-neutral-900 font-extrabold uppercase tracking-wider">Frequently Asked Questions</h2>
            </div>

            {/* Accordion list */}
            <div className="space-y-3 pt-2">
              {faqs.map((faq, idx) => {
                const isFaqOpen = openFaqIndex === idx;
                return (
                  <div
                    key={idx}
                    className="bg-white border border-stone-200 shadow-sm overflow-hidden transition-all duration-300"
                  >
                    <button
                      onClick={() => toggleFaq(idx)}
                      className="w-full text-left p-4 md:p-5 flex justify-between items-center gap-4 text-neutral-900 hover:bg-neutral-50 transition-colors select-none cursor-pointer"
                    >
                      <span className="text-xs md:text-sm font-extrabold uppercase tracking-wider">
                        {faq.q}
                      </span>
                      <span className={`text-neutral-900 font-bold transition-transform duration-300 text-xs flex-shrink-0 ${
                        isFaqOpen ? "rotate-180" : ""
                      }`}>
                        ▼
                      </span>
                    </button>
                    
                    {/* Expandable answer panel */}
                    <div className={`transition-all duration-300 ease-in-out ${
                      isFaqOpen ? "max-h-[300px] border-t border-stone-100 opacity-100 bg-stone-50/50" : "max-h-0 opacity-0 pointer-events-none"
                    } overflow-hidden`}>
                      <p className="p-4 md:p-5 text-xs text-neutral-600 leading-relaxed font-semibold">
                        {faq.a}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

          </div>

        </div>

      </div>
    </main>
  );
}
