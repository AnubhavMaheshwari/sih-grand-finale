import mongoose from "mongoose";

const phdStudentsSchema = new mongoose.Schema(
  {
    academicYear: {
      // format of academic year should be "2023-24"
      type: String,
      required: true,
      unique: true,
    },

    fulltime: { type: Number, default: 0 },
    parttime: { type: Number, default: 0 },
  },
  {}
);

const phdStudentsDetails = mongoose.model(
  "phdStudentsDetails",
  phdStudentsSchema
);
export default phdStudentsDetails;
