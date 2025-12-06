import mongoose from "mongoose";

const sponsoredResearchSchema = new mongoose.Schema(
  {
    financialYear: {
      type: String,
      required: true,
      unique: true,
    },
    totalSponsoredProjects: {
      type: Number,
      default: 0,
    },
    totalFundingAgencies: {
      type: Number,
      default: 0,
    },
    totalAmountReceived: {
      type: Number,
      default: 0,
    },
    amountReceivedInWords: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

const sponsoredResearch = mongoose.model(
  "sponsoredResearch",
  sponsoredResearchSchema
);

export default sponsoredResearch;
