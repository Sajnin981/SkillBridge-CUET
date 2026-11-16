const mongoose = require("mongoose");
const Opportunity = require("../../models/Opportunity");
const Application = require("../../models/Application");
const Company = require("../../models/Company");
const { OPPORTUNITY_TYPES } = require("../../models/Opportunity");
const AppError = require("../../utils/AppError");
const { success } = require("../../utils/apiResponse");

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const salaryAmountExpression = {
  $let: {
    vars: {
      salaryMatch: {
        $regexFind: {
          input: { $ifNull: ["$salary", ""] },
          regex: "([0-9][0-9,]*(?:\\.[0-9]+)?)\\s*(k|thousand|lakh|lac)?",
          options: "i",
        },
      },
    },
    in: {
      $let: {
        vars: {
          amount: {
            $convert: {
              input: {
                $replaceAll: {
                  input: { $ifNull: [{ $arrayElemAt: ["$$salaryMatch.captures", 0] }, "0"] },
                  find: ",",
                  replacement: "",
                },
              },
              to: "double",
              onError: 0,
              onNull: 0,
            },
          },
          unit: {
            $toLower: { $ifNull: [{ $arrayElemAt: ["$$salaryMatch.captures", 1] }, ""] },
          },
        },
        in: {
          $multiply: [
            "$$amount",
            {
              $switch: {
                branches: [
                  { case: { $eq: ["$$unit", "k"] }, then: 1000 },
                  { case: { $eq: ["$$unit", "thousand"] }, then: 1000 },
                  { case: { $in: ["$$unit", ["lakh", "lac"]] }, then: 100000 },
                ],
                default: 1,
              },
            },
          ],
        },
      },
    },
  },
};

/**
 * GET /api/opportunities
 * Query: type, search, location, isRemote, skills, salaryMin, status, page, limit, sort
 */
exports.listOpportunities = async (req, res, next) => {
  try {
    const {
      type, search, location, isRemote, skills, status = "open",
      salaryMin, page = 1, limit = 10, sort = "-createdAt",
    } = req.query;

    const filter = { isActive: true };
    if (status) filter.status = status;
    if (type) {
      const requestedTypes = (Array.isArray(type) ? type : String(type).split(","))
        .map((value) => value.trim())
        .filter(Boolean);
      if (requestedTypes.some((value) => !OPPORTUNITY_TYPES.includes(value))) {
        return next(new AppError(`Invalid type. Allowed: ${OPPORTUNITY_TYPES.join(", ")}`, 400));
      }
      filter.type = { $in: requestedTypes };
    }
    if (typeof location === "string" && location.trim()) {
      filter.location = new RegExp(`^\\s*${escapeRegex(location.trim())}\\s*$`, "i");
    }
    if (isRemote === "true") filter.isRemote = true;

    if (salaryMin !== undefined) {
      const minimumSalary = Number(salaryMin);
      if (!Number.isFinite(minimumSalary) || minimumSalary < 0) {
        return next(new AppError("Minimum salary must be a non-negative number.", 400));
      }
      if (minimumSalary > 0) {
        filter.$expr = { $gte: [salaryAmountExpression, minimumSalary] };
      }
    }

    if (skills) {
      const requestedSkills = (Array.isArray(skills) ? skills : String(skills).split(","))
        .map((value) => value.trim())
        .filter(Boolean);
      if (requestedSkills.length) {
        filter.tags = {
          $all: requestedSkills.map((value) => new RegExp(`^\\s*${escapeRegex(value)}\\s*$`, "i")),
        };
      }
    }

    if (typeof search === "string" && search.trim()) {
      const searchRegex = new RegExp(escapeRegex(search.trim()), "i");
      const matchingCompanies = await Company.find({ companyName: searchRegex }).distinct("_id");
      filter.$or = [
        { title: searchRegex },
        { tags: searchRegex },
        { company: { $in: matchingCompanies } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    let items;
    let total;
    let countByOpportunity = {};
    if (sort === "applicants") {
      const [ranked] = await Opportunity.aggregate([
        { $match: filter },
        {
          $lookup: {
            from: Application.collection.name,
            localField: "_id",
            foreignField: "opportunity",
            as: "applications",
          },
        },
        { $addFields: { applicantsCount: { $size: "$applications" } } },
        { $sort: { applicantsCount: -1, createdAt: -1 } },
        {
          $facet: {
            items: [
              { $skip: skip },
              { $limit: Number(limit) },
              {
                $lookup: {
                  from: Company.collection.name,
                  localField: "company",
                  foreignField: "_id",
                  as: "companyDetails",
                },
              },
              { $unwind: { path: "$companyDetails", preserveNullAndEmptyArrays: true } },
              {
                $set: {
                  company: {
                    _id: "$companyDetails._id",
                    companyName: "$companyDetails.companyName",
                    logoUrl: "$companyDetails.logoUrl",
                    industry: "$companyDetails.industry",
                  },
                },
              },
              { $project: { applications: 0, companyDetails: 0 } },
            ],
            total: [{ $count: "count" }],
          },
        },
      ]);
      items = ranked?.items || [];
      total = ranked?.total[0]?.count || 0;
    } else {
      [items, total] = await Promise.all([
        Opportunity.find(filter)
          .populate("company", "companyName logoUrl industry")
          .sort(sort)
          .skip(skip)
          .limit(Number(limit)),
        Opportunity.countDocuments(filter),
      ]);
      const applicantCounts = await Application.aggregate([
        { $match: { opportunity: { $in: items.map((item) => item._id) } } },
        { $group: { _id: "$opportunity", count: { $sum: 1 } } },
      ]);
      countByOpportunity = applicantCounts.reduce((counts, item) => {
        counts[item._id.toString()] = item.count;
        return counts;
      }, {});
    }

    return success(res, {
      message: "Opportunities list",
      data: {
        items: items.map((item) => {
          const opportunity = typeof item.toObject === "function" ? item.toObject() : item;
          return {
            ...opportunity,
            applicantsCount: opportunity.applicantsCount || countByOpportunity[item._id.toString()] || 0,
          };
        }),
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
 * GET /api/opportunities/filters
 * Returns location and required-skill values already used by active opportunities.
 */
exports.getOpportunityFilterOptions = async (_req, res, next) => {
  try {
    const activeFilter = { isActive: true, status: "open" };
    const [locations, skills, opportunityCounts] = await Promise.all([
      Opportunity.distinct("location", activeFilter),
      Opportunity.distinct("tags", activeFilter),
      Opportunity.aggregate([
        { $match: activeFilter },
        { $group: { _id: "$type", count: { $sum: 1 } } },
      ]),
    ]);

    const normalizeOptions = (values) => {
      const normalized = new Map();
      values.forEach((value) => {
        if (typeof value !== "string" || !value.trim()) return;
        const trimmed = value.trim();
        const key = trimmed.toLowerCase();
        if (!normalized.has(key)) normalized.set(key, trimmed);
      });
      return [...normalized.values()].sort((a, b) => a.localeCompare(b));
    };

    const countsByType = Object.fromEntries(OPPORTUNITY_TYPES.map((type) => [type, 0]));
    opportunityCounts.forEach(({ _id, count }) => {
      countsByType[_id] = count;
    });

    return success(res, {
      message: "Opportunity filter options",
      data: {
        locations: normalizeOptions(locations),
        skills: normalizeOptions(skills),
        countsByType,
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

    const applicantsCount = await Application.countDocuments({ opportunity: opportunity._id });
    return success(res, { message: "Opportunity details", data: { opportunity: { ...opportunity.toObject(), applicantsCount } } });
  } catch (err) {
    next(err);
  }
};
