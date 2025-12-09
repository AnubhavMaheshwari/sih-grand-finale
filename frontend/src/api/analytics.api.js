import axiosInstance from "./axios.config.js";

const analyticsApi = {
  // Get institute analytics overview
  getInstituteAnalytics: async (instituteId = null) => {
    try {
      let url = "/analytics/overview";
      if (instituteId) {
        url = `/analytics/admin/overview/${instituteId}`;
      }
      const response = await axiosInstance.get(url);
      return response.data;
    } catch (error) {
      console.error("Error fetching institute analytics:", error);
      throw error;
    }
  },

  // Get specific metric trends
  getMetricTrends: async (metric, instituteId = null) => {
    try {
      let url = `/analytics/metrics/${metric}`;
      if (instituteId) {
        url = `/analytics/admin/metrics/${metric}?instituteId=${instituteId}`;
      }
      const response = await axiosInstance.get(url);
      return response.data;
    } catch (error) {
      console.error("Error fetching metric trends:", error);
      throw error;
    }
  },

  // Get peer comparison
  getPeerComparison: async (instituteId = null, year = null) => {
    try {
      let url = "/analytics/peer-comparison";
      if (instituteId) {
        url = `/analytics/admin/peer-comparison/${instituteId}`;
      }
      if (year) {
        url += url.includes('?') ? `&year=${year}` : `?year=${year}`;
      }
      const response = await axiosInstance.get(url);
      return response.data;
    } catch (error) {
      console.error("Error fetching peer comparison:", error);
      throw error;
    }
  },

  // Get compliance status
  getComplianceStatus: async (instituteId = null, year = null) => {
    try {
      let url = "/analytics/compliance";
      if (instituteId) {
        url = `/analytics/compliance?instituteId=${instituteId}`;
      }
      if (year) {
        url += url.includes('?') ? `&year=${year}` : `?year=${year}`;
      }
      const response = await axiosInstance.get(url);
      return response.data;
    } catch (error) {
      console.error("Error fetching compliance status:", error);
      throw error;
    }
  },

  // Get financial data for institute
  getInstituteFinancialData: async (instituteId = null) => {
    try {
      // First get analytics data which includes financial metrics
      const analytics = await analyticsApi.getInstituteAnalytics(instituteId);

      if (analytics.success) {
        // Return the analytics response directly (it should now contain capitalByYear etc)
        return {
          success: true,
          data: analytics
        };
      }

      return {
        success: false,
        error: "Failed to load financial data"
      };

    } catch (error) {
      console.error("Error fetching financial data:", error);
      return {
        success: false,
        error: "Failed to connect to server"
      };
    }
  },
};

export default analyticsApi;
