const Banner = require("../models/Banner");

const DEFAULT_BANNERS = [
  {
    tagline: "⚡ DROP 01 // THE DIVINE SERIES",
    title: "DIVINITY.\nCRAFTED.",
    subtitle: "Micro-precision 3D printed spiritual idols engineered with 0.1mm accuracy for modern living spaces. Matte obsidian, sandstone, and metallic finishes.",
    imageUrl: "/images/shiva.png",
    ctaText: "Shop the Drop",
    ctaLink: "/products",
    secondaryCtaText: "The Design Lab",
    secondaryCtaLink: "/products",
    badge: "LIMITED LAB EDITIONS",
    position: "hero",
    order: 1,
    isActive: true,
  },
  {
    tagline: "✦ SACRED CRAFT // GANESHA EDITION",
    title: "AUSPICIOUS BEGINNINGS.\nSCULPTED.",
    subtitle: "Minimalist Lord Ganesha murti finished in premium obsidian matte and aged brass tones. Designed for homes, workspaces, and car dashboards.",
    imageUrl: "/images/ganesh.png",
    ctaText: "Explore Ganesha",
    ctaLink: "/products",
    secondaryCtaText: "View All Finishes",
    secondaryCtaLink: "/products",
    badge: "BESTSELLER",
    position: "hero",
    order: 2,
    isActive: true,
  },
  {
    tagline: "🔱 MAHASHAKTI // DIVINE PROTECTION",
    title: "POWER & DEVOTION.\nELEVATED.",
    subtitle: "Experience transcendental grace with our handcrafted Krishna and Hanuman sacred idols. Built for generations of mindful veneration.",
    imageUrl: "/images/krishna.jpg",
    ctaText: "Shop Divine Series",
    ctaLink: "/products",
    secondaryCtaText: "Explore Combos",
    secondaryCtaLink: "/products",
    badge: "FESTIVE DROP",
    position: "hero",
    order: 3,
    isActive: true,
  },
];

// @desc    Get active banners for public homepage
// @route   GET /api/banners
// @access  Public
exports.getPublicBanners = async (req, res) => {
  try {
    let count = await Banner.countDocuments();
    if (count === 0) {
      await Banner.insertMany(DEFAULT_BANNERS);
    }

    const query = { isActive: true };
    if (req.query.position) {
      query.position = req.query.position;
    }

    const banners = await Banner.find(query).sort({ order: 1, createdAt: -1 });
    res.json({ success: true, data: banners });
  } catch (error) {
    console.error("Error fetching public banners:", error);
    res.status(500).json({ success: false, message: "Failed to fetch banners" });
  }
};

// @desc    Get all banners for admin panel
// @route   GET /api/admin/banners
// @access  Private/Admin
exports.getAdminBanners = async (req, res) => {
  try {
    let count = await Banner.countDocuments();
    if (count === 0) {
      await Banner.insertMany(DEFAULT_BANNERS);
    }

    const banners = await Banner.find().sort({ order: 1, createdAt: -1 });
    res.json({ success: true, data: banners });
  } catch (error) {
    console.error("Error fetching admin banners:", error);
    res.status(500).json({ success: false, message: "Failed to fetch banners for admin" });
  }
};

// @desc    Create a new banner
// @route   POST /api/admin/banners
// @access  Private/Admin
exports.createBanner = async (req, res) => {
  try {
    const {
      tagline,
      title,
      subtitle,
      imageUrl,
      videoUrl,
      ctaText,
      ctaLink,
      secondaryCtaText,
      secondaryCtaLink,
      badge,
      position,
      order,
      isActive,
    } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, message: "Banner title is required" });
    }

    const newBanner = new Banner({
      tagline: tagline ? tagline.trim() : "",
      title: title.trim(),
      subtitle: subtitle ? subtitle.trim() : "",
      imageUrl: imageUrl ? imageUrl.trim() : "",
      videoUrl: videoUrl ? videoUrl.trim() : "",
      ctaText: ctaText ? ctaText.trim() : "Shop the Drop",
      ctaLink: ctaLink ? ctaLink.trim() : "/products",
      secondaryCtaText: secondaryCtaText ? secondaryCtaText.trim() : "",
      secondaryCtaLink: secondaryCtaLink ? secondaryCtaLink.trim() : "",
      badge: badge ? badge.trim() : "",
      position: position || "hero",
      order: order !== undefined ? Number(order) : 0,
      isActive: isActive !== undefined ? Boolean(isActive) : true,
    });

    await newBanner.save();
    res.status(201).json({ success: true, data: newBanner });
  } catch (error) {
    console.error("Error creating banner:", error);
    res.status(500).json({ success: false, message: error.message || "Failed to create banner" });
  }
};

// @desc    Update an existing banner
// @route   PUT /api/admin/banners/:id
// @access  Private/Admin
exports.updateBanner = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      tagline,
      title,
      subtitle,
      imageUrl,
      videoUrl,
      ctaText,
      ctaLink,
      secondaryCtaText,
      secondaryCtaLink,
      badge,
      position,
      order,
      isActive,
    } = req.body;

    const banner = await Banner.findById(id);
    if (!banner) {
      return res.status(404).json({ success: false, message: "Banner not found" });
    }

    if (tagline !== undefined) banner.tagline = tagline.trim();
    if (title !== undefined) banner.title = title.trim();
    if (subtitle !== undefined) banner.subtitle = subtitle.trim();
    if (imageUrl !== undefined) banner.imageUrl = imageUrl.trim();
    if (videoUrl !== undefined) banner.videoUrl = videoUrl.trim();
    if (ctaText !== undefined) banner.ctaText = ctaText.trim();
    if (ctaLink !== undefined) banner.ctaLink = ctaLink.trim();
    if (secondaryCtaText !== undefined) banner.secondaryCtaText = secondaryCtaText.trim();
    if (secondaryCtaLink !== undefined) banner.secondaryCtaLink = secondaryCtaLink.trim();
    if (badge !== undefined) banner.badge = badge.trim();
    if (position !== undefined) banner.position = position;
    if (order !== undefined) banner.order = Number(order);
    if (isActive !== undefined) banner.isActive = Boolean(isActive);

    await banner.save();
    res.json({ success: true, data: banner });
  } catch (error) {
    console.error("Error updating banner:", error);
    res.status(500).json({ success: false, message: error.message || "Failed to update banner" });
  }
};

// @desc    Delete a banner
// @route   DELETE /api/admin/banners/:id
// @access  Private/Admin
exports.deleteBanner = async (req, res) => {
  try {
    const { id } = req.params;
    const banner = await Banner.findByIdAndDelete(id);
    if (!banner) {
      return res.status(404).json({ success: false, message: "Banner not found" });
    }
    res.json({ success: true, message: "Banner deleted successfully" });
  } catch (error) {
    console.error("Error deleting banner:", error);
    res.status(500).json({ success: false, message: "Failed to delete banner" });
  }
};

// @desc    Reorder banners
// @route   PUT /api/admin/banners/reorder
// @access  Private/Admin
exports.reorderBanners = async (req, res) => {
  try {
    const { items } = req.body; // Array of { id, order }
    if (!Array.isArray(items)) {
      return res.status(400).json({ success: false, message: "Items array is required" });
    }

    const updates = items.map((item) =>
      Banner.findByIdAndUpdate(item.id, { order: item.order })
    );
    await Promise.all(updates);

    const updatedList = await Banner.find().sort({ order: 1, createdAt: -1 });
    res.json({ success: true, data: updatedList });
  } catch (error) {
    console.error("Error reordering banners:", error);
    res.status(500).json({ success: false, message: "Failed to reorder banners" });
  }
};
