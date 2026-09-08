const Student = require("../models/Student");
const Company = require("../models/Company");
const AppError = require("../utils/AppError");
const { success } = require("../utils/apiResponse");

exports.searchProfiles = async (req, res, next) => {
  try {
    const query = String(req.query.q || "").trim();
    if (query.length < 2) return next(new AppError("Search must contain at least 2 characters.", 422));

    const expression = new RegExp(query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
    const [students, companies] = await Promise.all([
      Student.find({ status: "approved", $or: [{ fullName: expression }, { department: expression }, { skills: expression }] })
        .select("fullName email department batch avatarUrl bio skills")
        .limit(20),
      Company.find({ status: "approved", $or: [{ companyName: expression }, { industry: expression }, { description: expression }] })
        .select("companyName email industry address logoUrl description website")
        .limit(20),
    ]);
    return success(res, { message: "Search results", data: { students, companies } });
  } catch (err) {
    next(err);
  }
};