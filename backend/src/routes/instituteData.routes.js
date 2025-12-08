import express from "express";
import instituteDataController from "../controllers/instituteData.controller.js";
import { auth as authenticate } from "../middleware/auth.js";

const router = express.Router();

// Apply authentication to all routes
router.use(authenticate);

// ========== PUBLIC PARAMETER MAPPINGS ==========
// This endpoint doesn't require specific role - anyone can access parameter mappings
router.get("/parameters/mappings", instituteDataController.getParameterMappings);

// ========== INSTITUTE USER ROUTES ==========
// These routes are for institute users to manage their own data

// Get institute's own data
router.get("/my/data", instituteDataController.getMyInstituteData);
router.get("/my/data/:academicYear", instituteDataController.getMyInstituteData);

// Save institute's own data
router.post("/my/data", instituteDataController.saveMyInstituteData);
router.post("/my/data/:academicYear", instituteDataController.saveMyInstituteData);
router.put("/my/data", instituteDataController.saveMyInstituteData);
router.put("/my/data/:academicYear", instituteDataController.saveMyInstituteData);

// Get completeness statistics for own institute
router.get("/my/stats/completeness", instituteDataController.getMyCompletenessStats);

// Get change history for own institute
router.get("/my/history", instituteDataController.getMyChangeHistory);

// Extracted parameter verification routes
router.get("/my/extracted", instituteDataController.getExtractedParameters);
router.post("/my/extracted/accept", instituteDataController.acceptExtractedParameter);
router.post("/my/extracted/reject", instituteDataController.rejectExtractedParameter);
router.post("/my/extracted/accept-all", instituteDataController.acceptAllExtractedParameters);
router.post("/my/extracted/reject-all", instituteDataController.rejectAllExtractedParameters);

// ========== ADMIN ROUTES ==========
// These routes are for admin users to manage any institute's data

// Get institute data (admin can access any institute)
router.get("/:instituteId/data", instituteDataController.getInstituteData);
router.get("/:instituteId/data/:academicYear", instituteDataController.getInstituteData);

// Get all data for an institute (multiple years)
router.get("/:instituteId/data-all", instituteDataController.getAllInstituteData);

// Save institute data (admin can save for any institute)
router.post("/:instituteId/data", instituteDataController.saveInstituteData);
router.post("/:instituteId/data/:academicYear", instituteDataController.saveInstituteData);
router.put("/:instituteId/data", instituteDataController.saveInstituteData);
router.put("/:instituteId/data/:academicYear", instituteDataController.saveInstituteData);

// Delete institute data (admin only)
router.delete("/:instituteId/data/:academicYear", instituteDataController.deleteInstituteData);

// Verify/unverify institute data (admin only)
router.post("/:instituteId/data/:academicYear/verify", instituteDataController.verifyInstituteData);
router.post("/:instituteId/data/:academicYear/unverify", instituteDataController.unverifyInstituteData);

// Get completeness statistics for any institute
router.get("/:instituteId/stats/completeness", instituteDataController.getCompletenessStats);

// Get change history for any institute
router.get("/:instituteId/history", instituteDataController.getChangeHistory);

export default router;
