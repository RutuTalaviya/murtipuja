const express = require("express");
const router = express.Router();
const {
  getPublicBanners,
  getAdminBanners,
  createBanner,
  updateBanner,
  deleteBanner,
  reorderBanners,
} = require("../controllers/bannerController");
const { protect, adminOnly } = require("../middleware/auth");

// Public route for homepage banners
router.get("/banners", getPublicBanners);

// Admin protected routes for banner management
router.get("/admin/banners", protect, adminOnly, getAdminBanners);
router.post("/admin/banners", protect, adminOnly, createBanner);
router.put("/admin/banners/reorder", protect, adminOnly, reorderBanners);
router.put("/admin/banners/:id", protect, adminOnly, updateBanner);
router.delete("/admin/banners/:id", protect, adminOnly, deleteBanner);

module.exports = router;
