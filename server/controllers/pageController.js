const PageContent = require("../models/PageContent");

// Default Fallback / Seed Content for core pages
const DEFAULT_PAGES = {
  about: {
    slug: "about",
    title: "About MurtiPuja",
    subtitle: "Where Sacred Devotion Meets 0.1mm Precision",
    hero: {
      badge: "✦ About MurtiPuja · Studio Surat",
      headline: "Where Sacred Devotion Meets 0.1mm Precision",
      description:
        "Preserving Sanatana Dharma's eternal iconography through next-generation 3D additive sculpting and handcrafted sacred finishes. Designed, consecrated, and made in India.",
      bannerImage: "/images/hero-shiva.jpg",
      buttonText: "Explore Collection →",
      buttonLink: "/products",
    },
    sections: [
      {
        title: "Our Origin & Vision",
        subtitle: "Reimagining Divine Sculptures for Modern Sanctuaries",
        content:
          "Founded in the historic cultural hub of Surat, Gujarat, MurtiPuja was born out of deep devotion and an engineering passion for micro-perfection. For generations, sacred murtis have inspired temples and homes across India.\n\nHowever, traditional mass-molding processes often lose the intricate micro-details of a deity's expression, ornamentation, or sacred mudras. We set out to change this by combining ancient Shilpa Shastra proportions with state-of-the-art 0.1mm micro-precision 3D printing technology.\n\nEvery single murti that leaves our studio is meticulously calibrated, cured, hand-detailed by skilled artisans, and rigorously inspected before insured dispatch to your doorstep.",
        items: [
          "Sub-millimeter facial & ornamental sharpness",
          "Engineered stone & resin blend for permanent durability",
          "Eco-conscious, non-toxic devotional materials",
          "Rigorous multi-point pre-dispatch quality verification",
        ],
        metrics: [
          { value: "0.1 mm", label: "Micro-Precision" },
          { value: "100%", label: "Crafted in India" },
          { value: "19,000+", label: "Pincodes Served" },
        ],
      },
      {
        title: "The MurtiPuja Pledge",
        subtitle: "Devotion in Every Micron",
        content:
          "We don't just print sculptures; we craft timeless representations of the divine that elevate your pooja room, home sanctuary, and spiritual meditation space.",
      },
    ],
    contactInfo: {
      email: "support@murtipuja.com",
      phone: "+91 98765 43210",
      whatsapp: "+91 98765 43210",
      address: "MurtiPuja Studio, Ring Road, Surat, Gujarat - 395002",
      openingHours: "Mon - Sat: 10:00 AM - 7:00 PM IST",
      supportHours: "Monday to Saturday, 10 AM to 7 PM",
    },
  },
  contact: {
    slug: "contact",
    title: "Contact MurtiPuja",
    subtitle: "Customer Support & Concierge",
    hero: {
      badge: "Customer Support & Concierge",
      headline: "Contact MurtiPuja",
      description:
        "Questions about a drop, bulk orders, or custom dimensions — our team in Surat is here to assist.",
    },
    contactInfo: {
      email: "support@murtipuja.com",
      phone: "+91 98765 43210",
      whatsapp: "+91 98765 43210",
      address: "MurtiPuja Studio, Ring Road, Surat, Gujarat - 395002",
      openingHours: "Mon - Sat: 10:00 AM - 7:00 PM IST",
      supportHours: "Monday to Saturday, 10 AM to 7 PM",
      googleMapsUrl: "https://maps.google.com/?q=Surat,+Gujarat",
    },
    faqs: [
      {
        question: "How do I return or exchange a product?",
        answer:
          "We offer a 7-day hassle-free return and exchange policy from the date of delivery. You can initiate a request directly from our returns portal or reach out to us via WhatsApp/email with your Order ID. Please note that an unedited unboxing video is mandatory for transit damage claims.",
        category: "Returns",
      },
      {
        question: "How can I track my order?",
        answer:
          "Once dispatched, you will receive a tracking link via WhatsApp, SMS, and Email. You can also use our public Track Order page to check real-time updates instantly using your Order ID and registered phone number.",
        category: "Tracking",
      },
      {
        question: "Can I order in bulk, and are there discounts?",
        answer:
          "Yes! We accept bulk orders for corporate gifting, wedding favors, and festive occasions. We offer customized packaging and special tiered discounts on large orders. Please email us at support@murtipuja.com or call us to discuss your requirements.",
        category: "Bulk Orders",
      },
      {
        question: "How do I explore a brand partnership or collaboration?",
        answer:
          "We are always excited to collaborate with designers, spiritual portals, and retail brands. Please send us your proposal or design portfolio at support@murtipuja.com, and our partnerships coordinator will reach out to you.",
        category: "Partnerships",
      },
      {
        question: "What are your shipping timelines? Do you ship internationally?",
        answer:
          "We dispatch orders within 48 hours. Standard shipping takes 1-3 working days for metro cities, and 3-5 days for other states. Currently, we ship primarily across India, but you can contact us for special international inquiries.",
        category: "Shipping",
      },
      {
        question: "Do you offer customisation and gift packaging?",
        answer:
          "Yes, we do! We can customize the size of your murtis (from 6 inches up to 24 inches) and print custom finishes (e.g., Gold Leaf, Antique Bronze). We also provide premium gift wrapping with handwritten personalized notes.",
        category: "Customisation",
      },
    ],
  },
  faqs: {
    slug: "faqs",
    title: "Frequently Asked Questions",
    subtitle: "Everything You Need to Know About MurtiPuja",
    hero: {
      badge: "Support Knowledgebase",
      headline: "Frequently Asked Questions",
      description: "Find instant answers to common questions about materials, sculpting, shipping, orders, and returns.",
    },
    faqs: [
      {
        question: "What material is used to craft the murtis?",
        answer: "We use high-grade photopolymer composite resins combined with micro-fine stone powder to ensure exceptional structural strength, crisp micro-details, and smooth sacred tactile finishes.",
        category: "Craftsmanship & Material",
      },
      {
        question: "How should I clean and maintain my idol?",
        answer: "Wipe gently with a clean, dry, soft microfiber cloth. Avoid harsh chemical cleaners, alcohol rubs, or abrasive scrubbers to preserve the consecrated finish.",
        category: "Care Guide",
      },
      {
        question: "Are MurtiPuja sculptures suitable for abhishek / water rituals?",
        answer: "Yes, our idols cured with waterproof sealant can endure water rituals. However, we recommend drying with a soft cotton cloth after jal-abhishek.",
        category: "Pooja Rituals",
      },
      {
        question: "What if my package arrives damaged?",
        answer: "We offer 100% replacement / return for any in-transit damage. Simply upload an unboxing video on your Order details page within 7 days of delivery.",
        category: "Returns & Warranty",
      },
      {
        question: "What are the available payment options?",
        answer: "We support UPI, Net Banking, Credit/Debit Cards, and Razorpay secure payment gateway.",
        category: "Payments",
      },
    ],
  },
  terms: {
    slug: "terms",
    title: "Terms & Conditions",
    subtitle: "Legal & Operating Policies",
    hero: {
      badge: "Legal Documentation",
      headline: "Terms & Conditions",
      description: "Please read these terms and conditions carefully before using the MurtiPuja website or purchasing products.",
    },
    body: "Welcome to MurtiPuja. By accessing our platform and placing an order, you agree to adhere to our sacred standards of service, verified delivery agreements, and copyright protections.",
  },
  "shipping-policy": {
    slug: "shipping-policy",
    title: "Shipping Policy",
    subtitle: "Fast, Insured & Consecrated Delivery",
    hero: {
      badge: "Logistics & Delivery",
      headline: "Shipping Policy",
      description: "We deliver across 19,000+ pincodes in India with 100% transit insurance and tamper-proof packaging.",
    },
    body: "All orders are processed and consecrated within 48 hours. Metro deliveries typically arrive within 1-3 business days, and other states within 3-5 business days.",
  },
  "refund-policy": {
    slug: "refund-policy",
    title: "Return & Refund Policy",
    subtitle: "7-Day Easy Return & Exchange Guarantee",
    hero: {
      badge: "Customer Assurance",
      headline: "Return & Refund Policy",
      description: "Transparent, honest, and hassle-free return and exchange policy for all our sacred drops.",
    },
    body: "We provide complete transit damage replacements and size/finish exchanges within 7 days of delivery. Unboxing video recording is mandatory for transit damage claims.",
  },
};

