import mongoose from "mongoose";

const instituteParameterHistorySchema = new mongoose.Schema(
  {
    // Reference to the institute data record (if it exists)
    instituteDataId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "InstituteData",
      index: true,
    },
    
    // Institute reference
    instituteId: {
      type: String,
      required: true,
      index: true,
    },
    
    // Academic year
    academicYear: {
      type: Number,
      required: true,
      index: true,
    },
    
    // Parameter category for grouping
    parameterCategory: {
      type: String,
      enum: [
        "ACADEMIC",
        "INFRASTRUCTURE", 
        "FACILITIES",
        "ADMINISTRATIVE",
        "FINANCIAL",
        "OTHER"
      ],
      required: true,
    },
    
    // Parameter name (matches field names in InstituteData)
    parameterName: {
      type: String,
      required: true,
      index: true,
    },
    
    // Human-readable parameter label
    parameterLabel: {
      type: String,
      required: true,
    },
    
    // Old value (before change)
    oldValue: {
      type: mongoose.Schema.Types.Mixed,
    },
    
    // New value (after change)
    newValue: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    
    // Data type for proper display/validation
    dataType: {
      type: String,
      enum: ["STRING", "NUMBER", "BOOLEAN", "TEXT", "DECIMAL", "INTEGER", "LONG"],
      required: true,
    },
    
    // Change source
    changeSource: {
      type: String,
      enum: [
        "EXCEL_UPLOAD",
        "PDF_UPLOAD", 
        "WEB_FORM",
        "MANUAL_ENTRY",
        "ADMIN_EDIT",
        "SYSTEM_CORRECTION",
        "BULK_UPDATE"
      ],
      required: true,
    },
    
    // Who made the change
    changedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false, // Made optional to handle system-generated changes
    },
    
    // Change timestamp
    changedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    
    // Change type (create, update, delete)
    changeType: {
      type: String,
      enum: ["CREATE", "UPDATE", "DELETE", "VERIFY", "UNVERIFY"],
      required: true,
    },
    
    // IP address for audit (optional)
    ipAddress: {
      type: String,
    },
    
    // User agent/browser info (optional)
    userAgent: {
      type: String,
    },
    
    // Additional context/notes about the change
    changeNotes: {
      type: String,
      trim: true,
    },
    
    // Batch ID for grouping related changes (e.g., from Excel upload)
    batchId: {
      type: String,
      index: true,
    },
    
    // Whether this change was part of a verification action
    isVerificationAction: {
      type: Boolean,
      default: false,
    },
    
    // Reference to verification if applicable
    verificationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Compound indexes for efficient queries
instituteParameterHistorySchema.index({ instituteId: 1, academicYear: 1, changedAt: -1 });
instituteParameterHistorySchema.index({ instituteId: 1, parameterName: 1, changedAt: -1 });
instituteParameterHistorySchema.index({ changedBy: 1, changedAt: -1 });
instituteParameterHistorySchema.index({ batchId: 1, changedAt: -1 });

// Virtual for change description
instituteParameterHistorySchema.virtual("changeDescription").get(function () {
  const paramLabel = this.parameterLabel || this.parameterName;
  
  switch (this.changeType) {
    case "CREATE":
      return `Added ${paramLabel}: ${this.formatValue(this.newValue)}`;
    case "UPDATE":
      return `Changed ${paramLabel} from ${this.formatValue(this.oldValue)} to ${this.formatValue(this.newValue)}`;
    case "DELETE":
      return `Removed ${paramLabel} (was: ${this.formatValue(this.oldValue)})`;
    case "VERIFY":
      return `Verified ${paramLabel}`;
    case "UNVERIFY":
      return `Unverified ${paramLabel}`;
    default:
      return `Modified ${paramLabel}`;
  }
});

// Virtual for formatted timestamp
instituteParameterHistorySchema.virtual("formattedTime").get(function () {
  return this.changedAt.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
});

