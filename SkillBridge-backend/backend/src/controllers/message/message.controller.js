const mongoose = require("mongoose");
const Conversation = require("../../models/Conversation");
const Message = require("../../models/Message");
const Opportunity = require("../../models/Opportunity");
const AppError = require("../../utils/AppError");
const { success } = require("../../utils/apiResponse");

const isStudent = (req) => req.userRole === "student";
const isCompany = (req) => req.userRole === "company";

/**
 * GET /api/messages/conversations
 * Returns the conversations for the current user (student or company).
 */
exports.listConversations = async (req, res, next) => {
  try {
    const filter = isStudent(req)
      ? { student: req.user._id }
      : { company: req.user._id };

    const items = await Conversation.find(filter)
      .populate("student", "fullName avatarUrl")
      .populate("company", "companyName logoUrl")
      .populate("opportunity", "title type")
      .sort("-lastMessageAt");

    return success(res, { message: "Conversations", data: { items } });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/messages/conversations
 * Body: { companyId, opportunityId? }  (student initiating)
 *    or { studentId, opportunityId? }  (company initiating)
 */
exports.startConversation = async (req, res, next) => {
  try {
    const studentId = isStudent(req) ? req.user._id : req.body.studentId;
    const companyId = isCompany(req) ? req.user._id : req.body.companyId;

    if (!studentId || !companyId) {
      return next(new AppError("Both student and company are required.", 422));
    }
    if (!mongoose.isValidObjectId(studentId) || !mongoose.isValidObjectId(companyId)) {
      return next(new AppError("Invalid student or company ID.", 400));
    }

    let opportunity = null;
    if (req.body.opportunityId) {
      if (!mongoose.isValidObjectId(req.body.opportunityId)) {
        return next(new AppError("Invalid opportunity ID.", 400));
      }
      opportunity = await Opportunity.findById(req.body.opportunityId);
    }

    // Upsert — one conversation per (student, company) pair.
    const conversation = await Conversation.findOneAndUpdate(
      { student: studentId, company: companyId },
      { $setOnInsert: { student: studentId, company: companyId, opportunity: opportunity?._id || null } },
      { upsert: true, new: true }
    );

    return success(res, { message: "Conversation ready", data: { conversation } });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/messages/conversations/:id/messages
 * Paginated message history for a conversation.
 */
exports.listMessages = async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return next(new AppError("Invalid conversation ID.", 400));
    }
    const conversation = await Conversation.findById(req.params.id);
    if (!conversation) return next(new AppError("Conversation not found.", 404));

    // Authorization: only the two participants can read the thread.
    const isParticipant =
      (isStudent(req) && conversation.student.equals(req.user._id)) ||
      (isCompany(req) && conversation.company.equals(req.user._id));
    if (!isParticipant) return next(new AppError("Not authorized for this conversation.", 403));

    const { page = 1, limit = 50 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const [items, total] = await Promise.all([
      Message.find({ conversation: conversation._id })
        .sort("createdAt")
        .skip(skip)
        .limit(Number(limit)),
      Message.countDocuments({ conversation: conversation._id }),
    ]);

    return success(res, {
      message: "Messages",
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
 * POST /api/messages/conversations/:id/messages
 * Body: { content }
 */
exports.sendMessage = async (req, res, next) => {
  try {
    const { content } = req.body;
    if (!content || !content.trim()) {
      return next(new AppError("Message content is required.", 422));
    }
    if (!mongoose.isValidObjectId(req.params.id)) {
      return next(new AppError("Invalid conversation ID.", 400));
    }

    const conversation = await Conversation.findById(req.params.id);
    if (!conversation) return next(new AppError("Conversation not found.", 404));

    const isParticipant =
      (isStudent(req) && conversation.student.equals(req.user._id)) ||
      (isCompany(req) && conversation.company.equals(req.user._id));
    if (!isParticipant) return next(new AppError("Not authorized for this conversation.", 403));

    const message = await Message.create({
      conversation: conversation._id,
      sender: req.user._id,
      senderModel: isStudent(req) ? "Student" : "Company",
      content: content.trim(),
    });

    conversation.lastMessageAt = new Date();
    await conversation.save();

    return success(res, {
      statusCode: 201,
      message: "Message sent",
      data: { message },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * PATCH /api/messages/conversations/:id/read
 * Marks all messages NOT sent by the current user as read.
 */
exports.markRead = async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return next(new AppError("Invalid conversation ID.", 400));
    }
    const conversation = await Conversation.findById(req.params.id);
    if (!conversation) return next(new AppError("Conversation not found.", 404));

    await Message.updateMany(
      {
        conversation: conversation._id,
        sender: { $ne: req.user._id },
        read: false,
      },
      { $set: { read: true, readAt: new Date() } }
    );

    return success(res, { message: "Messages marked as read", data: {} });
  } catch (err) {
    next(err);
  }
};
