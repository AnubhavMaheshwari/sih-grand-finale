import mongoose from "mongoose";

const facultyDetailsSchema = new mongoose.Schema(
  {
    academicYear: {
      type: String,
      required: true,
      unique: true,
    },
    totalFaculty: {
      type: Number,
      default: 0,
    },
    permanentFaculty: {
      type: Number,
      default: 0,
    },
    temporaryFaculty: {
      type: Number,
      default: 0,
    },
    guestFaculty: {
      type: Number,
      default: 0,
    },
    facultyWithPhD: {
      type: Number,
      default: 0,
    },
    facultyWithPostDoc: {
      type: Number,
      default: 0,
    },
    facultyWithIndustryExperience: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

const facultyDetails = mongoose.model("facultyDetails", facultyDetailsSchema);

export default facultyDetails;
