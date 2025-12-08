import express from "express";
import { 
  login, 
  adminLogin,
  instituteLogin,
  forgotPassword, 
  verifyOTP, 
  resetPassword,
  registerInstitute,
  verifyRegistrationOTP
} from "../controllers/auth.controller.js";

const router = express.Router();

// Public authentication routes
router.post("/login", login); // General login (for backward compatibility)
router.post("/admin/login", adminLogin);
router.post("/institute/login", instituteLogin);
router.post("/forgot-password", forgotPassword);
router.post("/verify-otp", verifyOTP);
router.post("/reset-password", resetPassword);

// Institute registration routes
router.post("/register", registerInstitute);
router.post("/verify-registration-otp", verifyRegistrationOTP);

export default router;
