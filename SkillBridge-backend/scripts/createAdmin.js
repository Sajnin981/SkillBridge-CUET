require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("../src/config/db");
const Admin = require("../src/models/Admin");

const ADMIN_NAME = "SkillBridge Admin";
const ADMIN_EMAIL = "admin@skillbridge.com";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "Admin@12345";

const createAdmin = async () => {
  try {
    await connectDB();

    const existing = await Admin.findOne({ email: ADMIN_EMAIL });
    if (existing) {
      console.log(`Admin already exists: ${ADMIN_EMAIL}`);
      return;
    }

    // Admin's existing Mongoose pre-save hook applies bcrypt hashing.
    await Admin.create({
      name: ADMIN_NAME,
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      role: "admin",
    });

    console.log(`Admin created successfully: ${ADMIN_EMAIL}`);
  } catch (error) {
    console.error(`Admin creation failed: ${error.message}`);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
};

createAdmin();
