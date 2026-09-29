"use client";

import { useState } from "react";

export default function ProductAccordion({ product }) {
  // State to track which accordion sections are open
  // Default first section open
  const [openSections, setOpenSections] = useState({
    details: true,
    materials: false,
    shipping: false,
  });

  const toggleSection = (key) => {
    setOpenSections((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  // Helper to render content with bullets or paragraphs
  const renderFormattedContent = (content, defaultFallback) => {
    const textToRender = (content || "").trim() || defaultFallback;
    if (!textToRender) return null;

    const lines = textToRender.split("\n").map((l) => l.trim()).filter(Boolean);

    // If text contains bullet-like lines
    const isBulletList = lines.some((l) => l.startsWith("•") || l.startsWith("-") || l.startsWith("*"));

    if (isBulletList) {
      return (
        <ul className="space-y-2 text-xs md:text-sm text-neutral-600 font-medium">
          {lines.map((line, idx) => {
            const cleanLine = line.replace(/^[•\-\*]\s*/, "");
            return (
              <li key={idx} className="flex items-start gap-2.5">
                <span className="text-black font-bold mt-0.5">•</span>
                <span className="leading-relaxed">{cleanLine}</span>
              </li>
            );
          })}
        </ul>
      );
    }

    return (
      <div className="space-y-2.5 text-xs md:text-sm text-neutral-600 font-medium leading-relaxed">
        {lines.map((p, idx) => (
          <p key={idx}>{p}</p>
        ))}
      </div>
    );
  };

  // Default content fallbacks
  const defaultProductDetails = `• Precision 3D Printed with 0.1mm micro-layer detail
• Deity: ${product.deity || "Sacred Series"}
• Intricate handcrafted finish inspected by skilled artisans
• Ideal for Home Mandir, Office Desk, Car Dashboard & Sacred Gifting
• Premium weighted base for absolute stability`;

  const defaultMaterialsCare = `• Material: High-Density Premium Eco-Resin / Composite
• Finish: Protective Matte / Antique Hand-Applied Coat
• Care Instructions: Wipe gently with a soft, clean dry cloth
• Avoid using harsh chemical cleaners, alcohol, or direct prolonged water submersion
• Keep away from open flames or extreme direct heat`;

  const defaultShippingReturns = `• Dispatch: Ships within 24 to 48 hours in shock-proof custom packaging
• Free Shipping: 100% Free insured express shipping across all India
• Delivery Timeline: Usually arrives within 3–5 business days
• 7-Day Replacement Policy: Easy replacement in case of transit damage or manufacturing defect
• Support: Dedicated WhatsApp support for instant order tracking and assistance`;

  const sections = [
    {
      id: "details",
      title: "PRODUCT DETAILS",
      content: product.productDetails || product.description,
      fallback: defaultProductDetails,
    },
    {
      id: "materials",
      title: "MATERIALS & CARE",
      content: product.materialsAndCare,
      fallback: defaultMaterialsCare,
    },
    {
      id: "shipping",
      title: "SHIPPING, RETURNS & EXCHANGES",
      content: product.shippingReturns,
      fallback: defaultShippingReturns,
    },
  ];

  // Custom accordion sections added by admin
  const customSections = Array.isArray(product.accordionSections)
    ? product.accordionSections.filter((s) => s.title && s.content)
    : [];

  return (
    <div className="w-full border-t border-b border-neutral-200 divide-y divide-neutral-200 mt-8">
      {sections.map((sec) => {
        const isOpen = Boolean(openSections[sec.id]);
        return (
          <div key={sec.id} className="py-4">
            <button
              type="button"
              onClick={() => toggleSection(sec.id)}
              className="w-full flex items-center justify-between text-left group cursor-pointer focus:outline-none select-none"
              aria-expanded={isOpen}
            >
              <span className="font-display text-xs md:text-sm font-extrabold uppercase tracking-wider text-black group-hover:text-amber-800 transition-colors">
                {sec.title}
              </span>
              <span className="text-base md:text-lg font-light text-neutral-500 group-hover:text-black transition-transform duration-200 flex-shrink-0 ml-4">
                {isOpen ? "−" : "+"}
              </span>
            </button>

            {isOpen && (
              <div className="pt-3.5 pb-1 text-neutral-600 animate-fade-in">
                {renderFormattedContent(sec.content, sec.fallback)}
              </div>
            )}
          </div>
        );
      })}

      {/* Additional Custom Sections */}
      {customSections.map((sec, idx) => {
        const secId = `custom_${idx}`;
        const isOpen = Boolean(openSections[secId]);
        return (
          <div key={secId} className="py-4">
            <button
              type="button"
              onClick={() => toggleSection(secId)}
              className="w-full flex items-center justify-between text-left group cursor-pointer focus:outline-none select-none"
              aria-expanded={isOpen}
            >
              <span className="font-display text-xs md:text-sm font-extrabold uppercase tracking-wider text-black group-hover:text-amber-800 transition-colors">
                {sec.title}
              </span>
              <span className="text-base md:text-lg font-light text-neutral-500 group-hover:text-black transition-transform duration-200 flex-shrink-0 ml-4">
                {isOpen ? "−" : "+"}
              </span>
            </button>

            {isOpen && (
              <div className="pt-3.5 pb-1 text-neutral-600 animate-fade-in">
                {renderFormattedContent(sec.content, "")}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
