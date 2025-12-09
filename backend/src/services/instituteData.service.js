import InstituteData from "../models/InstituteData.model.js";
import InstituteParameterHistory from "../models/InstituteParameterHistory.model.js";
import { ApiError } from "../utils/apiResponse.js";

/**
 * Service for managing institute parameter data
 */
class InstituteDataService {
  /**
   * Get institute data for a specific year
   */
  async getInstituteData(instituteId, academicYear) {
    try {
      const data = await InstituteData.findOne({
        instituteId,
        academicYear,
      }).populate("uploadedBy", "fullName email").populate("verifiedBy", "fullName email");

      if (!data) {
        return null;
      }

      return data;
    } catch (error) {
      console.error("Error getting institute data:", error);
      throw new ApiError(500, "Failed to fetch institute data");
    }
  }

  /**
   * Get all institute data for an institute (multiple years)
   */
  async getAllInstituteData(instituteId, limit = 10, skip = 0) {
    try {
      const data = await InstituteData.find({ instituteId })
        .sort({ academicYear: -1 })
        .skip(skip)
        .limit(limit)
        .populate("uploadedBy", "fullName email")
        .populate("verifiedBy", "fullName email");

      const total = await InstituteData.countDocuments({ instituteId });

      return {
        data,
        total,
        hasMore: total > skip + limit,
      };
    } catch (error) {
      console.error("Error getting all institute data:", error);
      throw new ApiError(500, "Failed to fetch institute data");
    }
  }

  /**
   * Create or update institute data
   */
  async saveInstituteData(instituteId, academicYear, data, userId, source = "WEB_FORM") {
    try {
      // Validate required fields
      if (!instituteId || !academicYear) {
        throw new ApiError(400, "Institute ID and academic year are required");
      }

      // Prepare data object
      const instituteData = {
        instituteId,
        academicYear,
        ...data,
        source,
        uploadedBy: userId,
      };

      // Check if data already exists for this year
      const existingData = await InstituteData.findOne({
        instituteId,
        academicYear,
      });

      let savedData;
      let changeType = "CREATE";

      if (existingData) {
        // Update existing data
        changeType = "UPDATE";
        
        // Log changes for each parameter
        await this.logParameterChanges(
          existingData,
          instituteData,
          userId,
          source,
          changeType
        );

        // Update the existing record
        Object.assign(existingData, instituteData);
        existingData.version += 1;
        existingData.isVerified = false; // Reset verification on update
        existingData.verifiedBy = undefined;
        existingData.verifiedAt = undefined;
        
        savedData = await existingData.save();
      } else {
        // Create new data
        savedData = await InstituteData.create(instituteData);
        
        // Log creation of all parameters
        await this.logParameterCreation(
          savedData,
          userId,
          source
        );
      }

      return await this.getInstituteData(instituteId, academicYear);
    } catch (error) {
      console.error("Error saving institute data:", error);
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(500, "Failed to save institute data");
    }
  }

  /**
   * Delete institute data for a specific year
   */
  async deleteInstituteData(instituteId, academicYear, userId) {
    try {
      const data = await InstituteData.findOneAndDelete({
        instituteId,
        academicYear,
      });

      if (!data) {
        throw new ApiError(404, "Institute data not found");
      }

      // Log deletion of all parameters
      await this.logParameterDeletion(data, userId);

      return { success: true, message: "Institute data deleted successfully" };
    } catch (error) {
      console.error("Error deleting institute data:", error);
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(500, "Failed to delete institute data");
    }
  }

  /**
   * Verify institute data
   */
  async verifyInstituteData(instituteId, academicYear, verifiedBy) {
    try {
      const data = await InstituteData.findOne({
        instituteId,
        academicYear,
      });

      if (!data) {
        throw new ApiError(404, "Institute data not found");
      }

      // Mark as verified
      await data.markAsVerified(verifiedBy);

      // Log verification
      await this.logVerification(data, verifiedBy);

      return await this.getInstituteData(instituteId, academicYear);
    } catch (error) {
      console.error("Error verifying institute data:", error);
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(500, "Failed to verify institute data");
    }
  }

