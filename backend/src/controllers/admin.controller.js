import * as adminService from "../services/admin.service.js";
import { successResponse, errorResponse } from "../utils/apiResponse.js";
import { sendWelcomeEmail } from "../utils/emailService.js";
import User from "../models/User.model.js";
import Institute from "../models/Institute.model.js";
import UploadedDocument from "../models/UploadedDocument.model.js";

// User Management Controllers
export const createUser = async (req, res) => {
  try {
    const userData = req.body;
    console.log("Create User Payload:", userData);

    const result = await adminService.createUser(userData);
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
    const users = await adminService.getUsers();
    successResponse(res, { users });
  } catch (error) {
    console.error(error);
    errorResponse(res, "Server error");
  }
};

export const getUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await adminService.getUserById(userId);
    successResponse(res, { user });
  } catch (error) {
    if (error.message === "User not found") {
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
    const user = await adminService.updateUser(userId, updateData);
    successResponse(res, { user, message: "User updated successfully" });
  } catch (error) {
    if (error.message === "User not found") {
      return errorResponse(res, error.message, 404);
    }
    console.error(error);
    errorResponse(res, "Server error");
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const result = await adminService.deleteUser(userId);
    successResponse(res, result);
  } catch (error) {
    if (error.message === "User not found") {
      return errorResponse(res, error.message, 404);
    }
    console.error(error);
    errorResponse(res, "Server error");
  }
};

export const regeneratePassword = async (req, res) => {
  try {
    const { userId } = req.params;
    const result = await adminService.regeneratePassword(userId);
    successResponse(res, result);
  } catch (error) {
    if (error.message === "User not found") {
      return errorResponse(res, error.message, 404);
    }
    console.error(error);
    errorResponse(res, "Server error");
  }
};

// Institute Management Controllers
export const createInstitute = async (req, res) => {
  try {
    const instituteData = req.body;
    const result = await adminService.createInstitute(instituteData);
    successResponse(res, result, 201);
  } catch (error) {
    console.error(error);
    errorResponse(res, "Server error");
  }
};

export const getInstitutes = async (req, res) => {
  try {
    const institutes = await adminService.getInstitutes();
    successResponse(res, { institutes });
  } catch (error) {
    console.error(error);
    errorResponse(res, "Server error");
  }
};

export const getInstitute = async (req, res) => {
  try {
    const { instituteId } = req.params;
    const institute = await adminService.getInstituteById(instituteId);
    successResponse(res, { institute });
  } catch (error) {
    if (error.message === "Institute not found") {
      return errorResponse(res, error.message, 404);
    }
    console.error(error);
    errorResponse(res, "Server error");
  }
};

export const updateInstitute = async (req, res) => {
  try {
    const { instituteId } = req.params;
    const updateData = req.body;
    const institute = await adminService.updateInstitute(instituteId, updateData);
    successResponse(res, { institute, message: "Institute updated successfully" });
  } catch (error) {
    if (error.message === "Institute not found") {
      return errorResponse(res, error.message, 404);
    }
    console.error(error);
    errorResponse(res, "Server error");
  }
};

export const deleteInstitute = async (req, res) => {
  try {
    const { instituteId } = req.params;
    const result = await adminService.deleteInstitute(instituteId);
    successResponse(res, result);
  } catch (error) {
    if (error.message === "Institute not found") {
      return errorResponse(res, error.message, 404);
    }
    console.error(error);
    errorResponse(res, "Server error");
  }
};

