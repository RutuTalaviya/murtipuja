const express = require("express");
const router = express.Router();
const { getFinishes, createFinish, updateFinish, deleteFinish } = require("../controllers/finishController");
const { protect, adminOnly } = require("../middleware/auth");

router.get("/", getFinishes);
router.post("/", protect, adminOnly, createFinish);
router.put("/:id", protect, adminOnly, updateFinish);
router.delete("/:id", protect, adminOnly, deleteFinish);

module.exports = router;
