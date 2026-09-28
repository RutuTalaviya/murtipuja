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
require("./models/PageContent");
require("./models/Tag");
require("./models/Purpose");

const categoryRoutes = require("./routes/categoryRoutes");
const finishRoutes = require("./routes/finishRoutes");
const tagRoutes = require("./routes/tagRoutes");
const purposeRoutes = require("./routes/purposeRoutes");
const navMenuRoutes = require("./routes/navMenuRoutes");
const bannerRoutes = require("./routes/bannerRoutes");
const videoRoutes = require("./routes/videoRoutes");
const pageRoutes = require("./routes/pageRoutes");

connectDB();


const app = express();

const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:3001",
  "https://murtipuja.com",
  "https://www.murtipuja.com",
  "http://murtipuja.com",
  "http://www.murtipuja.com",
  process.env.CLIENT_URL,
  process.env.CORS_ORIGIN,
].filter(Boolean);

const corsOptions = {
  origin: function (origin, callback) {
    if (
      !origin ||
      allowedOrigins.includes(origin) ||
      /^https?:\/\/(.+\.)?murtipuja\.com$/.test(origin)
    ) {
      callback(null, true);
    } else {
      callback(null, true); // Fallback allow to avoid unexpected lockouts
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "x-guest-id", "Accept"],
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));
app.use(express.json({ limit: "100mb" }));
app.use(express.urlencoded({ limit: "100mb", extended: true }));
// Serve static uploads directory from backend
const serverUploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(serverUploadsDir)) {
  fs.mkdirSync(serverUploadsDir, { recursive: true });
}
app.use("/uploads", express.static(serverUploadsDir));

// Also serve client public/uploads if exists (local dev support)
const clientUploadsDir = path.join(__dirname, "../client/public/uploads");
if (fs.existsSync(clientUploadsDir)) {
  app.use("/uploads", express.static(clientUploadsDir));
}

// POST upload route (saves to server/uploads and mirrors to client/public/uploads)
app.post("/api/upload", (req, res) => {
  try {
    const { filename, base64 } = req.body;
    if (!filename || !base64) {
      return res.status(400).json({ message: "Filename and base64 data are required" });
    }

    if (!fs.existsSync(serverUploadsDir)) {
      fs.mkdirSync(serverUploadsDir, { recursive: true });
    }

    const fileExt = path.extname(filename);
    const baseName = path.basename(filename, fileExt).replace(/[^a-zA-Z0-9]/g, "_");
    const uniqueFilename = `${baseName}_${Date.now()}${fileExt}`;
    const filepath = path.join(serverUploadsDir, uniqueFilename);

    const buffer = Buffer.from(base64, "base64");
    fs.writeFileSync(filepath, buffer);

    // Mirror to client public/uploads if directory exists (dev convenience)
    try {
      if (fs.existsSync(path.join(__dirname, "../client/public"))) {
        if (!fs.existsSync(clientUploadsDir)) {
          fs.mkdirSync(clientUploadsDir, { recursive: true });
        }
        fs.writeFileSync(path.join(clientUploadsDir, uniqueFilename), buffer);
      }
    } catch (mirrorErr) {
      // Ignore mirror error on production VPS
    }

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
app.use("/api/tags", tagRoutes);
app.use("/api/purposes", purposeRoutes);
app.use("/api/finishes", finishRoutes);
app.use("/api", orderRoutes);
app.use("/api/admin", offerRoutes);
app.use("/api", navMenuRoutes);
app.use("/api", bannerRoutes);
app.use("/api", videoRoutes);
app.use("/api/pages", pageRoutes);

app.use(notFound);

app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`MurtiPuja API running on port ${PORT} [${process.env.NODE_ENV || "development"}]`);
});
