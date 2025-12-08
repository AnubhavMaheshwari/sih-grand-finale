import User from "../models/User.model.js";
import jwt from "jsonwebtoken";
import { JWT_CONFIG, OTP_CONFIG } from "../config/constants.js";
import { sendOTPEmail, sendPasswordChangedEmail } from "../utils/emailService.js";
import crypto from "crypto";

export const loginUser = async (userId, password) => {
  // Escape special regex characters in userId
  const escapedUserId = userId.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  
  // Try to find user by userId first (case-insensitive)
  let user = await User.findOne({ 
    $or: [
      { userId: { $regex: new RegExp(`^${escapedUserId}$`, 'i') } }, // Case-insensitive match
      { email: userId } // Also try exact email match
    ]
  });
  
  if (!user) {
    throw new Error("Invalid credentials");
  }

  // Check registration status for institute users
  if (user.role === "institute") {
    if (user.registrationStatus === "pending") {
      throw new Error("Your registration is pending admin approval. Please wait for approval before logging in.");
    }
    if (user.registrationStatus === "rejected") {
      throw new Error("Your registration has been rejected. Please contact support for more information.");
    }
  }

  // Check if account is locked
  if (user.lockUntil && user.lockUntil > Date.now()) {
    const lockTime = Math.ceil((user.lockUntil - Date.now()) / 60000); // minutes
    throw new Error(`Account is locked. Try again in ${lockTime} minute(s)`);
  }

  const isMatch = await user.comparePassword(password);
  
  if (!isMatch) {
    // Increment login attempts
    user.loginAttempts += 1;
    
    // Lock account after 5 failed attempts
    if (user.loginAttempts >= 5) {
      user.lockUntil = Date.now() + 15 * 60 * 1000; // 15 minutes
    }
    
    await user.save();
    throw new Error("Invalid credentials");
  }

  // Reset login attempts on successful login
  user.loginAttempts = 0;
  user.lockUntil = null;
  await user.save();

  // Create token payload with user data
  const tokenPayload = {
    id: user._id,
    userId: user.userId,
    role: user.role,
    fullName: user.fullName,
  };

  // Add instituteId for institute users
  if (user.role === "institute") {
    tokenPayload.instituteId = user.instituteId;
    tokenPayload.instituteName = user.instituteName;
  }

  const token = jwt.sign(
    tokenPayload,
    process.env.JWT_SECRET,
    { expiresIn: JWT_CONFIG.EXPIRES_IN }
  );

  // Prepare user response data
  const userResponse = {
    id: user._id,
    userId: user.userId,
    role: user.role,
    fullName: user.fullName,
    email: user.email,
  };

  // Add institute data for institute users
  if (user.role === "institute") {
    userResponse.instituteId = user.instituteId;
    userResponse.instituteName = user.instituteName;
    userResponse.registrationStatus = user.registrationStatus;
  }

  return {
    message: "Login successful",
    token,
    user: userResponse,
  };
};

export const forgotPassword = async (email) => {
  // Find user by email
  const user = await User.findOne({ email });
  
  if (!user) {
    throw new Error("No account found with this email address");
  }

  // Check if user is an institute (only institutes can use forgot password)
  if (user.role !== "institute") {
    throw new Error("Password reset is only available for institute accounts");
  }

  // Generate 6-digit OTP
  const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
  const otpExpiresAt = new Date(Date.now() + OTP_CONFIG.EXPIRY_MINUTES * 60 * 1000);

  // Save OTP to user
  user.otpCode = otpCode;
  user.otpExpiresAt = otpExpiresAt;
  await user.save();

  // Send OTP email
  const emailResult = await sendOTPEmail(email, otpCode);
  
  if (!emailResult.success) {
    throw new Error("Failed to send OTP email. Please try again later.");
  }

  return {
    message: "OTP sent to your email address",
    email: email,
    expiresIn: OTP_CONFIG.EXPIRY_MINUTES,
  };
};

export const verifyOTP = async (email, otpCode) => {
  // Find user by email
  const user = await User.findOne({ email });
  
  if (!user) {
    throw new Error("Invalid OTP or email");
  }

  // Check if OTP exists and is not expired
  if (!user.otpCode || !user.otpExpiresAt) {
    throw new Error("OTP not found or expired");
  }

  if (user.otpExpiresAt < new Date()) {
    // Clear expired OTP
    user.otpCode = null;
    user.otpExpiresAt = null;
    await user.save();
    throw new Error("OTP has expired. Please request a new one.");
  }

  // Verify OTP
  if (user.otpCode !== otpCode) {
    throw new Error("Invalid OTP");
  }

  // Generate password reset token
  const resetToken = crypto.randomBytes(32).toString('hex');
  const resetTokenExpires = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes

  // Save reset token
  user.passwordResetToken = resetToken;
  user.passwordResetExpires = resetTokenExpires;
  await user.save();

  return {
    message: "OTP verified successfully",
    resetToken,
    expiresIn: 30, // minutes
  };
};

