import mongoose from "mongoose";

const parsedDocumentDataSchema = new mongoose.Schema(
  {
    // Reference to uploaded document
    documentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UploadedDocument",
      required: true,
      index: true,
    },
    
    instituteId: {
      type: String,
      required: true,
      index: true,
    },
    
    year: {
      type: Number,
      required: true,
      index: true,
    },
    
    // Extracted data sections (matching existing models)
    sanctionedIntake: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "sanctionedIntake",
    },
    
    studentStrength: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "studentstrength",
    },
    
    placementHigherStudy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "placement&higherstudy",
    },
    
    phdStudents: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "phdstudents",
    },
    
    financialResources: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "financialresources",
    },
    
    sponseredResearch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "sponseredresearch",
    },
    
    facultyDetails: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "facultyDetails",
    },
    
    // Raw extracted data for reference
    rawExtractedData: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    
    // Parsing metadata
    parsingVersion: {
      type: String,
      default: "1.0",
    },
    
    extractionMethod: {
      type: String,
      enum: ["AUTOMATED", "MANUAL", "HYBRID"],
      default: "AUTOMATED",
    },
    
    dataQualityScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    
    validationStatus: {
      type: String,
      enum: ["PENDING", "VALIDATED", "FLAGGED", "CORRECTED"],
      default: "PENDING",
    },
    
    validationNotes: [{
      field: String,
      issue: String,
      correctedValue: mongoose.Schema.Types.Mixed,
      correctedBy: mongoose.Schema.Types.ObjectId,
      correctedAt: Date,
    }],
    
    // Timestamps
    extractedAt: {
      type: Date,
      default: Date.now,
    },
    
    validatedAt: {
      type: Date,
    },
    
    // Analytics pre-computation
    analyticsSummary: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    
    // Versioning
    version: {
      type: Number,
      default: 1,
    },
    
    previousVersion: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ParsedDocumentData",
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for efficient queries
parsedDocumentDataSchema.index({ instituteId: 1, year: 1 });
parsedDocumentDataSchema.index({ documentId: 1 }, { unique: true });
parsedDocumentDataSchema.index({ validationStatus: 1, dataQualityScore: -1 });

// Virtual for completeness check
parsedDocumentDataSchema.virtual("isComplete").get(function () {
  const requiredSections = [
    this.sanctionedIntake,
    this.studentStrength,
    this.placementHigherStudy,
    this.phdStudents,
    this.financialResources,
    this.sponseredResearch,
    this.facultyDetails,
  ];
  
  return requiredSections.filter(Boolean).length >= 5; // At least 5 sections parsed
});

// Virtual for data age
parsedDocumentDataSchema.virtual("dataAgeDays").get(function () {
  if (!this.extractedAt) return null;
  const diffMs = Date.now() - this.extractedAt.getTime();
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
});

// Method to update data quality score
parsedDocumentDataSchema.methods.updateQualityScore = function () {
  let score = 0;
  const sections = [
    this.sanctionedIntake,
    this.studentStrength,
    this.placementHigherStudy,
    this.phdStudents,
    this.financialResources,
    this.sponseredResearch,
    this.facultyDetails,
  ];
  
  // Base score: 10 points per parsed section
  const parsedCount = sections.filter(Boolean).length;
  score += parsedCount * 10;
  
  // Bonus for complete data
  if (parsedCount >= 7) score += 20;
  
  // Adjust based on validation status
  if (this.validationStatus === "VALIDATED") score += 10;
  if (this.validationStatus === "CORRECTED") score += 5;
  
  this.dataQualityScore = Math.min(100, score);
  return this.save();
};

// Method to add validation note
parsedDocumentDataSchema.methods.addValidationNote = function (field, issue, correctedValue = null, correctedBy = null) {
  this.validationNotes.push({
    field,
    issue,
    correctedValue,
    correctedBy,
    correctedAt: correctedValue ? new Date() : null,
  });
  
  if (correctedValue) {
    this.validationStatus = "CORRECTED";
  } else if (this.validationStatus === "PENDING") {
    this.validationStatus = "FLAGGED";
  }
  
  return this.save();
};

// Method to mark as validated
parsedDocumentDataSchema.methods.markAsValidated = function () {
  this.validationStatus = "VALIDATED";
  this.validatedAt = new Date();
  return this.save();
};

const ParsedDocumentData = mongoose.model("ParsedDocumentData", parsedDocumentDataSchema);

export default ParsedDocumentData;
