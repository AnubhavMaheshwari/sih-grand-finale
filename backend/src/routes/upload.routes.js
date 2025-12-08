import express from "express";
import {
  uploadSingle,
  uploadMultiple,
  getInstituteDocuments,
  getDocument,
  deleteDocument,
  viewDocument,
} from "../controllers/upload.controller.js";
import { auth as authenticate } from "../middleware/auth.js";

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticate);

// Upload routes
router.post("/upload", uploadSingle);
router.post("/upload/multiple", uploadMultiple);

// Document management routes
router.get("/documents", getInstituteDocuments);
router.get("/documents/:id", getDocument);
router.delete("/documents/:id", deleteDocument);
router.get("/documents/:id/view", viewDocument);

// Admin routes (for viewing all institute documents)
router.get("/admin/documents", (req, res, next) => {
  // Check if user is admin
  if (req.user?.role !== "admin") {
    return res.status(403).json({
      success: false,
      error: "Access denied. Admin privileges required.",
    });
  }
  next();
}, getInstituteDocuments);

router.get("/admin/documents/:id", (req, res, next) => {
  if (req.user?.role !== "admin") {
    return res.status(403).json({
      success: false,
      error: "Access denied. Admin privileges required.",
    });
  }
  next();
}, getDocument);

export default router;
