import * as authService from "../services/auth.service.js";
import { successResponse, errorResponse } from "../utils/apiResponse.js";

export const login = async (req, res) => {
  try {
    const { userId, password } = req.body;

    if (!userId || !password) {
      return errorResponse(res, "User ID and password are required", 400);
    }

    const result = await authService.loginUser(userId, password);
    successResponse(res, result);
  } catch (error) {
    if (error.message === "Invalid credentials" || 
        error.message.includes("Account is locked") ||
        error.message.includes("Try again in") ||
        error.message.includes("registration is pending") ||
        error.message.includes("registration has been rejected")) {
      return errorResponse(res, error.message, 400);
    }
    console.error("LOGIN ERROR:", error);
    errorResponse(res, "Server error", 500);
  }
};

export const adminLogin = async (req, res) => {
  try {
    const { userId, password } = req.body;

    if (!userId || !password) {
      return errorResponse(res, "User ID and password are required", 400);
    }

    const result = await authService.loginUser(userId, password);
    
    // Verify that the user is actually an admin
    if (result.user.role !== 'admin') {
      return errorResponse(res, "Access denied. Admin credentials required.", 403);
    }
    
    successResponse(res, result);
  } catch (error) {
    if (error.message === "Invalid credentials" || 
        error.message.includes("Account is locked") ||
        error.message.includes("Try again in")) {
      return errorResponse(res, error.message, 400);
    }
    console.error("ADMIN LOGIN ERROR:", error);
    errorResponse(res, "Server error", 500);
  }
};

export const instituteLogin = async (req, res) => {
  try {
    const { userId, password } = req.body;

    if (!userId || !password) {
      return errorResponse(res, "User ID and password are required", 400);
    }

    const result = await authService.loginUser(userId, password);
    
    // Verify that the user is actually an institute
    if (result.user.role !== 'institute') {
      return errorResponse(res, "Access denied. Institute credentials required.", 403);
    }
    
    successResponse(res, result);
  } catch (error) {
    if (error.message === "Invalid credentials" || 
        error.message.includes("Account is locked") ||
        error.message.includes("Try again in") ||
        error.message.includes("registration is pending") ||
        error.message.includes("registration has been rejected")) {
      return errorResponse(res, error.message, 400);
    }
    console.error("INSTITUTE LOGIN ERROR:", error);
    errorResponse(res, "Server error", 500);
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return errorResponse(res, "Email is required", 400);
    }

    // Check if user can request OTP (rate limiting)
    const canRequest = await authService.canRequestOTP(email);
    if (!canRequest.canRequest) {
      return errorResponse(res, canRequest.message, 429);
    }

    const result = await authService.forgotPassword(email);
    successResponse(res, result);
  } catch (error) {
    if (error.message === "No account found with this email address" ||
        error.message === "Password reset is only available for institute accounts" ||
        error.message === "Failed to send OTP email. Please try again later.") {
      return errorResponse(res, error.message, 400);
    }
    console.error("FORGOT PASSWORD ERROR:", error);
    errorResponse(res, "Server error", 500);
  }
};

export const verifyOTP = async (req, res) => {
  try {
    const { email, otpCode } = req.body;

    if (!email || !otpCode) {
      return errorResponse(res, "Email and OTP code are required", 400);
    }

    const result = await authService.verifyOTP(email, otpCode);
    successResponse(res, result);
  } catch (error) {
    if (error.message === "Invalid OTP or email" ||
        error.message === "OTP not found or expired" ||
        error.message === "OTP has expired. Please request a new one." ||
        error.message === "Invalid OTP") {
      return errorResponse(res, error.message, 400);
    }
    console.error("VERIFY OTP ERROR:", error);
    errorResponse(res, "Server error", 500);
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { resetToken, newPassword } = req.body;

    if (!resetToken || !newPassword) {
      return errorResponse(res, "Reset token and new password are required", 400);
    }

    const result = await authService.resetPassword(resetToken, newPassword);
    successResponse(res, result);
  } catch (error) {
    if (error.message === "Invalid or expired reset token" ||
        error.message === "Password must be at least 8 characters long") {
      return errorResponse(res, error.message, 400);
    }
    console.error("RESET PASSWORD ERROR:", error);
    errorResponse(res, "Server error", 500);
  }
};

// Institute Registration Functions
export const registerInstitute = async (req, res) => {
  try {
    const { instituteName, instituteType, fullName, email, password } = req.body;

    // Validate required fields
    if (!instituteName || !instituteType || !fullName || !email || !password) {
      return errorResponse(res, "All fields are required: institute name, institute type, full name, email, and password", 400);
    }

    // Validate password length
    if (password.length < 8) {
      return errorResponse(res, "Password must be at least 8 characters long", 400);
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return errorResponse(res, "Invalid email format", 400);
    }

    const result = await authService.registerInstitute({
      instituteName,
      instituteType,
      fullName,
      email,
      password
    });
    
    successResponse(res, result, 201);
  } catch (error) {
    if (error.message.includes("already registered") || 
        error.message.includes("already exists") || 
        error.message.includes("Invalid") ||
        error.message.includes("required") ||
        error.message.includes("OTP")) {
      return errorResponse(res, error.message, 400);
    }
    console.error("REGISTER INSTITUTE ERROR:", error);
    errorResponse(res, "Server error during registration", 500);
  }
};

export const verifyRegistrationOTP = async (req, res) => {
  try {
    const { email, otpCode } = req.body;

    if (!email || !otpCode) {
      return errorResponse(res, "Email and OTP code are required", 400);
    }

    const result = await authService.verifyRegistrationOTP(email, otpCode);
    successResponse(res, result);
  } catch (error) {
    if (error.message === "Invalid OTP or email" ||
        error.message === "OTP not found or expired" ||
        error.message === "OTP has expired. Please request a new one." ||
        error.message === "Invalid OTP" ||
        error.message === "User not found" ||
        error.message === "Registration already verified") {
      return errorResponse(res, error.message, 400);
    }
    console.error("VERIFY REGISTRATION OTP ERROR:", error);
    errorResponse(res, "Server error", 500);
  }
};
