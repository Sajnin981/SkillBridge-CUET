const mongoose = require("mongoose");

const { Schema } = mongoose;

/**
 * A conversation is a 1:1 thread between a Student and a Company.
 * Either side can initiate; the pair (student + company) is unique.
 */
const conversationSchema = new Schema(
  {
    student: { type: Schema.Types.ObjectId, ref: "Student", required: true, index: true },
    company: { type: Schema.Types.ObjectId, ref: "Company", required: true, index: true },
    // The opportunity this conversation is about (optional but recommended).
    opportunity: { type: Schema.Types.ObjectId, ref: "Opportunity", default: null },
    lastMessageAt: { type: Date, default: Date.now, index: true },
  },
  { timestamps: true }
);

conversationSchema.index({ student: 1, company: 1 }, { unique: true });

module.exports = mongoose.model("Conversation", conversationSchema);