  /**
   * Unverify institute data
   */
  async unverifyInstituteData(instituteId, academicYear, unverifiedBy) {
    try {
      const data = await InstituteData.findOne({
        instituteId,
        academicYear,
      });

      if (!data) {
        throw new ApiError(404, "Institute data not found");
      }

      data.isVerified = false;
      data.verifiedBy = undefined;
      data.verifiedAt = undefined;
      await data.save();

      // Log unverification
      await this.logUnverification(data, unverifiedBy);

      return await this.getInstituteData(instituteId, academicYear);
    } catch (error) {
      console.error("Error unverifying institute data:", error);
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(500, "Failed to unverify institute data");
    }
  }

  /**
   * Get data completeness statistics
   */
  async getCompletenessStats(instituteId, academicYear = null) {
    try {
      const query = { instituteId };
      if (academicYear) {
        query.academicYear = academicYear;
      }

      const data = await InstituteData.find(query);

      if (data.length === 0) {
        return {
          totalRecords: 0,
          averageCompleteness: 0,
          verifiedCount: 0,
          byYear: {},
        };
      }

      let totalCompleteness = 0;
      let verifiedCount = 0;
      const byYear = {};

      data.forEach((record) => {
        const completeness = record.completenessScore || 0;
        totalCompleteness += completeness;
        
        if (record.isVerified) {
          verifiedCount++;
        }

        byYear[record.academicYear] = {
          completeness,
          isVerified: record.isVerified,
          source: record.source,
          lastUpdated: record.updatedAt,
        };
      });

      return {
        totalRecords: data.length,
        averageCompleteness: Math.round(totalCompleteness / data.length),
        verifiedCount,
        byYear,
      };
    } catch (error) {
      console.error("Error getting completeness stats:", error);
      throw new ApiError(500, "Failed to fetch completeness statistics");
    }
  }

  /**
   * Get change history for an institute
   */
  async getChangeHistory(instituteId, academicYear = null, limit = 50, skip = 0) {
    try {
      return await InstituteParameterHistory.getInstituteHistory(
        instituteId,
        academicYear,
        limit,
        skip
      );
    } catch (error) {
      console.error("Error getting change history:", error);
      throw new ApiError(500, "Failed to fetch change history");
    }
  }

  /**
   * Log parameter changes when updating data
   */
  async logParameterChanges(oldData, newData, userId, source, changeType) {
    try {
      const batchId = `batch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const parameterMappings = this.getParameterMappings();

      const logPromises = [];

      for (const mapping of parameterMappings) {
        const oldValue = oldData[mapping.fieldName];
        const newValue = newData[mapping.fieldName];

        // Only log if value changed
        if (oldValue !== newValue) {
          logPromises.push(
            InstituteParameterHistory.logChange({
              instituteDataId: oldData._id,
              instituteId: oldData.instituteId,
              academicYear: oldData.academicYear,
              parameterCategory: mapping.category,
              parameterName: mapping.fieldName,
              parameterLabel: mapping.label,
              oldValue,
              newValue,
              dataType: mapping.dataType,
              changeSource: source,
              changedBy: userId,
              changeType,
              batchId,
            })
          );
        }
      }

      await Promise.all(logPromises);
    } catch (error) {
      console.error("Error logging parameter changes:", error);
      // Don't throw error here - we don't want to fail the main operation
    }
  }

  /**
   * Log parameter creation
   */
  async logParameterCreation(data, userId, source) {
    try {
      const batchId = `batch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const parameterMappings = this.getParameterMappings();

      const logPromises = [];

      for (const mapping of parameterMappings) {
        const value = data[mapping.fieldName];
        
        if (value !== undefined && value !== null && value !== "") {
          logPromises.push(
            InstituteParameterHistory.logChange({
              instituteDataId: data._id,
              instituteId: data.instituteId,
              academicYear: data.academicYear,
              parameterCategory: mapping.category,
              parameterName: mapping.fieldName,
              parameterLabel: mapping.label,
              oldValue: undefined,
              newValue: value,
              dataType: mapping.dataType,
              changeSource: source,
              changedBy: userId,
              changeType: "CREATE",
              batchId,
            })
          );
        }
      }

      await Promise.all(logPromises);
    } catch (error) {
      console.error("Error logging parameter creation:", error);
    }
  }

