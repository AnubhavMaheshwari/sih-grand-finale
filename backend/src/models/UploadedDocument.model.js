import mongoose from "mongoose";

const uploadedDocumentSchema = new mongoose.Schema(
  {
    // Institute reference
    instituteId: {
      type: String,
      required: true,
      index: true,
    },
    
    // Document metadata
    originalFilename: {
      type: String,
      required: true,
    },
    
    storedFilename: {
      type: String,
      required: true,
      unique: true,
    },
    
    filePath: {
      type: String,
      required: true,
    },
    
    fileSize: {
      type: Number, // in bytes
      required: true,
    },
    
    mimeType: {
      type: String,
      default: "application/pdf",
    },
    
    // Data context
    year: {
      type: Number,
      required: true,
      index: true,
    },
    
    documentType: {
      type: String,
      enum: ["NIRF", "ANNUAL_REPORT", "OTHER"],
      default: "NIRF",
    },
    
    // Processing status
    status: {
      type: String,
      enum: ["UPLOADED", "PARSING", "PARSED", "ERROR", "DELETED"],
      default: "UPLOADED",
      index: true,
    },
    
    parsingStartedAt: {
      type: Date,
    },
    
    parsingCompletedAt: {
      type: Date,
    },
    
    // Parsing results
    parsedData: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ParsedDocumentData",
    },
    
    parsingErrors: [{
      section: String,
      error: String,
      timestamp: Date,
    }],
    
    parsingStats: {
      sectionsFound: Number,
      sectionsParsed: Number,
      dataPointsExtracted: Number,
      confidenceScore: Number, // 0-100
    },
    
    // Analytics cache
    analyticsGenerated: {
      type: Boolean,
      default: false,
    },
    
    analyticsGeneratedAt: {
      type: Date,
    },
    
    // Metadata
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    
    uploadedAt: {
      type: Date,
      default: Date.now,
    },
    
    deletedAt: {
      type: Date,
    },
    
    deletedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    
    // Versioning
    version: {
      type: Number,
      default: 1,
    },
    
    previousVersion: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UploadedDocument",
    },
    
    // Audit trail
    lastAccessedAt: {
      type: Date,
    },
    
    accessCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Index for efficient queries
uploadedDocumentSchema.index({ instituteId: 1, year: 1, status: 1 });
uploadedDocumentSchema.index({ instituteId: 1, uploadedAt: -1 });
uploadedDocumentSchema.index({ status: 1, parsingStartedAt: 1 });

// Virtual for file URL
uploadedDocumentSchema.virtual("fileUrl").get(function () {
  return `/api/documents/${this._id}/view`;
});

// Virtual for parsing status
uploadedDocumentSchema.virtual("isParsed").get(function () {
  return this.status === "PARSED";
});

// Virtual for deletion status
uploadedDocumentSchema.virtual("isDeleted").get(function () {
  return this.status === "DELETED";
});

// Method to mark as parsing
uploadedDocumentSchema.methods.startParsing = function () {
  this.status = "PARSING";
  this.parsingStartedAt = new Date();
  return this.save();
};

// Method to mark as parsed
uploadedDocumentSchema.methods.markAsParsed = function (parsedDataId, stats) {
  this.status = "PARSED";
  this.parsedData = parsedDataId;
  this.parsingCompletedAt = new Date();
  this.parsingStats = stats;
  return this.save();
};

// Method to mark as error
uploadedDocumentSchema.methods.markAsError = function (errors) {
  this.status = "ERROR";
  this.parsingErrors = errors;
  this.parsingCompletedAt = new Date();
  return this.save();
};

// Method to soft delete
uploadedDocumentSchema.methods.softDelete = function (deletedBy) {
  this.status = "DELETED";
  this.deletedAt = new Date();
  this.deletedBy = deletedBy;
  return this.save();
};

const UploadedDocument = mongoose.model("UploadedDocument", uploadedDocumentSchema);

export default UploadedDocument;
