import express from "express";
import dotenv from "dotenv";
import cors from "cors";

import connectDB from "./src/connections/dbConnect.js";
import routes from "./src/routes/index.js";
import User from "./src/models/User.model.js";
import { DEFAULT_ADMIN } from "./src/config/constants.js";

dotenv.config();

import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.use("/api", routes);

app.get("/", (req, res) => {
  res.send("Server Running Successfully 🚀");
});

const createAdminIfNotExists = async () => {
  try {
    const admin = await User.findOne({ role: "admin" });
    const envAdminId = process.env.ADMIN_USER_ID || DEFAULT_ADMIN.USER_ID;
    const envAdminPassword = process.env.ADMIN_PASSWORD || DEFAULT_ADMIN.PASSWORD;

    if (!admin) {
      // Create admin if doesn't exist
      await User.create({
        userId: envAdminId,
        password: envAdminPassword,
        role: "admin",
        fullName: "System Administrator",
        email: "admin@sarthi.gov.in"
      });
      console.log(`✔ Admin user created with ID: ${envAdminId}`);
    } else {
      // Check if admin credentials match .env file
      const passwordMatches = await admin.comparePassword(envAdminPassword);
      const userIdMatches = admin.userId === envAdminId;

      if (!userIdMatches || !passwordMatches) {
        // Update admin with .env credentials
        admin.userId = envAdminId;
        admin.password = envAdminPassword;
        admin.fullName = "System Administrator";
        admin.email = "admin@sarthi.gov.in";
        await admin.save();
        console.log(`✔ Admin credentials updated from .env file. New ID: ${envAdminId}`);
      } else {
        console.log(`✔ Admin already exists with matching credentials. ID: ${envAdminId}`);
      }
    }
  } catch (err) {
    console.error("Admin configuration error:", err.message);
  }
};

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();
  await createAdminIfNotExists();

  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
};

startServer();
