const mongoose = require("mongoose");

const { Schema } = mongoose;

/**
 * Stores a log entry for every AI-powered request (resume analysis,
 * recommendation, candidate matching). Used by admins to audit AI usage.
 */
const aiLogSchema = new Schema(
  {
    feature: {
      type: String,
      required: true,
      enum: ["resume-analysis", "recommendation", "candidate-matching"],
      index: true,
    },
    requester: { type: Schema.Types.ObjectId, required: true, refPath: "requesterModel" },
    requesterModel: { type: String, required: true, enum: ["Student", "Company", "Admin"] },
    inputSummary: { type: String, default: "" },
    outputSummary: { type: String, default: "" },
    durationMs: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("AILog", aiLogSchema);
