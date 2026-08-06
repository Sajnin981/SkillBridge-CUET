const AILog = require("../../models/AILog");
const { success } = require("../../utils/apiResponse");

/**
 * AI placeholder endpoints.
 *
 * These return mock JSON responses shaped like the eventual real AI output,
 * so the frontend can integrate against them immediately. Each request is
 * logged to the AILog collection for admin auditing. When a real AI provider
 * is wired in later, only the response bodies here need to change.
 */

const logRequest = (feature, requester, requesterModel, inputSummary, outputSummary, durationMs) =>
  AILog.create({
    feature,
    requester,
    requesterModel,
    inputSummary,
    outputSummary,
    durationMs,
  });

/**
 * POST /api/ai/resume-analysis
 * Body: { resumeText } or relies on the student's stored resume.
 * Returns a mock resume analysis (score, strengths, gaps, suggestions).
 */
exports.resumeAnalysis = async (req, res, next) => {
  try {
    const start = Date.now();
    const resumeText = req.body.resumeText || req.user?.resumeUrl || "";

    const analysis = {
      score: 78,
      summary: "Your resume demonstrates solid technical foundations with relevant project experience.",
      strengths: [
        "Clear academic background in engineering",
        "Demonstrated proficiency in multiple programming languages",
        "Relevant internship or project experience",
      ],
      gaps: [
        "Limited evidence of leadership or team coordination",
        "Quantifiable achievements could be highlighted more",
        "Missing industry-specific certifications",
      ],
      suggestions: [
        "Add measurable outcomes to your experience entries (e.g., 'improved performance by 20%')",
        "Include a dedicated skills section with proficiency levels",
        "Tailor your resume keywords to each opportunity you apply for",
      ],
      keywordsDetected: ["JavaScript", "React", "Node.js", "MongoDB", "Python"],
      isPlaceholder: true,
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
 * Returns mock opportunity recommendations for the authenticated student.
 */
exports.recommendations = async (req, res, next) => {
  try {
    const start = Date.now();

    const recommendations = [
      {
        opportunityId: "mock-1",
        title: "Software Engineering Intern",
        company: "TechCorp Ltd.",
        matchScore: 92,
        matchReasons: ["Matches your React skills", "Aligned with your department (CSE)"],
      },
      {
        opportunityId: "mock-2",
        title: "Backend Developer (Freelance)",
        company: "StartupHub",
        matchScore: 85,
        matchReasons: ["Matches your Node.js experience", "Remote-friendly"],
      },
      {
        opportunityId: "mock-3",
        title: "Research Assistant — Machine Learning",
        company: "CUET Research Lab",
        matchScore: 80,
        matchReasons: ["Matches your Python skills", "On-campus opportunity"],
      },
    ];

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
      data: { recommendations, isPlaceholder: true },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/ai/candidate-matching
 * Body: { opportunityId, criteria? }
 * Company-only. Returns mock candidate matches for an opportunity.
 */
exports.candidateMatching = async (req, res, next) => {
  try {
    const start = Date.now();
    const { opportunityId } = req.body;

    const candidates = [
      {
        studentId: "mock-student-1",
        fullName: "Ayesha Rahman",
        matchScore: 94,
        matchReasons: ["Strong React skills", "Relevant internship experience"],
      },
      {
        studentId: "mock-student-2",
        fullName: "Tanvir Ahmed",
        matchScore: 88,
        matchReasons: ["Node.js proficiency", "Matching department (CSE)"],
      },
      {
        studentId: "mock-student-3",
        fullName: "Sadia Karim",
        matchScore: 82,
        matchReasons: ["Python experience", "Relevant project portfolio"],
      },
    ];

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
      data: { candidates, isPlaceholder: true },
    });
  } catch (err) {
    next(err);
  }
};
