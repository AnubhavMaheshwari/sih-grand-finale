import mongoose from "mongoose";

const financialResourcesSchema = new mongoose.Schema(
  {
    financialYear: {
      type: String,
      required: true,
      unique: true,
    },

    capital: {
      libraryBooksEResources: { type: Number, default: 0 },
      labEquipmentSoftware: { type: Number, default: 0 },
      engineeringWorkshops: { type: Number, default: 0 },
      otherCapitalAssets: { type: Number, default: 0 },
    },

    operational: {
      salaries: { type: Number, default: 0 },
      infrastructureMaintenance: { type: Number, default: 0 },
      seminarsConferencesWorkshops: { type: Number, default: 0 },
    },
  },
  { timestamps: true }
);

const financialResources = mongoose.model(
  "financialResources",
  financialResourcesSchema
);

export default financialResources;
