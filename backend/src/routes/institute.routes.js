import express from "express";
import { auth, isInstitute } from "../middleware/auth.js";
import {
  getProfile,
  updateProfile,
  getDashboardStats,
  changePassword,
} from "../controllers/institute.controller.js";

const router = express.Router();

// Apply authentication and institute middleware to all routes
router.use(auth);
router.use(isInstitute);

// Profile Management Routes
router.get("/profile", getProfile);
router.put("/profile", updateProfile);

// Dashboard Routes
router.get("/dashboard", getDashboardStats);

// Password Management Routes
router.post("/change-password", changePassword);

export default router;
