import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import InstituteData from "../src/models/InstituteData.model.js";
import Institute from "../src/models/Institute.model.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, "../.env") });

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/sih-grand-finale";

const debugData = async () => {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log("Connected.");

        const institutes = await Institute.find({});
        console.log("--- INSTITUTES ---");
        institutes.forEach(i => console.log(`${i.name}: ${i.instituteId} (_id: ${i._id})`));

        const data = await InstituteData.find({});
        console.log("--- INSTITUTE DATA ---");
        // Print detailed first record to see keys
        if (data.length > 0) {
            console.log("First record keys:", Object.keys(data[0].toObject()));
            console.log("First record content:", JSON.stringify(data[0].toObject(), null, 2));
        }
        data.forEach(d => console.log(`InstID: ${d.instituteId}, Year: ${d.academicYear}, Cap: ${d.financialCapacity}`));

    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.disconnect();
    }
};

debugData();
