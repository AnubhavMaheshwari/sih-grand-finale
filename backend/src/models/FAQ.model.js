import mongoose from "mongoose";

const faqSchema = new mongoose.Schema(
  {
    question: {
      type: String,
      required: true,
      trim: true,
    },
    answer: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      enum: ["general", "technical", "submission", "account", "other"],
      default: "general",
    },
    order: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: String,
      default: "admin",
    },
    updatedBy: {
      type: String,
      default: "admin",
    },
  },
  { timestamps: true }
);

// Create index for sorting and filtering
faqSchema.index({ category: 1, order: 1, isActive: 1 });

const FAQ = mongoose.model("FAQ", faqSchema);

export default FAQ;
