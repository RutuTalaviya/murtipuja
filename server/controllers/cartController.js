const Cart = require("../models/Cart");
const Product = require("../models/Product");
const { calculateCartDiscounts } = require("../utils/discountCalculator");
const { sendWhatsAppMessage } = require("../utils/whatsappService");

async function findOrCreateCart(cartOwner) {
  const query = cartOwner.user ? { user: cartOwner.user } : { guestId: cartOwner.guestId };
  let cart = await Cart.findOne(query);
  if (!cart) {
    cart = await Cart.create({ ...query, items: [] });
  }
  return cart;
}

/** Helper to calculate discounts and return populated cart payload */
async function sendCartResponse(cart, couponCode, offerId, res) {
  const populated = await cart.populate(
    "items.product",
    "title slug images category deity variants basePrice"
  );
  const calculations = await calculateCartDiscounts(populated.items, couponCode, offerId);

  if (couponCode && calculations.couponError) {
    return res.status(400).json({ message: calculations.couponError, calculations });
  }

  if (offerId && calculations.offerError) {
    return res.status(400).json({ message: calculations.offerError, calculations });
  }

  const cartObj = populated.toObject();
  cartObj.calculations = calculations;
  return res.status(200).json(cartObj);
}

/** GET /api/cart */
async function getCart(req, res, next) {
  try {
    const { couponCode, offerId } = req.query;
    const cart = await findOrCreateCart(req.cartOwner);
    return await sendCartResponse(cart, couponCode, offerId, res);
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/cart/add
 * body: { productId, variantSku, quantity }
 */
async function addToCart(req, res, next) {
  try {
    const { productId, variantSku, quantity = 1 } = req.body;
    const { couponCode, offerId } = req.query; // optional coupon/offer propagation

    if (!productId || !variantSku) {
      return res.status(400).json({ message: "productId and variantSku are required" });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const variant = product.variants.find((v) => v.sku === variantSku);
    if (!variant) {
      return res.status(404).json({ message: "Selected variant not found" });
    }

    if (variant.stock < quantity) {
      return res.status(400).json({
        message: variant.stock === 0 ? "This variant is out of stock" : `Only ${variant.stock} left in stock`,
      });
    }

    const cart = await findOrCreateCart(req.cartOwner);
    const existingItem = cart.items.find((item) => item.variantSku === variantSku);

    if (existingItem) {
      const newQty = existingItem.quantity + quantity;
      if (newQty > variant.stock) {
        return res.status(400).json({ message: `Only ${variant.stock} left in stock` });
      }
      existingItem.quantity = newQty;
    } else {
      const priceAtAdd = Boolean(product.isOnSale && variant.discountPrice && variant.discountPrice < variant.price)
        ? variant.discountPrice
        : variant.price;

      cart.items.push({
        product: product._id,
        variantSku,
        quantity,
        priceAtAdd,
      });
    }

    await cart.save();

    // Send WhatsApp notification if user is logged in
    if (req.user && req.user.phone) {
      const messageText = `Hi ${req.user.name || "Customer"},\n\nYou have added "${product.title}" (SKU: ${variantSku}, Qty: ${quantity}) to your cart on MurtiPuja. 🛒\n\nCheck your cart here: http://localhost:3000/cart`;
      sendWhatsAppMessage(req.user.phone, messageText).catch((err) => {
        console.error("Failed to send WhatsApp cart notification:", err.message);
      });
    }

    return await sendCartResponse(cart, couponCode, offerId, res);
  } catch (error) {
    next(error);
  }
}

/**
 * PUT /api/cart/item/:itemId
 * body: { quantity }
 */
async function updateCartItem(req, res, next) {
  try {
    const { quantity } = req.body;
    const { couponCode, offerId } = req.query; // optional coupon/offer propagation
    if (!quantity || quantity < 1) {
      return res.status(400).json({ message: "Quantity must be at least 1" });
    }

    const cart = await findOrCreateCart(req.cartOwner);
    const item = cart.items.id(req.params.itemId);
    if (!item) {
      return res.status(404).json({ message: "Cart item not found" });
    }

    const product = await Product.findById(item.product);
    const variant = product?.variants.find((v) => v.sku === item.variantSku);
    if (variant && quantity > variant.stock) {
      return res.status(400).json({ message: `Only ${variant.stock} left in stock` });
    }

    item.quantity = quantity;
    await cart.save();
    return await sendCartResponse(cart, couponCode, offerId, res);
  } catch (error) {
    next(error);
  }
}

/** DELETE /api/cart/item/:itemId */
async function removeCartItem(req, res, next) {
  try {
    const { couponCode, offerId } = req.query; // optional coupon/offer propagation
    const cart = await findOrCreateCart(req.cartOwner);
    cart.items = cart.items.filter((item) => item._id.toString() !== req.params.itemId);
    await cart.save();
    return await sendCartResponse(cart, couponCode, offerId, res);
  } catch (error) {
    next(error);
  }
}

module.exports = { getCart, addToCart, updateCartItem, removeCartItem };

