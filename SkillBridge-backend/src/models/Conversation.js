const mongoose = require("mongoose");

const { Schema } = mongoose;

/**
 * A conversation is a 1:1 thread between a Student, Company, or Admin.
 * Legacy student/company threads keep their existing fields; admin threads
 * set admin plus exactly one of student or company.
 */
const conversationSchema = new Schema(
  {
    student: { type: Schema.Types.ObjectId, ref: "Student", index: true },
    company: { type: Schema.Types.ObjectId, ref: "Company", index: true },
    admin: { type: Schema.Types.ObjectId, ref: "Admin", index: true },
    // The opportunity this conversation is about (optional but recommended).
    opportunity: { type: Schema.Types.ObjectId, ref: "Opportunity", default: null },
    lastMessageAt: { type: Date, default: Date.now, index: true },
  },
  { timestamps: true }
);

// Unique index: one thread per student+company pair (legacy). This partial
// index excludes admin conversations (where company OR student may be null)
// so they don't collide on { student: null, company: null }.
conversationSchema.index(
  { student: 1, company: 1 },
  {
    unique: true,
    partialFilterExpression: { student: { $exists: true }, company: { $exists: true }, admin: { $exists: false } },
  }
);

// Unique index for admin+student threads.
conversationSchema.index(
  { admin: 1, student: 1 },
  {
    unique: true,
    partialFilterExpression: { admin: { $exists: true }, student: { $exists: true }, company: { $exists: false } },
  }
);

// Unique index for admin+company threads.
conversationSchema.index(
  { admin: 1, company: 1 },
  {
    unique: true,
    partialFilterExpression: { admin: { $exists: true }, company: { $exists: true }, student: { $exists: false } },
  }
);

module.exports = mongoose.model("Conversation", conversationSchema);
