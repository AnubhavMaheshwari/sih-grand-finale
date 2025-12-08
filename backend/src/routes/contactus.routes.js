import express from "express";
import {
  getContactInfo,
  updateContactInfo,
  addPhoneNumber,
  addEmailAddress,
  addSocialMedia,
  removePhoneNumber,
  removeEmailAddress,
  removeSocialMedia
} from "../controllers/contactus.controller.js";
import { auth, isAdmin } from "../middleware/auth.js";

const router = express.Router();

// Public routes
router.get("/", getContactInfo);

// Admin routes (protected)
router.put("/", auth, isAdmin, updateContactInfo);
router.post("/phone", auth, isAdmin, addPhoneNumber);
router.post("/email", auth, isAdmin, addEmailAddress);
router.post("/social", auth, isAdmin, addSocialMedia);
router.delete("/phone/:index", auth, isAdmin, removePhoneNumber);
router.delete("/email/:index", auth, isAdmin, removeEmailAddress);
router.delete("/social/:index", auth, isAdmin, removeSocialMedia);

export default router;
