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
    const { description, website, industry, address, logoUrl, achievements, projects, size, founded } = req.body;
    const company = req.user;

    if (description !== undefined) company.description = description;
    if (website !== undefined) company.website = website;
    if (industry !== undefined) company.industry = industry;
    if (address !== undefined) company.address = address;
    if (logoUrl !== undefined) company.logoUrl = logoUrl;
    if (size !== undefined) company.size = size;
    if (founded !== undefined) company.founded = founded;
    if (Array.isArray(achievements)) company.achievements = achievements;
    if (Array.isArray(projects)) company.projects = projects;

    await company.save();
    return success(res, { message: "Profile updated", data: { company } });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/company/settings
 */
exports.getSettings = (req, res, next) => {
  try {
    return success(res, { message: "Company settings", data: { settings: req.user.settings } });
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/company/settings
 */
exports.updateSettings = async (req, res, next) => {
  try {
    const company = req.user;
    const { notifications } = req.body;
    if (notifications && typeof notifications === "object") {
      for (const key of ["newApplicants", "dailyDigest", "messages", "weeklyReport"]) {
        if (typeof notifications[key] === "boolean") company.settings.notifications[key] = notifications[key];
      }
    }
    await company.save();
    return success(res, { message: "Company settings updated", data: { settings: company.settings } });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/companies
 * Public list of approved companies for discovery pages.
 */
exports.listPublicCompanies = async (req, res, next) => {
  try {
    const { search = "", page = 1, limit = 20 } = req.query;
    const filter = { status: "approved" };
    if (search) filter.$or = [
      { companyName: new RegExp(search, "i") },
      { industry: new RegExp(search, "i") },
    ];
    const skip = (Number(page) - 1) * Number(limit);
    const [items, total] = await Promise.all([
      Company.find(filter).select("companyName email website industry address logoUrl description achievements projects status createdAt updatedAt").sort("companyName").skip(skip).limit(Number(limit)),
      Company.countDocuments(filter),
    ]);
    return success(res, {
      message: "Verified companies",
      data: { items, pagination: { page: Number(page), limit: Number(limit), total, totalPages: Math.ceil(total / Number(limit)) || 1 } },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/companies/:id
 * Public profile for an approved company.
 */
exports.getPublicCompany = async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return next(new AppError("Invalid company ID.", 400));
    const company = await Company.findOne({ _id: req.params.id, status: "approved" }).select("companyName website industry address logoUrl description achievements projects status createdAt updatedAt");
    if (!company) return next(new AppError("Company not found.", 404));
    return success(res, { message: "Company profile", data: { company } });
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
    const [items, total, applicantCounts] = await Promise.all([
      Opportunity.find(filter).sort("-createdAt").skip(skip).limit(Number(limit)),
      Opportunity.countDocuments(filter),
      Application.aggregate([
        { $match: { company: req.user._id } },
        { $group: { _id: "$opportunity", count: { $sum: 1 } } },
      ]),
    ]);
    const countByOpportunity = applicantCounts.reduce((acc, x) => ({ ...acc, [x._id.toString()]: x.count }), {});
    const enrichedItems = items.map((opportunity) => ({
      ...opportunity.toObject(),
      applicantsCount: countByOpportunity[opportunity._id.toString()] || 0,
    }));

    return success(res, {
      message: "Company opportunities",
      data: {
        items: enrichedItems,
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
