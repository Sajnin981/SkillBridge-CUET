const mongoose = require("mongoose");
const Student = require("../../models/Student");
const Company = require("../../models/Company");
const Opportunity = require("../../models/Opportunity");
const Application = require("../../models/Application");
const AILog = require("../../models/AILog");
const AppError = require("../../utils/AppError");
const { success } = require("../../utils/apiResponse");

const MODEL_BY_ROLE = { student: Student, company: Company };

/**
 * GET /api/admin/verifications
 * Query: role=student|company, status=pending|approved|rejected, page, limit
 */
exports.listVerifications = async (req, res, next) => {
  try {
    const { role = "student", status, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (status) filter.status = status;

    const skip = (Number(page) - 1) * Number(limit);
    const Model = MODEL_BY_ROLE[role];
    if (!Model) return next(new AppError("role must be student or company.", 400));

    const [items, total] = await Promise.all([
      Model.find(filter).sort("-createdAt").skip(skip).limit(Number(limit)),
      Model.countDocuments(filter),
    ]);

    return success(res, {
      message: "Verification queue",
      data: {
        role,
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
 * GET /api/admin/verifications/:role/:id
 * Returns a single pending/approved/rejected account with uploaded documents.
 */
exports.getVerification = async (req, res, next) => {
  try {
    const { role, id } = req.params;
    if (!mongoose.isValidObjectId(id)) return next(new AppError("Invalid ID.", 400));

    const Model = MODEL_BY_ROLE[role];
    if (!Model) return next(new AppError("role must be student or company.", 400));

    const item = await Model.findById(id);
    if (!item) return next(new AppError("Record not found.", 404));

    return success(res, { message: "Verification record", data: { role, item } });
  } catch (err) {
    next(err);
  }
};

/**
 * PATCH /api/admin/verifications/:role/:id/approve
 */
exports.approve = async (req, res, next) => {
  try {
    const { role, id } = req.params;
    if (!mongoose.isValidObjectId(id)) return next(new AppError("Invalid ID.", 400));

    const Model = MODEL_BY_ROLE[role];
    if (!Model) return next(new AppError("role must be student or company.", 400));

    const item = await Model.findById(id);
    if (!item) return next(new AppError("Record not found.", 404));

    item.status = "approved";
    item.rejectionReason = "";
    await item.save();

    return success(res, {
      message: `${role === "student" ? "Student" : "Company"} approved`,
      data: { item },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * PATCH /api/admin/verifications/:role/:id/reject
 * Body: { reason }
 */
exports.reject = async (req, res, next) => {
  try {
    const { role, id } = req.params;
    if (!mongoose.isValidObjectId(id)) return next(new AppError("Invalid ID.", 400));

    const Model = MODEL_BY_ROLE[role];
    if (!Model) return next(new AppError("role must be student or company.", 400));

    const item = await Model.findById(id);
    if (!item) return next(new AppError("Record not found.", 404));

    item.status = "rejected";
    item.rejectionReason = req.body.reason || "";
    await item.save();

    return success(res, {
      message: `${role === "student" ? "Student" : "Company"} rejected`,
      data: { item },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/admin/opportunities/:id
 * Admin removes an inappropriate opportunity (soft delete via isActive=false).
 */
exports.deleteOpportunity = async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return next(new AppError("Invalid opportunity ID.", 400));
    }
    const opportunity = await Opportunity.findById(req.params.id);
    if (!opportunity) return next(new AppError("Opportunity not found.", 404));

    opportunity.isActive = false;
    opportunity.status = "closed";
    await opportunity.save();

    return success(res, { message: "Opportunity removed", data: {} });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/admin/analytics
 * High-level platform analytics (dashboard statistics).
 */
exports.analytics = async (req, res, next) => {
  try {
    const [
      students,
      approvedStudents,
      pendingStudents,
      companies,
      approvedCompanies,
      pendingCompanies,
      opportunities,
      activeOpportunities,
      applications,
    ] = await Promise.all([
      Student.countDocuments(),
      Student.countDocuments({ status: "approved" }),
      Student.countDocuments({ status: "pending" }),
      Company.countDocuments(),
      Company.countDocuments({ status: "approved" }),
      Company.countDocuments({ status: "pending" }),
      Opportunity.countDocuments(),
      Opportunity.countDocuments({ isActive: true, status: "open" }),
      Application.countDocuments(),
    ]);

    const byStatus = await Application.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);

    // Opportunities grouped by type.
    const byType = await Opportunity.aggregate([
      { $group: { _id: "$type", count: { $sum: 1 } } },
    ]);

    return success(res, {
      message: "Platform analytics",
      data: {
        students: { total: students, approved: approvedStudents, pending: pendingStudents },
        companies: { total: companies, approved: approvedCompanies, pending: pendingCompanies },
        opportunities: {
          total: opportunities,
          active: activeOpportunities,
          byType: byType.reduce((acc, x) => ({ ...acc, [x._id]: x.count }), {}),
        },
        applications: {
          total: applications,
          byStatus: byStatus.reduce((acc, x) => ({ ...acc, [x._id]: x.count }), {}),
        },
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/admin/users
 * User management — list all students or companies with pagination.
 * Query: role=student|company, status, search, page, limit
 */
exports.listUsers = async (req, res, next) => {
  try {
    const { role = "student", status, search, page = 1, limit = 20 } = req.query;
    const Model = MODEL_BY_ROLE[role];
    if (!Model) return next(new AppError("role must be student or company.", 400));

    const filter = {};
    if (status) filter.status = status;
    if (search) {
      if (role === "student") {
        filter.$or = [
          { fullName: new RegExp(search, "i") },
          { email: new RegExp(search, "i") },
          { studentId: new RegExp(search, "i") },
        ];
      } else {
        filter.$or = [
          { companyName: new RegExp(search, "i") },
          { email: new RegExp(search, "i") },
          { hrName: new RegExp(search, "i") },
        ];
      }
    }

    const skip = (Number(page) - 1) * Number(limit);
    const [items, total] = await Promise.all([
      Model.find(filter).sort("-createdAt").skip(skip).limit(Number(limit)),
      Model.countDocuments(filter),
    ]);

    return success(res, {
      message: "Users list",
      data: {
        role,
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
 * GET /api/admin/users/:role/:id
 * Admin views a single user's full record.
 */
exports.getUser = async (req, res, next) => {
  try {
    const { role, id } = req.params;
    if (!mongoose.isValidObjectId(id)) return next(new AppError("Invalid ID.", 400));
    const Model = MODEL_BY_ROLE[role];
    if (!Model) return next(new AppError("role must be student or company.", 400));

    const item = await Model.findById(id);
    if (!item) return next(new AppError("User not found.", 404));

    return success(res, { message: "User record", data: { role, item } });
  } catch (err) {
    next(err);
  }
};

/**
 * PATCH /api/admin/users/:role/:id/status
 * Admin updates a user's status directly (approve/reject/re-pending).
 * Body: { status, reason? }
 */
exports.updateUserStatus = async (req, res, next) => {
  try {
    const { role, id } = req.params;
    const { status, reason } = req.body;
    if (!["pending", "approved", "rejected"].includes(status)) {
      return next(new AppError("status must be pending, approved, or rejected.", 400));
    }
    if (!mongoose.isValidObjectId(id)) return next(new AppError("Invalid ID.", 400));

    const Model = MODEL_BY_ROLE[role];
    if (!Model) return next(new AppError("role must be student or company.", 400));

    const item = await Model.findById(id);
    if (!item) return next(new AppError("User not found.", 404));

    item.status = status;
    item.rejectionReason = status === "rejected" ? (reason || "") : "";
    await item.save();

    return success(res, { message: "User status updated", data: { item } });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/admin/reports
 * Aggregated platform reports: verifications, applications, opportunities
 * broken down by status and type for a given date range.
 * Query: startDate, endDate (ISO dates, optional)
 */
exports.reports = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;
    const dateFilter = {};
    if (startDate || endDate) {
      dateFilter.createdAt = {};
      if (startDate) dateFilter.createdAt.$gte = new Date(startDate);
      if (endDate) dateFilter.createdAt.$lte = new Date(endDate);
    }

    const [students, companies, opportunities, applications, byAppStatus, byOppType] = await Promise.all([
      Student.countDocuments(dateFilter),
      Company.countDocuments(dateFilter),
      Opportunity.countDocuments(dateFilter),
      Application.countDocuments(dateFilter),
      Application.aggregate([
      ...(startDate || endDate ? [{ $match: dateFilter }] : []),
        { $group: { _id: "$status", count: { $sum: 1 } } },
      ]),
      Opportunity.aggregate([
      ...(startDate || endDate ? [{ $match: dateFilter }] : []),
        { $group: { _id: "$type", count: { $sum: 1 } } },
      ]),
    ]);

    return success(res, {
      message: "Platform reports",
      data: {
        totals: { students, companies, opportunities, applications },
        applicationsByStatus: byAppStatus.reduce((acc, x) => ({ ...acc, [x._id]: x.count }), {}),
        opportunitiesByType: byOppType.reduce((acc, x) => ({ ...acc, [x._id]: x.count }), {}),
      },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/admin/ai-logs
 * List AI feature usage logs (audit trail).
 * Query: feature, page, limit
 */
exports.listAILogs = async (req, res, next) => {
  try {
    const { feature, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (feature) filter.feature = feature;

    const skip = (Number(page) - 1) * Number(limit);
    const [items, total] = await Promise.all([
      AILog.find(filter)
        .populate("requester", "fullName companyName email")
        .sort("-createdAt")
        .skip(skip)
        .limit(Number(limit)),
      AILog.countDocuments(filter),
    ]);

    return success(res, {
      message: "AI logs",
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
