"use client";

import { useState, useEffect, useMemo } from "react";
import {
  getPageContent,
  updatePageContent,
  resetPageToDefault,
  resetAllPagesToDefaults,
} from "@/lib/api";

const AVAILABLE_PAGES = [
  { slug: "about", title: "About Us", icon: "📖", liveUrl: "/about", description: "Studio vision, 4 pillars, making process & contact" },
  { slug: "contact", title: "Contact Page", icon: "📞", liveUrl: "/contact", description: "Headquarters, customer care, operating status & FAQs" },
  { slug: "faqs", title: "FAQs Knowledgebase", icon: "❓", liveUrl: "/faqs", description: "Complete 22+ questions across 7 categories" },
  { slug: "shipping-policy", title: "Shipping Policy", icon: "🚚", liveUrl: "/shipping-policy", description: "Delivery timelines, logistics partners & insured transit" },
  { slug: "refund-policy", title: "Return & Refund Policy", icon: "🔄", liveUrl: "/refund-policy", description: "7-Day trial, unboxing video protocol & return FAQs" },
  { slug: "terms", title: "Terms & Conditions", icon: "📜", liveUrl: "/terms", description: "Legal agreements, prepaid terms & governing laws" },
];

const COMMON_FAQ_CATEGORIES = [
  "General",
  "Crafting, Materials & 3D Tech",
  "Dimensions & Sizing",
  "Limited Drops & The Vault",
  "Orders & Secure Payments (Prepaid Only)",
  "Shipping & Delivery — India",
  "Returns, Exchanges & Claims",
  "Support & Studio Contact",
  "Return & Exchange Policy",
];

