import axios from "./axios.config.js";

/**
 * API client for institute parameter data operations
 */
const instituteDataApi = {
  /**
   * Get parameter mappings (for form generation)
   */
  async getParameterMappings() {
    try {
      const response = await axios.get("/institute-data/parameters/mappings");
      return response.data;
    } catch (error) {
      console.error("Error fetching parameter mappings:", error);
      throw error;
    }
  },

  /**
   * Get institute's own data
   */
  async getMyInstituteData(academicYear = null) {
    try {
      const url = academicYear 
        ? `/institute-data/my/data/${academicYear}`
        : "/institute-data/my/data";
      const response = await axios.get(url);
      return response.data;
    } catch (error) {
      console.error("Error fetching institute data:", error);
      throw error;
    }
  },

  /**
   * Save institute's own data
   */
  async saveMyInstituteData(data, academicYear = null, source = "WEB_FORM") {
    try {
      const url = academicYear 
        ? `/institute-data/my/data/${academicYear}?source=${source}`
        : `/institute-data/my/data?source=${source}`;
      const response = await axios.post(url, data);
      return response.data;
    } catch (error) {
      console.error("Error saving institute data:", error);
      throw error;
    }
  },

  /**
   * Update institute's own data
   */
  async updateMyInstituteData(data, academicYear = null, source = "WEB_FORM") {
    try {
      const url = academicYear 
        ? `/institute-data/my/data/${academicYear}?source=${source}`
        : `/institute-data/my/data?source=${source}`;
      const response = await axios.put(url, data);
      return response.data;
    } catch (error) {
      console.error("Error updating institute data:", error);
      throw error;
    }
  },

  /**
   * Get completeness statistics for own institute
   */
  async getMyCompletenessStats(academicYear = null) {
    try {
      const url = academicYear 
        ? `/institute-data/my/stats/completeness?academicYear=${academicYear}`
        : "/institute-data/my/stats/completeness";
      const response = await axios.get(url);
      return response.data;
    } catch (error) {
      console.error("Error fetching completeness stats:", error);
      throw error;
    }
  },

  /**
   * Get change history for own institute
   */
  async getMyChangeHistory(academicYear = null, limit = 50, skip = 0) {
    try {
      const url = academicYear 
        ? `/institute-data/my/history?academicYear=${academicYear}&limit=${limit}&skip=${skip}`
        : `/institute-data/my/history?limit=${limit}&skip=${skip}`;
      const response = await axios.get(url);
      return response.data;
    } catch (error) {
      console.error("Error fetching change history:", error);
      throw error;
    }
  },

  /**
   * Upload CSV file with parameter data
   */
  async uploadParameterCsv(file, academicYear) {
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("year", academicYear);
      formData.append("documentType", "PARAMETERS_CSV");

      const response = await axios.post("/documents/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    } catch (error) {
      console.error("Error uploading parameter CSV:", error);
      throw error;
    }
  },

  /**
   * Parse uploaded CSV file
   */
  async parseParameterCsv(documentId) {
    try {
      const response = await axios.post(`/documents/${documentId}/parse-parameters`);
      return response.data;
    } catch (error) {
      console.error("Error parsing parameter CSV:", error);
      throw error;
    }
  },

  /**
   * Get available years for institute data
   */
  async getAvailableYears() {
    try {
      const response = await axios.get("/institute-data/my/data");
      if (response.data.success && response.data.data) {
        const years = response.data.data.data?.map(item => item.academicYear) || [];
        return [...new Set(years)].sort((a, b) => b - a);
      }
      return [];
    } catch (error) {
      console.error("Error fetching available years:", error);
      return [];
    }
  },

  /**
   * Accept extracted parameter value
   */
  async acceptExtractedParameter(parameterName, academicYear) {
    try {
      const response = await axios.post(`/institute-data/my/extracted/accept`, {
        parameterName,
        academicYear
      });
      return response.data;
    } catch (error) {
      console.error("Error accepting extracted parameter:", error);
      throw error;
    }
  },

  /**
   * Reject extracted parameter value
   */
  async rejectExtractedParameter(parameterName, academicYear) {
    try {
      const response = await axios.post(`/institute-data/my/extracted/reject`, {
        parameterName,
        academicYear
      });
      return response.data;
    } catch (error) {
      console.error("Error rejecting extracted parameter:", error);
      throw error;
    }
  },

  /**
   * Accept all extracted parameters
   */
  async acceptAllExtractedParameters(academicYear) {
    try {
      const response = await axios.post(`/institute-data/my/extracted/accept-all`, {
        academicYear
      });
      return response.data;
    } catch (error) {
      console.error("Error accepting all extracted parameters:", error);
      throw error;
    }
  },

  /**
   * Reject all extracted parameters
   */
  async rejectAllExtractedParameters(academicYear) {
    try {
      const response = await axios.post(`/institute-data/my/extracted/reject-all`, {
        academicYear
      });
      return response.data;
    } catch (error) {
      console.error("Error rejecting all extracted parameters:", error);
      throw error;
    }
  },

  /**
   * Get extracted parameters needing verification
   */
  async getExtractedParameters(academicYear) {
    try {
      const response = await axios.get(`/institute-data/my/extracted?academicYear=${academicYear}`);
      return response.data;
    } catch (error) {
      console.error("Error fetching extracted parameters:", error);
      throw error;
    }
  },

  /**
   * Delete institute data for a specific year
   */
  async deleteInstituteData(academicYear) {
    try {
      const response = await axios.delete(`/institute-data/my/data/${academicYear}`);
      return response.data;
    } catch (error) {
      console.error("Error deleting institute data:", error);
      throw error;
    }
  },
};

export default instituteDataApi;
