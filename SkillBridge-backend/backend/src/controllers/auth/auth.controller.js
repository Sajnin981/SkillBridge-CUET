const Student = require("../../models/Student");
const Company = require("../../models/Company");
const AppError = require("../../utils/AppError");
const { success } = require("../../utils/apiResponse");
const { signToken } = require("../../services/authService");

/**
 * POST /api/auth/student/register
 * Body: fullName, email, studentId, department, batch, phone, password
 * File: idCard (required), resume (optional)
 */
exports.registerStudent = async (req, res, next) => {
  try {
    const {
      fullName, email, studentId, department, batch, phone, password,
    } = req.body;

    const existing = await Student.findOne({
      $or: [{ email: email.toLowerCase() }, { studentId }],
    });
    if (existing) {
      return next(new AppError("A student with this email or student ID already exists.", 409));
    }

    const idCardFile = req.files?.idCard?.[0];
    if (!idCardFile) return next(new AppError("CUET student ID card upload is required.", 422));

    const resumeFile = req.files?.resume?.[0];

    const student = await Student.create({
      fullName,
      email,
      studentId,
      department,
      batch,
      phone,
      password,
      idCardUrl: `/uploads/student-ids/${idCardFile.filename}`,
      resumeUrl: resumeFile ? `/uploads/resumes/${resumeFile.filename}` : "",
    });

    const token = signToken(student._id, "student");

    return success(res, {
      statusCode: 201,
      message: "Registration successful. Your account is pending admin approval.",
      data: { student, token },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/auth/company/register
 * Body: companyName, hrName, email, phone, website, industry, address, password
 * File: tradeLicense (required), logo (optional)
 */
exports.registerCompany = async (req, res, next) => {
  try {
    const {
      companyName, hrName, email, phone, website, industry, address, password,
    } = req.body;

    const existing = await Company.findOne({ email: email.toLowerCase() });
    if (existing) {
      return next(new AppError("A company with this email already exists.", 409));
    }

    const tradeLicenseFile = req.files?.tradeLicense?.[0];
    if (!tradeLicenseFile) return next(new AppError("Trade license upload is required.", 422));

    const logoFile = req.files?.logo?.[0];

    const company = await Company.create({
      companyName,
      hrName,
      email,
      phone,
      website: website || "",
      industry,
      address,
      password,
      tradeLicenseUrl: `/uploads/trade-licenses/${tradeLicenseFile.filename}`,
      logoUrl: logoFile ? `/uploads/company-logos/${logoFile.filename}` : "",
    });

    const token = signToken(company._id, "company");

    return success(res, {
      statusCode: 201,
      message: "Registration successful. Your company is pending admin approval.",
      data: { company, token },
    });
  } catch (err) {
    next(err);
  }
};
