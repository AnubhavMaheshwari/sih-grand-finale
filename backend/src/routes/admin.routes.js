import express from "express";
import { auth, isAdmin } from "../middleware/auth.js";
import {
  // User Management
  createUser,
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  regeneratePassword,
  
  // Institute Management
  createInstitute,
  getInstitutes,
  getInstitute,
  updateInstitute,
  deleteInstitute,
  
  // Dashboard Statistics
  getAdminStats,
} from "../controllers/admin.controller.js";

const router = express.Router();

// Apply authentication and admin middleware to all routes
router.use(auth);
router.use(isAdmin);

// User Management Routes
router.post("/users", createUser);
router.get("/users", getUsers);
router.get("/users/:userId", getUser);
router.put("/users/:userId", updateUser);
router.delete("/users/:userId", deleteUser);
router.post("/users/:userId/regenerate-password", regeneratePassword);

// Institute Management Routes
router.post("/institutes", createInstitute);
router.get("/institutes", getInstitutes);
router.get("/institutes/:instituteId", getInstitute);
router.put("/institutes/:instituteId", updateInstitute);
router.delete("/institutes/:instituteId", deleteInstitute);

// Dashboard Statistics Routes
router.get("/stats", getAdminStats);

export default router;
