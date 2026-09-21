const express = require("express");
const router = express.Router();
const {
  getPublicVideos,
  getAdminVideos,
  createVideo,
  updateVideo,
  deleteVideo,
  reorderVideos,
} = require("../controllers/videoController");
const { protect, adminOnly } = require("../middleware/auth");

// Public route for video reels
router.get("/videos", getPublicVideos);

// Admin protected routes for video reels management
router.get("/admin/videos", protect, adminOnly, getAdminVideos);
router.post("/admin/videos", protect, adminOnly, createVideo);
router.put("/admin/videos/reorder", protect, adminOnly, reorderVideos);
router.put("/admin/videos/:id", protect, adminOnly, updateVideo);
router.delete("/admin/videos/:id", protect, adminOnly, deleteVideo);

module.exports = router;
