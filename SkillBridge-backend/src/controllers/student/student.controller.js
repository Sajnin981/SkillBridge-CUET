const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");
const Student = require("../../models/Student");
const Opportunity = require("../../models/Opportunity");
const AppError = require("../../utils/AppError");
const { success } = require("../../utils/apiResponse");

const UPLOAD_ROOT = path.join(__dirname, "..", "..", "uploads");

function isValidUrl(value) {
  try {
    const parsed = new URL(value);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

function removeUploadedFile(fileUrl) {
  if (!fileUrl || !fileUrl.startsWith("/uploads/")) return;
  const relative = fileUrl.replace("/uploads/", "");
  const absolute = path.join(UPLOAD_ROOT, relative);
  if (!absolute.startsWith(UPLOAD_ROOT)) return;
  if (fs.existsSync(absolute)) fs.unlinkSync(absolute);
}

/**
 * GET /api/student/profile
 */
exports.getProfile = (req, res, next) => {
  try {
    return success(res, { message: "Student profile", data: { student: req.user } });
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/student/profile
 * Updatable fields: bio, skills, avatarUrl, education, experience,
 * certifications, achievements, portfolio.
 */
exports.updateProfile = async (req, res, next) => {
  try {
    const student = req.user;
    const {
      bio, phone, skills, avatarUrl,
      education, experience, certifications, achievements, portfolio, socialLinks,
    } = req.body;

    if (bio !== undefined) student.bio = bio;
    if (phone !== undefined) student.phone = phone;
    if (Array.isArray(skills)) student.skills = skills;
    if (avatarUrl !== undefined) student.avatarUrl = avatarUrl;
    if (Array.isArray(education)) student.education = education;
    if (Array.isArray(experience)) student.experience = experience;
    if (Array.isArray(certifications)) student.certifications = certifications;
    if (Array.isArray(achievements)) student.achievements = achievements;
    if (Array.isArray(portfolio)) student.portfolio = portfolio;
    if (socialLinks && typeof socialLinks === "object") {
      const keys = ["linkedin", "github", "facebook", "portfolio", "website"];
      keys.forEach((key) => {
        if (socialLinks[key] === undefined) return;
        const rawValue = String(socialLinks[key] || "").trim();
        if (!rawValue) {
          student.socialLinks[key] = "";
          return;
        }
        if (!isValidUrl(rawValue)) {
          throw new AppError(`${key} must be a valid URL.`, 422);
        }
        student.socialLinks[key] = rawValue;
      });
    }

    await student.save();

    return success(res, { message: "Profile updated", data: { student } });
  } catch (err) {
    next(err);
  }
};

exports.uploadAvatar = async (req, res, next) => {
  try {
    const file = req.file;
    if (!file) return next(new AppError("Avatar file is required.", 422));

    const student = req.user;
    if (student.avatarUrl) removeUploadedFile(student.avatarUrl);
    student.avatarUrl = `/uploads/avatars/${file.filename}`;
    await student.save();

    return success(res, {
      message: "Profile picture uploaded",
      data: { avatarUrl: student.avatarUrl },
    });
  } catch (err) {
    next(err);
  }
};

exports.deleteAvatar = async (req, res, next) => {
  try {
    const student = req.user;
    if (student.avatarUrl) removeUploadedFile(student.avatarUrl);
    student.avatarUrl = "";
    await student.save();

    return success(res, { message: "Profile picture removed", data: { avatarUrl: "" } });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/student/resume  (multipart, field: resume)
 * Replaces the student's resume file.
 */
exports.uploadResume = async (req, res, next) => {
  try {
    const file = req.file;
    if (!file) return next(new AppError("Resume file is required.", 422));

    const student = req.user;
    student.resumeUrl = `/uploads/resumes/${file.filename}`;
    await student.save();

    return success(res, {
      message: "Resume uploaded",
      data: { resumeUrl: student.resumeUrl },
    });
  } catch (err) {
    next(err);
  }
};

exports.deleteResume = async (req, res, next) => {
  try {
    const student = req.user;
    if (student.resumeUrl) removeUploadedFile(student.resumeUrl);
    student.resumeUrl = "";
    await student.save();

    return success(res, {
      message: "Resume removed",
      data: { resumeUrl: "" },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/student/saved-opportunities
 * Returns the student's saved opportunities (populated).
 */
exports.listSavedOpportunities = async (req, res, next) => {
  try {
    const student = await Student.findById(req.user._id).populate({
      path: "savedOpportunities",
      match: { isActive: true },
      populate: { path: "company", select: "companyName logoUrl industry" },
    });

    return success(res, {
      message: "Saved opportunities",
      data: { items: student.savedOpportunities || [] },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/student/saved-opportunities/:opportunityId
 * Save an opportunity for later viewing.
 */
exports.saveOpportunity = async (req, res, next) => {
  try {
    const { opportunityId } = req.params;
    if (!mongoose.isValidObjectId(opportunityId)) {
      return next(new AppError("Invalid opportunity ID.", 400));
    }

    const opportunity = await Opportunity.findOne({ _id: opportunityId, isActive: true });
    if (!opportunity) return next(new AppError("Opportunity not found.", 404));

    const student = req.user;
    const already = student.savedOpportunities.some((id) => id.equals(opportunity._id));
    if (already) return next(new AppError("Opportunity already saved.", 409));

    student.savedOpportunities.push(opportunity._id);
    await student.save();

    return success(res, { message: "Opportunity saved", data: { student } });
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/student/saved-opportunities/:opportunityId
 * Remove a saved opportunity.
 */
exports.unsaveOpportunity = async (req, res, next) => {
  try {
    const { opportunityId } = req.params;
    if (!mongoose.isValidObjectId(opportunityId)) {
      return next(new AppError("Invalid opportunity ID.", 400));
    }

    const student = req.user;
    const before = student.savedOpportunities.length;
    student.savedOpportunities = student.savedOpportunities.filter(
      (id) => !id.equals(opportunityId)
    );

    if (student.savedOpportunities.length === before) {
      return next(new AppError("Opportunity was not saved.", 404));
    }

    await student.save();
    return success(res, { message: "Opportunity removed from saved", data: { student } });
  } catch (err) {
    next(err);
  }
};
