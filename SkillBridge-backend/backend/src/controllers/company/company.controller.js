const mongoose = require("mongoose");
const Company = require("../../models/Company");
const Opportunity = require("../../models/Opportunity");
const Application = require("../../models/Application");
const AppError = require("../../utils/AppError");
const { success } = require("../../utils/apiResponse");

/**
 * GET /api/company/profile
 */
exports.getProfile = (req, res, next) => {
  try {
    return success(res, { message: "Company profile", data: { company: req.user } });
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/company/profile
 */
exports.updateProfile = async (req, res, next) => {
  try {
    const { description, website, industry, address, logoUrl } = req.body;
    const company = req.user;

    if (description !== undefined) company.description = description;
    if (website !== undefined) company.website = website;
    if (industry !== undefined) company.industry = industry;
    if (address !== undefined) company.address = address;
    if (logoUrl !== undefined) company.logoUrl = logoUrl;

    await company.save();
    return success(res, { message: "Profile updated", data: { company } });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/company/opportunities
 */
exports.createOpportunity = async (req, res, next) => {
  try {
    const company = req.user;
    const {
      title, type, description, requirements, responsibilities,
      location, isRemote, salary, deadline, openings, tags,
    } = req.body;

    const opportunity = await Opportunity.create({
      company: company._id,
      title,
      type,
      description,
      requirements: requirements || [],
      responsibilities: responsibilities || [],
      location: location || "Remote",
      isRemote: isRemote || false,
      salary: salary || "",
      deadline,
      openings: openings || 1,
      tags: tags || [],
    });

    return success(res, {
      statusCode: 201,
      message: "Opportunity created",
      data: { opportunity },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/company/opportunities  — list this company's opportunities
 */
exports.listMyOpportunities = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const filter = { company: req.user._id };
    if (status) filter.status = status;

    const skip = (Number(page) - 1) * Number(limit);
    const [items, total] = await Promise.all([
      Opportunity.find(filter).sort("-createdAt").skip(skip).limit(Number(limit)),
      Opportunity.countDocuments(filter),
    ]);

    return success(res, {
      message: "Company opportunities",
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
 * GET /api/company/opportunities/:id/applicants-count
 * Lightweight count of applicants per opportunity (used in dashboards).
 */
exports.getOpportunityApplicantCount = async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return next(new AppError("Invalid opportunity ID.", 400));
    }
    const opportunity = await Opportunity.findOne({
      _id: req.params.id,
      company: req.user._id,
    });
    if (!opportunity) return next(new AppError("Opportunity not found.", 404));

    const total = await Application.countDocuments({ opportunity: opportunity._id });
    const byStatus = await Application.aggregate([
      { $match: { opportunity: opportunity._id } },
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);

    return success(res, {
      message: "Applicant count",
      data: {
        opportunityId: opportunity._id,
        total,
        byStatus: byStatus.reduce((acc, x) => ({ ...acc, [x._id]: x.count }), {}),
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/company/opportunities/:id
 */
exports.updateOpportunity = async (req, res, next) => {
  try {
    const opportunity = await Opportunity.findOne({
      _id: req.params.id,
      company: req.user._id,
    });
    if (!opportunity) return next(new AppError("Opportunity not found.", 404));

    const allowed = [
      "title", "type", "description", "requirements", "responsibilities",
      "location", "isRemote", "salary", "deadline", "openings", "tags", "status",
    ];
    allowed.forEach((f) => {
      if (req.body[f] !== undefined) opportunity[f] = req.body[f];
    });

    await opportunity.save();
    return success(res, { message: "Opportunity updated", data: { opportunity } });
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/company/opportunities/:id
 * Hard delete with cascade (applications removed via Opportunity pre hook).
 */
exports.deleteOpportunity = async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return next(new AppError("Invalid opportunity ID.", 400));
    }
    const opportunity = await Opportunity.findOne({
      _id: req.params.id,
      company: req.user._id,
    });
    if (!opportunity) return next(new AppError("Opportunity not found.", 404));

    await opportunity.deleteOne();

    return success(res, { message: "Opportunity deleted", data: {} });
  } catch (err) {
    next(err);
  }
};

/**
 * PATCH /api/company/applications/:id/interview
 * Schedule an interview for an application (sets status to "interview").
 * Body: { scheduledAt, location?, notes? }
 */
exports.scheduleInterview = async (req, res, next) => {
  try {
    const { scheduledAt, location, notes } = req.body;
    if (!scheduledAt) {
      return next(new AppError("scheduledAt is required to schedule an interview.", 422));
    }
    const date = new Date(scheduledAt);
    if (Number.isNaN(date.getTime())) {
      return next(new AppError("scheduledAt must be a valid ISO date.", 400));
    }
    if (!mongoose.isValidObjectId(req.params.id)) {
      return next(new AppError("Invalid application ID.", 400));
    }

    const application = await Application.findOne({
      _id: req.params.id,
      company: req.user._id,
    });
    if (!application) return next(new AppError("Application not found.", 404));

    application.status = "interview";
    application.interview = {
      scheduledAt: date,
      location: location || "",
      notes: notes || "",
    };
    await application.save();

    return success(res, {
      message: "Interview scheduled",
      data: { application },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/company/analytics
 * Company-specific dashboard analytics.
 */
exports.analytics = async (req, res, next) => {
  try {
    const companyId = req.user._id;

    const [opportunities, activeOpportunities, applications, byStatus, recent] = await Promise.all([
      Opportunity.countDocuments({ company: companyId }),
      Opportunity.countDocuments({ company: companyId, isActive: true, status: "open" }),
      Application.countDocuments({ company: companyId }),
      Application.aggregate([
        { $match: { company: companyId } },
        { $group: { _id: "$status", count: { $sum: 1 } } },
      ]),
      Application.find({ company: companyId })
        .populate("student", "fullName email department batch")
        .populate("opportunity", "title type")
        .sort("-createdAt")
        .limit(5),
    ]);

    return success(res, {
      message: "Company analytics",
      data: {
        opportunities: { total: opportunities, active: activeOpportunities },
        applications: {
          total: applications,
          byStatus: byStatus.reduce((acc, x) => ({ ...acc, [x._id]: x.count }), {}),
        },
        recentApplications: recent,
      },
    });
  } catch (err) {
    next(err);
  }
};
