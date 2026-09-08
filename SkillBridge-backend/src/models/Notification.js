const mongoose = require("mongoose");

const { Schema } = mongoose;

const notificationSchema = new Schema(
  {
    recipient: { type: Schema.Types.ObjectId, required: true, refPath: "recipientModel", index: true },
    recipientModel: { type: String, required: true, enum: ["Student", "Company", "Admin"] },
    actor: { type: Schema.Types.ObjectId, refPath: "actorModel", default: null },
    actorModel: { type: String, enum: ["Student", "Company", "Admin"], default: null },
    title: { type: String, required: true, trim: true, maxlength: 200 },
    body: { type: String, required: true, trim: true, maxlength: 1000 },
    type: { type: String, default: "info" },
    link: { type: String, default: "" },
    postId: { type: Schema.Types.ObjectId, ref: "Post", default: null },
    opportunityId: { type: Schema.Types.ObjectId, ref: "Opportunity", default: null },
    applicationId: { type: Schema.Types.ObjectId, ref: "Application", default: null },
    isRead: { type: Boolean, default: false, index: true },
    readAt: { type: Date, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Notification", notificationSchema);
