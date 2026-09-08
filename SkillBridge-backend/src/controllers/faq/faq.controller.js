const FAQ = require("../../models/FAQ");
const { success } = require("../../utils/apiResponse");

exports.listFAQs = async (_req, res, next) => {
  try {
    const items = await FAQ.find({ isPublished: true })
      .select("question answer")
      .sort({ order: 1, createdAt: 1 })
      .lean();

    return success(res, { message: "Published FAQs", data: { items } });
  } catch (err) {
    next(err);
  }
};