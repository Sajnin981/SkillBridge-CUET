const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const { Schema } = mongoose;

// Sub-schemas for richer student profile data.
const educationSchema = new Schema(
  {
    institution: { type: String, required: true, trim: true },
    degree: { type: String, required: true, trim: true },
    field: { type: String, default: "", trim: true },
    startYear: { type: String, default: "", trim: true },
    endYear: { type: String, default: "", trim: true },
    grade: { type: String, default: "", trim: true },
  },
  { _id: false }
);

const experienceSchema = new Schema(
  {
    company: { type: String, required: true, trim: true },
    position: { type: String, required: true, trim: true },
    startDate: { type: String, default: "", trim: true },
    endDate: { type: String, default: "", trim: true },
    description: { type: String, default: "", maxlength: 1000 },
  },
  { _id: false }
);

const certificationSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    issuer: { type: String, default: "", trim: true },
    date: { type: String, default: "", trim: true },
    credentialUrl: { type: String, default: "", trim: true },
  },
  { _id: false }
);

const achievementSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "", maxlength: 500 },
    date: { type: String, default: "", trim: true },
  },
  { _id: false }
);

const studentSchema = new Schema(
  {
    fullName: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[a-zA-Z0-9._%+-]+@(?:[a-zA-Z0-9-]+\.)*cuet\.ac\.bd$/, "Email must be a valid CUET email (@cuet.ac.bd)"],
    },
    studentId: { type: String, required: true, unique: true, trim: true },
    department: { type: String, required: true, trim: true },
    batch: { type: String, required: true, trim: true },
    phone: {
      type: String,
      required: true,
      trim: true,
      match: [/^\+?[0-9]{10,15}$/, "Phone must be 10–15 digits, optional leading +"],
    },
    password: { type: String, required: true, minlength: 8, select: false },
    idCardUrl: { type: String, required: true },
    resumeUrl: { type: String, default: "" },
    aiResumeUrl: { type: String, default: "" },
    sharedResumeUrl: { type: String, default: "" },
    avatarUrl: { type: String, default: "" },
    bio: { type: String, default: "", maxlength: 1000 },
    skills: [{ type: String, trim: true }],
    // Rich profile sections
    education: [educationSchema],
    experience: [experienceSchema],
    certifications: [certificationSchema],
    achievements: [achievementSchema],
    portfolio: [{ type: String, trim: true }],
    // Saved opportunities for later viewing
    savedOpportunities: [{ type: Schema.Types.ObjectId, ref: "Opportunity" }],
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    rejectionReason: { type: String, default: "" },
    settings: {
      notifications: {
        email: { type: Boolean, default: true },
        push: { type: Boolean, default: true },
        applications: { type: Boolean, default: true },
        recommendations: { type: Boolean, default: true },
        messages: { type: Boolean, default: false },
      },
    },
  },
  { timestamps: true }
);

// Hash password before saving when modified.
studentSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

studentSchema.methods.comparePassword = function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

studentSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model("Student", studentSchema);
