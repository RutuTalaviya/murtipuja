require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("./config/db");
const User = require("./models/User");

async function run() {
  await connectDB();
  const phone = "9999999999";
  let user = await User.findOne({ phone });
  if (user) {
    user.role = "admin";
    await user.save();
    console.log(`\n[SUCCESS] Elevated existing user ${phone} to admin.`);
  } else {
    user = await User.create({
      phone,
      name: "Admin User",
      role: "admin",
      phoneVerified: true,
    });
    console.log(`\n[SUCCESS] Created new admin user with phone: ${phone}`);
  }
  await mongoose.disconnect();
  process.exit(0);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
