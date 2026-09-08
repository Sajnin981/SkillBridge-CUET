const mongoose = require("mongoose");
const Opportunity = require("../../models/Opportunity");
const { OPPORTUNITY_TYPES } = require("../../models/Opportunity");
const AppError = require("../../utils/AppError");
const { success } = require("../../utils/apiResponse");

/**
 * GET /api/opportunities
 * Query: type, search, location, isRemote, status, page, limit, sort
 */
exports.listOpportunities = async (req, res, next) => {
  try {
    const {
      type, search, location, isRemote, status = "open",
      page = 1, limit = 10, sort = "-createdAt",
    } = req.query;

    const filter = { isActive: true };
    if (status) filter.status = status;
    if (type) {
      if (!OPPORTUNITY_TYPES.includes(type)) {
        return next(new AppError(`Invalid type. Allowed: ${OPPORTUNITY_TYPES.join(", ")}`, 400));
      }
      filter.type = type;
    }
    if (location) filter.location = new RegExp(location, "i");
    if (isRemote === "true") filter.isRemote = true;

    if (search) {
      filter.$text = { $search: search };
    }

    const skip = (Number(page) - 1) * Number(limit);
    const [items, total] = await Promise.all([
      Opportunity.find(filter)
        .populate("company", "companyName logoUrl industry")
        .sort(sort)
        .skip(skip)
        .limit(Number(limit)),
      Opportunity.countDocuments(filter),
    ]);

    return success(res, {
      message: "Opportunities list",
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
 * GET /api/opportunities/:id
 */
exports.getOpportunity = async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return next(new AppError("Invalid opportunity ID.", 400));
    }
    const opportunity = await Opportunity.findOne({
      _id: req.params.id,
      isActive: true,
    }).populate("company", "companyName logoUrl industry website description");

    if (!opportunity) return next(new AppError("Opportunity not found.", 404));

    return success(res, { message: "Opportunity details", data: { opportunity } });
  } catch (err) {
    next(err);
  }
};
