const mongoose = require("mongoose");

const { Schema } = mongoose;

const APPLICATION_STATUS = [
  "pending",
  "reviewing",
  "shortlisted",
  "interview",
  "offered",
  "rejected",
  "withdrawn",
];

const applicationSchema = new Schema(
  {
    opportunity: {
      type: Schema.Types.ObjectId,
      ref: "Opportunity",
      required: true,
      index: true,
    },
    student: { type: Schema.Types.ObjectId, ref: "Student", required: true, index: true },
    company: { type: Schema.Types.ObjectId, ref: "Company", required: true, index: true },
    coverLetter: { type: String, default: "", maxlength: 3000 },
    resumeUrl: { type: String, required: true },
    status: {
      type: String,
      enum: APPLICATION_STATUS,
      default: "pending",
      index: true,
    },
    // Optional company-side note when changing status.
    note: { type: String, default: "" },
    // Interview scheduling (set when status moves to "interview").
    interview: {
      scheduledAt: { type: Date, default: null },
      location: { type: String, default: "" },
      notes: { type: String, default: "" },
    },
  },
  { timestamps: true }
);

// One student can apply to a given opportunity only once.
applicationSchema.index({ opportunity: 1, student: 1 }, { unique: true });

module.exports = mongoose.model("Application", applicationSchema);
module.exports.APPLICATION_STATUS = APPLICATION_STATUS;
