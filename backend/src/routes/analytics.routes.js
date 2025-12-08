import express from "express";
import {
  getInstituteAnalytics,
  getMetricTrends,
  getPeerComparison,
  getComplianceStatus,
} from "../controllers/analytics.controller.js";
import { auth as authenticate } from "../middleware/auth.js";

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticate);

// Analytics routes
router.get("/overview", getInstituteAnalytics);
router.get("/metrics/:metric", getMetricTrends);
router.get("/peer-comparison", getPeerComparison);
router.get("/compliance", getComplianceStatus);

// Admin analytics routes
router.get("/admin/overview/:instituteId", (req, res, next) => {
  // Check if user is admin
  if (req.user?.role !== "admin") {
    return res.status(403).json({
      success: false,
      error: "Access denied. Admin privileges required.",
    });
  }
  next();
}, getInstituteAnalytics);

router.get("/admin/peer-comparison/:instituteId", (req, res, next) => {
  if (req.user?.role !== "admin") {
    return res.status(403).json({
      success: false,
      error: "Access denied. Admin privileges required.",
    });
  }
  next();
}, getPeerComparison);

export default router;
