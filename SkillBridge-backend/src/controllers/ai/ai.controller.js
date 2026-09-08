const AILog = require("../../models/AILog");
const Opportunity = require("../../models/Opportunity");
const Application = require("../../models/Application");
const AppError = require("../../utils/AppError");
const { success } = require("../../utils/apiResponse");
const fs = require("fs");
const path = require("path");
const PDFDocument = require("pdfkit");

const logRequest = (feature, requester, requesterModel, inputSummary, outputSummary, durationMs) =>
  AILog.create({
    feature,
    requester,
    requesterModel,
    inputSummary,
    outputSummary,
    durationMs,
  });

exports.generateResume = async (req, res, next) => {
  try {
    const student = req.user;
    const filename = `ai-resume-${student._id}-${Date.now()}.pdf`;
    const directory = path.join(__dirname, "..", "..", "uploads", "resumes");
    fs.mkdirSync(directory, { recursive: true });
    const filePath = path.join(directory, filename);
    const document = new PDFDocument({ margin: 50 });
    const stream = fs.createWriteStream(filePath);
    document.pipe(stream);
    document.fontSize(22).text(student.fullName).fontSize(10).text(`${student.email} | ${student.phone}`);
    if (student.bio) document.moveDown().fontSize(12).text("SUMMARY").fontSize(10).text(student.bio);
    if (student.skills?.length) document.moveDown().fontSize(12).text("SKILLS").fontSize(10).text(student.skills.join(", "));
    if (student.education?.length) document.moveDown().fontSize(12).text("EDUCATION").fontSize(10).text(student.education.map((item) => `${item.degree}, ${item.institution} (${item.startYear}-${item.endYear})`).join("\n"));
    if (student.experience?.length) document.moveDown().fontSize(12).text("EXPERIENCE").fontSize(10).text(student.experience.map((item) => `${item.position}, ${item.company}\n${item.description}`).join("\n\n"));
    if (student.certifications?.length) document.moveDown().fontSize(12).text("CERTIFICATIONS").fontSize(10).text(student.certifications.map((item) => `${item.name} - ${item.issuer}`).join("\n"));
    document.end();
    await new Promise((resolve, reject) => { stream.on("finish", resolve); stream.on("error", reject); });
    student.aiResumeUrl = `/uploads/resumes/${filename}`;
    await student.save();
    await logRequest("resume-analysis", student._id, "Student", "profile data", "AI resume PDF generated", 0);
    return success(res, { message: "AI resume generated", data: { aiResumeUrl: student.aiResumeUrl, shared: Boolean(student.sharedResumeUrl) } });
  } catch (err) {
    next(err);
  }
};

exports.shareResume = async (req, res, next) => {
  try {
    if (!req.user.aiResumeUrl) return next(new AppError("Generate an AI resume before sharing it.", 422));
    req.user.sharedResumeUrl = req.user.aiResumeUrl;
    await req.user.save();
    return success(res, { message: "AI resume shared to profile", data: { sharedResumeUrl: req.user.sharedResumeUrl } });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/ai/resume-analysis
 * Body: { resumeText } or relies on the student's stored resume.
 * Produces a deterministic profile-based analysis until an external AI
 * provider is configured.
 */
exports.resumeAnalysis = async (req, res, next) => {
  try {
    const start = Date.now();
    const resumeText = req.body.resumeText || "";
    const skills = req.user.skills || [];
    const profileSections = [req.user.bio, req.user.education?.length, req.user.experience?.length, req.user.projects?.length].filter(Boolean).length;
    const score = Math.min(100, 35 + skills.length * 8 + profileSections * 8 + (resumeText.length >= 200 ? 10 : 0));
    const analysis = {
      score,
      summary: `Your profile currently lists ${skills.length} skill${skills.length === 1 ? "" : "s"} and ${profileSections} completed profile section${profileSections === 1 ? "" : "s"}.`,
      strengths: skills.length ? [`${skills.length} skills listed`, "Profile data is available for matching"] : [],
      gaps: [
        ...(skills.length < 3 ? ["Add more relevant skills"] : []),
        ...(!req.user.experience?.length ? ["Add practical experience or projects"] : []),
      ],
      suggestions: ["Keep skills and experience aligned with the opportunities you target."],
      keywordsDetected: skills,
    };

    await logRequest(
      "resume-analysis",
      req.user._id,
      req.user.constructor.modelName,
      `resume length: ${resumeText.length || 0}`,
      `score: ${analysis.score}`,
      Date.now() - start
    );

    return success(res, { message: "Resume analysis complete", data: { analysis } });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/ai/recommendations
 * Returns active opportunities ranked by overlap with the student's skills.
 */
exports.recommendations = async (req, res, next) => {
  try {
    const start = Date.now();

    const studentSkills = new Set((req.user.skills || []).map((skill) => skill.toLowerCase()));
    const opportunities = await Opportunity.find({ isActive: true, status: "open", deadline: { $gte: new Date() } })
      .populate("company", "companyName")
      .limit(100);
    const recommendations = opportunities.map((opportunity) => {
      const matched = (opportunity.tags || []).filter((tag) => studentSkills.has(tag.toLowerCase()));
      return {
        opportunityId: opportunity._id,
        title: opportunity.title,
        company: opportunity.company?.companyName || "Company",
        matchScore: Math.min(100, 50 + matched.length * 15),
        matchReasons: matched.length ? [`Matches your ${matched.join(", ")} skills`] : ["Open opportunity matching your profile"],
      };
    }).sort((a, b) => b.matchScore - a.matchScore).slice(0, 20);

    await logRequest(
      "recommendation",
      req.user._id,
      req.user.constructor.modelName,
      `student: ${req.user.email}`,
      `${recommendations.length} recommendations`,
      Date.now() - start
    );

    return success(res, {
      message: "Recommendations generated",
      data: { recommendations },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/ai/candidate-matching
 * Body: { opportunityId, criteria? }
 * Company-only. Ranks applicants for one of the company's opportunities.
 */
exports.candidateMatching = async (req, res, next) => {
  try {
    const start = Date.now();
    const { opportunityId } = req.body;
    let applicationsQuery = Application.find({ company: req.user._id })
      .populate("student", "fullName skills")
      .populate("opportunity", "tags");
    if (opportunityId) {
      const opportunity = await Opportunity.findOne({ _id: opportunityId, company: req.user._id });
      if (!opportunity) return next(new AppError("Opportunity not found.", 404));
      applicationsQuery = Application.find({ opportunity: opportunity._id })
        .populate("student", "fullName skills")
        .populate("opportunity", "tags");
    }
    const applications = await applicationsQuery;
    const candidates = applications.map((application) => {
      const student = application.student;
      const required = new Set((application.opportunity?.tags || []).map((tag) => tag.toLowerCase()));
      const matched = (student.skills || []).filter((skill) => required.has(skill.toLowerCase()));
      return {
        studentId: student._id,
        fullName: student.fullName,
        matchScore: required.size ? Math.round((matched.length / required.size) * 100) : 0,
        matchReasons: matched.length ? [`Matches ${matched.join(", ")}`] : ["Applicant has been submitted for review"],
      };
    }).sort((a, b) => b.matchScore - a.matchScore);

    await logRequest(
      "candidate-matching",
      req.user._id,
      req.user.constructor.modelName,
      `opportunity: ${opportunityId || "n/a"}`,
      `${candidates.length} candidates`,
      Date.now() - start
    );

    return success(res, {
      message: "Candidate matching complete",
      data: { candidates },
    });
  } catch (err) {
    next(err);
  }
};
