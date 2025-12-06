import express from "express";
import { 
  auth, 
  isAdmin, 
  isInstitute, 
  isUgcEmployee,
  isAdminOrUgc,
  isAdminOrInstitute 
} from "../middleware/auth.js";
import { 
  login, 
  createUser, 
  getUsers, 
  getUser, 
  updateUser, 
  deleteUser,
  getProfile,
  updateProfile,
  regeneratePassword
} from "../controllers/auth.controller.js";

const router = express.Router();

// Public routes
router.post("/login", login);

// Protected routes
router.get("/profile", auth, getProfile);
router.put("/profile", auth, updateProfile);

// Admin only routes
router.post("/create-user", auth, isAdmin, createUser);
router.get("/users", auth, isAdminOrUgc, getUsers);
router.get("/users/:userId", auth, getUser);
router.put("/users/:userId", auth, updateUser);
router.delete("/users/:userId", auth, isAdmin, deleteUser);
router.post("/users/:userId/regenerate-password", auth, isAdmin, regeneratePassword);

export default router;
