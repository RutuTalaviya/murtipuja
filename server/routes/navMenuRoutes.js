const express = require("express");
const router = express.Router();
const {
  getPublicNavMenu,
  getAdminNavMenu,
  createNavMenuItem,
  updateNavMenuItem,
  deleteNavMenuItem,
  reorderNavMenuItems,
} = require("../controllers/navMenuController");
const { protect, adminOnly } = require("../middleware/auth");

// Public route for frontend navbar
router.get("/nav-menu", getPublicNavMenu);

// Admin protected routes for navbar management
router.get("/admin/nav-menu", protect, adminOnly, getAdminNavMenu);
router.post("/admin/nav-menu", protect, adminOnly, createNavMenuItem);
router.put("/admin/nav-menu/reorder", protect, adminOnly, reorderNavMenuItems);
router.put("/admin/nav-menu/:id", protect, adminOnly, updateNavMenuItem);
router.delete("/admin/nav-menu/:id", protect, adminOnly, deleteNavMenuItem);

module.exports = router;