export const resetPassword = async (resetToken, newPassword) => {
  // Find user by reset token
  const user = await User.findOne({ 
    passwordResetToken: resetToken,
    passwordResetExpires: { $gt: new Date() }
  });
  
  if (!user) {
    throw new Error("Invalid or expired reset token");
  }

  // Validate new password
  if (newPassword.length < 8) {
    throw new Error("Password must be at least 8 characters long");
  }

  // Update password
  user.password = newPassword;
  user.lastPasswordReset = new Date();
  
  // Clear OTP and reset token fields
  user.otpCode = null;
  user.otpExpiresAt = null;
  user.passwordResetToken = null;
  user.passwordResetExpires = null;
  user.loginAttempts = 0;
  user.lockUntil = null;
  
  await user.save();

  // Send password change confirmation email
  if (user.email) {
    await sendPasswordChangedEmail(user.email);
  }

  return {
    message: "Password reset successfully",
    userId: user.userId,
    email: user.email,
  };
};

// Helper function to check if user can request OTP (rate limiting)
export const canRequestOTP = async (email) => {
  const user = await User.findOne({ email });
  
  if (!user) {
    return { canRequest: true };
  }

  // Check if user has made too many OTP requests
  // This is a simple implementation - in production you might want more sophisticated rate limiting
  if (user.otpExpiresAt && user.otpExpiresAt > new Date()) {
    const timeLeft = Math.ceil((user.otpExpiresAt - new Date()) / 60000); // minutes
    return { 
      canRequest: false, 
      message: `Please wait ${timeLeft} minute(s) before requesting a new OTP` 
    };
  }

  return { canRequest: true };
};

// Institute Registration Functions
export const registerInstitute = async (userData) => {
  const { instituteName, instituteType, fullName, email, password } = userData;
  
  // Check if email already exists
  const existingUserByEmail = await User.findOne({ email });
  if (existingUserByEmail) {
    throw new Error("Email already registered");
  }

  // Generate institute ID based on type
  const prefix = getInstitutePrefix(instituteType);
  const instituteId = `${prefix}${Math.floor(100000 + Math.random() * 900000)}`;
  
  // Generate User ID (same as instituteId for institute users)
  const userId = instituteId;

  // Check if user ID already exists
  const existingUserById = await User.findOne({ userId });
  if (existingUserById) {
    throw new Error("User ID already exists. Please try again.");
  }

  // Generate 6-digit OTP for registration verification
  const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
  const otpExpiresAt = new Date(Date.now() + OTP_CONFIG.EXPIRY_MINUTES * 60 * 1000);

  // Create new user with pending registration status
  const newUser = await User.create({
    userId,
    password,
    role: "institute",
    instituteId,
    instituteName,
    instituteType,
    fullName,
    email,
    otpCode,
    otpExpiresAt,
    registrationStatus: "pending",
  });

  // Send OTP email for registration verification
  const emailResult = await sendOTPEmail(email, otpCode);
  
  if (!emailResult.success) {
    // If email fails, delete the user and throw error
    await User.findByIdAndDelete(newUser._id);
    throw new Error("Failed to send OTP email. Please try again later.");
  }

  // Prepare response (don't include sensitive data)
  const userResponse = {
    id: newUser._id,
    email: newUser.email,
    fullName: newUser.fullName,
    instituteName: newUser.instituteName,
    instituteType: newUser.instituteType,
    registrationStatus: newUser.registrationStatus,
    message: "Registration successful. Please check your email for OTP verification.",
  };

  return {
    message: "Institute registration successful. OTP sent to email for verification.",
    user: userResponse,
    expiresIn: OTP_CONFIG.EXPIRY_MINUTES,
  };
};

export const verifyRegistrationOTP = async (email, otpCode) => {
  // Find user by email
  const user = await User.findOne({ email });
  
  if (!user) {
    throw new Error("User not found");
  }

  // Check if registration is already verified/approved
  if (user.registrationStatus !== "pending") {
    throw new Error("Registration already verified");
  }

  // Check if OTP exists and is not expired
  if (!user.otpCode || !user.otpExpiresAt) {
    throw new Error("OTP not found or expired");
  }

  if (user.otpExpiresAt < new Date()) {
    // Clear expired OTP
    user.otpCode = null;
    user.otpExpiresAt = null;
    await user.save();
    throw new Error("OTP has expired. Please request a new one.");
  }

  // Verify OTP
  if (user.otpCode !== otpCode) {
    throw new Error("Invalid OTP");
  }

  // Clear OTP after successful verification
  user.otpCode = null;
  user.otpExpiresAt = null;
  await user.save();

  return {
    message: "Registration OTP verified successfully. Your account is pending admin approval.",
    userId: user.userId,
    email: user.email,
    registrationStatus: user.registrationStatus,
  };
};

// Helper function for institute prefix
function getInstitutePrefix(instituteType) {
  switch(instituteType) {
    case 'engineering': return 'ENGG';
    case 'management': return 'MGMT';
    case 'medical': return 'MED';
    default: return 'INST';
  }
}
