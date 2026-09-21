/**
 * Run with: node seed.js
 * Populates a few sample categories + products (with variants) so you can
 * actually see the listing/detail pages working locally before building
 * out the admin panel (which comes in a later phase).
 */
require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("./config/db");
const Category = require("./models/Category");
const Product = require("./models/Product");
const Coupon = require("./models/Coupon");
const Offer = require("./models/Offer");
const ComboOffer = require("./models/ComboOffer");
const Finish = require("./models/Finish");

const finishes = [
  { name: "Matte Black", slug: "matte-black", colorCode: "#000000" },
  { name: "Antique Bronze", slug: "antique-bronze", colorCode: "#804A00" },
  { name: "Ivory White", slug: "ivory-white", colorCode: "#FFFFFF" },
  { name: "Gold Leaf", slug: "gold-leaf", colorCode: "#D4AF37" },
  { name: "Silver", slug: "silver", colorCode: "#C0C0C0" },
  { name: "Copper", slug: "copper", colorCode: "#B87333" },
];

const categories = [
  { name: "Shiva", slug: "shiva" },
  { name: "Ganesh", slug: "ganesh" },
  { name: "Krishna", slug: "krishna" },
  { name: "Hanuman", slug: "hanuman" },
  { name: "Durga", slug: "durga" },
  { name: "Saraswati", slug: "saraswati" },
];

async function seed() {
  await connectDB();

  await Category.deleteMany({});
  await Product.deleteMany({});
  await Coupon.deleteMany({});
  await Offer.deleteMany({});
  await ComboOffer.deleteMany({});
  await Finish.deleteMany({});

  await Finish.insertMany(finishes);
  const createdCategories = await Category.insertMany(categories);
  const shivaCategory = createdCategories.find((c) => c.slug === "shiva");
  const ganeshCategory = createdCategories.find((c) => c.slug === "ganesh");

  const createdProducts = await Product.create([
    {
      title: "Meditating Shiva Murti",
      slug: "meditating-shiva-murti",
      description:
        "A finely 3D-printed murti of Lord Shiva in deep meditation, seated on a rock with a serpent coiled around his neck and the crescent moon in his hair. Finished by hand in a matte black stone-effect coating.",
      category: [shivaCategory._id],
      deity: "Shiva",
      material: "Resin (3D Printed)",
      purpose: ["pooja-room", "gifting", "home-decor"],
      images: [
        { url: "/images/shiva.png", alt: "Meditating Shiva Murti" },
        { url: "/images/shiva_close.png", alt: "Meditating Shiva Murti Close-up" }
      ],
      videos: [],
      basePrice: 1499,
      isFeatured: true,
      tags: ["shiva", "meditation", "murti", "black stone finish"],
      variants: [
        {
          size: "6 inch",
          finish: "Matte Black",
          weight: "450g",
          price: 1499,
          stock: 20,
          sku: "SHIVA-MED-6-BLK",
        },
        {
          size: "12 inch",
          finish: "Matte Black",
          weight: "1.1kg",
          price: 2999,
          stock: 8,
          sku: "SHIVA-MED-12-BLK",
        },
        {
          size: "12 inch",
          finish: "Antique Bronze",
          weight: "1.2kg",
          price: 3499,
          stock: 0,
          sku: "SHIVA-MED-12-BRZ",
        },
      ],
    },
    {
      title: "Modern Ganesh Idol",
      slug: "modern-ganesh-idol",
      description:
        "A contemporary-styled Ganesh idol, 3D-printed with clean lines and fine detail, perfect for a modern pooja room or as a housewarming gift.",
      category: [ganeshCategory._id],
      deity: "Ganesh",
      material: "Resin (3D Printed)",
      purpose: ["pooja-room", "gifting", "home-decor", "wedding"],
      images: [
        { url: "/images/ganesh.png", alt: "Modern Ganesh Idol" },
        { url: "/images/ganesh_alt.png", alt: "Modern Ganesh Idol Alternative Angle" }
      ],
      videos: [],
      basePrice: 899,
      isFeatured: true,
      tags: ["ganesh", "modern", "gift"],
      variants: [
        {
          size: "4 inch",
          finish: "Matte Black",
          weight: "220g",
          price: 899,
          stock: 35,
          sku: "GANESH-MOD-4-BLK",
        },
        {
          size: "8 inch",
          finish: "Ivory White",
          weight: "600g",
          price: 1799,
          stock: 15,
          sku: "GANESH-MOD-8-IVR",
        },
      ],
    },
  ]);

  const shivaMurti = createdProducts.find((p) => p.slug === "meditating-shiva-murti");
  const ganeshIdol = createdProducts.find((p) => p.slug === "modern-ganesh-idol");

  if (shivaMurti && ganeshIdol) {
    await ComboOffer.create({
      title: "Shiva & Ganesh Divine Combo",
      description: "Buy Meditating Shiva Murti & Modern Ganesh Idol together and save 15% on the bundle!",
      products: [shivaMurti._id, ganeshIdol._id],
      discountType: "percentage",
      discountValue: 15,
      isActive: true,
    });
  }

  await Offer.create({
    title: "Storewide Divine Blessing Discount",
    description: "Flat ₹200 off on all orders of ₹2000 or more!",
    discountType: "flat",
    discountValue: 200,
    minOrderValue: 2000,
    isActive: true,
  });

  await Coupon.create({
    code: "FESTIVE10",
    discountType: "percentage",
    discountValue: 10,
    minOrderValue: 500,
    expiryDate: new Date("2030-12-31"),
    isActive: true,
  });

  console.log("Seed complete: 3 categories, 2 products, 1 combo offer, 1 automatic offer, 1 coupon, and default finishes created.");
  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
