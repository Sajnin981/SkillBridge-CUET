/**
 * One-off script to create an admin account.
 * Admins are manually inserted — there is no public registration endpoint.
 *
 * Usage:
 *   node src/scripts/seedAdmin.js <name> <email> <password>
 *
 * Example:
 *   node src/scripts/seedAdmin.js "Admin User" admin@skillbridge.cuet.ac.bd StrongPass1
 */
require("dotenv").config();
const connectDB = require("../config/db");
const Admin = require("../models/Admin");

const run = async () => {
  const [,, name, email, password] = process.argv;
  if (!name || !email || !password) {
    console.error("Usage: node src/scripts/seedAdmin.js <name> <email> <password>");
    process.exit(1);
  }
  if (password.length < 8) {
    console.error("Password must be at least 8 characters.");
    process.exit(1);
  }

  await connectDB();
  const existing = await Admin.findOne({ email: email.toLowerCase() });
  if (existing) {
    console.log("Admin with this email already exists.");
    process.exit(0);
  }

  const admin = await Admin.create({ name, email, password });
  console.log("✅ Admin created:", admin.email);
  process.exit(0);
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
