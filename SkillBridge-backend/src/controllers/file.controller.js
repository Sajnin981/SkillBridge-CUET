const path = require("path");
const fs = require("fs");
const Application = require("../models/Application");
const AppError = require("../utils/AppError");

const ALLOWED_FOLDERS = new Set(["student-ids", "resumes", "company-logos", "trade-licenses"]);

module.exports = async (req, res, next) => {
  try {
    const { folder, filename } = req.params;
    if (!ALLOWED_FOLDERS.has(folder) || path.basename(filename) !== filename) {
      return next(new AppError("Invalid file path.", 400));
    }

    const requestedPath = `/uploads/${folder}/${filename}`;
    let allowed = req.userRole === "admin";
    if (req.userRole === "student") {
      allowed = [req.user.idCardUrl, req.user.resumeUrl, req.user.aiResumeUrl, req.user.sharedResumeUrl].includes(requestedPath);
    } else if (req.userRole === "company") {
      allowed = [req.user.logoUrl, req.user.tradeLicenseUrl].includes(requestedPath);
      if (!allowed && folder === "resumes") {
        allowed = Boolean(await Application.exists({ company: req.user._id, resumeUrl: requestedPath }));
      }
    }
    if (!allowed) return next(new AppError("You do not have permission to access this file.", 403));

    const filePath = path.join(__dirname, "..", "uploads", folder, filename);
    if (!fs.existsSync(filePath)) return next(new AppError("File not found.", 404));
    return res.sendFile(filePath);
  } catch (err) {
    next(err);
  }
};