import express from "express";
import {
  getFAQs,
  getAllFAQs,
  getFAQ,
  createFAQ,
  updateFAQ,
  deleteFAQ,
  reorderFAQs
} from "../controllers/faq.controller.js";
import { auth, isAdmin } from "../middleware/auth.js";

const router = express.Router();

// Public routes
router.get("/", getFAQs);
router.get("/:id", getFAQ);

// Admin routes (protected)
router.get("/admin/all", auth, isAdmin, getAllFAQs);
router.post("/", auth, isAdmin, createFAQ);
router.put("/:id", auth, isAdmin, updateFAQ);
router.delete("/:id", auth, isAdmin, deleteFAQ);
router.put("/admin/reorder", auth, isAdmin, reorderFAQs);

export default router;