// Method to format values based on data type
instituteParameterHistorySchema.methods.formatValue = function (value) {
  if (value === undefined || value === null) {
    return "Not set";
  }
  
  switch (this.dataType) {
    case "BOOLEAN":
      return value ? "Yes" : "No";
    case "NUMBER":
    case "INTEGER":
    case "DECIMAL":
    case "LONG":
      return value.toLocaleString("en-IN");
    case "STRING":
    case "TEXT":
      return value.length > 50 ? value.substring(0, 47) + "..." : value;
    default:
      return String(value);
  }
};

// Method to check if value actually changed (useful for filtering)
instituteParameterHistorySchema.methods.hasValueChanged = function () {
  if (this.oldValue === undefined || this.oldValue === null) {
    return this.newValue !== undefined && this.newValue !== null;
  }
  
  if (this.newValue === undefined || this.newValue === null) {
    return true;
  }
  
  // For primitive values
  if (typeof this.oldValue !== "object" && typeof this.newValue !== "object") {
    return this.oldValue !== this.newValue;
  }
  
  // For objects/arrays, do string comparison
  return JSON.stringify(this.oldValue) !== JSON.stringify(this.newValue);
};

// Static method to log a change
instituteParameterHistorySchema.statics.logChange = async function (data) {
  const {
    instituteDataId,
    instituteId,
    academicYear,
    parameterCategory,
    parameterName,
    parameterLabel,
    oldValue,
    newValue,
    dataType,
    changeSource,
    changedBy,
    changeType,
    ipAddress,
    userAgent,
    changeNotes,
    batchId,
    isVerificationAction,
    verificationId,
  } = data;
  
  // Only log if value actually changed
  if (oldValue === newValue) {
    return null;
  }
  
  const historyEntry = new this({
    instituteDataId,
    instituteId,
    academicYear,
    parameterCategory,
    parameterName,
    parameterLabel: parameterLabel || parameterName,
    oldValue,
    newValue,
    dataType: dataType || this.inferDataType(newValue),
    changeSource,
    changedBy,
    changeType,
    ipAddress,
    userAgent,
    changeNotes,
    batchId,
    isVerificationAction,
    verificationId,
  });
  
  return await historyEntry.save();
};

// Static method to infer data type from value
instituteParameterHistorySchema.statics.inferDataType = function (value) {
  if (value === undefined || value === null) {
    return "STRING";
  }
  
  if (typeof value === "boolean") {
    return "BOOLEAN";
  }
  
  if (typeof value === "number") {
    // Check if it's an integer
    if (Number.isInteger(value)) {
      return value > 2147483647 ? "LONG" : "INTEGER";
    }
    return "DECIMAL";
  }
  
  if (typeof value === "string") {
    return value.length > 255 ? "TEXT" : "STRING";
  }
  
  return "STRING";
};

// Static method to get change history for an institute
instituteParameterHistorySchema.statics.getInstituteHistory = async function (
  instituteId,
  academicYear = null,
  limit = 50,
  skip = 0
) {
  const query = { instituteId };
  
  if (academicYear) {
    query.academicYear = academicYear;
  }
  
  return await this.find(query)
    .sort({ changedAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate("changedBy", "fullName email role")
    .lean();
};

// Static method to get parameter-specific history
instituteParameterHistorySchema.statics.getParameterHistory = async function (
  instituteId,
  parameterName,
  academicYear = null,
  limit = 20
) {
  const query = { instituteId, parameterName };
  
  if (academicYear) {
    query.academicYear = academicYear;
  }
  
  return await this.find(query)
    .sort({ changedAt: -1 })
    .limit(limit)
    .populate("changedBy", "fullName email role")
    .lean();
};

const InstituteParameterHistory = mongoose.model(
  "InstituteParameterHistory",
  instituteParameterHistorySchema
);

export default InstituteParameterHistory;