// Dashboard Statistics (keeping existing functions)
export const getAdminStats = async (req, res) => {
  try {
    // Get user statistics
    const totalUsers = await User.countDocuments();
    const instituteUsers = await User.countDocuments({ role: "institute" });
    const adminUsers = await User.countDocuments({ role: "admin" });

    // Get institute statistics
    const totalInstitutes = await Institute.countDocuments();
    
    // Get document statistics
    const totalDocuments = await UploadedDocument.countDocuments({ status: { $ne: "DELETED" } });
    const parsedDocuments = await UploadedDocument.countDocuments({ status: "PARSED" });
    const pendingDocuments = await UploadedDocument.countDocuments({ status: "PARSING" });
    const errorDocuments = await UploadedDocument.countDocuments({ status: "ERROR" });

    // Get recent activity
    const recentUsers = await User.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select("fullName email role createdAt")
      .lean();

    const recentDocuments = await UploadedDocument.find({ status: { $ne: "DELETED" } })
      .sort({ uploadedAt: -1 })
      .limit(5)
      .populate("uploadedBy", "fullName email")
      .lean();

    const recentActivity = [
      ...recentUsers.map(user => ({
        id: user._id,
        action: `${user.role.charAt(0).toUpperCase() + user.role.slice(1)} Created`,
        user: user.fullName || user.email,
        time: formatTimeAgo(user.createdAt),
        type: "user"
      })),
      ...recentDocuments.map(doc => ({
        id: doc._id,
        action: "Document Uploaded",
        user: doc.uploadedBy?.fullName || "Unknown",
        time: formatTimeAgo(doc.uploadedAt),
        type: "document"
      }))
    ].sort((a, b) => new Date(b.time) - new Date(a.time)).slice(0, 8);

    // Get user distribution by role
    const userDistribution = [
      { name: "Admin", value: adminUsers, color: "#4F46E5" },
      { name: "Institute", value: instituteUsers, color: "#10B981" },
    ];

    // Get institute distribution by category (if available)
    const institutes = await Institute.find().select("category").lean();
    const categoryCounts = {};
    institutes.forEach(inst => {
      const category = inst.category || "Uncategorized";
      categoryCounts[category] = (categoryCounts[category] || 0) + 1;
    });

    const instituteByCategory = Object.entries(categoryCounts).map(([category, count], index) => ({
      category,
      count,
      fill: getCategoryColor(index)
    }));

    // Get monthly growth data (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyGrowth = await getMonthlyGrowthData(sixMonthsAgo);

    return successResponse(res, {
      stats: {
        totalUsers,
        totalInstitutes,
        totalDocuments,
        parsedDocuments,
        pendingDocuments,
        errorDocuments,
        documentSuccessRate: totalDocuments > 0 ? Math.round((parsedDocuments / totalDocuments) * 100) : 0,
      },
      charts: {
        userDistribution,
        instituteByCategory,
        monthlyGrowth,
      },
      recentActivity,
      message: "Admin statistics retrieved successfully",
    });
  } catch (error) {
    console.error("Get admin stats error:", error);
    return errorResponse(res, error.message || "Failed to retrieve admin statistics", 500);
  }
};

// Helper functions
function formatTimeAgo(date) {
  if (!date) return "Unknown";
  
  const now = new Date();
  const diffMs = now - new Date(date);
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  
  return new Date(date).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function getCategoryColor(index) {
  const colors = ["#4F46E5", "#10B981", "#3B82F6", "#F59E0B", "#EF4444", "#8B5CF6"];
  return colors[index % colors.length];
}

async function getMonthlyGrowthData(sinceDate) {
  const monthlyData = [];
  const now = new Date();
  
  // Generate last 6 months
  for (let i = 5; i >= 0; i--) {
    const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
    
    const monthName = monthStart.toLocaleDateString("en-US", { month: "short" });
    
    // Count users created in this month
    const usersCount = await User.countDocuments({
      createdAt: { $gte: monthStart, $lte: monthEnd }
    });
    
    // Count institutes created in this month
    const institutesCount = await Institute.countDocuments({
      createdAt: { $gte: monthStart, $lte: monthEnd }
    });
    
    // Count documents uploaded in this month
    const documentsCount = await UploadedDocument.countDocuments({
      uploadedAt: { $gte: monthStart, $lte: monthEnd },
      status: { $ne: "DELETED" }
    });
    
    monthlyData.push({
      month: monthName,
      users: usersCount,
      institutes: institutesCount,
      documents: documentsCount,
    });
  }
  
  return monthlyData;
}
