const express = require("express");
const router = express.Router();
const {
  getProducts,
  getProductBySlug,
  createProduct,
  updateProduct,
  deleteProduct,
  getAvailableTags,
  getAvailableDeities,
} = require("../controllers/productController");
const { protect, adminOnly } = require("../middleware/auth");

router.get("/tags", getAvailableTags);
router.get("/deities", getAvailableDeities);
router.get("/", getProducts);
router.get("/:slug", getProductBySlug);
router.post("/", protect, adminOnly, createProduct);
router.put("/:id", protect, adminOnly, updateProduct);
router.delete("/:id", protect, adminOnly, deleteProduct);

module.exports = router;

