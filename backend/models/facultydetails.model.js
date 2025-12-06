import mongoose from "mongoose";

const facultyDetailsSchema = new mongoose.Schema(
  {
    totalfaculty: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

const facultyDetails = mongoose.model("facultyDetails", facultyDetailsSchema);

export default facultyDetails;
