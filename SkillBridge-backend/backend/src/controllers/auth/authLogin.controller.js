const { loginWithRole } = require("../../services/authService");
const { success } = require("../../utils/apiResponse");
const AppError = require("../../utils/AppError");

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
