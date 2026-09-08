const mongoose = require("mongoose");

const faqSchema = new mongoose.Schema(
  {
    question: { type: String, required: true, trim: true },
    answer: { type: String, required: true, trim: true },
    order: { type: Number, default: 0 },
    isPublished: { type: Boolean, default: true, index: true },
  },
  { timestamps: true }
);

faqSchema.index({ order: 1, createdAt: 1 });

module.exports = mongoose.model("FAQ", faqSchema);