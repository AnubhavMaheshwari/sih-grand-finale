import mongoose from "mongoose";

const studentStrengthSchema = new mongoose.Schema(
  {
    sanctionedIntake: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "sanctionedIntake",
      required: true,
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
    maleStudents: { type: Number, default: 0 },
    femaleStudents: { type: Number, default: 0 },
    totalStudents: { type: Number, default: 0 },
    withinState: { type: Number, default: 0 },
    outsideState: { type: Number, default: 0 },
    outsideCountry: { type: Number, default: 0 },
    economicallyWeaker: { type: Number, default: 0 },
    sociallyChallenged: { type: Number, default: 0 }, // sc st and obc
    fullFeeReimbStateCentral: { type: Number, default: 0 },
    fullFeeReimbInstitution: { type: Number, default: 0 },
    fullFeeReimbPrivate: { type: Number, default: 0 },
    notReceivingFullReimb: { type: Number, default: 0 }, // reimb -remburshment
  },
  { timestamps: true }
);

const studentStrength = mongoose.model(
  "studentStrength",
  studentStrengthSchema
);

export default studentStrength;
