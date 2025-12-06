import express from "express";
import dotenv from "dotenv";
import cors from "cors";

import connectDB from "./src/connections/dbConnect.js";
import routes from "./src/routes/index.js";
import User from "./src/models/User.model.js";
import { DEFAULT_ADMIN } from "./src/config/constants.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api", routes);

app.get("/", (req, res) => {
  res.send("Server Running Successfully 🚀");
});

const createAdminIfNotExists = async () => {
  try {
    const admin = await User.findOne({ role: "admin" });
    if (!admin) {
      await User.create({
        userId: DEFAULT_ADMIN.USER_ID,
        password: DEFAULT_ADMIN.PASSWORD,
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

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();
  await createAdminIfNotExists();

  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
};

startServer();
