import * as authService from "../services/auth.service.js";
import { successResponse, errorResponse } from "../utils/apiResponse.js";
import { sendWelcomeEmail } from "../utils/emailService.js";

export const login = async (req, res) => {
  try {
    const { userId, password } = req.body;

    const result = await authService.loginUser(userId, password);

    successResponse(res, result);
  } catch (error) {
    if (error.message === "Invalid credentials") {
      return errorResponse(res, error.message, 400);
    }
    console.error("LOGIN ERROR:", error);
    errorResponse(res, "Server error");
  }
};

export const createUser = async (req, res) => {
  try {
    const userData = req.body;
    console.log("Create User Payload:", userData);

    const result = await authService.createUser(userData);
    console.log("Create User Result:", result);

    // Send email if user creation was successful and email exists
    if (result.user.email && result.user.generatedPassword) {
      // Don't await this to keep response fast, or await if critical
      try {
        await sendWelcomeEmail(result.user.email, result.user.userId, result.user.generatedPassword);
      } catch (emailError) {
        console.error("Failed to send email:", emailError);
      }
    }

    successResponse(res, result, 201);
  } catch (error) {
    if (error.message === "UserId already exists" ||
      error.message === "Institute ID and name are required for institute users" ||
      error.message === "Institute not found. Please create institute first.") {
      return errorResponse(res, error.message, 400);
    }
    console.error(error);
    errorResponse(res, "Server error");
  }
};

export const getUsers = async (req, res) => {
  try {
    const currentUserRole = req.user?.role;
    const users = await authService.getUsers(currentUserRole);

    successResponse(res, { users });
  } catch (error) {
    console.error(error);
    errorResponse(res, "Server error");
  }
};

export const getUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserRole = req.user?.role;
    const currentUserId = req.user?.userId;

    const user = await authService.getUserById(userId, currentUserRole, currentUserId);

    successResponse(res, { user });
  } catch (error) {
    if (error.message === "User not found" || error.message === "Access denied") {
      return errorResponse(res, error.message, 404);
    }
    console.error(error);
    errorResponse(res, "Server error");
  }
};

export const updateUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const updateData = req.body;
    const currentUserRole = req.user?.role;
    const currentUserId = req.user?.userId;

    const user = await authService.updateUser(userId, updateData, currentUserRole, currentUserId);

    successResponse(res, { user, message: "User updated successfully" });
  } catch (error) {
    if (error.message === "User not found" || error.message === "Access denied") {
      return errorResponse(res, error.message, 404);
    }
    console.error(error);
    errorResponse(res, "Server error");
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserRole = req.user?.role;

    const result = await authService.deleteUser(userId, currentUserRole);

    successResponse(res, result);
  } catch (error) {
    if (error.message === "User not found" || error.message === "Only admin can delete users") {
      return errorResponse(res, error.message, 404);
    }
    console.error(error);
    errorResponse(res, "Server error");
  }
};

export const getProfile = async (req, res) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return errorResponse(res, "User not authenticated", 401);
    }

    const user = await authService.getUserById(userId, req.user?.role, userId);

    successResponse(res, { user });
  } catch (error) {
    console.error(error);
    errorResponse(res, "Server error");
  }
};

export const updateProfile = async (req, res) => {
  try {
    const userId = req.user?.userId;
    const updateData = req.body;

    if (!userId) {
      return errorResponse(res, "User not authenticated", 401);
    }

    // Users can only update their own profile
    const user = await authService.updateUser(userId, updateData, req.user?.role, userId);

    successResponse(res, { user, message: "Profile updated successfully" });
  } catch (error) {
    console.error(error);
    errorResponse(res, "Server error");
  }
};

export const regeneratePassword = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserRole = req.user?.role;

    const result = await authService.regeneratePassword(userId, currentUserRole);

    successResponse(res, result);
  } catch (error) {
    if (error.message === "Only admin can regenerate passwords" ||
      error.message === "User not found") {
      return errorResponse(res, error.message, 400);
    }
    console.error(error);
    errorResponse(res, "Server error");
  }
};
