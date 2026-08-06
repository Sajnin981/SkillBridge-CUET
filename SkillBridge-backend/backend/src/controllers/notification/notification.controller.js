const mongoose = require("mongoose");
const Notification = require("../../models/Notification");
const AppError = require("../../utils/AppError");
const { success } = require("../../utils/apiResponse");

const MODEL_BY_ROLE = {
  student: "Student",
  company: "Company",
  admin: "Admin",
};

/**
 * GET /api/notifications
 * Query: unreadOnly=true|false, page, limit
 */
exports.listNotifications = async (req, res, next) => {
  try {
    const { unreadOnly, page = 1, limit = 20 } = req.query;
    const filter = {
      recipient: req.user._id,
      recipientModel: MODEL_BY_ROLE[req.userRole],
    };
    if (unreadOnly === "true") filter.isRead = false;

    const skip = (Number(page) - 1) * Number(limit);
    const [items, total, unreadCount] = await Promise.all([
      Notification.find(filter).sort("-createdAt").skip(skip).limit(Number(limit)),
      Notification.countDocuments(filter),
      Notification.countDocuments({ ...filter, isRead: false }),
    ]);

    return success(res, {
      message: "Notifications",
      data: {
        items,
        unreadCount,
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
 * PATCH /api/notifications/:id/read
 */
exports.markRead = async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return next(new AppError("Invalid notification ID.", 400));
    }
    const notification = await Notification.findOne({
      _id: req.params.id,
      recipient: req.user._id,
      recipientModel: MODEL_BY_ROLE[req.userRole],
    });
    if (!notification) return next(new AppError("Notification not found.", 404));

    notification.isRead = true;
    notification.readAt = new Date();
    await notification.save();

    return success(res, { message: "Notification marked as read", data: { notification } });
  } catch (err) {
    next(err);
  }
};

/**
 * PATCH /api/notifications/read-all
 */
exports.markAllRead = async (req, res, next) => {
  try {
    await Notification.updateMany(
      {
        recipient: req.user._id,
        recipientModel: MODEL_BY_ROLE[req.userRole],
        isRead: false,
      },
      { $set: { isRead: true, readAt: new Date() } }
    );

    return success(res, { message: "All notifications marked as read", data: {} });
  } catch (err) {
    next(err);
  }
};