// GET /api/pages/:slug
async function getPageBySlug(req, res) {
  try {
    const slug = req.params.slug.toLowerCase().trim();
    let page = await PageContent.findOne({ slug });

    // If page doesn't exist yet, seed default data if available
    if (!page) {
      const defaultData = DEFAULT_PAGES[slug];
      if (defaultData) {
        page = await PageContent.create(defaultData);
      } else {
        return res.status(404).json({ success: false, message: `Page '${slug}' not found` });
      }
    }

    res.status(200).json({ success: true, data: page });
  } catch (err) {
    console.error("Get page by slug error:", err);
    res.status(500).json({ success: false, message: "Server error fetching page content" });
  }
}

// GET /api/pages
async function getAllPages(req, res) {
  try {
    // Ensure all default pages exist in database
    for (const [slug, def] of Object.entries(DEFAULT_PAGES)) {
      const exists = await PageContent.findOne({ slug });
      if (!exists) {
        await PageContent.create(def);
      }
    }

    const pages = await PageContent.find({}).sort({ updatedAt: -1 });
    res.status(200).json({ success: true, data: pages });
  } catch (err) {
    console.error("Get all pages error:", err);
    res.status(500).json({ success: false, message: "Server error fetching pages" });
  }
}

// PUT /api/pages/:slug (Admin Protected)
async function updatePageBySlug(req, res) {
  try {
    const slug = req.params.slug.toLowerCase().trim();
    const updateData = req.body;

    const page = await PageContent.findOneAndUpdate(
      { slug },
      { $set: updateData },
      { new: true, upsert: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: `Page '${page.title || slug}' updated successfully!`,
      data: page,
    });
  } catch (err) {
    console.error("Update page error:", err);
    res.status(500).json({ success: false, message: "Failed to update page content: " + err.message });
  }
}

module.exports = {
  getPageBySlug,
  getAllPages,
  updatePageBySlug,
};
