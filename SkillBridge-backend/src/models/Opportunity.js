const mongoose = require("mongoose");

const { Schema } = mongoose;

const OPPORTUNITY_TYPES = [
  "internship",
  "job",
  "research",
  "industrial-training",
  "competition",
  "freelancing",
];

const opportunitySchema = new Schema(
  {
    company: { type: Schema.Types.ObjectId, ref: "Company", required: true, index: true },
    title: { type: String, required: true, trim: true },
    type: {
      type: String,
      required: true,
      enum: OPPORTUNITY_TYPES,
      index: true,
    },
    description: { type: String, required: true },
    requirements: [{ type: String, trim: true }],
    responsibilities: [{ type: String, trim: true }],
    location: { type: String, default: "Remote", trim: true },
    isRemote: { type: Boolean, default: false },
    salary: { type: String, default: "", trim: true },
    deadline: { type: Date, required: true },
    openings: { type: Number, default: 1, min: 1 },
    tags: [{ type: String, trim: true }],
    status: {
      type: String,
      enum: ["open", "closed"],
      default: "open",
      index: true,
    },
    // Soft delete / admin moderation
    isActive: { type: Boolean, default: true, index: true },
  },
  { timestamps: true }
);

opportunitySchema.index({ title: "text", description: "text", tags: "text" });

// Cascade: when an opportunity is hard-deleted, remove its applications and
// conversations so no orphaned references remain.
opportunitySchema.pre("deleteOne", { document: true, query: false }, async function () {
  const Application = mongoose.model("Application");
  const Conversation = mongoose.model("Conversation");
  await Promise.all([
    Application.deleteMany({ opportunity: this._id }),
    Conversation.updateMany({ opportunity: this._id }, { $unset: { opportunity: "" } }),
  ]);
});

module.exports = mongoose.model("Opportunity", opportunitySchema);
module.exports.OPPORTUNITY_TYPES = OPPORTUNITY_TYPES;
