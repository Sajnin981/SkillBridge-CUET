const jwt = require("jsonwebtoken");
const Student = require("../models/Student");
const Company = require("../models/Company");
const Admin = require("../models/Admin");
const AppError = require("../utils/AppError");

/**
 * Issue a signed JWT for a given user + role.
 */
const signToken = (id, role) =>
  jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });

/**
 * Look up a user by email within the model matching `role`, verify the
 * password, and return { user, token }.
 *
 * Student and company accounts must be approved by an admin before they can
 * log in; admins are always allowed (they are manually seeded).
 */
const loginWithRole = async (email, password, role) => {
  let Model;
  if (role === "student") Model = Student;
  else if (role === "company") Model = Company;
  else if (role === "admin") Model = Admin;
  else throw new AppError("Invalid role.", 400);

  const user = await Model.findOne({ email: email.toLowerCase() }).select("+password");
  if (!user) throw new AppError("Invalid credentials.", 401);

  const ok = await user.comparePassword(password);
  if (!ok) throw new AppError("Invalid credentials.", 401);

  if ((role === "student" || role === "company") && user.status !== "approved") {
    const reason =
      user.status === "rejected"
        ? user.rejectionReason
          ? `Your account was rejected. Reason: ${user.rejectionReason}`
          : "Your account was rejected. Please contact support."
        : "Your account is pending admin approval. Please try again later.";
    throw new AppError(reason, 403);
  }

  return { user, token: signToken(user._id, role) };
};

module.exports = { signToken, loginWithRole };
