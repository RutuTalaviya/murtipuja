const jwt = require("jsonwebtoken");
const User = require("../models/User");

/**
 * Doesn't reject the request like `protect` does — instead it figures out
 * who this cart belongs to, either:
 *  - req.cartOwner = { user: <userId> }   if a valid JWT is present, or
 *  - req.cartOwner = { guestId: <id> }    if an `x-guest-id` header is present
 * The frontend generates a random guestId (e.g. via crypto.randomUUID())
 * and stores it in localStorage before the user logs in, so the cart
 * persists across page reloads even for guests.
 */
async function identifyCartOwner(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id);
      if (user) {
        req.cartOwner = { user: user._id };
        req.user = user;
        return next();
      }
    }

    const guestId = req.headers["x-guest-id"];
    if (guestId) {
      req.cartOwner = { guestId };
      return next();
    }

    return res.status(400).json({
      message: "Missing auth token or x-guest-id header — cannot identify cart",
    });
  } catch (error) {
    // Invalid/expired token — fall back to guest cart if a guestId was also sent
    const guestId = req.headers["x-guest-id"];
    if (guestId) {
      req.cartOwner = { guestId };
      return next();
    }
    return res.status(401).json({ message: "Invalid session" });
  }
}

module.exports = { identifyCartOwner };
