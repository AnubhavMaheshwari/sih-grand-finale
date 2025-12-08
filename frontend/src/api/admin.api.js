import axiosInstance from "./axios.config.js";

const adminApi = {
  // Get admin dashboard statistics
  getAdminStats: async () => {
    const response = await axiosInstance.get("/admin/stats");
    return response.data;
  },

  // Get system health status
  getSystemHealth: async () => {
    const response = await axiosInstance.get("/admin/system-health");
    return response.data;
  },

  // Get user management statistics
  getUserManagementStats: async () => {
    const response = await axiosInstance.get("/admin/user-stats");
    return response.data;
  },

  // Get all users for management
  getAllUsers: async (params = {}) => {
    const queryParams = new URLSearchParams();
    
    if (params.role) queryParams.append("role", params.role);
    if (params.search) queryParams.append("search", params.search);
    if (params.page) queryParams.append("page", params.page);
    if (params.limit) queryParams.append("limit", params.limit);

    const url = `/admin/user-stats${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;
    const response = await axiosInstance.get(url);
    return response.data;
  },

  // Create new user
  createUser: async (userData) => {
    const response = await axiosInstance.post("/auth/register", userData);
    return response.data;
  },

  // Update user
  updateUser: async (userId, userData) => {
    const response = await axiosInstance.put(`/auth/users/${userId}`, userData);
    return response.data;
  },

  // Delete user
  deleteUser: async (userId) => {
    const response = await axiosInstance.delete(`/auth/users/${userId}`);
    return response.data;
  },

  // Reset user password
  resetUserPassword: async (userId, newPassword) => {
    const response = await axiosInstance.post(`/auth/users/${userId}/reset-password`, {
      newPassword,
    });
    return response.data;
  },

  // Get all institutes
  getAllInstitutes: async (params = {}) => {
    const queryParams = new URLSearchParams();
    
    if (params.category) queryParams.append("category", params.category);
    if (params.search) queryParams.append("search", params.search);
    if (params.page) queryParams.append("page", params.page);
    if (params.limit) queryParams.append("limit", params.limit);

    const url = `/admin/institutes${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;
    const response = await axiosInstance.get(url);
    return response.data;
  },

  // Create institute
  createInstitute: async (instituteData) => {
    const response = await axiosInstance.post("/admin/institutes", instituteData);
    return response.data;
  },

  // Update institute
  updateInstitute: async (instituteId, instituteData) => {
    const response = await axiosInstance.put(`/admin/institutes/${instituteId}`, instituteData);
    return response.data;
  },

  // Delete institute
  deleteInstitute: async (instituteId) => {
    const response = await axiosInstance.delete(`/admin/institutes/${instituteId}`);
    return response.data;
  },

  // Get all documents (admin view)
  getAllDocuments: async (params = {}) => {
    const queryParams = new URLSearchParams();
    
    if (params.year) queryParams.append("year", params.year);
    if (params.status) queryParams.append("status", params.status);
    if (params.instituteId) queryParams.append("instituteId", params.instituteId);
    if (params.page) queryParams.append("page", params.page);
    if (params.limit) queryParams.append("limit", params.limit);

    const url = `/documents/admin/documents${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;
    const response = await axiosInstance.get(url);
    return response.data;
  },

  // Retry document parsing
  retryDocumentParsing: async (documentId) => {
    const response = await axiosInstance.post(`/documents/documents/${documentId}/retry`);
    return response.data;
  },

  // Force delete document
  forceDeleteDocument: async (documentId) => {
    const response = await axiosInstance.delete(`/admin/documents/${documentId}`);
    return response.data;
  },
};

export default adminApi;
