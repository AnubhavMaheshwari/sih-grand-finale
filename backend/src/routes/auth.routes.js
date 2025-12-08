import express from "express";
import { 
  login, 
  forgotPassword, 
  verifyOTP, 
  resetPassword 
} from "../controllers/auth.controller.js";

const router = express.Router();

// Public authentication routes
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.post("/verify-otp", verifyOTP);
router.post("/reset-password", resetPassword);

export default router;
