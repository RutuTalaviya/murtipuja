const express = require("express");
const router = express.Router();
const { getPageBySlug, getAllPages, updatePageBySlug } = require("../controllers/pageController");
const { protect, adminOnly } = require("../middleware/auth");

// Public routes
router.get("/", getAllPages);
router.get("/:slug", getPageBySlug);

// Admin protected route
router.put("/:slug", protect, adminOnly, updatePageBySlug);

module.exports = router;
