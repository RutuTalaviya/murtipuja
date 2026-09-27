const express = require("express");
const router = express.Router();
const {
  getTags,
  createTag,
  updateTag,
  deleteTag,
} = require("../controllers/tagController");
const { protect, adminOnly } = require("../middleware/auth");

router.route("/")
  .get(getTags)
  .post(protect, adminOnly, createTag);

router.route("/:id")
  .put(protect, adminOnly, updateTag)
  .delete(protect, adminOnly, deleteTag);

module.exports = router;
