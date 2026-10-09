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

const { syncExpiredPromotions } = require("./utils/promotionExpirySync");
const { autoSyncActiveDelhiveryOrders } = require("./utils/delhivery");

connectDB().then(() => {
  syncExpiredPromotions();
  // Auto-sync expired promotions every 60 seconds
  setInterval(syncExpiredPromotions, 60 * 1000);

  // Auto-sync live Delhivery in-transit shipments in background every 30 minutes
  autoSyncActiveDelhiveryOrders();
  setInterval(autoSyncActiveDelhiveryOrders, 30 * 60 * 1000);
});


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
let sharp = null;
try {
  sharp = require("sharp");
} catch (e) {
  console.warn("sharp image compression library not loaded, using fallback:", e.message);
}

// Serve static uploads directory from backend with 30-day cache headers
const serverUploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(serverUploadsDir)) {
  fs.mkdirSync(serverUploadsDir, { recursive: true });
}

const staticUploadOptions = {
  maxAge: "30d",
  immutable: true,
  etag: true,
  lastModified: true,
  setHeaders: (res) => {
    res.setHeader("Cache-Control", "public, max-age=2592000, immutable");
  },
};

app.use("/uploads", express.static(serverUploadsDir, staticUploadOptions));

// Also serve client public/uploads if exists (local dev support)
const clientUploadsDir = path.join(__dirname, "../client/public/uploads");
if (fs.existsSync(clientUploadsDir)) {
  app.use("/uploads", express.static(clientUploadsDir, staticUploadOptions));
}

// POST upload route (supports both /api/upload and /upload)
app.post(["/api/upload", "/upload"], async (req, res) => {
  try {
    const { filename, base64 } = req.body;
    if (!filename || !base64) {
      return res.status(400).json({ message: "Filename and base64 data are required" });
    }

    if (!fs.existsSync(serverUploadsDir)) {
      fs.mkdirSync(serverUploadsDir, { recursive: true });
    }

    const fileExt = path.extname(filename).toLowerCase();
    const baseName = path.basename(filename, fileExt).replace(/[^a-zA-Z0-9]/g, "_").slice(0, 50);
    const rawBuffer = Buffer.from(base64, "base64");

    const imageExts = [".jpg", ".jpeg", ".png", ".webp", ".avif", ".bmp", ".tiff", ".gif"];
    const isImage = imageExts.includes(fileExt);

    let finalBuffer = rawBuffer;
    let savedFilename = `${baseName}_${Date.now()}${fileExt || ".jpg"}`;

    if (isImage && sharp) {
      try {
        // Compress image to WebP with max 1600px width/height and quality 80
        finalBuffer = await sharp(rawBuffer)
          .rotate() // auto-orient based on EXIF
          .resize({
            width: 1600,
            height: 1600,
            fit: "inside",
            withoutEnlargement: true,
          })
          .webp({ quality: 80, effort: 4 })
          .toBuffer();

        savedFilename = `${baseName}_${Date.now()}.webp`;
        console.log(`[Image Upload] Optimized ${filename} (${(rawBuffer.length / 1024).toFixed(1)} KB -> ${(finalBuffer.length / 1024).toFixed(1)} KB WebP)`);
      } catch (sharpError) {
        console.warn("Sharp compression failed, falling back to raw buffer:", sharpError.message);
        finalBuffer = rawBuffer;
      }
    } else if (isImage) {
      savedFilename = `${baseName}_${Date.now()}${fileExt || ".jpg"}`;
    } else {
      // Video or other media
      savedFilename = `${baseName}_${Date.now()}${fileExt || ".mp4"}`;
    }

    const filepath = path.join(serverUploadsDir, savedFilename);
    fs.writeFileSync(filepath, finalBuffer);

    // Mirror to client public/uploads if directory exists (dev convenience)
    try {
      if (fs.existsSync(path.join(__dirname, "../client/public"))) {
        if (!fs.existsSync(clientUploadsDir)) {
          fs.mkdirSync(clientUploadsDir, { recursive: true });
        }
        fs.writeFileSync(path.join(clientUploadsDir, savedFilename), finalBuffer);
      }
    } catch (mirrorErr) {
      // Ignore mirror error on production VPS
    }

    const relativeUrl = `/uploads/${savedFilename}`;
    return res.status(200).json({ url: relativeUrl });
  } catch (error) {
    console.error("Upload error:", error);
    return res.status(500).json({ message: "Server error during upload" });
  }
});

app.get(["/api/health", "/health"], (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Mount routes with /api prefix (standard direct calls)
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

// ALSO mount routes without /api prefix (for Nginx reverse proxies that strip /api)
app.use("/auth", authRoutes);
app.use("/products", productRoutes);
app.use("/cart", cartRoutes);
app.use("/categories", categoryRoutes);
app.use("/tags", tagRoutes);
app.use("/purposes", purposeRoutes);
app.use("/finishes", finishRoutes);
app.use("/admin", offerRoutes);
app.use("/", orderRoutes);
app.use("/", navMenuRoutes);
app.use("/", bannerRoutes);
app.use("/", videoRoutes);
app.use("/pages", pageRoutes);

app.use(notFound);

app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`MurtiPuja API running on port ${PORT} [${process.env.NODE_ENV || "development"}]`);
});
