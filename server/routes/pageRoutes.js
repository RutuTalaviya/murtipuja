const express = require("express");
const router = express.Router();
const { getPageBySlug, getAllPages, updatePageBySlug } = require("../controllers/pageController");
const { verifyToken, requireAdmin } = require("../middleware/authMiddleware");

// Public routes
router.get("/", getAllPages);
router.get("/:slug", getPageBySlug);

// Admin protected route
router.put("/:slug", verifyToken, requireAdmin, updatePageBySlug);

module.exports = router;
