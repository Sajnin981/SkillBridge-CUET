const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const { Schema } = mongoose;

/**
 * Admin accounts are manually inserted into the database — there is no
 * public registration endpoint for admins.
 */
const adminSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true, minlength: 8, select: false },
    role: { type: String, default: "admin" },
    settings: {
      emailNotifications: { type: Boolean, default: true },
      verificationAlerts: { type: Boolean, default: true },
      systemAlerts: { type: Boolean, default: true },
    },
  },
  { timestamps: true }
);

adminSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

adminSchema.methods.comparePassword = function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

adminSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model("Admin", adminSchema);
