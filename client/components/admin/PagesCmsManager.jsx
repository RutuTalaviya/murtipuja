"use client";

import { useState, useEffect } from "react";
import { getPageContent, updatePageContent, getAllPages } from "@/lib/api";

const AVAILABLE_PAGES = [
  { slug: "about", title: "About Us", icon: "📖", liveUrl: "/about" },
  { slug: "contact", title: "Contact Page", icon: "📞", liveUrl: "/contact" },
  { slug: "faqs", title: "FAQs Knowledgebase", icon: "❓", liveUrl: "/faqs" },
  { slug: "shipping-policy", title: "Shipping Policy", icon: "🚚", liveUrl: "/shipping-policy" },
  { slug: "refund-policy", title: "Return & Refund Policy", icon: "🔄", liveUrl: "/refund-policy" },
  { slug: "terms", title: "Terms & Conditions", icon: "📜", liveUrl: "/terms" },
];

export default function PagesCmsManager() {
  const [selectedSlug, setSelectedSlug] = useState("about");
  const [pageData, setPageData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState("");
  const [saveError, setSaveError] = useState("");

  // Load selected page data
  useEffect(() => {
    async function fetchPage() {
      setLoading(true);
      setSaveSuccess("");
      setSaveError("");
      try {
        const res = await getPageContent(selectedSlug);
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
    fetchPage();
  }, [selectedSlug]);

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

  // FAQ helper methods
  function handleAddFaq() {
    const newFaq = { question: "New Question?", answer: "Answer details here...", category: "General" };
    const updated = {
      ...pageData,
      faqs: [...(pageData.faqs || []), newFaq],
    };
    setPageData(updated);
  }

  function handleUpdateFaq(index, field, value) {
    const updatedFaqs = [...(pageData.faqs || [])];
    updatedFaqs[index] = { ...updatedFaqs[index], [field]: value };
    setPageData({ ...pageData, faqs: updatedFaqs });
  }

  function handleDeleteFaq(index) {
    const updatedFaqs = (pageData.faqs || []).filter((_, i) => i !== index);
    setPageData({ ...pageData, faqs: updatedFaqs });
  }

  // Section helper methods
  function handleUpdateSection(index, field, value) {
    const updatedSections = [...(pageData.sections || [])];
    if (!updatedSections[index]) updatedSections[index] = {};
    updatedSections[index] = { ...updatedSections[index], [field]: value };
    setPageData({ ...pageData, sections: updatedSections });
  }

  const selectedPageMeta = AVAILABLE_PAGES.find((p) => p.slug === selectedSlug) || AVAILABLE_PAGES[0];

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-white border-2 border-black p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl">📄</span>
            <h2 className="font-display text-lg sm:text-xl font-black text-black uppercase tracking-wider">
              Dynamic Pages CMS
            </h2>
            <span className="bg-amber-100 text-amber-900 border border-amber-300 text-[10px] font-extrabold px-2 py-0.5 uppercase tracking-wider">
              Live Editor
            </span>
          </div>
          <p className="text-xs text-neutral-500 font-semibold uppercase tracking-wider mt-1">
            Manage and publish dynamic content for About Us, Contact, FAQs & Legal policies in real-time.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <a
            href={selectedPageMeta.liveUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 bg-neutral-100 hover:bg-neutral-200 text-black border-2 border-black px-4 py-2.5 text-xs font-extrabold uppercase tracking-wider transition-all"
          >
            <span>👁️ View Live Page</span>
            <span>↗</span>
          </a>
          <button
            onClick={handleSave}
            disabled={saving || loading}
            className="inline-flex items-center gap-1.5 bg-black hover:bg-gold hover:text-black text-white border-2 border-black px-6 py-2.5 text-xs font-black uppercase tracking-widest transition-all disabled:opacity-50 cursor-pointer shadow-xs"
          >
            <span>{saving ? "Publishing..." : "💾 Save & Publish"}</span>
          </button>
        </div>
      </div>

      {/* Notifications */}
      {saveSuccess && (
        <div className="bg-green-50 border-2 border-green-600 text-green-900 p-4 font-bold text-xs uppercase tracking-wider flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span>✓</span>
            <span>{saveSuccess}</span>
          </div>
          <button onClick={() => setSaveSuccess("")} className="text-sm font-black">✕</button>
        </div>
      )}
      {saveError && (
        <div className="bg-red-50 border-2 border-red-600 text-red-900 p-4 font-bold text-xs uppercase tracking-wider flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span>⚠️</span>
            <span>{saveError}</span>
          </div>
          <button onClick={() => setSaveError("")} className="text-sm font-black">✕</button>
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
              className={`p-3.5 border-2 text-left transition-all flex flex-col justify-between gap-1.5 ${
                isActive
                  ? "bg-black border-black text-white shadow-sm"
                  : "bg-white border-neutral-200 text-neutral-800 hover:border-black hover:bg-neutral-50"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-lg">{page.icon}</span>
                {isActive && <span className="text-amber-400 text-xs font-black">● ACTIVE</span>}
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

      {/* Editor Main Container */}
      {loading ? (
        <div className="bg-white border-2 border-black p-12 text-center">
          <p className="text-xs text-neutral-400 font-extrabold uppercase tracking-widest animate-pulse">
            Loading page editor for /{selectedSlug}...
          </p>
        </div>
      ) : pageData ? (
        <form onSubmit={handleSave} className="space-y-6">
          {/* Section: Page Meta & Hero Section */}
          <div className="bg-white border-2 border-black p-6 space-y-5">
            <div className="border-b-2 border-neutral-100 pb-3 flex items-center justify-between">
              <h3 className="font-display font-black text-sm uppercase tracking-wider text-black">
                1. Header & Hero Section
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
                  Hero Tag / Badge
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
                Subtitle / Description
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
                className="w-full px-4 py-2.5 border-2 border-neutral-200 rounded-none bg-white text-xs font-bold text-black outline-none focus:border-black"
              />
            </div>
          </div>

          {/* Section: Contact Details Editor (for Contact & About pages) */}
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
                    Customer Care Phone
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
                    WhatsApp Concierge Number
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
                    Studio / Head Office Address
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
                    className="w-full px-4 py-2.5 border-2 border-neutral-200 rounded-none bg-white text-xs font-bold text-black outline-none focus:border-black"
                    placeholder="MurtiPuja Studio, Ring Road, Surat, Gujarat - 395002"
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
                    className="w-full px-4 py-2.5 border-2 border-neutral-200 rounded-none bg-white text-xs font-bold text-black outline-none focus:border-black"
                    placeholder="Mon–Sat · 10am–7pm IST"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Section: Brand Story & Sections (for About Page) */}
          {selectedSlug === "about" && (
            <div className="bg-white border-2 border-black p-6 space-y-5">
              <div className="border-b-2 border-neutral-100 pb-3">
                <h3 className="font-display font-black text-sm uppercase tracking-wider text-black">
                  2. Brand Origin & Story Paragraphs
                </h3>
              </div>

              <div>
                <label className="block text-[10px] font-extrabold uppercase tracking-widest text-neutral-500 mb-1.5">
                  Story Subheading
                </label>
                <input
                  type="text"
                  value={pageData.sections?.[0]?.subtitle || ""}
                  onChange={(e) => handleUpdateSection(0, "subtitle", e.target.value)}
                  className="w-full px-4 py-2.5 border-2 border-neutral-200 rounded-none bg-white text-xs font-bold text-black outline-none focus:border-black"
                  placeholder="Reimagining Divine Sculptures for Modern Sanctuaries"
                />
              </div>

              <div>
                <label className="block text-[10px] font-extrabold uppercase tracking-widest text-neutral-500 mb-1.5">
                  Origin Story Content (Supports Multiple Paragraphs)
                </label>
                <textarea
                  rows={6}
                  value={pageData.sections?.[0]?.content || ""}
                  onChange={(e) => handleUpdateSection(0, "content", e.target.value)}
                  className="w-full px-4 py-2.5 border-2 border-neutral-200 rounded-none bg-white text-xs font-bold text-black outline-none focus:border-black leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-[10px] font-extrabold uppercase tracking-widest text-neutral-500 mb-1.5">
                  The MurtiPuja Pledge / Quote
                </label>
                <textarea
                  rows={2}
                  value={pageData.sections?.[1]?.content || ""}
                  onChange={(e) => handleUpdateSection(1, "content", e.target.value)}
                  className="w-full px-4 py-2.5 border-2 border-neutral-200 rounded-none bg-white text-xs font-bold text-black outline-none focus:border-black"
                />
              </div>
            </div>
          )}

          {/* Section: FAQs Knowledgebase (for Contact & FAQs pages) */}
          {(selectedSlug === "faqs" || selectedSlug === "contact") && (
            <div className="bg-white border-2 border-black p-6 space-y-5">
              <div className="border-b-2 border-neutral-100 pb-3 flex items-center justify-between">
                <div>
                  <h3 className="font-display font-black text-sm uppercase tracking-wider text-black">
                    {selectedSlug === "faqs" ? "2. Frequently Asked Questions List" : "3. Support FAQs Accordion"}
                  </h3>
                  <p className="text-[10px] text-neutral-400 font-semibold uppercase tracking-wider mt-0.5">
                    Total {pageData.faqs?.length || 0} Questions configured
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleAddFaq}
                  className="bg-black hover:bg-gold hover:text-black text-white border border-black px-4 py-1.5 text-xs font-extrabold uppercase tracking-wider"
                >
                  + Add Question
                </button>
              </div>

              <div className="space-y-4">
                {(pageData.faqs || []).map((faq, idx) => (
                  <div key={idx} className="bg-neutral-50 border-2 border-neutral-200 p-4 space-y-3 relative group">
                    <div className="flex items-center justify-between gap-3">
                      <span className="w-6 h-6 bg-black text-white text-[10px] font-extrabold flex items-center justify-center">
                        {idx + 1}
                      </span>
                      <input
                        type="text"
                        value={faq.category || "General"}
                        onChange={(e) => handleUpdateFaq(idx, "category", e.target.value)}
                        placeholder="Category (e.g. Shipping / Materials)"
                        className="text-[10px] uppercase font-extrabold px-2.5 py-1 border border-neutral-300 bg-white"
                      />
                      <button
                        type="button"
                        onClick={() => handleDeleteFaq(idx)}
                        className="text-red-600 hover:underline text-xs font-bold uppercase tracking-wider ml-auto"
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
                        onChange={(e) => handleUpdateFaq(idx, "question", e.target.value)}
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
                        onChange={(e) => handleUpdateFaq(idx, "answer", e.target.value)}
                        className="w-full px-3 py-2 border border-neutral-300 bg-white text-xs font-semibold text-neutral-700 outline-none focus:border-black leading-relaxed"
                      />
                    </div>
                  </div>
                ))}

                {(pageData.faqs || []).length === 0 && (
                  <div className="p-6 text-center border-2 border-dashed border-neutral-200 text-neutral-400 text-xs font-bold uppercase">
                    No FAQs added yet. Click &ldquo;+ Add Question&rdquo; to add your first Q&A item.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Section: Policy Body Editor (for Terms, Shipping, Refund policies) */}
          {(selectedSlug === "terms" || selectedSlug === "shipping-policy" || selectedSlug === "refund-policy") && (
            <div className="bg-white border-2 border-black p-6 space-y-4">
              <div className="border-b-2 border-neutral-100 pb-3">
                <h3 className="font-display font-black text-sm uppercase tracking-wider text-black">
                  2. Policy Detailed Terms & Content
                </h3>
              </div>

              <div>
                <label className="block text-[10px] font-extrabold uppercase tracking-widest text-neutral-500 mb-1.5">
                  Detailed Policy Text
                </label>
                <textarea
                  rows={10}
                  value={pageData.body || ""}
                  onChange={(e) => setPageData({ ...pageData, body: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-neutral-200 rounded-none bg-white text-xs font-medium text-black outline-none focus:border-black leading-relaxed font-mono"
                  placeholder="Enter full policy guidelines, terms, conditions, timelines, etc..."
                />
              </div>
            </div>
          )}

          {/* Bottom Save Action Bar */}
          <div className="p-4 bg-white border-2 border-black flex items-center justify-between">
            <span className="text-[11px] text-neutral-400 font-semibold uppercase tracking-wider">
              ✦ Changes are published immediately to the live site upon clicking save.
            </span>
            <button
              type="submit"
              disabled={saving}
              className="bg-black hover:bg-gold hover:text-black text-white border-2 border-black px-8 py-3 text-xs font-black uppercase tracking-widest transition-all shadow-xs cursor-pointer"
            >
              {saving ? "Publishing Changes..." : "💾 Save & Publish Changes"}
            </button>
          </div>
        </form>
      ) : null}
    </div>
  );
}
