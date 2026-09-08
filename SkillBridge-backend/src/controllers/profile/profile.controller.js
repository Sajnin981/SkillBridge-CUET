const mongoose = require("mongoose");
const Student = require("../../models/Student");
const Company = require("../../models/Company");
const AppError = require("../../utils/AppError");
const { success } = require("../../utils/apiResponse");

exports.getStudentProfile = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) return next(new AppError("Invalid student ID.", 400));

    const student = await Student.findOne({ _id: id, status: "approved" })
      .select("fullName email department batch phone avatarUrl bio skills socialLinks education experience resumeUrl createdAt updatedAt");

    if (!student) return next(new AppError("Student not found.", 404));

    return success(res, { message: "Student profile", data: { student } });
  } catch (err) {
    next(err);
  }
};

exports.getCompanyProfile = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) return next(new AppError("Invalid company ID.", 400));

    const company = await Company.findOne({ _id: id, status: "approved" })
      .select("companyName email industry address website logoUrl description socialLinks achievements projects status createdAt updatedAt");

    if (!company) return next(new AppError("Company not found.", 404));

    return success(res, { message: "Company profile", data: { company } });
  } catch (err) {
    next(err);
  }
};
