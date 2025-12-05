import express from "express";
import dotenv from "dotenv";
import cors from "cors";

// Import DB connection function
import connectDB from "./Connections/dbConnect.js";

// Import routes
import authRoutes from "./routes/auth.routes.js";
import User from "./Models/User.model.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use("/auth", authRoutes);

app.get("/", (req, res) => {
  res.send("Server Running Successfully 🚀");
});

const createAdminIfNotExists = async () => {
  try {
    const admin = await User.findOne({ role: "admin" });
    if (!admin) {
      await User.create({
        userId: process.env.ADMIN_USER_ID || "admin",
        password: process.env.ADMIN_PASSWORD || "Admin@123",
        role: "admin",
      });
      console.log("✔ Admin user created");
    } else {
      console.log("✔ Admin already exists");
    }
  } catch (err) {
    console.error("Admin creation error:", err.message);
  }
};

// ---------- Start Server ----------
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB(); // Connect DB here
  await createAdminIfNotExists(); // Ensure admin exists

  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
};

startServer();
