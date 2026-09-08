const mongoose = require("mongoose");

const { Schema } = mongoose;

const APPLICATION_STATUS = [
  "new",
  "shortlisted",
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
    resumeUrl: { type: String, default: "" },
    status: {
      type: String,
      enum: APPLICATION_STATUS,
      default: "new",
      index: true,
    },
    // Optional company-side note when changing status.
    note: { type: String, default: "" },
  },
  { timestamps: true }
);

// One student can apply to a given opportunity only once.
applicationSchema.index({ opportunity: 1, student: 1 }, { unique: true });

module.exports = mongoose.model("Application", applicationSchema);
module.exports.APPLICATION_STATUS = APPLICATION_STATUS;
