const mongoose = require("mongoose");

const pageContentSchema = new mongoose.Schema(
  {
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    subtitle: {
      type: String,
      default: "",
    },
    hero: {
      badge: { type: String, default: "" },
      headline: { type: String, default: "" },
      description: { type: String, default: "" },
      bannerImage: { type: String, default: "" },
      buttonText: { type: String, default: "" },
      buttonLink: { type: String, default: "" },
    },
    // Generic rich content / sections (for brand story, mission, policies)
    sections: [
      {
        title: { type: String, default: "" },
        subtitle: { type: String, default: "" },
        content: { type: String, default: "" },
        image: { type: String, default: "" },
        items: [{ type: String }],
        metrics: [
          {
            value: { type: String, default: "" },
            label: { type: String, default: "" },
          },
        ],
      },
    ],
    // Contact Info (for contact page & footer)
    contactInfo: {
      email: { type: String, default: "support@murtipuja.com" },
      phone: { type: String, default: "+91 98765 43210" },
      whatsapp: { type: String, default: "+91 98765 43210" },
      address: { type: String, default: "MurtiPuja Studio, Ring Road, Surat, Gujarat - 395002" },
      openingHours: { type: String, default: "Mon - Sat: 10:00 AM - 7:00 PM IST" },
      supportHours: { type: String, default: "Monday to Saturday, 10 AM to 7 PM" },
      googleMapsUrl: { type: String, default: "" },
    },
    // FAQs list (for contact & FAQ pages)
    faqs: [
      {
        question: { type: String, required: true },
        answer: { type: String, required: true },
        category: { type: String, default: "General" },
      },
    ],
    // Policy / Raw HTML / Markdown body (for Terms, Shipping, Return policies)
    body: {
      type: String,
      default: "",
    },
    seo: {
      metaTitle: { type: String, default: "" },
      metaDescription: { type: String, default: "" },
      keywords: { type: String, default: "" },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.models.PageContent || mongoose.model("PageContent", pageContentSchema);
