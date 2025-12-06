import mongoose from "mongoose";

const instituteSchema = new mongoose.Schema(
  {
    instituteId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ["University", "College", "Institute", "School"],
      default: "Institute",
    },
    location: {
      city: {
        type: String,
        required: true,
      },
      state: {
        type: String,
        required: true,
      },
    },
    establishedYear: {
      type: Number,
    },
    accreditation: {
      type: String,
      default: "",
    },
    contact: {
      email: {
        type: String,
        default: "",
      },
      phone: {
        type: String,
        default: "",
      },
      address: {
        type: String,
        default: "",
      },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

const Institute = mongoose.model("Institute", instituteSchema);

export default Institute;
