import express from "express";
import {
  getAdminStats,
  getSystemHealth,
  getUserManagementStats,
} from "../controllers/admin.controller.js";
import { auth, isAdmin } from "../middleware/auth.js";

const router = express.Router();

// Apply authentication and admin middleware to all routes
router.use(auth);
router.use(isAdmin);

// Admin dashboard routes
router.get("/stats", getAdminStats);
router.get("/system-health", getSystemHealth);
router.get("/user-stats", getUserManagementStats);

export default router;
