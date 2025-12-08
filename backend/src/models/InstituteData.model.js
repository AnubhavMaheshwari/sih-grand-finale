import mongoose from "mongoose";

const instituteDataSchema = new mongoose.Schema(
  {
    // Reference to institute
    instituteId: {
      type: String,
      required: true,
      index: true,
    },
    
    // Academic year for this data (e.g., 2025 for 2024-2025)
    academicYear: {
      type: Number,
      required: true,
      index: true,
    },
    
    // ========== ACADEMIC PARAMETERS ==========
    
    // Teacher-Student Ratio (stored as string like "1:30")
    teacherStudentRatio: {
      type: String,
      trim: true,
    },
    
    // Placement percentage (integer)
    placementPercentage: {
      type: Number,
      min: 0,
      max: 100,
    },
    
    // Students going for higher studies (integer count)
    studentsGoingForHigherStudies: {
      type: Number,
      min: 0,
    },
    
    // ========== INFRASTRUCTURE PARAMETERS ==========
    
    // Hostel vacancies (integer counts)
    vacancyBoysHostelUG: {
      type: Number,
      min: 0,
    },
    
    vacancyGirlsHostelUG: {
      type: Number,
      min: 0,
    },
    
    // Classroom capacity (integer)
    classroomCapacity: {
      type: Number,
      min: 0,
    },
    
    // Lift available (boolean)
    liftAvailable: {
      type: Boolean,
    },
    
    // Land area in square kilometers (decimal)
    landAreaSqKm: {
      type: Number,
      min: 0,
    },
    
    // ========== FACILITIES PARAMETERS ==========
    
    // Labs facilities (text description)
    labsFacilities: {
      type: String,
      trim: true,
    },
    
    // Lab equipments (integer count)
    labEquipments: {
      type: Number,
      min: 0,
    },
    
    // Faculty strength (integer count)
    facultyStrength: {
      type: Number,
      min: 0,
    },
    
    // Library resources (text description)
    libraryResources: {
      type: String,
      trim: true,
    },
    
    // ICT facilities (text description)
    ictFacilities: {
      type: String,
      trim: true,
    },
    
    // Available workshops (integer count)
    availableWorkshops: {
      type: Number,
      min: 0,
    },
    
    // ========== ADMINISTRATIVE PARAMETERS ==========
    
    // Academic plan (text description)
    academicPlan: {
      type: String,
      trim: true,
    },
    
    // Compliance certificate (text - yes/no/details)
    complianceCertificate: {
      type: String,
      trim: true,
    },
    
    // Research environment (text description)
    researchEnvironment: {
      type: String,
      trim: true,
    },
    
    // Program justification (text description)
    programJustification: {
      type: String,
      trim: true,
    },
    
    // Qualification of faculties (text description)
    qualificationOfFaculties: {
      type: String,
      trim: true,
    },
    
    // Land ownership and possession (text description)
    landOwnershipAndPossession: {
      type: String,
      trim: true,
    },
    
    // Building plan requirement (text description)
    buildingPlanRequirement: {
      type: String,
      trim: true,
    },
    
    // Leadership qualifications (text description)
    leadershipQualifications: {
      type: String,
      trim: true,
    },
    
    // Institutional name norms (text description)
    institutionalNameNorms: {
      type: String,
      trim: true,
    },
    
    // Safety certificates (text description)
    safetyCertificates: {
      type: String,
      trim: true,
    },
    
    // ========== FINANCIAL PARAMETERS ==========
    
    // Financial capacity (long number)
    financialCapacity: {
      type: Number,
      min: 0,
    },
    
    // Budget allocation (long number)
    budgetAllocation: {
      type: Number,
      min: 0,
    },
    
    // ========== METADATA ==========
    
    // Data source
    source: {
      type: String,
      enum: ["EXCEL_UPLOAD", "PDF_UPLOAD", "WEB_FORM", "MANUAL_ENTRY", "CSV_UPLOAD", "PDF_PARSER"],
      default: "WEB_FORM",
    },
    
    // Extraction staging fields
    extractedParameters: {
      type: Map,
      of: mongoose.Schema.Types.Mixed,
      default: {},
    },
    
    extractionSource: {
      type: String,
      enum: ["PDF", "CSV", "EXCEL", "PDF_PARSER", "LLM_PDF_EXTRACTOR", null],
      default: null,
    },
    
    extractionConfidence: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    
    needsVerification: {
      type: Boolean,
      default: false,
    },
    
    extractionMetadata: {
      extractedAt: Date,
      extractedBy: String, // "system", "ai_service", "manual"
      rawSource: String, // Reference to original document
      confidenceScores: Map, // Individual confidence scores per parameter
    },
    
    // Upload/entry information
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    
    // Validation status
    isVerified: {
      type: Boolean,
      default: false,
    },
    
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    
    verifiedAt: {
      type: Date,
    },
    
    // Notes/comments
    notes: {
      type: String,
      trim: true,
    },
    
    // Version for tracking edits
    version: {
      type: Number,
      default: 1,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Compound unique index: one record per institute per year
instituteDataSchema.index({ instituteId: 1, academicYear: 1 }, { unique: true });

// Index for efficient queries
instituteDataSchema.index({ instituteId: 1, academicYear: -1 });
instituteDataSchema.index({ isVerified: 1 });
instituteDataSchema.index({ source: 1 });

// Virtual for data completeness score
instituteDataSchema.virtual("completenessScore").get(function () {
  const fields = [
    this.teacherStudentRatio,
    this.vacancyBoysHostelUG,
    this.vacancyGirlsHostelUG,
    this.classroomCapacity,
    this.liftAvailable,
    this.placementPercentage,
    this.labsFacilities,
    this.studentsGoingForHigherStudies,
    this.labEquipments,
    this.facultyStrength,
    this.libraryResources,
    this.financialCapacity,
    this.landAreaSqKm,
    this.academicPlan,
    this.complianceCertificate,
    this.ictFacilities,
    this.researchEnvironment,
    this.programJustification,
    this.qualificationOfFaculties,
    this.landOwnershipAndPossession,
    this.buildingPlanRequirement,
    this.leadershipQualifications,
    this.budgetAllocation,
    this.institutionalNameNorms,
    this.availableWorkshops,
    this.safetyCertificates,
  ];
  
  const filledCount = fields.filter(field => field !== undefined && field !== null && field !== "").length;
  return Math.round((filledCount / 27) * 100);
});

// Virtual for extraction completeness
instituteDataSchema.virtual("extractionCompleteness").get(function () {
  if (!this.extractedParameters || this.extractedParameters.size === 0) {
    return 0;
  }
  
  const totalParameters = 27;
  const extractedCount = this.extractedParameters.size;
  return Math.round((extractedCount / totalParameters) * 100);
});

// Virtual for last updated info
instituteDataSchema.virtual("lastUpdatedBy").get(function () {
  return this.uploadedBy;
});

instituteDataSchema.virtual("lastUpdatedAt").get(function () {
  return this.updatedAt;
});

// Method to check if data is complete (all required fields filled)
instituteDataSchema.methods.isComplete = function () {
  return this.completenessScore === 100;
};

// Method to mark as verified
instituteDataSchema.methods.markAsVerified = function (verifiedBy) {
  this.isVerified = true;
  this.verifiedBy = verifiedBy;
  this.verifiedAt = new Date();
  return this.save();
};

// Method to create a new version
instituteDataSchema.methods.createNewVersion = function (updateData, updatedBy) {
  // In a real implementation, you might want to save the old version
  // For now, we'll just update the current record and increment version
  Object.assign(this, updateData);
  this.uploadedBy = updatedBy;
  this.version += 1;
  this.isVerified = false; // Reset verification when data changes
  this.verifiedBy = undefined;
  this.verifiedAt = undefined;
  return this.save();
};

// Method to set extracted parameters
instituteDataSchema.methods.setExtractedParameters = function (parameters, source, confidence, metadata = {}) {
  this.extractedParameters = parameters;
  this.extractionSource = source;
  this.extractionConfidence = confidence;
  this.needsVerification = true;
  
  this.extractionMetadata = {
    extractedAt: new Date(),
    extractedBy: metadata.extractedBy || "system",
    rawSource: metadata.rawSource || null,
    confidenceScores: metadata.confidenceScores || {},
  };
  
  return this.save();
};

// Method to accept extracted parameters
instituteDataSchema.methods.acceptExtractedParameters = function (acceptedParameters = []) {
  if (acceptedParameters.length === 0) {
    // Accept all extracted parameters
    for (const [key, value] of this.extractedParameters.entries()) {
      this[key] = value;
    }
  } else {
    // Accept only specified parameters
    for (const paramName of acceptedParameters) {
      if (this.extractedParameters.has(paramName)) {
        this[paramName] = this.extractedParameters.get(paramName);
      }
    }
  }
  
  // Clear extraction staging
  this.extractedParameters = {};
  this.needsVerification = false;
  this.extractionMetadata.acceptedAt = new Date();
  
  return this.save();
};

// Method to reject extracted parameters
instituteDataSchema.methods.rejectExtractedParameters = function (rejectedParameters = []) {
  if (rejectedParameters.length === 0) {
    // Reject all extracted parameters
    this.extractedParameters = {};
  } else {
    // Reject only specified parameters
    for (const paramName of rejectedParameters) {
      this.extractedParameters.delete(paramName);
    }
  }
  
  // Update needsVerification based on remaining extracted parameters
  this.needsVerification = this.extractedParameters.size > 0;
  this.extractionMetadata.rejectedAt = new Date();
  
  return this.save();
};

// Method to get parameters that need verification
instituteDataSchema.methods.getParametersNeedingVerification = function () {
  const result = [];
  
  for (const [paramName, value] of this.extractedParameters.entries()) {
    const currentValue = this[paramName];
    const confidence = this.extractionMetadata?.confidenceScores?.[paramName] || this.extractionConfidence;
    
    result.push({
      parameter: paramName,
      extractedValue: value,
      currentValue: currentValue,
      confidence: confidence,
      hasConflict: currentValue !== undefined && currentValue !== null && currentValue !== "" && 
                  JSON.stringify(currentValue) !== JSON.stringify(value),
    });
  }
  
  return result;
};

const InstituteData = mongoose.model("InstituteData", instituteDataSchema);

export default InstituteData;