  /**
   * Log parameter deletion
   */
  async logParameterDeletion(data, userId) {
    try {
      const batchId = `batch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const parameterMappings = this.getParameterMappings();

      const logPromises = [];

      for (const mapping of parameterMappings) {
        const value = data[mapping.fieldName];
        
        if (value !== undefined && value !== null && value !== "") {
          logPromises.push(
            InstituteParameterHistory.logChange({
              instituteDataId: data._id,
              instituteId: data.instituteId,
              academicYear: data.academicYear,
              parameterCategory: mapping.category,
              parameterName: mapping.fieldName,
              parameterLabel: mapping.label,
              oldValue: value,
              newValue: undefined,
              dataType: mapping.dataType,
              changeSource: "MANUAL_ENTRY",
              changedBy: userId,
              changeType: "DELETE",
              batchId,
            })
          );
        }
      }

      await Promise.all(logPromises);
    } catch (error) {
      console.error("Error logging parameter deletion:", error);
    }
  }

  /**
   * Log verification
   */
  async logVerification(data, verifiedBy) {
    try {
      const batchId = `batch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const parameterMappings = this.getParameterMappings();

      const logPromises = [];

      for (const mapping of parameterMappings) {
        const value = data[mapping.fieldName];
        
        if (value !== undefined && value !== null && value !== "") {
          logPromises.push(
            InstituteParameterHistory.logChange({
              instituteDataId: data._id,
              instituteId: data.instituteId,
              academicYear: data.academicYear,
              parameterCategory: mapping.category,
              parameterName: mapping.fieldName,
              parameterLabel: mapping.label,
              oldValue: value,
              newValue: value, // Same value, just marking as verified
              dataType: mapping.dataType,
              changeSource: "MANUAL_ENTRY",
              changedBy: verifiedBy,
              changeType: "VERIFY",
              batchId,
              isVerificationAction: true,
              verificationId: verifiedBy,
            })
          );
        }
      }

      await Promise.all(logPromises);
    } catch (error) {
      console.error("Error logging verification:", error);
    }
  }