export default function PagesCmsManager() {
  const [selectedSlug, setSelectedSlug] = useState("about");
  const [pageData, setPageData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState("");
  const [saveError, setSaveError] = useState("");
  const [faqSearch, setFaqSearch] = useState("");
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState("all");

  // Load selected page data
  useEffect(() => {
    fetchPage(selectedSlug);
  }, [selectedSlug]);

  async function fetchPage(slug) {
    setLoading(true);
    setSaveSuccess("");
    setSaveError("");
    setFaqSearch("");
    try {
      const res = await getPageContent(slug);
      if (res.data?.success && res.data?.data) {
        setPageData(res.data.data);
      } else {
        setPageData(res.data);
      }
    } catch (err) {
      console.error("Failed to load page data:", err);
      setSaveError("Failed to load page content: " + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  }

  async function handleSave(e) {
    e?.preventDefault();
    setSaving(true);
    setSaveSuccess("");
    setSaveError("");

    try {
      const res = await updatePageContent(selectedSlug, pageData);
      if (res.data?.success) {
        setSaveSuccess(`Page '${pageData.title || selectedSlug}' saved and published successfully!`);
        setTimeout(() => setSaveSuccess(""), 4000);
      }
    } catch (err) {
      console.error("Save page error:", err);
      setSaveError("Failed to save page: " + (err.response?.data?.message || err.message));
    } finally {
      setSaving(false);
    }
  }

  async function handleResetSingle() {
    const confirmed = window.confirm(
      `Are you sure you want to reset '/${selectedSlug}' to its default original template? Any custom edits will be replaced.`
    );
    if (!confirmed) return;

    setResetting(true);
    setSaveSuccess("");
    setSaveError("");
    try {
      const res = await resetPageToDefault(selectedSlug);
      if (res.data?.success) {
        setPageData(res.data.data);
        setSaveSuccess(`Page '${selectedSlug}' reset to default template successfully!`);
        setTimeout(() => setSaveSuccess(""), 4000);
      }
    } catch (err) {
      console.error("Reset error:", err);
      setSaveError("Failed to reset page: " + (err.response?.data?.message || err.message));
    } finally {
      setResetting(false);
    }
  }

  async function handleResetAll() {
    const confirmed = window.confirm(
      "Are you sure you want to reset ALL 6 dynamic pages (About, Contact, FAQs, Shipping, Refund, Terms) to their complete default static versions? All original 22 FAQs and complete policies will be restored."
    );
    if (!confirmed) return;

    setResetting(true);
    setSaveSuccess("");
    setSaveError("");
    try {
      const res = await resetAllPagesToDefaults();
      if (res.data?.success) {
        await fetchPage(selectedSlug);
        setSaveSuccess("All 6 pages have been restored with full default static content!");
        setTimeout(() => setSaveSuccess(""), 5000);
      }
    } catch (err) {
      console.error("Reset all error:", err);
      setSaveError("Failed to reset all pages: " + (err.response?.data?.message || err.message));
    } finally {
      setResetting(false);
    }
  }

  // FAQ helper methods
  function handleAddFaq() {
    const defaultCat =
      selectedSlug === "refund-policy"
        ? "Return & Exchange Policy"
        : selectedSlug === "contact"
        ? "General"
        : "Crafting, Materials & 3D Tech";

    const newFaq = {
      question: "New Question Title?",
      answer: "Detailed answer explanation here...",
      category: defaultCat,
    };
    const updated = {
      ...pageData,
      faqs: [...(pageData.faqs || []), newFaq],
    };
    setPageData(updated);
  }

  function handleUpdateFaq(originalIndex, field, value) {
    const updatedFaqs = [...(pageData.faqs || [])];
    updatedFaqs[originalIndex] = { ...updatedFaqs[originalIndex], [field]: value };
    setPageData({ ...pageData, faqs: updatedFaqs });
  }

  function handleDeleteFaq(originalIndex) {
    const updatedFaqs = (pageData.faqs || []).filter((_, i) => i !== originalIndex);
    setPageData({ ...pageData, faqs: updatedFaqs });
  }

  // Section helper methods
  function handleUpdateSection(index, field, value) {
    const updatedSections = [...(pageData.sections || [])];
    if (!updatedSections[index]) updatedSections[index] = {};
    updatedSections[index] = { ...updatedSections[index], [field]: value };
    setPageData({ ...pageData, sections: updatedSections });
  }

  function handleAddSection() {
    const newSection = {
      title: "New Section Title",
      subtitle: "Section Subheading",
      content: "Section content details...",
      items: [],
      metrics: [],
    };
    setPageData({
      ...pageData,
      sections: [...(pageData.sections || []), newSection],
    });
  }

  function handleDeleteSection(index) {
    const updatedSections = (pageData.sections || []).filter((_, i) => i !== index);
    setPageData({ ...pageData, sections: updatedSections });
  }

  // Filtered FAQs for search/category
  const displayedFaqs = useMemo(() => {
    if (!pageData?.faqs) return [];
    const q = faqSearch.trim().toLowerCase();

    return pageData.faqs
      .map((faq, originalIndex) => ({ ...faq, originalIndex }))
      .filter((faq) => {
        if (selectedCategoryFilter !== "all" && faq.category !== selectedCategoryFilter) {
          return false;
        }
        if (!q) return true;
        return (
          faq.question?.toLowerCase().includes(q) ||
          faq.answer?.toLowerCase().includes(q) ||
          faq.category?.toLowerCase().includes(q)
        );
      });
  }, [pageData?.faqs, faqSearch, selectedCategoryFilter]);

  // Unique categories list
  const availableCategories = useMemo(() => {
    const cats = new Set(COMMON_FAQ_CATEGORIES);
    (pageData?.faqs || []).forEach((f) => {
      if (f.category) cats.add(f.category);
    });
    return Array.from(cats);
  }, [pageData?.faqs]);

  const selectedPageMeta = AVAILABLE_PAGES.find((p) => p.slug === selectedSlug) || AVAILABLE_PAGES[0];

  return (
    <div className="space-y-6 font-display">
      {/* Top Header Card */}
      <div className="bg-white border-2 border-black p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xl">📄</span>
            <h2 className="font-display text-lg sm:text-xl font-black text-black uppercase tracking-wider">
              Dynamic Pages CMS & Content Manager
            </h2>
            <span className="bg-amber-100 text-amber-900 border border-amber-300 text-[10px] font-extrabold px-2 py-0.5 uppercase tracking-wider">
              Live Real-Time Sync
            </span>
          </div>
          <p className="text-xs text-neutral-500 font-semibold uppercase tracking-wider mt-1">
            All default static content is seeded. Any edit you make updates the live site instantly.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={handleResetAll}
            disabled={resetting || saving || loading}
            title="Restore default text for all pages"
            className="inline-flex items-center gap-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 border-2 border-neutral-300 hover:border-black px-3.5 py-2.5 text-xs font-extrabold uppercase tracking-wider transition-all cursor-pointer"
          >
            <span>🔄 Restore All Defaults</span>
          </button>

          <a
            href={selectedPageMeta.liveUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 bg-white hover:bg-neutral-50 text-black border-2 border-black px-4 py-2.5 text-xs font-extrabold uppercase tracking-wider transition-all"
          >
            <span>👁️ View Live</span>
            <span>↗</span>
          </a>

          <button
            onClick={handleSave}
            disabled={saving || loading || resetting}
            className="inline-flex items-center gap-1.5 bg-black hover:bg-gold hover:text-black text-white border-2 border-black px-6 py-2.5 text-xs font-black uppercase tracking-widest transition-all disabled:opacity-50 cursor-pointer shadow-xs"
          >
            <span>{saving ? "Publishing..." : "💾 Save & Publish"}</span>
          </button>
        </div>
      </div>

      {/* Notifications */}
      {saveSuccess && (
        <div className="bg-green-50 border-2 border-green-600 text-green-900 p-4 font-bold text-xs uppercase tracking-wider flex items-center justify-between animate-fadeIn">
          <div className="flex items-center gap-2">
            <span>✓</span>
            <span>{saveSuccess}</span>
          </div>
          <button onClick={() => setSaveSuccess("")} className="text-sm font-black cursor-pointer">✕</button>
        </div>
      )}
      {saveError && (
        <div className="bg-red-50 border-2 border-red-600 text-red-900 p-4 font-bold text-xs uppercase tracking-wider flex items-center justify-between animate-fadeIn">
          <div className="flex items-center gap-2">
            <span>⚠️</span>
            <span>{saveError}</span>
          </div>
          <button onClick={() => setSaveError("")} className="text-sm font-black cursor-pointer">✕</button>
        </div>
      )}

      {/* Page Selector Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
        {AVAILABLE_PAGES.map((page) => {
          const isActive = selectedSlug === page.slug;
          return (
            <button
              key={page.slug}
              type="button"
              onClick={() => setSelectedSlug(page.slug)}
              className={`p-3.5 border-2 text-left transition-all flex flex-col justify-between gap-1.5 cursor-pointer ${
                isActive
                  ? "bg-black border-black text-white shadow-sm"
                  : "bg-white border-neutral-200 text-neutral-800 hover:border-black hover:bg-neutral-50"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-lg">{page.icon}</span>
                {isActive && <span className="text-amber-400 text-[10px] font-black">● EDITING</span>}
              </div>
              <div>
                <p className="font-extrabold text-xs uppercase tracking-wider truncate">{page.title}</p>
                <p className={`text-[9.5px] uppercase font-semibold ${isActive ? "text-neutral-400" : "text-neutral-400"}`}>
                  /{page.slug}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Page Quick Description Banner */}
      <div className="bg-neutral-50 border-2 border-neutral-200 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="text-2xl">{selectedPageMeta.icon}</span>
          <div>
            <h3 className="text-xs font-black uppercase tracking-wider text-black">
              Editing: {selectedPageMeta.title} <span className="text-neutral-400 font-mono">({selectedPageMeta.liveUrl})</span>
            </h3>
            <p className="text-[11px] text-neutral-600 font-medium">
              {selectedPageMeta.description}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleResetSingle}
          disabled={resetting || saving || loading}
          className="text-[11px] font-extrabold uppercase tracking-wider text-neutral-700 bg-white border border-neutral-300 hover:border-black hover:text-black px-3 py-1.5 transition-colors cursor-pointer self-end sm:self-auto"
        >
          ↺ Reset This Page To Default
        </button>
      </div>

      {/* Editor Main Container */}
      {loading ? (
        <div className="bg-white border-2 border-black p-12 text-center">
          <p className="text-xs text-neutral-400 font-extrabold uppercase tracking-widest animate-pulse">
            Loading page editor for /{selectedSlug}...
          </p>
        </div>
      ) : pageData ? (
        <form onSubmit={handleSave} className="space-y-6">
          
          {/* Section: Page Header & Hero */}
          <div className="bg-white border-2 border-black p-6 space-y-5">
            <div className="border-b-2 border-neutral-100 pb-3 flex items-center justify-between">
              <h3 className="font-display font-black text-sm uppercase tracking-wider text-black flex items-center gap-2">
                <span>1. Header & Hero Section</span>
              </h3>
              <span className="text-[10px] font-mono text-neutral-400">/{pageData.slug}</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-extrabold uppercase tracking-widest text-neutral-500 mb-1.5">
                  Page Title *
                </label>
                <input
                  type="text"
                  required
                  value={pageData.title || ""}
                  onChange={(e) => setPageData({ ...pageData, title: e.target.value })}
                  className="w-full px-4 py-2.5 border-2 border-neutral-200 rounded-none bg-white text-xs font-bold text-black outline-none focus:border-black"
                />
              </div>

              <div>
                <label className="block text-[10px] font-extrabold uppercase tracking-widest text-neutral-500 mb-1.5">
                  Top Tag / Badge
                </label>
                <input
                  type="text"
                  value={pageData.hero?.badge || ""}
                  onChange={(e) =>
                    setPageData({
                      ...pageData,
                      hero: { ...(pageData.hero || {}), badge: e.target.value },
                    })
                  }
                  className="w-full px-4 py-2.5 border-2 border-neutral-200 rounded-none bg-white text-xs font-bold text-black outline-none focus:border-black"
                  placeholder="e.g. ✦ Customer Support & Concierge"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-extrabold uppercase tracking-widest text-neutral-500 mb-1.5">
                Main Headline *
              </label>
              <input
                type="text"
                required
                value={pageData.hero?.headline || pageData.title || ""}
                onChange={(e) =>
                  setPageData({
                    ...pageData,
                    hero: { ...(pageData.hero || {}), headline: e.target.value },
                  })
                }
                className="w-full px-4 py-2.5 border-2 border-neutral-200 rounded-none bg-white text-xs font-bold text-black outline-none focus:border-black"
              />
            </div>

            <div>
              <label className="block text-[10px] font-extrabold uppercase tracking-widest text-neutral-500 mb-1.5">
                Subtitle / Description Text
              </label>
              <textarea
                rows={2}
                value={pageData.hero?.description || pageData.subtitle || ""}
                onChange={(e) =>
                  setPageData({
                    ...pageData,
                    subtitle: e.target.value,
                    hero: { ...(pageData.hero || {}), description: e.target.value },
                  })
                }
                className="w-full px-4 py-2.5 border-2 border-neutral-200 rounded-none bg-white text-xs font-medium text-black outline-none focus:border-black leading-relaxed"
              />
            </div>
          </div>

          {/* Section: Studio Contact Information */}
          {(selectedSlug === "contact" || selectedSlug === "about") && (
            <div className="bg-white border-2 border-black p-6 space-y-5">
              <div className="border-b-2 border-neutral-100 pb-3">
                <h3 className="font-display font-black text-sm uppercase tracking-wider text-black">
                  2. Studio Contact & Operating Information
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] font-extrabold uppercase tracking-widest text-neutral-500 mb-1.5">
                    Customer Care Calling Phone
                  </label>
                  <input
                    type="text"
                    value={pageData.contactInfo?.phone || ""}
                    onChange={(e) =>
                      setPageData({
                        ...pageData,
                        contactInfo: { ...(pageData.contactInfo || {}), phone: e.target.value },
                      })
                    }
                    className="w-full px-4 py-2.5 border-2 border-neutral-200 rounded-none bg-white text-xs font-bold text-black outline-none focus:border-black"
                    placeholder="+91 96647 37035"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-extrabold uppercase tracking-widest text-neutral-500 mb-1.5">
                    WhatsApp Concierge Phone
                  </label>
                  <input
                    type="text"
                    value={pageData.contactInfo?.whatsapp || ""}
                    onChange={(e) =>
                      setPageData({
                        ...pageData,
                        contactInfo: { ...(pageData.contactInfo || {}), whatsapp: e.target.value },
                      })
                    }
                    className="w-full px-4 py-2.5 border-2 border-neutral-200 rounded-none bg-white text-xs font-bold text-black outline-none focus:border-black"
                    placeholder="+91 79901 38678"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-extrabold uppercase tracking-widest text-neutral-500 mb-1.5">
                    Official Support Email
                  </label>
                  <input
                    type="email"
                    value={pageData.contactInfo?.email || ""}
                    onChange={(e) =>
                      setPageData({
                        ...pageData,
                        contactInfo: { ...(pageData.contactInfo || {}), email: e.target.value },
                      })
                    }
                    className="w-full px-4 py-2.5 border-2 border-neutral-200 rounded-none bg-white text-xs font-bold text-black outline-none focus:border-black"
                    placeholder="support@murtipuja.com"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-extrabold uppercase tracking-widest text-neutral-500 mb-1.5">
                    Studio / Head Office Physical Address
                  </label>
                  <textarea
                    rows={2}
                    value={pageData.contactInfo?.address || ""}
                    onChange={(e) =>
                      setPageData({
                        ...pageData,
                        contactInfo: { ...(pageData.contactInfo || {}), address: e.target.value },
                      })
                    }
                    className="w-full px-4 py-2.5 border-2 border-neutral-200 rounded-none bg-white text-xs font-bold text-black outline-none focus:border-black leading-relaxed"
                    placeholder="MurtiPuja Headquarters, Ring Road, Surat, Gujarat - 395007, India"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-extrabold uppercase tracking-widest text-neutral-500 mb-1.5">
                    Opening / Support Hours Text
                  </label>
                  <textarea
                    rows={2}
                    value={pageData.contactInfo?.openingHours || ""}
                    onChange={(e) =>
                      setPageData({
                        ...pageData,
                        contactInfo: { ...(pageData.contactInfo || {}), openingHours: e.target.value },
                      })
                    }
                    className="w-full px-4 py-2.5 border-2 border-neutral-200 rounded-none bg-white text-xs font-bold text-black outline-none focus:border-black leading-relaxed"
                    placeholder="Mon–Sat · 10am–7pm IST"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Section: Brand Story & Sections (for About Page) */}
          {selectedSlug === "about" && (
            <div className="bg-white border-2 border-black p-6 space-y-6">
              <div className="border-b-2 border-neutral-100 pb-3 flex items-center justify-between">
                <div>
                  <h3 className="font-display font-black text-sm uppercase tracking-wider text-black">
                    2. Brand Story, Pillars & Craft Process
                  </h3>
                  <p className="text-[10px] text-neutral-400 font-semibold uppercase tracking-wider mt-0.5">
                    {pageData.sections?.length || 0} Sections Configured
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleAddSection}
                  className="bg-black hover:bg-gold hover:text-black text-white border border-black px-4 py-1.5 text-xs font-extrabold uppercase tracking-wider cursor-pointer"
                >
                  + Add Section
                </button>
              </div>

              <div className="space-y-4">
                {(pageData.sections || []).map((sec, idx) => (
                  <div key={idx} className="bg-neutral-50 border-2 border-neutral-200 p-4 sm:p-5 space-y-3">
                    <div className="flex items-center justify-between gap-3 border-b border-neutral-200 pb-2">
                      <span className="w-6 h-6 bg-black text-white text-[10px] font-extrabold flex items-center justify-center">
                        {idx + 1}
                      </span>
                      <span className="text-xs font-black uppercase tracking-wider text-black">
                        {sec.title || `Section #${idx + 1}`}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleDeleteSection(idx)}
                        className="text-red-600 hover:underline text-xs font-bold uppercase tracking-wider ml-auto cursor-pointer"
                      >
                        🗑️ Remove
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[9px] font-extrabold uppercase tracking-widest text-neutral-400 mb-1">
                          Section Title *
                        </label>
                        <input
                          type="text"
                          required
                          value={sec.title || ""}
                          onChange={(e) => handleUpdateSection(idx, "title", e.target.value)}
                          className="w-full px-3 py-2 border border-neutral-300 bg-white text-xs font-bold text-black outline-none focus:border-black"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] font-extrabold uppercase tracking-widest text-neutral-400 mb-1">
                          Subtitle / Badge
                        </label>
                        <input
                          type="text"
                          value={sec.subtitle || ""}
                          onChange={(e) => handleUpdateSection(idx, "subtitle", e.target.value)}
                          className="w-full px-3 py-2 border border-neutral-300 bg-white text-xs font-bold text-black outline-none focus:border-black"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[9px] font-extrabold uppercase tracking-widest text-neutral-400 mb-1">
                        Content Text (Supports multiple paragraphs & numbers)
                      </label>
                      <textarea
                        rows={4}
                        value={sec.content || ""}
                        onChange={(e) => handleUpdateSection(idx, "content", e.target.value)}
                        className="w-full px-3 py-2 border border-neutral-300 bg-white text-xs font-medium text-black outline-none focus:border-black leading-relaxed font-sans"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section: FAQs Knowledgebase (for FAQs, Contact & Refund pages) */}
          {(selectedSlug === "faqs" || selectedSlug === "contact" || selectedSlug === "refund-policy") && (
            <div className="bg-white border-2 border-black p-6 space-y-5">
              <div className="border-b-2 border-neutral-100 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="font-display font-black text-sm uppercase tracking-wider text-black">
                    {selectedSlug === "faqs"
                      ? "2. Complete FAQs Question Bank (22+ Questions)"
                      : selectedSlug === "contact"
                      ? "3. Contact Instant Support FAQs"
                      : "2. Return & Refund Policy FAQs"}
                  </h3>
                  <p className="text-[10px] text-neutral-400 font-semibold uppercase tracking-wider mt-0.5">
                    Showing {displayedFaqs.length} of {pageData.faqs?.length || 0} Questions
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleAddFaq}
                    className="bg-black hover:bg-gold hover:text-black text-white border border-black px-4 py-2 text-xs font-extrabold uppercase tracking-wider cursor-pointer"
                  >
                    + Add New Question
                  </button>
                </div>
              </div>

              {/* FAQ Search & Category Filter Toolbar */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 bg-neutral-50 p-3 border border-neutral-200">
                <div className="sm:col-span-7">
                  <input
                    type="text"
                    value={faqSearch}
                    onChange={(e) => setFaqSearch(e.target.value)}
                    placeholder="Search in questions or answers..."
                    className="w-full px-3 py-2 text-xs bg-white border border-neutral-300 font-semibold outline-none focus:border-black"
                  />
                </div>
                <div className="sm:col-span-5">
                  <select
                    value={selectedCategoryFilter}
                    onChange={(e) => setSelectedCategoryFilter(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white border border-neutral-300 font-bold uppercase outline-none focus:border-black cursor-pointer"
                  >
                    <option value="all">All Categories ({pageData.faqs?.length || 0})</option>
                    {availableCategories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* FAQ List */}
              <div className="space-y-4 max-h-[600px] overflow-y-auto pr-1">
                {displayedFaqs.map((faq) => (
                  <div
                    key={faq.originalIndex}
                    className="bg-neutral-50 border-2 border-neutral-200 p-4 space-y-3 relative group hover:border-black transition-colors"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 bg-black text-white text-[10px] font-extrabold flex items-center justify-center">
                          {faq.originalIndex + 1}
                        </span>
                        <input
                          type="text"
                          value={faq.category || "General"}
                          onChange={(e) => handleUpdateFaq(faq.originalIndex, "category", e.target.value)}
                          placeholder="Category Name"
                          className="text-[10px] uppercase font-extrabold px-2.5 py-1 border border-neutral-300 bg-white"
                        />
                      </div>

                      <button
                        type="button"
                        onClick={() => handleDeleteFaq(faq.originalIndex)}
                        className="text-red-600 hover:underline text-xs font-bold uppercase tracking-wider cursor-pointer"
                      >
                        🗑️ Remove
                      </button>
                    </div>

                    <div>
                      <label className="block text-[9px] font-extrabold uppercase tracking-widest text-neutral-400 mb-1">
                        Question *
                      </label>
                      <input
                        type="text"
                        required
                        value={faq.question || ""}
                        onChange={(e) => handleUpdateFaq(faq.originalIndex, "question", e.target.value)}
                        className="w-full px-3 py-2 border border-neutral-300 bg-white text-xs font-bold text-black outline-none focus:border-black"
                      />
                    </div>

                    <div>
                      <label className="block text-[9px] font-extrabold uppercase tracking-widest text-neutral-400 mb-1">
                        Answer *
                      </label>
                      <textarea
                        rows={3}
                        required
                        value={faq.answer || ""}
                        onChange={(e) => handleUpdateFaq(faq.originalIndex, "answer", e.target.value)}
                        className="w-full px-3 py-2 border border-neutral-300 bg-white text-xs font-semibold text-neutral-700 outline-none focus:border-black leading-relaxed"
                      />
                    </div>
                  </div>
                ))}

                {displayedFaqs.length === 0 && (
                  <div className="p-8 text-center border-2 border-dashed border-neutral-200 text-neutral-400 text-xs font-bold uppercase">
                    No matching FAQs found. Click &ldquo;+ Add New Question&rdquo; or clear search filter.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Section: Policy Detailed Text / Sections (for Terms, Shipping, Refund policies) */}
          {(selectedSlug === "terms" || selectedSlug === "shipping-policy" || selectedSlug === "refund-policy") && (
            <div className="bg-white border-2 border-black p-6 space-y-4">
              <div className="border-b-2 border-neutral-100 pb-3 flex items-center justify-between">
                <div>
                  <h3 className="font-display font-black text-sm uppercase tracking-wider text-black">
                    {selectedSlug === "terms"
                      ? "2. Terms & Conditions Document Text"
                      : selectedSlug === "shipping-policy"
                      ? "2. Shipping Policy Document & Guidelines"
                      : "3. Return & Refund Policy Document & Guidelines"}
                  </h3>
                  <p className="text-[10px] text-neutral-400 font-semibold uppercase tracking-wider mt-0.5">
                    Pre-filled with full original static clauses & guidelines
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-extrabold uppercase tracking-widest text-neutral-500 mb-1.5">
                  Detailed Policy Content (Supports Markdown headings ###, bullet points, etc.)
                </label>
                <textarea
                  rows={14}
                  value={pageData.body || ""}
                  onChange={(e) => setPageData({ ...pageData, body: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-neutral-200 rounded-none bg-white text-xs font-mono text-black outline-none focus:border-black leading-relaxed"
                  placeholder="Enter full policy terms..."
                />
              </div>
            </div>
          )}

          {/* Bottom Save Action Bar */}
          <div className="p-5 bg-white border-2 border-black flex flex-col sm:flex-row items-center justify-between gap-4 sticky bottom-4 shadow-lg">
            <span className="text-[11px] text-neutral-500 font-bold uppercase tracking-wider">
              ✦ Any changes saved here update /{selectedSlug} immediately for all users.
            </span>
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                type="button"
                onClick={handleResetSingle}
                disabled={saving || resetting}
                className="w-full sm:w-auto bg-neutral-100 hover:bg-neutral-200 text-black border-2 border-neutral-300 px-5 py-3 text-xs font-extrabold uppercase tracking-wider transition-all cursor-pointer"
              >
                ↺ Reset /{selectedSlug}
              </button>
              <button
                type="submit"
                disabled={saving || resetting}
                className="w-full sm:w-auto bg-black hover:bg-gold hover:text-black text-white border-2 border-black px-8 py-3 text-xs font-black uppercase tracking-widest transition-all shadow-xs cursor-pointer"
              >
                {saving ? "Publishing Changes..." : "💾 Save & Publish Changes"}
              </button>
            </div>
          </div>
        </form>
      ) : null}
    </div>
  );
}
