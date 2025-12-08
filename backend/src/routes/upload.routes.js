import express from "express";
import { auth as authenticate } from "../middleware/auth.js";
import { successResponse, errorResponse } from "../utils/apiResponse.js";

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticate);

// File upload functionality is disabled - use parameter form instead
router.post("/upload", (req, res) => {
  return errorResponse(res, "File uploads are no longer supported. Please use the parameter form for data entry.", 410);
});

router.post("/upload/multiple", (req, res) => {
  return errorResponse(res, "File uploads are no longer supported. Please use the parameter form for data entry.", 410);
});

// Document management routes - return empty or redirect to form
router.get("/documents", (req, res) => {
  return successResponse(res, {
    documents: [],
    message: "File uploads are no longer supported. Please use the parameter form for data entry."
  });
});

router.get("/documents/:id", (req, res) => {
  return errorResponse(res, "File uploads are no longer supported. Please use the parameter form for data entry.", 410);
});

router.delete("/documents/:id", (req, res) => {
  return errorResponse(res, "File uploads are no longer supported. Please use the parameter form for data entry.", 410);
});

router.get("/documents/:id/view", (req, res) => {
  return errorResponse(res, "File uploads are no longer supported. Please use the parameter form for data entry.", 410);
});

router.post("/documents/:id/parse-parameters", (req, res) => {
  return errorResponse(res, "File uploads are no longer supported. Please use the parameter form for data entry.", 410);
});

// Admin routes
router.get("/admin/documents", (req, res) => {
  if (req.user?.role !== "admin") {
    return errorResponse(res, "Access denied. Admin privileges required.", 403);
  }
  return successResponse(res, {
    documents: [],
    message: "File uploads are no longer supported. Please use the parameter form for data entry."
  });
});

router.get("/admin/documents/:id", (req, res) => {
  if (req.user?.role !== "admin") {
    return errorResponse(res, "Access denied. Admin privileges required.", 403);
  }
  return errorResponse(res, "File uploads are no longer supported. Please use the parameter form for data entry.", 410);
});

export default router;
