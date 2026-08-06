const mongoose = require("mongoose");
const Application = require("../../models/Application");
const Opportunity = require("../../models/Opportunity");
const { APPLICATION_STATUS } = require("../../models/Application");
const AppError = require("../../utils/AppError");
const { success } = require("../../utils/apiResponse");

/**
 * POST /api/opportunities/:id/apply
 * Student applies to an opportunity.
 * Body: coverLetter, resumeUrl (optional; defaults to student's resume)
 * File: resume (optional multipart upload)
 */
exports.apply = async (req, res, next) => {
  try {
    const student = req.user;

    if (!mongoose.isValidObjectId(req.params.id)) {
      return next(new AppError("Invalid opportunity ID.", 400));
    }

    const opportunity = await Opportunity.findOne({ _id: req.params.id, isActive: true });
    if (!opportunity) return next(new AppError("Opportunity not found.", 404));
    if (opportunity.status === "closed") {
      return next(new AppError("This opportunity is no longer accepting applications.", 400));
    }
    if (new Date(opportunity.deadline) < new Date()) {
      return next(new AppError("The deadline for this opportunity has passed.", 400));
    }

    const existing = await Application.findOne({ opportunity: opportunity._id, student: student._id });
    if (existing) {
      return next(new AppError("You have already applied to this opportunity.", 409));
    }

    const uploadedFile = req.file;
    const resumeUrl = uploadedFile
      ? `/uploads/resumes/${uploadedFile.filename}`
      : req.body.resumeUrl || student.resumeUrl;

    if (!resumeUrl) {
      return next(new AppError("A resume is required to apply. Please upload your resume first.", 422));
    }

    const application = await Application.create({
      opportunity: opportunity._id,
      student: student._id,
      company: opportunity.company,
      coverLetter: req.body.coverLetter || "",
      resumeUrl,
    });

    return success(res, {
      statusCode: 201,
      message: "Application submitted",
      data: { application },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/applications/:id/withdraw
 * Student withdraws their own application.
 */
exports.withdraw = async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return next(new AppError("Invalid application ID.", 400));
    }
    const application = await Application.findOne({
      _id: req.params.id,
      student: req.user._id,
    });
    if (!application) return next(new AppError("Application not found.", 404));

    if (application.status === "withdrawn") {
      return next(new AppError("Application is already withdrawn.", 400));
    }

    application.status = "withdrawn";
    await application.save();

    return success(res, { message: "Application withdrawn", data: { application } });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/applications/me
 * Student lists their own applications (with status tracking).
 */
exports.myApplications = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const filter = { student: req.user._id };
    if (status) filter.status = status;

    const skip = (Number(page) - 1) * Number(limit);
    const [items, total] = await Promise.all([
      Application.find(filter)
        .populate("opportunity", "title type location deadline status")
        .populate("company", "companyName logoUrl")
        .sort("-createdAt")
        .skip(skip)
        .limit(Number(limit)),
      Application.countDocuments(filter),
    ]);

    return success(res, {
      message: "My applications",
      data: {
        items,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          totalPages: Math.ceil(total / Number(limit)) || 1,
        },
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/applications/:id
 * Student views a single application's status and details.
 */
exports.getMyApplication = async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return next(new AppError("Invalid application ID.", 400));
    }
    const application = await Application.findOne({
      _id: req.params.id,
      student: req.user._id,
    })
      .populate("opportunity", "title type location deadline status")
      .populate("company", "companyName logoUrl");

    if (!application) return next(new AppError("Application not found.", 404));

    return success(res, { message: "Application details", data: { application } });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/applications/opportunity/:opportunityId
 * Company views applicants for one of its opportunities.
 */
exports.listApplicants = async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.opportunityId)) {
      return next(new AppError("Invalid opportunity ID.", 400));
    }

    const opportunity = await Opportunity.findOne({
      _id: req.params.opportunityId,
      company: req.user._id,
    });
    if (!opportunity) return next(new AppError("Opportunity not found.", 404));

    const { status, page = 1, limit = 20 } = req.query;
    const filter = { opportunity: opportunity._id };
    if (status) filter.status = status;

    const skip = (Number(page) - 1) * Number(limit);
    const [items, total] = await Promise.all([
      Application.find(filter)
        .populate("student", "fullName email department batch phone resumeUrl avatarUrl skills")
        .sort("-createdAt")
        .skip(skip)
        .limit(Number(limit)),
      Application.countDocuments(filter),
    ]);

    return success(res, {
      message: "Applicants",
      data: {
        items,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          totalPages: Math.ceil(total / Number(limit)) || 1,
        },
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * PATCH /api/applications/:id/status
 * Company updates an application status.
 * Allowed transitions: pending → reviewing → shortlisted → interview → offered → rejected.
 * Body: { status, note? }
 */
exports.updateStatus = async (req, res, next) => {
  try {
    const { status, note } = req.body;
    if (!APPLICATION_STATUS.includes(status)) {
      return next(new AppError(`Invalid status. Allowed: ${APPLICATION_STATUS.join(", ")}`, 400));
    }
    if (!mongoose.isValidObjectId(req.params.id)) {
      return next(new AppError("Invalid application ID.", 400));
    }

    const application = await Application.findOne({
      _id: req.params.id,
      company: req.user._id,
    });
    if (!application) return next(new AppError("Application not found.", 404));

    // Companies cannot set "withdrawn" — that's student-only.
    if (status === "withdrawn") {
      return next(new AppError("Companies cannot withdraw applications.", 403));
    }

    application.status = status;
    if (note !== undefined) application.note = note;
    await application.save();

    return success(res, { message: "Application status updated", data: { application } });
  } catch (err) {
    next(err);
  }
};
