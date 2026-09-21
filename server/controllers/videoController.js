const Video = require("../models/Video");

// Default sample reels if database is empty
const DEFAULT_VIDEOS = [
  {
    _id: "sample-reel-1",
    title: "Obsidian Shiva 3D Carving",
    tagline: "Micro-Precision SLA Layering",
    videoUrl: "/videos/reel-1.mp4",
    thumbnailUrl: "/images/shiva.png",
    badge: "0.1MM TIMELAPSE",
    productLink: "/products?deity=Shiva",
    duration: "0:45",
    order: 1,
    isActive: true,
  },
  {
    _id: "sample-reel-2",
    title: "Lord Ganesha Sandstone Finish",
    tagline: "Hand-Polishing Sacred Details",
    videoUrl: "/videos/reel-2.mp4",
    thumbnailUrl: "/images/ganesh.png",
    badge: "ARTISAN CRAFT",
    productLink: "/products?deity=Ganesh",
    duration: "0:38",
    order: 2,
    isActive: true,
  },
  {
    _id: "sample-reel-3",
    title: "Krishna Divine Flute Detailing",
    tagline: "Microscopic Temple Carvings",
    videoUrl: "/videos/reel-3.mp4",
    thumbnailUrl: "/images/krishna.jpg",
    badge: "4K CLOSEUP",
    productLink: "/products?deity=Krishna",
    duration: "0:52",
    order: 3,
    isActive: true,
  },
  {
    _id: "sample-reel-4",
    title: "Mahabali Hanuman Solid Infill",
    tagline: "High-Density Sandstone Core",
    videoUrl: "/videos/reel-4.mp4",
    thumbnailUrl: "/images/hanuman.jpg",
    badge: "SOLID INFILL",
    productLink: "/products?deity=Hanuman",
    duration: "0:30",
    order: 4,
    isActive: true,
  },
  {
    _id: "sample-reel-5",
    title: "Maa Durga Trishul Assembly",
    tagline: "Sacred Iconography Precision",
    videoUrl: "/videos/reel-5.mp4",
    thumbnailUrl: "/images/durga.jpg",
    badge: "MAHASHAKTI",
    productLink: "/products?deity=Durga",
    duration: "0:40",
    order: 5,
    isActive: true,
  },
  {
    _id: "sample-reel-6",
    title: "Unboxing & Zero-Breakage Packaging",
    tagline: "5-Ply Insured Transit Guarantee",
    videoUrl: "/videos/reel-6.mp4",
    thumbnailUrl: "/images/shiva_close.png",
    badge: "INSURED TRANSIT",
    productLink: "/shipping-policy",
    duration: "0:35",
    order: 6,
    isActive: true,
  },
  {
    _id: "sample-reel-7",
    title: "Artisan Gold Leaf Detailing",
    tagline: "Hand-Applied Sacred Gold Accent",
    videoUrl: "/videos/reel-7.mp4",
    thumbnailUrl: "/images/ganesh_alt.png",
    badge: "GOLD ACCENT",
    productLink: "/products",
    duration: "0:48",
    order: 7,
    isActive: true,
  },
];

// Public: GET active videos
exports.getPublicVideos = async (req, res) => {
  try {
    const videos = await Video.find({ isActive: true }).sort({ order: 1, createdAt: -1 });
    if (!videos || videos.length === 0) {
      return res.status(200).json({ success: true, count: DEFAULT_VIDEOS.length, data: DEFAULT_VIDEOS });
    }
    return res.status(200).json({ success: true, count: videos.length, data: videos });
  } catch (error) {
    console.error("Error in getPublicVideos:", error);
    return res.status(200).json({ success: true, count: DEFAULT_VIDEOS.length, data: DEFAULT_VIDEOS });
  }
};

// Admin: GET all videos
exports.getAdminVideos = async (req, res) => {
  try {
    const videos = await Video.find().sort({ order: 1, createdAt: -1 });
    return res.status(200).json({ success: true, count: videos.length, data: videos });
  } catch (error) {
    console.error("Error in getAdminVideos:", error);
    return res.status(500).json({ success: false, message: "Server error fetching admin videos" });
  }
};

// Admin: POST create video
exports.createVideo = async (req, res) => {
  try {
    const { title, tagline, videoUrl, thumbnailUrl, badge, productLink, duration, order, isActive } = req.body;

    if (!title || !videoUrl) {
      return res.status(400).json({ success: false, message: "Title and Video URL are required" });
    }

    const totalVideos = await Video.countDocuments();
    const newVideo = await Video.create({
      title: title.trim(),
      tagline: tagline ? tagline.trim() : "",
      videoUrl: videoUrl.trim(),
      thumbnailUrl: thumbnailUrl ? thumbnailUrl.trim() : "",
      badge: badge ? badge.trim() : "4K REEL",
      productLink: productLink ? productLink.trim() : "/products",
      duration: duration ? duration.trim() : "0:30",
      order: order !== undefined ? Number(order) : totalVideos + 1,
      isActive: isActive !== undefined ? Boolean(isActive) : true,
    });

    return res.status(201).json({ success: true, message: "Video created successfully", data: newVideo });
  } catch (error) {
    console.error("Error in createVideo:", error);
    return res.status(500).json({ success: false, message: "Server error creating video" });
  }
};

// Admin: PUT update video
exports.updateVideo = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, tagline, videoUrl, thumbnailUrl, badge, productLink, duration, order, isActive } = req.body;

    const video = await Video.findById(id);
    if (!video) {
      return res.status(404).json({ success: false, message: "Video not found" });
    }

    if (title !== undefined) video.title = title.trim();
    if (tagline !== undefined) video.tagline = tagline.trim();
    if (videoUrl !== undefined) video.videoUrl = videoUrl.trim();
    if (thumbnailUrl !== undefined) video.thumbnailUrl = thumbnailUrl.trim();
    if (badge !== undefined) video.badge = badge.trim();
    if (productLink !== undefined) video.productLink = productLink.trim();
    if (duration !== undefined) video.duration = duration.trim();
    if (order !== undefined) video.order = Number(order);
    if (isActive !== undefined) video.isActive = Boolean(isActive);

    const updatedVideo = await video.save();
    return res.status(200).json({ success: true, message: "Video updated successfully", data: updatedVideo });
  } catch (error) {
    console.error("Error in updateVideo:", error);
    return res.status(500).json({ success: false, message: "Server error updating video" });
  }
};

// Admin: DELETE video
exports.deleteVideo = async (req, res) => {
  try {
    const { id } = req.params;
    const video = await Video.findByIdAndDelete(id);
    if (!video) {
      return res.status(404).json({ success: false, message: "Video not found" });
    }
    return res.status(200).json({ success: true, message: "Video deleted successfully", data: { _id: id } });
  } catch (error) {
    console.error("Error in deleteVideo:", error);
    return res.status(500).json({ success: false, message: "Server error deleting video" });
  }
};

// Admin: PUT bulk reorder
exports.reorderVideos = async (req, res) => {
  try {
    const { items } = req.body;
    if (!Array.isArray(items)) {
      return res.status(400).json({ success: false, message: "Invalid payload: items array required" });
    }

    const updates = items.map((item, index) =>
      Video.findByIdAndUpdate(item.id || item._id, { order: index + 1 }, { new: true })
    );

    await Promise.all(updates);
    const updatedVideos = await Video.find().sort({ order: 1 });
    return res.status(200).json({ success: true, message: "Videos reordered successfully", data: updatedVideos });
  } catch (error) {
    console.error("Error in reorderVideos:", error);
    return res.status(500).json({ success: false, message: "Server error reordering videos" });
  }
};
