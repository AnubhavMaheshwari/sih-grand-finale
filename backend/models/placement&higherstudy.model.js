import mongoose from "mongoose";

const placementHigherStudiesSchema = new mongoose.Schema(
  {
    sanctionedIntake: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "sanctionedIntake",
    },

    studentStrength: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "studentStrength",
    },

    programLevel: {
      type: String,
      enum: ["UG", "PG"],
      required: true,
    },

    programYears: {
      type: Number,
      required: true,
    },

    intakeAcademicYear: {
      type: String, // "2023-24"
      required: true,
    },
    firstYearIntake: {
      type: Number,
      default: 0,
    },
    firstYearAdmitted: {
      type: Number,
      default: 0,
    },

    lateralEntryStudents: {
      type: Number,
      default: 0,
    },

    graduationAcademicYear: {
      type: String,
      required: true,
    },
    graduatingInMinTime: {
      type: Number,
      default: 0,
    },

    studentsPlaced: {
      type: Number,
      default: 0,
    },
    medianSalary: {
      type: Number,
      default: 0,
    },
    selectedForHigherStudies: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

const placementHigherStudies = mongoose.model(
  "placementHigherStudies",
  placementHigherStudiesSchema
);

export default placementHigherStudies;
