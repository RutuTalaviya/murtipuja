const express = require("express");
const router = express.Router();
const { getCart, addToCart, updateCartItem, removeCartItem } = require("../controllers/cartController");
const { identifyCartOwner } = require("../middleware/cartOwner");

router.use(identifyCartOwner);

router.get("/", getCart);
router.post("/add", addToCart);
router.put("/item/:itemId", updateCartItem);
router.delete("/item/:itemId", removeCartItem);

module.exports = router;
