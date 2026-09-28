const express = require("express");
const router = express.Router();
const {
  getPurposes,
  createPurpose,
  updatePurpose,
  deletePurpose,
} = require("../controllers/purposeController");
const { protect, adminOnly } = require("../middleware/auth");

router.get("/", getPurposes);
router.post("/", protect, adminOnly, createPurpose);
router.put("/:id", protect, adminOnly, updatePurpose);
router.delete("/:id", protect, adminOnly, deletePurpose);

module.exports = router;
