const express = require("express");
const router = express.Router();
const {
  getPageBySlug,
  getAllPages,
  updatePageBySlug,
  resetPageToDefault,
  resetAllPagesToDefaults,
} = require("../controllers/pageController");
const { protect, adminOnly } = require("../middleware/auth");

// Public routes
router.get("/", getAllPages);
router.get("/:slug", getPageBySlug);

// Admin protected routes
router.put("/:slug", protect, adminOnly, updatePageBySlug);
router.post("/reset-all-defaults", protect, adminOnly, resetAllPagesToDefaults);
router.post("/:slug/reset-default", protect, adminOnly, resetPageToDefault);

module.exports = router;

