const { loginWithRole } = require("../../services/authService");
const { success } = require("../../utils/apiResponse");
const AppError = require("../../utils/AppError");
const Student = require("../../models/Student");
const Company = require("../../models/Company");
const Admin = require("../../models/Admin");

/**
 * POST /api/auth/login
 * Body: { email, password, role }
 * Works for student, company, and admin.
 */
exports.login = async (req, res, next) => {
  try {
    const { email, password, role } = req.body;
    const { user, token } = await loginWithRole(email, password, role);

    return success(res, {
      message: "Login successful",
      data: { user, token, role },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/auth/me
 * Returns the currently authenticated user (any role).
 */
exports.getMe = (req, res, next) => {
  try {
    return success(res, {
      message: "Authenticated user",
      data: { user: req.user, role: req.userRole },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/auth/password
 * Body: { currentPassword, newPassword }
 */
exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return next(new AppError("Current password and new password are required.", 422));
    }
    if (newPassword.length < 8) {
      return next(new AppError("New password must be at least 8 characters.", 422));
    }

    const Model = req.userRole === "student" ? Student : req.userRole === "company" ? Company : Admin;
    const user = await Model.findById(req.user._id).select("+password");
    if (!user || !(await user.comparePassword(currentPassword))) {
      return next(new AppError("Current password is incorrect.", 401));
    }

    user.password = newPassword;
    await user.save();
    return success(res, { message: "Password updated", data: {} });
  } catch (err) {
    next(err);
  }
};
