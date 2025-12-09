import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import InstituteData from "../src/models/InstituteData.model.js";
import Institute from "../src/models/Institute.model.js";

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, "../.env") });

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/sih-grand-finale";

const ensureInstituteExists = async (code, name, type, location) => {
    let inst = await Institute.findOne({
        $or: [{ instituteId: code }, { name: { $regex: new RegExp(name, 'i') } }]
    });

    if (!inst) {
        console.log(`Creating institute: ${name} (${code})...`);
        inst = await Institute.create({
            instituteId: code,
            name: name,
            type: type,
            category: "Engineering",
            location: location,
            contact: {
                email: `${code}@example.com`,
                phone: "1234567890",
                address: `${location.city}, ${location.state}`
            }
        });
    } else {
        console.log(`Found existing institute: ${inst.name} (${inst.instituteId})`);
    }
    return inst;
};

const seedData = async () => {
    try {
        console.log("Connecting to MongoDB...");
        await mongoose.connect(MONGODB_URI);
        console.log("Connected.");

        // Ensure institutes exist and get their REAL IDs
        const nitInst = await ensureInstituteExists(
            "nitjsr",
            "NIT Jamshedpur",
            "Institute",
            { city: "Jamshedpur", state: "Jharkhand" }
        );

        const iitInst = await ensureInstituteExists(
            "iitd",
            "IIT Delhi",
            "Institute",
            { city: "New Delhi", state: "Delhi" }
        );

        // Data for NIT Jamshedpur
        const nitJsrData = [
            {
                instituteId: nitInst.instituteId, // Use the real ID
                academicYear: 2021,
                teacherStudentRatio: "1:20",
                facultyStrength: 350,
                studentStrength: 7000,
                placementPercentage: 85,
                studentsGoingForHigherStudies: 120,
                financialCapacity: 16159011 + 32702870 + 10276185 + 116807266, // Capital
                budgetAllocation: 654305850 + 270257352, // Operational
                source: "MANUAL_ENTRY",
                isVerified: true
            },
            {
                instituteId: nitInst.instituteId,
                academicYear: 2022,
                teacherStudentRatio: "1:19",
                facultyStrength: 380,
                studentStrength: 7200,
                placementPercentage: 92,
                studentsGoingForHigherStudies: 140,
                financialCapacity: 26960364 + 40039505 + 15642801 + 205437744,
                budgetAllocation: 740051982 + 325776674,
                source: "MANUAL_ENTRY",
                isVerified: true
            },
            {
                instituteId: nitInst.instituteId,
                academicYear: 2023,
                teacherStudentRatio: "1:18",
                facultyStrength: 410,
                studentStrength: 7500,
                placementPercentage: 96,
                studentsGoingForHigherStudies: 160,
                financialCapacity: 64619296 + 37165334 + 7808673 + 117932029,
                budgetAllocation: 892977412 + 470807984,
                source: "MANUAL_ENTRY",
                isVerified: true
            }
        ];

        // Data for IIT Delhi
        const iitDelhiData = [
            {
                instituteId: iitInst.instituteId, // Use the real ID
                academicYear: 2021,
                teacherStudentRatio: "1:15",
                facultyStrength: 600,
                studentStrength: 9000,
                placementPercentage: 90,
                studentsGoingForHigherStudies: 400,
                financialCapacity: 450000000,
                budgetAllocation: 1200000000,
                source: "MANUAL_ENTRY",
                isVerified: true
            },
            {
                instituteId: iitInst.instituteId,
                academicYear: 2022,
                teacherStudentRatio: "1:14",
                facultyStrength: 650,
                studentStrength: 9200,
                placementPercentage: 94,
                studentsGoingForHigherStudies: 420,
                financialCapacity: 520000000,
                budgetAllocation: 1350000000,
                source: "MANUAL_ENTRY",
                isVerified: true
            },
            {
                instituteId: iitInst.instituteId,
                academicYear: 2023,
                teacherStudentRatio: "1:12",
                facultyStrength: 700,
                studentStrength: 9500,
                placementPercentage: 98,
                studentsGoingForHigherStudies: 450,
                financialCapacity: 600000000,
                budgetAllocation: 1500000000,
                source: "MANUAL_ENTRY",
                isVerified: true
            }
        ];

        const allData = [...nitJsrData, ...iitDelhiData];

        console.log(`Seeding data for ${allData.length} entries...`);

        for (const data of allData) {
            // Upsert: Update if exists, Insert if not
            await InstituteData.findOneAndUpdate(
                { instituteId: data.instituteId, academicYear: data.academicYear },
                data,
                { upsert: true, new: true, setDefaultsOnInsert: true }
            );
            console.log(`Processed data for ${data.instituteId} - ${data.academicYear}`);
        }

        console.log("Seeding complete! Data is now linked correctly to institutes.");
    } catch (error) {
        console.error("Error seeding data:", error);
    } finally {
        await mongoose.connection.close();
    }
};

seedData();