  /**
   * Log unverification
   */
  async logUnverification(data, unverifiedBy) {
    try {
      const batchId = `batch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const parameterMappings = this.getParameterMappings();

      const logPromises = [];

      for (const mapping of parameterMappings) {
        const value = data[mapping.fieldName];
        
        if (value !== undefined && value !== null && value !== "") {
          logPromises.push(
            InstituteParameterHistory.logChange({
              instituteDataId: data._id,
              instituteId: data.instituteId,
              academicYear: data.academicYear,
              parameterCategory: mapping.category,
              parameterName: mapping.fieldName,
              parameterLabel: mapping.label,
              oldValue: value,
              newValue: value, // Same value, just marking as unverified
              dataType: mapping.dataType,
              changeSource: "MANUAL_ENTRY",
              changedBy: unverifiedBy,
              changeType: "UNVERIFY",
              batchId,
              isVerificationAction: true,
              verificationId: unverifiedBy,
            })
          );
        }
      }

      await Promise.all(logPromises);
    } catch (error) {
      console.error("Error logging unverification:", error);
    }
  }

  /**
   * Get extracted parameters needing verification
   */
  async getExtractedParameters(instituteId, academicYear) {
    try {
      const data = await InstituteData.findOne({
        instituteId,
        academicYear,
      });

      if (!data || !data.needsVerification || !data.extractedParameters) {
        return [];
      }

      return data.getParametersNeedingVerification();
    } catch (error) {
      console.error("Error getting extracted parameters:", error);
      throw new ApiError(500, "Failed to fetch extracted parameters");
    }
  }

  /**
   * Accept extracted parameter value
   */
  async acceptExtractedParameter(instituteId, academicYear, parameterName, userId) {
    try {
      const data = await InstituteData.findOne({
        instituteId,
        academicYear,
      });

      if (!data) {
        throw new ApiError(404, "Institute data not found");
      }

      if (!data.needsVerification || !data.extractedParameters.has(parameterName)) {
        throw new ApiError(400, `No extracted value found for parameter: ${parameterName}`);
      }

      // Accept the extracted parameter
      await data.acceptExtractedParameters([parameterName]);

      // Log the acceptance
      await this.logExtractedParameterAction(
        data,
        parameterName,
        "ACCEPT_EXTRACTED",
        userId
      );

      return await this.getInstituteData(instituteId, academicYear);
    } catch (error) {
      console.error("Error accepting extracted parameter:", error);
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(500, "Failed to accept extracted parameter");
    }
  }

  /**
   * Reject extracted parameter value
   */
  async rejectExtractedParameter(instituteId, academicYear, parameterName, userId) {
    try {
      const data = await InstituteData.findOne({
        instituteId,
        academicYear,
      });

      if (!data) {
        throw new ApiError(404, "Institute data not found");
      }

      if (!data.needsVerification || !data.extractedParameters.has(parameterName)) {
        throw new ApiError(400, `No extracted value found for parameter: ${parameterName}`);
      }

      // Reject the extracted parameter
      await data.rejectExtractedParameters([parameterName]);

      // Log the rejection
      await this.logExtractedParameterAction(
        data,
        parameterName,
        "REJECT_EXTRACTED",
        userId
      );

      return await this.getInstituteData(instituteId, academicYear);
    } catch (error) {
      console.error("Error rejecting extracted parameter:", error);
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(500, "Failed to reject extracted parameter");
    }
  }

  /**
   * Accept all extracted parameters
   */
  async acceptAllExtractedParameters(instituteId, academicYear, userId) {
    try {
      const data = await InstituteData.findOne({
        instituteId,
        academicYear,
      });

      if (!data) {
        throw new ApiError(404, "Institute data not found");
      }

      if (!data.needsVerification || data.extractedParameters.size === 0) {
        throw new ApiError(400, "No extracted parameters found for verification");
      }

      // Accept all extracted parameters
      await data.acceptExtractedParameters();

      // Log the acceptance of all parameters
      const parameterMappings = this.getParameterMappings();
      for (const mapping of parameterMappings) {
        if (data.extractedParameters.has(mapping.fieldName)) {
          await this.logExtractedParameterAction(
            data,
            mapping.fieldName,
            "ACCEPT_EXTRACTED",
            userId
          );
        }
      }

      return await this.getInstituteData(instituteId, academicYear);
    } catch (error) {
      console.error("Error accepting all extracted parameters:", error);
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(500, "Failed to accept all extracted parameters");
    }
  }

  /**
   * Reject all extracted parameters
   */
  async rejectAllExtractedParameters(instituteId, academicYear, userId) {
    try {
      const data = await InstituteData.findOne({
        instituteId,
        academicYear,
      });

      if (!data) {
        throw new ApiError(404, "Institute data not found");
      }

      if (!data.needsVerification || data.extractedParameters.size === 0) {
        throw new ApiError(400, "No extracted parameters found for verification");
      }

      // Reject all extracted parameters
      await data.rejectExtractedParameters();

      // Log the rejection of all parameters
      const parameterMappings = this.getParameterMappings();
      for (const mapping of parameterMappings) {
        if (data.extractedParameters.has(mapping.fieldName)) {
          await this.logExtractedParameterAction(
            data,
            mapping.fieldName,
            "REJECT_EXTRACTED",
            userId
          );
        }
      }

      return await this.getInstituteData(instituteId, academicYear);
    } catch (error) {
      console.error("Error rejecting all extracted parameters:", error);
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(500, "Failed to reject all extracted parameters");
    }
  }

  /**
   * Log extracted parameter action (accept/reject)
   */
  async logExtractedParameterAction(data, parameterName, actionType, userId) {
    try {
      const mapping = this.getParameterMappings().find(m => m.fieldName === parameterName);
      if (!mapping) {
        return;
      }

      const extractedValue = data.extractedParameters?.get(parameterName);
      const currentValue = data[parameterName];

      await InstituteParameterHistory.logChange({
        instituteDataId: data._id,
        instituteId: data.instituteId,
        academicYear: data.academicYear,
        parameterCategory: mapping.category,
        parameterName: mapping.fieldName,
        parameterLabel: mapping.label,
        oldValue: extractedValue,
        newValue: currentValue,
        dataType: mapping.dataType,
        changeSource: "EXTRACTION_VERIFICATION",
        changedBy: userId,
        changeType: actionType,
        batchId: `extraction_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        isExtractionAction: true,
        extractionSource: data.extractionSource,
        extractionConfidence: data.extractionConfidence,
      });
    } catch (error) {
      console.error("Error logging extracted parameter action:", error);
      // Don't throw error here - we don't want to fail the main operation
    }
  }

  /**
   * Get all institutes with their latest data (admin only)
   */
  async getAllInstitutesWithData() {
    try {
      // Import User model here to avoid circular dependency
      const User = (await import("../models/User.model.js")).default;
      
      // Get all institute users (approved registration)
      const instituteUsers = await User.find({
        role: "institute",
        registrationStatus: "approved"
      }).select("instituteId instituteName instituteType fullName email");
      
      if (!instituteUsers || instituteUsers.length === 0) {
        return [];
      }
      
      // Group users by instituteId (in case multiple users per institute)
      const institutesMap = new Map();
      
      for (const user of instituteUsers) {
        if (!institutesMap.has(user.instituteId)) {
          institutesMap.set(user.instituteId, {
            instituteId: user.instituteId,
            instituteName: user.instituteName,
            instituteType: user.instituteType,
            users: [],
            latestData: null,
            completenessScore: 0,
            isVerified: false,
            lastUpdated: null,
            uploadedBy: null
          });
        }
        
        const institute = institutesMap.get(user.instituteId);
        institute.users.push({
          fullName: user.fullName,
          email: user.email
        });
      }
      
      // Get latest data for each institute
      const institutes = Array.from(institutesMap.values());
      
      const institutesWithData = await Promise.all(
        institutes.map(async (institute) => {
          try {
            // Get all data for this institute
            const dataResponse = await this.getAllInstituteData(institute.instituteId, 1, 0);
            
            if (dataResponse.data && dataResponse.data.length > 0) {
              const latestData = dataResponse.data[0]; // Already sorted by academicYear descending
              
              institute.latestData = latestData;
              institute.completenessScore = latestData.completenessScore || 0;
              institute.isVerified = latestData.isVerified || false;
              institute.lastUpdated = latestData.updatedAt || latestData.createdAt;
              institute.uploadedBy = latestData.uploadedBy?.fullName || institute.users[0]?.fullName || "Unknown";
              
              // Extract location from data if available
              if (latestData.extractedParameters?.get("location")) {
                institute.location = latestData.extractedParameters.get("location");
              }
            }
            
            return institute;
          } catch (error) {
            console.error(`Error fetching data for institute ${institute.instituteId}:`, error);
            return institute; // Return institute without data
          }
        })
      );
      
      return institutesWithData;
    } catch (error) {
      console.error("Error getting all institutes with data:", error);
      throw new ApiError(500, "Failed to fetch institutes with data");
    }
  }

  /**
   * Get parameter mappings for all 27 parameters
   */
  getParameterMappings() {
    return [
      // ACADEMIC PARAMETERS
      {
        fieldName: "teacherStudentRatio",
        label: "Teacher-Student Ratio",
        category: "ACADEMIC",
        dataType: "STRING",
      },
      {
        fieldName: "placementPercentage",
        label: "Placement percentage",
        category: "ACADEMIC",
        dataType: "INTEGER",
      },
      {
        fieldName: "studentsGoingForHigherStudies",
        label: "Students going for higher studies",
        category: "ACADEMIC",
        dataType: "INTEGER",
      },
      
      // INFRASTRUCTURE PARAMETERS
      {
        fieldName: "vacancyBoysHostelUG",
        label: "Vacancy in BOYS hostel (UG)",
        category: "INFRASTRUCTURE",
        dataType: "INTEGER",
      },
      {
        fieldName: "vacancyGirlsHostelUG",
        label: "Vacancy in GIRLS hostel (UG)",
        category: "INFRASTRUCTURE",
        dataType: "INTEGER",
      },
      {
        fieldName: "classroomCapacity",
        label: "Classroom capacity",
        category: "INFRASTRUCTURE",
        dataType: "INTEGER",
      },
      {
        fieldName: "liftAvailable",
        label: "Lift available",
        category: "INFRASTRUCTURE",
        dataType: "BOOLEAN",
      },
      {
        fieldName: "landAreaSqKm",
        label: "Land area (sqkm)",
        category: "INFRASTRUCTURE",
        dataType: "DECIMAL",
      },
      
      // FACILITIES PARAMETERS
      {
        fieldName: "labsFacilities",
        label: "Labs facilities",
        category: "FACILITIES",
        dataType: "TEXT",
      },
      {
        fieldName: "labEquipments",
        label: "Lab equipments",
        category: "FACILITIES",
        dataType: "INTEGER",
      },
      {
        fieldName: "facultyStrength",
        label: "Faculty strength",
        category: "FACILITIES",
        dataType: "INTEGER",
      },
      {
        fieldName: "libraryResources",
        label: "Library resources",
        category: "FACILITIES",
        dataType: "TEXT",
      },
      {
        fieldName: "ictFacilities",
        label: "ICT facilities",
        category: "FACILITIES",
        dataType: "TEXT",
      },
      {
        fieldName: "availableWorkshops",
        label: "Available workshops",
        category: "FACILITIES",
        dataType: "INTEGER",
      },
      
      // ADMINISTRATIVE PARAMETERS
      {
        fieldName: "academicPlan",
        label: "Academic plan",
        category: "ADMINISTRATIVE",
        dataType: "TEXT",
      },
      {
        fieldName: "complianceCertificate",
        label: "Compliance certificate",
        category: "ADMINISTRATIVE",
        dataType: "TEXT",
      },
      {
        fieldName: "researchEnvironment",
        label: "Research environment",
        category: "ADMINISTRATIVE",
        dataType: "TEXT",
      },
      {
        fieldName: "programJustification",
        label: "Program justification",
        category: "ADMINISTRATIVE",
        dataType: "TEXT",
      },
      {
        fieldName: "qualificationOfFaculties",
        label: "Qualification of faculties",
        category: "ADMINISTRATIVE",
        dataType: "TEXT",
      },
      {
        fieldName: "landOwnershipAndPossession",
        label: "Land ownership and possession",
        category: "ADMINISTRATIVE",
        dataType: "TEXT",
      },
      {
        fieldName: "buildingPlanRequirement",
        label: "Building plan requirement",
        category: "ADMINISTRATIVE",
        dataType: "TEXT",
      },
      {
        fieldName: "leadershipQualifications",
        label: "Leadership qualifications",
        category: "ADMINISTRATIVE",
        dataType: "TEXT",
      },
      {
        fieldName: "institutionalNameNorms",
        label: "Institutional name norms",
        category: "ADMINISTRATIVE",
        dataType: "TEXT",
      },
      {
        fieldName: "safetyCertificates",
        label: "Safety certificates",
        category: "ADMINISTRATIVE",
        dataType: "TEXT",
      },
      
      // FINANCIAL PARAMETERS
      {
        fieldName: "financialCapacity",
        label: "Financial capacity",
        category: "FINANCIAL",
        dataType: "LONG",
      },
      {
        fieldName: "budgetAllocation",
        label: "Budget allocation",
        category: "FINANCIAL",
        dataType: "LONG",
      },
    ];
  }
}

export default new InstituteDataService();
