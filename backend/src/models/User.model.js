import mongoose from "mongoose";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["admin", "institute"],
      default: "institute",
    },
    instituteId: {
      type: String,
      required: function() { return this.role === "institute"; },
    },
    instituteName: {
      type: String,
      required: function() { return this.role === "institute"; },
    },
    instituteType: {
      type: String,
      enum: ["engineering", "management", "medical", "others"],
      default: "others",
      required: function() { return this.role === "institute"; },
    },
    fullName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      default: "",
    },
    generatedPassword: {
      type: String,
      default: "",
    },
    // OTP and password reset fields
    otpCode: {
      type: String,
      default: null,
    },
    otpExpiresAt: {
      type: Date,
      default: null,
    },
    passwordResetToken: {
      type: String,
      default: null,
    },
    passwordResetExpires: {
      type: Date,
      default: null,
    },
    lastPasswordReset: {
      type: Date,
      default: null,
    },
    loginAttempts: {
      type: Number,
      default: 0,
    },
    lockUntil: {
      type: Date,
      default: null,
    },
    // Registration status for institute users
    registrationStatus: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
  },
  { timestamps: true }
);

userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.comparePassword = function (plainPassword) {
  return bcrypt.compare(plainPassword, this.password);
};

const users = mongoose.model("users", userSchema);

export default users;
