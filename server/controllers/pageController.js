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
        title: "The 4 Pillars of Our Craft",
        subtitle: "Why Devotees Choose MurtiPuja",
        content:
          "1. 0.1mm Micro-Precision: Layer-by-layer high-density resin and polymer fabrication capturing every micro detail like Trishul, Bansuri, and Mukut.\n2. Shilpa Shastra Proportions: Sculpted in strict adherence to Vedic iconography, mudras, balance, and classical spiritual aesthetics.\n3. Hand-Detailed Finishes: Expert artisans apply antique bronze, matte sandstone, and raw obsidian coatings for a luxurious tactile presence.\n4. Safe & Insured Delivery: Custom-molded foam packaging with zero transit damage risk and 100% free doorstep pickup if needed.",
      },
      {
        title: "How Every Murti is Born",
        subtitle: "Behind the Scenes: The 4-Step Making Process",
        content:
          "1. Digital 3D Sculpting: Master 3D artists recreate divine forms using digital clay, ensuring mathematical symmetry and expressive features.\n2. Additive 3D Printing: High-end industrial printers sculpt layer-by-layer at 0.1mm thickness over several hours without imperfections.\n3. Artisan Hand-Finishing: Surface post-curing, precision smoothing, and multi-layered patina painting by Gujarat's seasoned craftsmen.\n4. Consecration & Dispatch: Each idol is cleaned, quality certified, and nestled into custom shockproof foam before air dispatch across India.",
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
      phone: "+91 96647 37035",
      whatsapp: "+91 79901 38678",
      address: "MurtiPuja Headquarters, Ring Road, Textile & Diamond City, Surat - 395007, Gujarat, India",
      openingHours: "Mon–Sat · 10am–7pm IST",
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
      phone: "+91 96647 37035",
      whatsapp: "+91 79901 38678",
      address: "MurtiPuja Headquarters, Ring Road, Textile & Diamond City, Surat - 395007, Gujarat, India",
      openingHours: "Mon–Sat · 10am–7pm IST",
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
    subtitle: "All the answers you need in one place. 0.1mm micro-precision 3D crafting, shipping, payments, returns, and care protocols.",
    hero: {
      badge: "Help Desk & Devotee Knowledge Base",
      headline: "Frequently Asked Questions",
      description: "All the answers you need in one place. 0.1mm micro-precision 3D crafting, shipping, payments, returns, and care protocols.",
    },
    faqs: [
      // 1. Crafting, Materials & 3D Tech
      {
        category: "Crafting, Materials & 3D Tech",
        question: "What materials are used to sculpt MurtiPuja idols?",
        answer: "Our divine sculptures are 3D-crafted using high-density engineering bio-PLA derived from renewable plant starches, achieving 0.1mm micro-layer precision. After printing, each idol is manually polished and hand-detailed by traditional artisans using premium obsidian black, metallic bronze, copper, and matte stone finishes.",
      },
      {
        category: "Crafting, Materials & 3D Tech",
        question: "Can I perform Abhishek (bathing with water/milk) on these idols?",
        answer: "While our high-density polymer is water-resistant, we recommend dry dusting with a soft microfiber cloth or gentle wiping with a lightly damp cloth. Avoiding full water/milk submersions preserves the artisan matte texture, metallic pigments, and micro-layer surface luster indefinitely.",
      },
      {
        category: "Crafting, Materials & 3D Tech",
        question: "How are MurtiPuja idols designed and developed?",
        answer: "Every sculpture begins with extensive study of traditional Vedic iconography and Dhyana Shlokas. Our digital sculptors create high-polygon 3D meshes that capture subtle muscle anatomy, ornaments, and sacred postures. These are brought to life via multi-axis precision 3D printing and finished by hand in our Surat studio.",
      },
      {
        category: "Crafting, Materials & 3D Tech",
        question: "Are MurtiPuja materials eco-friendly and non-toxic?",
        answer: "Yes, 100%. Our bio-polymers are plant-derived, non-toxic, and free from heavy metals or harsh chemical binders. Unlike conventional Plaster of Paris (PoP) idols that harm water bodies, our idols are durable, heirloom-quality, and environmentally sustainable.",
      },

      // 2. Dimensions & Sizing
      {
        category: "Dimensions & Sizing",
        question: "What sizes and proportions are available?",
        answer: "Our collector drops typically come in 6-inch (compact mandir/desk edition), 9-inch (standard pooja room edition), and 12-inch (grand centerpiece edition). Exact dimensions (Height × Width × Depth) and weight in grams are listed on each product's page.",
      },
      {
        category: "Dimensions & Sizing",
        question: "Do you accept custom deity or custom size commissions?",
        answer: "Yes! We create bespoke commissioned murtis ranging from 6 inches up to 24 inches for home sanctums, corporate installations, and overseas temples. Contact our concierge team with your required deity form and dimensions to receive a 3D preview and timeline.",
      },
      {
        category: "Dimensions & Sizing",
        question: "Do you offer premium gift packaging and personalized notes?",
        answer: "Every MurtiPuja idol arrives securely housed in luxury shockproof rigid foam packaging suitable for gifting. During checkout, you can also add a personalized gift message printed on a sacred blessing card.",
      },

      // 3. Limited Drops & The Vault
      {
        category: "Limited Drops & The Vault",
        question: "What are MurtiPuja Drops?",
        answer: "Drops are strictly limited production batches of exclusive deity designs and rare artisanal finishes. Each drop has a capped unit quantity. Once sold out, that exact edition is archived in The Vault and is never re-manufactured in that exact variant.",
      },
      {
        category: "Limited Drops & The Vault",
        question: "How do I get early access to upcoming drops?",
        answer: "You can sign up for drop alerts via our WhatsApp concierge or newsletter on the homepage. VIP subscribers receive a 1-hour early access window before drops open to the general public.",
      },

      // 4. Orders & Secure Payments (Prepaid Only)
      {
        category: "Orders & Secure Payments (Prepaid Only)",
        question: "Which payment methods does MurtiPuja accept?",
        answer: "We accept all 100% secure online payment methods powered by 256-bit SSL encrypted Razorpay checkout: UPI (Google Pay, PhonePe, Paytm, BHIM, Cred), Credit/Debit cards (Visa, MasterCard, RuPay, Amex), and Net Banking across 50+ banks. All orders are 100% prepaid.",
      },
      {
        category: "Orders & Secure Payments (Prepaid Only)",
        question: "Does MurtiPuja offer Cash on Delivery (COD)?",
        answer: "No, MurtiPuja operates exclusively on a 100% Prepaid Model. Because each sacred murti is precision 3D-crafted, consecrated, and hand-finished, eliminating COD ensures zero transit cancellations and guarantees 100% Free Insured Express Air Delivery on every single order.",
      },
      {
        category: "Orders & Secure Payments (Prepaid Only)",
        question: "Can I modify or cancel my order after placing it?",
        answer: "You can modify your shipping address or cancel your order within 12 hours of placing it before it enters our dispatch queue. Simply email support@murtipuja.com or message our WhatsApp concierge with your Order ID.",
      },
      {
        category: "Orders & Secure Payments (Prepaid Only)",
        question: "Will I receive a tax invoice with my order?",
        answer: "Yes, a GST tax invoice with full itemized details and HSN codes is automatically emailed to your registered email upon dispatch and included inside the parcel.",
      },

      // 5. Shipping & Delivery — India
      {
        category: "Shipping & Delivery — India",
        question: "How long does delivery take across India?",
        answer: "Orders are dispatched within 24 to 48 hours from our Surat studio. Metro cities (Mumbai, Delhi NCR, Bengaluru, Hyderabad, Chennai, Pune, Ahmedabad, Surat) receive delivery within 2–3 business days. All other Indian cities and towns take 3–5 business days.",
      },
      {
        category: "Shipping & Delivery — India",
        question: "Is shipping free?",
        answer: "Yes! We provide 100% Free Insured Express Shipping across India on all prepaid orders. There are zero hidden courier fees.",
      },
      {
        category: "Shipping & Delivery — India",
        question: "How can I track my shipment in real-time?",
        answer: "Once dispatched, you will receive an SMS and WhatsApp containing your tracking number and AWB link. You can also visit our public Track Order page anytime to check live delivery milestones without needing an account.",
      },
      {
        category: "Shipping & Delivery — India",
        question: "Is my shipment insured against transit damages?",
        answer: "Yes. Every MurtiPuja parcel is 100% transit-insured. If your package arrives damaged, our concierge team will immediately send a fresh replacement at no extra charge.",
      },

      // 6. Returns, Exchanges & Claims
      {
        category: "Returns, Exchanges & Claims",
        question: "What is your return & exchange policy?",
        answer: "We offer a 7-day hassle-free return and replacement policy from the date of delivery. If your item arrives damaged, defective, or incorrect, we arrange a free reverse pickup and dispatch a brand new unit immediately.",
      },
      {
        category: "Returns, Exchanges & Claims",
        question: "Why is an unboxing video strictly mandatory for all returns & exchanges?",
        answer: "Divine sculptures feature delicate 0.1mm micro-sculpted details and hand-gilded finishes. An unedited, continuous unboxing video starting from the sealed outer box to revealing the idol is strictly compulsory to prevent false claims and enable instant replacement or refund approvals.",
      },
      {
        category: "Returns, Exchanges & Claims",
        question: "How long do refunds take to reflect in my bank account?",
        answer: "Once an approved return is received at our facility, refunds are initiated immediately and credited back to your original payment method (Bank/UPI/Card) within 24–48 hours via Razorpay.",
      },

      // 7. Support & Studio Contact
      {
        category: "Support & Studio Contact",
        question: "How do I contact customer support?",
        answer: "Our studio concierge team in Surat is available Monday to Saturday from 10:00 AM to 7:00 PM IST. You can reach us via Phone/WhatsApp at +91 79901 38678 / +91 96647 37035, or via email at support@murtipuja.com.",
      },
      {
        category: "Support & Studio Contact",
        question: "Do you have an offline showroom or store?",
        answer: "MurtiPuja operates primarily as a direct-to-devotee online studio to ensure pristine quality control and direct pricing. Studio visits in Surat are available by prior appointment for bespoke corporate and large temple idol consultations.",
      },
    ],
  },
  terms: {
    slug: "terms",
    title: "Terms & Conditions",
    subtitle: "Legal Agreements · Last updated: 2026",
    hero: {
      badge: "Legal Documentation",
      headline: "Terms & Conditions",
      description: "Please read these terms and conditions carefully before using the MurtiPuja website or purchasing products.",
    },
    body: `### 1. Introduction & Acceptance of Terms
Welcome to MurtiPuja. By accessing our platform (murtipuja.com), browsing our drops, or purchasing physical deity sculptures, you acknowledge that you have read, understood, and agreed to be legally bound by these Terms & Conditions.

### 2. Products & Sacred Craftsmanship
MurtiPuja designs and manufactures spiritual sculptures utilizing high-density 3D additive precision engineering combined with artisanal hand-finishing in Surat, Gujarat. Because each murti is individually hand-polished and coated with sacred patinas (such as Antique Bronze, Sandstone Matte, and Obsidian Black), minor organic variations in surface texture and hue are inherent hallmarks of authentic artisan craft.

### 3. Pricing, 100% Prepaid Orders & Payments
- All product prices are listed in Indian Rupees (INR ₹) inclusive of applicable taxes.
- MurtiPuja operates on an exclusive 100% Prepaid Model to ensure insured air express dispatch and prevent fraudulent transit returns.
- Transactions are processed through 256-bit SSL encrypted payment gateways (Razorpay) supporting UPI, Debit/Credit cards, and Net Banking.

### 4. Shipping, Transit Insurance & Risk of Loss
We provide 100% Free Insured Express Air Delivery across India. The risk of loss passes to you upon delivery by the courier partner. In the event of transit damage, MurtiPuja will arrange a free instant replacement upon submission of the mandatory unboxing video within 7 days of delivery.

### 5. Return & Cancellation Policy
- Order cancellations or address modifications must be requested within 12 hours of placing the order.
- Returns and exchanges are accepted within 7 calendar days of delivery. A continuous, unedited unboxing video starting from the sealed outer parcel is strictly mandatory for all damage and return approvals.

### 6. Intellectual Property
All 3D digital sculpts, iconography, brand logos, visual drops, photographs, and website content are the exclusive intellectual property of MurtiPuja. Unauthorized reproduction, commercial 3D scanning, re-molding, or digital redistribution is strictly prohibited.

### 7. Governing Law & Jurisdiction
These terms shall be governed by and construed in accordance with the laws of the Republic of India. Any disputes arising in connection with these terms shall be subject to the exclusive jurisdiction of the competent courts in Surat, Gujarat, India.`,
  },
  "shipping-policy": {
    slug: "shipping-policy",
    title: "Shipping & Delivery Policy",
    subtitle: "100% Insured express transit across 19,000+ Indian pincodes · Dispatched from our Surat design lab · Zero shipping fees.",
    hero: {
      badge: "Logistics & Dispatch Standards",
      headline: "Shipping & Delivery Policy",
      description: "100% Insured express transit across 19,000+ Indian pincodes · Dispatched from our Surat design lab · Zero shipping fees.",
    },
    sections: [
      {
        title: "1. Order Processing & Dispatch Timelines",
        content: "All in-stock MurtiPuja drops undergo multi-stage optical surface inspection, manual micro-layer detailing, and protective sealing before leaving our Surat facility. Orders are dispatched within 24 to 48 working hours after payment verification.",
      },
      {
        title: "2. Estimated Delivery Timelines Across India",
        content: "• Within Gujarat (Surat, Ahmedabad, Vadodara, Rajkot): 1 – 2 Business Days\n• Metro Cities (Mumbai, Delhi NCR, Bengaluru, Hyderabad, Pune, Chennai): 2 – 3 Business Days\n• Rest of India (Tier 2, Tier 3 & Rural Pin Codes): 3 – 5 Business Days",
      },
      {
        title: "3. Transit Couriers & Sacred Packaging",
        content: "We partner exclusively with air express logistics providers including Blue Dart Express and Delhivery Air. Each divine idol is encapsulated in custom-molded high-density foam, encased in tamper-evident sealed packaging with sacred unboxing documentation.",
      },
      {
        title: "4. Real-Time Tracking & Notifications",
        content: "As soon as your shipment is scanned at the hub, an SMS & WhatsApp notification containing your AWB tracking link is triggered. You can also track transit milestones directly on our portal via your registered phone number.",
      },
      {
        title: "5. Transit Damage Policy",
        content: "In the rare event of transit damage, MurtiPuja provides a 100% free instant replacement or refund. Simply file a claim within 7 days of delivery with your continuous unboxing video via our dedicated Claims Portal.",
      },
    ],
    body: `### 1. Order Processing & Dispatch Timelines
All in-stock MurtiPuja drops undergo multi-stage optical surface inspection, manual micro-layer detailing, and protective sealing before leaving our Surat facility. Orders are dispatched within 24 to 48 working hours after payment verification.

### 2. Estimated Delivery Timelines Across India
- Within Gujarat (Surat, Ahmedabad, Vadodara, Rajkot): 1 – 2 Business Days
- Metro Cities (Mumbai, Delhi NCR, Bengaluru, Hyderabad, Pune, Chennai): 2 – 3 Business Days
- Rest of India (All Tier 2, Tier 3 & Rural Pincodes): 3 – 5 Business Days

### 3. Transit Couriers & Sacred Packaging
We partner exclusively with air express logistics providers including Blue Dart Express and Delhivery Air. Each divine idol is encapsulated in custom-molded high-density foam, encased in tamper-evident sealed packaging with sacred unboxing documentation.

### 4. Real-Time Tracking & Notifications
As soon as your shipment is scanned at the hub, an SMS & WhatsApp notification containing your AWB tracking link is triggered. You can also track transit milestones directly on our portal via your registered phone number.

### 5. Transit Damage Policy
In the rare event of transit damage, MurtiPuja provides a 100% free instant replacement or refund. Simply file a claim within 7 days of delivery with your continuous unboxing video via our dedicated Claims Portal.`,
  },
  "refund-policy": {
    slug: "refund-policy",
    title: "Return & Exchange Rules & Policy",
    subtitle: "Official guidelines · 7-Day trial guarantee · Mandatory unboxing video protocol · 100% free doorstep reverse pickup.",
    hero: {
      badge: "Customer Protection & Devotee Satisfaction",
      headline: "Return & Exchange Rules & Policy",
      description: "Official guidelines · 7-Day trial guarantee · Mandatory unboxing video protocol · 100% free doorstep reverse pickup.",
    },
    sections: [
      {
        title: "1. 7-Day Trial & Exchange Window",
        content: "Every MurtiPuja sculpture is covered by our 7-Day Trial & Exchange Guarantee. You have 7 full calendar days from the exact delivery timestamp to file an exchange for size, variant, or finish on our Return Claim Portal.",
      },
      {
        title: "2. Compulsory Unboxing Video Guidelines",
        content: "Because sacred spiritual idols are precision 3D-sculpted with micro-fine details, an unboxing video is strictly mandatory to validate courier transit handling and approve claims immediately.\n1. Start Before Unsealing: Video must start before cutting the outer courier tape.\n2. Show Shipping Label: Ensure AWB barcode and recipient details are visible.\n3. Single Continuous Shot: No video cuts, pauses, or edits permitted during unpacking.\n4. Inspect on Camera: Carefully lift the idol from foam inserts and inspect.",
      },
      {
        title: "3. 100% Free Doorstep Reverse Pickup",
        content: "You never pay for reverse shipping on verified claims. Our logistics partners (Blue Dart, Delhivery, DTDC) will arrive at your address with a pre-printed AWB within 24–48 hours of claim registration.",
      },
      {
        title: "4. Product Condition & Eligibility",
        content: "• The deity sculpture must be unused, clean, and in original brand-new physical condition.\n• All original packaging materials, shockproof foam inserts, certificates, and accessories must be safely returned.\n• Custom bespoke deity orders with personalized devotional engravings cannot be returned for cash refunds unless transit-damaged.",
      },
      {
        title: "5. 100% Prepaid Model & Razorpay Refund Settlement",
        content: "MurtiPuja operates exclusively on a 100% prepaid model to ensure expedited air dispatch. Approved refunds are credited directly back to the original source payment method (Bank Account, UPI, or Card via 256-bit SSL Razorpay) within 24 to 48 hours of warehouse reception.",
      },
    ],
    faqs: [
      {
        category: "Return & Exchange Policy",
        question: "What is the return and exchange window for MurtiPuja idols?",
        answer: "We provide a 7-Day Hassle-Free Window starting from the exact calendar day your shipment is marked as delivered by the courier partner. You can request a size exchange, finish swap, or transit damage claim within this 7-day period.",
      },
      {
        category: "Return & Exchange Policy",
        question: "Why is an unboxing video strictly mandatory for all returns and exchanges?",
        answer: "Spiritual murtis are precision 3D-sculpted, consecrated, and feature delicate micro-carvings (e.g. Trishul, Bansuri, Mukut). An unedited, single continuous unboxing video starting from before opening the sealed package is strictly compulsory to verify transit handling and authorize instant replacement or refund approvals.",
      },
      {
        category: "Return & Exchange Policy",
        question: "Is reverse doorstep pickup free across India?",
        answer: "Yes, 100% Free! Once your unboxing video claim is verified, our logistics partners (Blue Dart, Delhivery, DTDC) will collect the safely packed parcel directly from your doorstep with zero reverse shipping fees.",
      },
      {
        category: "Return & Exchange Policy",
        question: "How fast will my exchange item be dispatched?",
        answer: "Once your reverse pickup is initiated or damage claim verified with unboxing video proof, your fresh replacement murti is dispatched via Express Air Courier within 24 hours with live WhatsApp tracking updates.",
      },
      {
        category: "Return & Exchange Policy",
        question: "How and when are refunds processed?",
        answer: "All MurtiPuja orders are 100% prepaid. Approved refunds are processed directly via Razorpay back to your original source payment method (Bank Account, UPI, or Card) within 24 to 48 hours of warehouse inspection.",
      },
      {
        category: "Return & Exchange Policy",
        question: "Can I exchange for a larger size or a different deity sculpture?",
        answer: "Yes! You can exchange for any available size or finish variant. If there is a price difference, our concierge team will share a direct secure Razorpay payment link or instantly refund any surplus amount.",
      },
    ],
    body: `### 1. 7-Day Trial & Exchange Window
Every MurtiPuja sculpture is covered by our 7-Day Trial & Exchange Guarantee. You have 7 full calendar days from the exact delivery timestamp to file an exchange for size, variant, or finish on our Return Claim Portal.

### 2. Compulsory Unboxing Video Guidelines
Because sacred spiritual idols are precision 3D-sculpted with micro-fine details, an unboxing video is strictly mandatory to validate courier transit handling and approve claims immediately.
1. Start Before Unsealing: Video must start before cutting the outer courier tape.
2. Show Shipping Label: Ensure AWB barcode and recipient details are visible.
3. Single Continuous Shot: No video cuts, pauses, or edits permitted during unpacking.
4. Inspect on Camera: Carefully lift the idol from foam inserts and inspect.

### 3. 100% Free Doorstep Reverse Pickup
You never pay for reverse shipping on verified claims. Our logistics partners (Blue Dart, Delhivery, DTDC) will arrive at your address with a pre-printed AWB within 24–48 hours of claim registration.

### 4. Product Condition & Eligibility
- The deity sculpture must be unused, clean, and in original brand-new physical condition.
- All original packaging materials, shockproof foam inserts, certificates, and accessories must be safely returned.
- Custom bespoke deity orders with personalized devotional engravings cannot be returned for cash refunds unless transit-damaged.

### 5. 100% Prepaid Model & Razorpay Refund Settlement
MurtiPuja operates exclusively on a 100% prepaid model to ensure expedited air dispatch. Approved refunds are credited directly back to the original source payment method (Bank Account, UPI, or Card via 256-bit SSL Razorpay) within 24 to 48 hours of warehouse reception.`,
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

// POST /api/pages/:slug/reset-default (Admin / Reset)
async function resetPageToDefault(req, res) {
  try {
    const slug = req.params.slug.toLowerCase().trim();
    const defaultData = DEFAULT_PAGES[slug];
    if (!defaultData) {
      return res.status(404).json({ success: false, message: `Default data for '${slug}' not found` });
    }

    const page = await PageContent.findOneAndUpdate(
      { slug },
      { $set: defaultData },
      { new: true, upsert: true }
    );

    res.status(200).json({
      success: true,
      message: `Page '${page.title || slug}' reset to default template successfully!`,
      data: page,
    });
  } catch (err) {
    console.error("Reset page error:", err);
    res.status(500).json({ success: false, message: "Failed to reset page: " + err.message });
  }
}

// POST /api/pages/reset-all-defaults (Admin / Bulk Reset)
async function resetAllPagesToDefaults(req, res) {
  try {
    const results = [];
    for (const [slug, def] of Object.entries(DEFAULT_PAGES)) {
      const page = await PageContent.findOneAndUpdate(
        { slug },
        { $set: def },
        { new: true, upsert: true }
      );
      results.push(page);
    }

    res.status(200).json({
      success: true,
      message: "All dynamic pages have been updated/reset with full default static content!",
      data: results,
    });
  } catch (err) {
    console.error("Reset all pages error:", err);
    res.status(500).json({ success: false, message: "Failed to reset all pages: " + err.message });
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
  resetPageToDefault,
  resetAllPagesToDefaults,
  updatePageBySlug,
  DEFAULT_PAGES,
};

