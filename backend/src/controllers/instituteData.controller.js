import instituteDataService from "../services/instituteData.service.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { ApiError } from "../utils/apiResponse.js";

/**
 * Controller for institute parameter data operations
 */
class InstituteDataController {
  /**
   * Get institute data for a specific year
   */
  async getInstituteData(req, res, next) {
    try {
      const { instituteId, academicYear } = req.params;
      const userId = req.user?._id;

      if (!instituteId) {
        throw new ApiError(400, "Institute ID is required");
      }

      // Parse academic year to number
      const year = academicYear ? parseInt(academicYear) : new Date().getFullYear();

      const data = await instituteDataService.getInstituteData(instituteId, year);

      if (!data) {
        return res
          .status(200)
          .json(new ApiResponse(200, null, "No data found for this institute and year"));
      }

      return res
        .status(200)
        .json(new ApiResponse(200, data, "Institute data retrieved successfully"));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get all institute data for an institute (multiple years)
   */
  async getAllInstituteData(req, res, next) {
    try {
      const { instituteId } = req.params;
      const { limit = "10", skip = "0" } = req.query;

      if (!instituteId) {
        throw new ApiError(400, "Institute ID is required");
      }

      const result = await instituteDataService.getAllInstituteData(
        instituteId,
        parseInt(limit),
        parseInt(skip)
      );

      return res
        .status(200)
        .json(new ApiResponse(200, result, "Institute data retrieved successfully"));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get institute's own data (for institute users)
   */
  async getMyInstituteData(req, res, next) {
    try {
      const user = req.user;
      const { academicYear } = req.params;
      const { limit = "10", skip = "0" } = req.query;

      if (!user || !user.instituteId) {
        throw new ApiError(400, "User is not associated with an institute");
      }

      if (academicYear) {
        // Get data for specific year
        const year = parseInt(academicYear);
        const data = await instituteDataService.getInstituteData(user.instituteId, year);

        return res
          .status(200)
          .json(new ApiResponse(200, data, "Institute data retrieved successfully"));
      } else {
        // Get all data for the institute
        const result = await instituteDataService.getAllInstituteData(
          user.instituteId,
          parseInt(limit),
          parseInt(skip)
        );

        return res
          .status(200)
          .json(new ApiResponse(200, result, "Institute data retrieved successfully"));
      }
    } catch (error) {
      next(error);
    }
  }

  /**
   * Save institute data (create or update)
   */
  async saveInstituteData(req, res, next) {
    try {
      const user = req.user;
      const { instituteId, academicYear } = req.params;
      const data = req.body;
      const { source = "WEB_FORM" } = req.query;

      // Determine which institute ID to use
      let targetInstituteId = instituteId;
      
      // If user is institute user, they can only save data for their own institute
      if (user.role === "institute") {
        if (!user.instituteId) {
          throw new ApiError(400, "User is not associated with an institute");
        }
        targetInstituteId = user.instituteId;
      }

      // If no institute ID provided and user is admin, throw error
      if (!targetInstituteId && user.role === "admin") {
        throw new ApiError(400, "Institute ID is required for admin users");
      }

      // Parse academic year
      const year = academicYear ? parseInt(academicYear) : new Date().getFullYear();

      // Validate data structure
      if (!data || typeof data !== "object") {
        throw new ApiError(400, "Invalid data format");
      }

      const savedData = await instituteDataService.saveInstituteData(
        targetInstituteId,
        year,
        data,
        user._id,
        source
      );

      return res
        .status(200)
        .json(new ApiResponse(200, savedData, "Institute data saved successfully"));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Save institute's own data (for institute users)
   */
  async saveMyInstituteData(req, res, next) {
    try {
      const user = req.user;
      const { academicYear } = req.params;
      const data = req.body;
      const { source = "WEB_FORM" } = req.query;

      if (!user || user.role !== "institute" || !user.instituteId) {
        throw new ApiError(403, "Only institute users can save their own data");
      }

      // Parse academic year
      const year = academicYear ? parseInt(academicYear) : new Date().getFullYear();

      // Validate data structure
      if (!data || typeof data !== "object") {
        throw new ApiError(400, "Invalid data format");
      }

      const savedData = await instituteDataService.saveInstituteData(
        user.instituteId,
        year,
        data,
        user._id,
        source
      );

      return res
        .status(200)
        .json(new ApiResponse(200, savedData, "Institute data saved successfully"));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete institute data
   */
  async deleteInstituteData(req, res, next) {
    try {
      const user = req.user;
      const { instituteId, academicYear } = req.params;

      // Only admins can delete institute data
      if (user.role !== "admin") {
        throw new ApiError(403, "Only admin users can delete institute data");
      }

      if (!instituteId || !academicYear) {
        throw new ApiError(400, "Institute ID and academic year are required");
      }

      const year = parseInt(academicYear);

      const result = await instituteDataService.deleteInstituteData(
        instituteId,
        year,
        user._id
      );

      return res
        .status(200)
        .json(new ApiResponse(200, result, "Institute data deleted successfully"));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Verify institute data (admin only)
   */
  async verifyInstituteData(req, res, next) {
    try {
      const user = req.user;
      const { instituteId, academicYear } = req.params;

      // Only admins can verify data
      if (user.role !== "admin") {
        throw new ApiError(403, "Only admin users can verify institute data");
      }

      if (!instituteId || !academicYear) {
        throw new ApiError(400, "Institute ID and academic year are required");
      }

      const year = parseInt(academicYear);

      const verifiedData = await instituteDataService.verifyInstituteData(
        instituteId,
        year,
        user._id
      );

      return res
        .status(200)
        .json(new ApiResponse(200, verifiedData, "Institute data verified successfully"));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Unverify institute data (admin only)
   */
  async unverifyInstituteData(req, res, next) {
    try {
      const user = req.user;
      const { instituteId, academicYear } = req.params;

      // Only admins can unverify data
      if (user.role !== "admin") {
        throw new ApiError(403, "Only admin users can unverify institute data");
      }

      if (!instituteId || !academicYear) {
        throw new ApiError(400, "Institute ID and academic year are required");
      }

      const year = parseInt(academicYear);

      const unverifiedData = await instituteDataService.unverifyInstituteData(
        instituteId,
        year,
        user._id
      );

      return res
        .status(200)
        .json(new ApiResponse(200, unverifiedData, "Institute data unverified successfully"));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get data completeness statistics
   */
  async getCompletenessStats(req, res, next) {
    try {
      const { instituteId } = req.params;
      const { academicYear } = req.query;

      if (!instituteId) {
        throw new ApiError(400, "Institute ID is required");
      }

      const year = academicYear ? parseInt(academicYear) : null;

      const stats = await instituteDataService.getCompletenessStats(instituteId, year);

      return res
        .status(200)
        .json(new ApiResponse(200, stats, "Completeness statistics retrieved successfully"));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get institute's own completeness statistics
   */
  async getMyCompletenessStats(req, res, next) {
    try {
      const user = req.user;
      const { academicYear } = req.query;

      if (!user || !user.instituteId) {
        throw new ApiError(400, "User is not associated with an institute");
      }

      const year = academicYear ? parseInt(academicYear) : null;

      const stats = await instituteDataService.getCompletenessStats(user.instituteId, year);

      return res
        .status(200)
        .json(new ApiResponse(200, stats, "Completeness statistics retrieved successfully"));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get change history for an institute
   */
  async getChangeHistory(req, res, next) {
    try {
      const { instituteId } = req.params;
      const { academicYear, limit = "50", skip = "0" } = req.query;

      if (!instituteId) {
        throw new ApiError(400, "Institute ID is required");
      }

      const year = academicYear ? parseInt(academicYear) : null;

      const history = await instituteDataService.getChangeHistory(
        instituteId,
        year,
        parseInt(limit),
        parseInt(skip)
      );

      return res
        .status(200)
        .json(new ApiResponse(200, history, "Change history retrieved successfully"));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get institute's own change history
   */
  async getMyChangeHistory(req, res, next) {
    try {
      const user = req.user;
      const { academicYear, limit = "50", skip = "0" } = req.query;

      if (!user || !user.instituteId) {
        throw new ApiError(400, "User is not associated with an institute");
      }

      const year = academicYear ? parseInt(academicYear) : null;

      const history = await instituteDataService.getChangeHistory(
        user.instituteId,
        year,
        parseInt(limit),
        parseInt(skip)
      );

      return res
        .status(200)
        .json(new ApiResponse(200, history, "Change history retrieved successfully"));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get parameter mappings (for frontend form generation)
   */
  async getParameterMappings(req, res, next) {
    try {
      const mappings = instituteDataService.getParameterMappings();

      // Group by category for easier frontend consumption
      const groupedMappings = mappings.reduce((acc, mapping) => {
        if (!acc[mapping.category]) {
          acc[mapping.category] = [];
        }
        acc[mapping.category].push(mapping);
        return acc;
      }, {});

      return res
        .status(200)
        .json(new ApiResponse(200, groupedMappings, "Parameter mappings retrieved successfully"));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get extracted parameters needing verification
   */
  async getExtractedParameters(req, res, next) {
    try {
      const user = req.user;
      const { academicYear } = req.query;

      if (!user || !user.instituteId) {
        throw new ApiError(400, "User is not associated with an institute");
      }

      const year = academicYear ? parseInt(academicYear) : new Date().getFullYear();

      const extractedParams = await instituteDataService.getExtractedParameters(
        user.instituteId,
        year
      );

      return res
        .status(200)
        .json(new ApiResponse(200, extractedParams, "Extracted parameters retrieved successfully"));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Accept extracted parameter value
   */
  async acceptExtractedParameter(req, res, next) {
    try {
      const user = req.user;
      const { parameterName, academicYear } = req.body;

      if (!user || !user.instituteId) {
        throw new ApiError(400, "User is not associated with an institute");
      }

      if (!parameterName) {
        throw new ApiError(400, "Parameter name is required");
      }

      const year = academicYear ? parseInt(academicYear) : new Date().getFullYear();

      const result = await instituteDataService.acceptExtractedParameter(
        user.instituteId,
        year,
        parameterName,
        user._id
      );

      return res
        .status(200)
        .json(new ApiResponse(200, result, "Extracted parameter accepted successfully"));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Reject extracted parameter value
   */
  async rejectExtractedParameter(req, res, next) {
    try {
      const user = req.user;
      const { parameterName, academicYear } = req.body;

      if (!user || !user.instituteId) {
        throw new ApiError(400, "User is not associated with an institute");
      }

      if (!parameterName) {
        throw new ApiError(400, "Parameter name is required");
      }

      const year = academicYear ? parseInt(academicYear) : new Date().getFullYear();

      const result = await instituteDataService.rejectExtractedParameter(
        user.instituteId,
        year,
        parameterName,
        user._id
      );

      return res
        .status(200)
        .json(new ApiResponse(200, result, "Extracted parameter rejected successfully"));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Accept all extracted parameters
   */
  async acceptAllExtractedParameters(req, res, next) {
    try {
      const user = req.user;
      const { academicYear } = req.body;

      if (!user || !user.instituteId) {
        throw new ApiError(400, "User is not associated with an institute");
      }

      const year = academicYear ? parseInt(academicYear) : new Date().getFullYear();

      const result = await instituteDataService.acceptAllExtractedParameters(
        user.instituteId,
        year,
        user._id
      );

      return res
        .status(200)
        .json(new ApiResponse(200, result, "All extracted parameters accepted successfully"));
    } catch (error) {
      next(error);
    }
  }

  /**
   * Reject all extracted parameters
   */
  async rejectAllExtractedParameters(req, res, next) {
    try {
      const user = req.user;
      const { academicYear } = req.body;

      if (!user || !user.instituteId) {
        throw new ApiError(400, "User is not associated with an institute");
      }

      const year = academicYear ? parseInt(academicYear) : new Date().getFullYear();

      const result = await instituteDataService.rejectAllExtractedParameters(
        user.instituteId,
        year,
        user._id
      );

      return res
        .status(200)
        .json(new ApiResponse(200, result, "All extracted parameters rejected successfully"));
    } catch (error) {
      next(error);
    }
  }
}

export default new InstituteDataController();
