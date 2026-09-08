const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const { Schema } = mongoose;

const companySchema = new Schema(
  {
    companyName: { type: String, required: true, trim: true },
    hrName: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Please provide a valid email"],
    },
    phone: {
      type: String,
      required: true,
      trim: true,
      match: [/^\+?[0-9]{10,15}$/, "Phone must be 10–15 digits, optional leading +"],
    },
    website: { type: String, trim: true, default: "" },
    industry: { type: String, required: true, trim: true },
    address: { type: String, required: true, trim: true },
    size: { type: String, trim: true, default: "" },
    founded: { type: String, trim: true, default: "" },
    password: { type: String, required: true, minlength: 8, select: false },
    logoUrl: { type: String, default: "" },
    tradeLicenseUrl: { type: String, required: true },
    description: { type: String, default: "", maxlength: 2000 },
    achievements: [{ type: String, trim: true }],
    projects: [{
      title: { type: String, required: true, trim: true },
      description: { type: String, default: "", maxlength: 1000 },
      link: { type: String, default: "", trim: true },
    }],
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    rejectionReason: { type: String, default: "" },
    settings: {
      notifications: {
        newApplicants: { type: Boolean, default: true },
        dailyDigest: { type: Boolean, default: true },
        messages: { type: Boolean, default: true },
        weeklyReport: { type: Boolean, default: false },
      },
    },
  },
  { timestamps: true }
);

companySchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

companySchema.methods.comparePassword = function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

companySchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model("Company", companySchema);
