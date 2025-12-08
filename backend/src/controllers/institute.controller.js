import User from "../models/User.model.js";
import Institute from "../models/Institute.model.js";
import UploadedDocument from "../models/UploadedDocument.model.js";
import { successResponse, errorResponse } from "../utils/apiResponse.js";

// Get institute profile
export const getProfile = async (req, res) => {
  try {
    const userId = req.user?.userId;
    
    if (!userId) {
      return errorResponse(res, "User not authenticated", 401);
    }

    const user = await User.findOne({ userId }).select("-password -otpCode -passwordResetToken");
    
    if (!user) {
      return errorResponse(res, "User not found", 404);
    }

    // Get institute details if user is an institute
    let instituteDetails = null;
    if (user.role === "institute" && user.instituteId) {
      instituteDetails = await Institute.findOne({ instituteId: user.instituteId });
    }

    successResponse(res, { 
      user,
      institute: instituteDetails 
    });
  } catch (error) {
    console.error("Get profile error:", error);
    errorResponse(res, "Server error", 500);
  }
};

// Update institute profile
export const updateProfile = async (req, res) => {
  try {
    const userId = req.user?.userId;
    const updateData = req.body;

    if (!userId) {
      return errorResponse(res, "User not authenticated", 401);
    }

    const user = await User.findOne({ userId });
    
    if (!user) {
      return errorResponse(res, "User not found", 404);
    }

    // Only allow updating specific fields
    const allowedUpdates = ["fullName", "email"];
    
    Object.keys(updateData).forEach((key) => {
      if (allowedUpdates.includes(key)) {
        user[key] = updateData[key];
      }
    });

    await user.save();
    
    const userResponse = user.toObject();
    delete userResponse.password;
    delete userResponse.otpCode;
    delete userResponse.passwordResetToken;

    successResponse(res, { 
      user: userResponse, 
      message: "Profile updated successfully" 
    });
  } catch (error) {
    console.error("Update profile error:", error);
    errorResponse(res, "Server error", 500);
  }
};

// Get institute dashboard statistics
export const getDashboardStats = async (req, res) => {
  try {
    const userId = req.user?.userId;
    
    if (!userId) {
      return errorResponse(res, "User not authenticated", 401);
    }

    const user = await User.findOne({ userId });
    
    if (!user || user.role !== "institute") {
      return errorResponse(res, "Institute access required", 403);
    }

    // Get document statistics for this institute
    const totalDocuments = await UploadedDocument.countDocuments({ 
      uploadedBy: user._id,
      status: { $ne: "DELETED" }
    });
    
    const parsedDocuments = await UploadedDocument.countDocuments({ 
      uploadedBy: user._id,
      status: "PARSED"
    });
    
    const pendingDocuments = await UploadedDocument.countDocuments({ 
      uploadedBy: user._id,
      status: "PARSING"
    });
    
    const errorDocuments = await UploadedDocument.countDocuments({ 
      uploadedBy: user._id,
      status: "ERROR"
    });

    // Get recent documents
    const recentDocuments = await UploadedDocument.find({ 
      uploadedBy: user._id,
      status: { $ne: "DELETED" }
    })
      .sort({ uploadedAt: -1 })
      .limit(5)
      .select("originalFilename status uploadedAt parsedData")
      .lean();

    // Get institute details
    const instituteDetails = await Institute.findOne({ instituteId: user.instituteId });

    successResponse(res, {
      stats: {
        totalDocuments,
        parsedDocuments,
        pendingDocuments,
        errorDocuments,
        documentSuccessRate: totalDocuments > 0 ? Math.round((parsedDocuments / totalDocuments) * 100) : 0,
      },
      recentDocuments: recentDocuments.map(doc => ({
        id: doc._id,
        filename: doc.originalFilename,
        status: doc.status,
        uploadedAt: doc.uploadedAt,
        hasData: !!doc.parsedData,
      })),
      institute: instituteDetails,
      user: {
        userId: user.userId,
        fullName: user.fullName,
        email: user.email,
        instituteId: user.instituteId,
        instituteName: user.instituteName,
      },
      message: "Dashboard statistics retrieved successfully",
    });
  } catch (error) {
    console.error("Get dashboard stats error:", error);
    errorResponse(res, "Server error", 500);
  }
};

// Change password (for institute users)
export const changePassword = async (req, res) => {
  try {
    const userId = req.user?.userId;
    const { currentPassword, newPassword } = req.body;

    if (!userId) {
      return errorResponse(res, "User not authenticated", 401);
    }

    if (!currentPassword || !newPassword) {
      return errorResponse(res, "Current password and new password are required", 400);
    }

    if (newPassword.length < 8) {
      return errorResponse(res, "New password must be at least 8 characters long", 400);
    }

    const user = await User.findOne({ userId });
    
    if (!user) {
      return errorResponse(res, "User not found", 404);
    }

    // Verify current password
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return errorResponse(res, "Current password is incorrect", 400);
    }

    // Update password
    user.password = newPassword;
    user.lastPasswordReset = new Date();
    await user.save();

    successResponse(res, { 
      message: "Password changed successfully",
      userId: user.userId,
    });
  } catch (error) {
    console.error("Change password error:", error);
    errorResponse(res, "Server error", 500);
  }
};
