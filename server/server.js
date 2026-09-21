require("dotenv").config();
const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const connectDB = require("./config/db");
const { notFound, errorHandler } = require("./middleware/errorHandler");
const authRoutes = require("./routes/authRoutes");
const productRoutes = require("./routes/productRoutes");
const cartRoutes = require("./routes/cartRoutes");
const orderRoutes = require("./routes/orderRoutes");
const offerRoutes = require("./routes/offerRoutes");

// Register all mongoose models at startup
require("./models/User");
require("./models/Category");
require("./models/Product");
require("./models/Otp");
require("./models/Cart");
require("./models/Order");
require("./models/Review");
require("./models/Coupon");
require("./models/Banner");
require("./models/Offer");
require("./models/ComboOffer");
require("./models/Finish");
require("./models/NavMenu");
require("./models/Video");

const categoryRoutes = require("./routes/categoryRoutes");
const finishRoutes = require("./routes/finishRoutes");
const navMenuRoutes = require("./routes/navMenuRoutes");
const bannerRoutes = require("./routes/bannerRoutes");
const videoRoutes = require("./routes/videoRoutes");

connectDB();


const app = express();

const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:3001",
  process.env.CORS_ORIGIN,
].filter(Boolean);

app.use(
  cors({
    origin: function (origin, callback) {
      // allow requests with no origin (like mobile apps or curl requests)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);
app.use(express.json({ limit: "100mb" }));
app.use(express.urlencoded({ limit: "100mb", extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "../client/public/uploads")));

// POST upload route (saves to client public/uploads)
app.post("/api/upload", (req, res) => {
  try {
    const { filename, base64 } = req.body;
    if (!filename || !base64) {
      return res.status(400).json({ message: "Filename and base64 data are required" });
    }

    const uploadDir = path.join(__dirname, "../client/public/uploads");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const fileExt = path.extname(filename);
    const baseName = path.basename(filename, fileExt).replace(/[^a-zA-Z0-9]/g, "_");
    const uniqueFilename = `${baseName}_${Date.now()}${fileExt}`;
    const filepath = path.join(uploadDir, uniqueFilename);

    const buffer = Buffer.from(base64, "base64");
    fs.writeFileSync(filepath, buffer);

    const relativeUrl = `/uploads/${uniqueFilename}`;
    return res.status(200).json({ url: relativeUrl });
  } catch (error) {
    console.error("Upload error:", error);
    return res.status(500).json({ message: "Server error during upload" });
  }
});

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/finishes", finishRoutes);
app.use("/api", orderRoutes);
app.use("/api/admin", offerRoutes);
app.use("/api", navMenuRoutes);
app.use("/api", bannerRoutes);
app.use("/api", videoRoutes);

app.use(notFound);

app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`MurtiPuja API running on port ${PORT} [${process.env.NODE_ENV || "development"}]`);
});
