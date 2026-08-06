const jwt = require("jsonwebtoken");
const AppError = require("../utils/AppError");
const Student = require("../models/Student");
const Company = require("../models/Company");
const Admin = require("../models/Admin");

/**
 * Verify a Bearer JWT and attach the authenticated user to req.user.
 * Works for any of the three roles (student, company, admin).
 */
const protect = async (req, _res, next) => {
  try {
    let token;
    const header = req.headers.authorization;
    if (header && header.startsWith("Bearer ")) {
      token = header.split(" ")[1];
    }

    if (!token) {
      return next(new AppError("You are not logged in. Please log in to continue.", 401));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    let user;
    if (decoded.role === "student") user = await Student.findById(decoded.id);
    else if (decoded.role === "company") user = await Company.findById(decoded.id);
    else if (decoded.role === "admin") user = await Admin.findById(decoded.id);

    if (!user) {
      return next(new AppError("The user belonging to this token no longer exists.", 401));
    }

    req.user = user;
    req.userRole = decoded.role;
    next();
  } catch (err) {
    next(err);
  }
};

/**
 * Restrict a route to one or more roles.
 * Usage: router.delete("/x", restrict("admin"), handler)
 */
const restrict = (...roles) => (req, _res, next) => {
  if (!roles.includes(req.userRole)) {
    return next(new AppError("You do not have permission to perform this action.", 403));
  }
  next();
};

/**
 * Convenience: require an approved account (students/companies must be
 * approved by an admin before they can access protected resources).
 */
const requireApproved = (req, _res, next) => {
  const user = req.user;
  if (req.userRole === "admin") return next();

  if (user.status && user.status !== "approved") {
    return next(
      new AppError(
        `Your account is currently "${user.status}". Please wait for admin approval.`,
        403
      )
    );
  }
  next();
};

module.exports = { protect, restrict, requireApproved };
