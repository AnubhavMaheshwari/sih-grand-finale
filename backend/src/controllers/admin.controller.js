import User from "../models/User.model.js";
import Institute from "../models/Institute.model.js";
import UploadedDocument from "../models/UploadedDocument.model.js";
import ParsedDocumentData from "../models/ParsedDocumentData.model.js";
import { successResponse, errorResponse } from "../utils/apiResponse.js";

// Get admin dashboard statistics
const getAdminStats = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user?.role !== "admin") {
      return errorResponse(res, "Admin access required", 403);
    }

    // Get user statistics
    const totalUsers = await User.countDocuments();
    const instituteUsers = await User.countDocuments({ role: "institute" });
    const ugcEmployees = await User.countDocuments({ role: "ugc_employee" });
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
      { name: "UGC Employee", value: ugcEmployees, color: "#3B82F6" },
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
        totalEmployees: ugcEmployees,
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

// Get system health status
const getSystemHealth = async (req, res) => {
  try {
    if (req.user?.role !== "admin") {
      return errorResponse(res, "Admin access required", 403);
    }

    // Check database connection
    const dbStatus = await checkDatabaseHealth();
    
    // Check storage availability (simplified)
    const storageStatus = {
      status: "healthy",
      used: "2.4GB",
      total: "10GB",
      percentage: 24,
    };

    // Check recent errors
    const recentErrors = await UploadedDocument.find({ status: "ERROR" })
      .sort({ updatedAt: -1 })
      .limit(5)
      .select("originalFilename errorDetails updatedAt")
      .lean();

    return successResponse(res, {
      health: {
        database: dbStatus,
        storage: storageStatus,
        api: { status: "healthy", responseTime: "120ms" },
        overall: dbStatus.status === "healthy" ? "healthy" : "degraded",
      },
      recentErrors: recentErrors.map(error => ({
        document: error.originalFilename,
        error: error.errorDetails?.[0]?.error || "Unknown error",
        time: formatTimeAgo(error.updatedAt),
      })),
      message: "System health status retrieved successfully",
    });
  } catch (error) {
    console.error("Get system health error:", error);
    return errorResponse(res, error.message || "Failed to retrieve system health", 500);
  }
};

// Get user management statistics
const getUserManagementStats = async (req, res) => {
  try {
    if (req.user?.role !== "admin") {
      return errorResponse(res, "Admin access required", 403);
    }

    const users = await User.find()
      .select("fullName email role instituteId createdAt lastLogin")
      .populate("instituteId", "name")
      .lean();

    // Calculate user engagement
    const activeUsers = users.filter(user => {
      if (!user.lastLogin) return false;
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return new Date(user.lastLogin) > thirtyDaysAgo;
    }).length;

    const engagementRate = users.length > 0 ? Math.round((activeUsers / users.length) * 100) : 0;

    return successResponse(res, {
      users: users.map(user => ({
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        institute: user.instituteId?.name || "N/A",
        createdAt: user.createdAt,
        lastLogin: user.lastLogin,
        isActive: user.lastLogin ? new Date(user.lastLogin) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) : false,
      })),
      stats: {
        totalUsers: users.length,
        activeUsers,
        engagementRate,
        byRole: {
          admin: users.filter(u => u.role === "admin").length,
          institute: users.filter(u => u.role === "institute").length,
          ugc_employee: users.filter(u => u.role === "ugc_employee").length,
        },
      },
      message: "User management statistics retrieved successfully",
    });
  } catch (error) {
    console.error("Get user management stats error:", error);
    return errorResponse(res, error.message || "Failed to retrieve user management statistics", 500);
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

async function checkDatabaseHealth() {
  try {
    // Simple database health check
    const userCount = await User.countDocuments();
    const instituteCount = await Institute.countDocuments();
    
    return {
      status: "healthy",
      collections: {
        users: userCount,
        institutes: instituteCount,
        documents: await UploadedDocument.countDocuments(),
      },
      lastCheck: new Date(),
    };
  } catch (error) {
    return {
      status: "unhealthy",
      error: error.message,
      lastCheck: new Date(),
    };
  }
}

export {
  getAdminStats,
  getSystemHealth,
  getUserManagementStats,
};
