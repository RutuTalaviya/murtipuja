const Razorpay = require("razorpay");

// Initialize Razorpay client. In local/development, we default to placeholders
// to avoid crashes if credentials aren't set yet.
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || "rzp_test_placeholder",
  key_secret: process.env.RAZORPAY_KEY_SECRET || "rzp_test_secret_placeholder",
});

module.exports = razorpay;
