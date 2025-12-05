import mongoose from "mongoose";

const sanctionedIntakeSchema = new mongoose.Schema(
  {
    academicYear: {
      // format of academic year should be "2023-24"
      type: String,
      required: true,
      unique: true,
    },
    ug: {
      year: {
        // no of year of the program
        type: Number,
        required: true,
      },
      value: {
        type: Number,

        default: 0,
      },
    },
    pg: {
      year: {
        type: Number,
        required: true,
      },
      value: {
        type: Number,

        default: 0,
      },
    },
  },
  { timestamps: true }
);

const sanctionedIntake = mongoose.model(
  "sanctionedIntake",
  sanctionedIntakeSchema
);
export default sanctionedIntake;
