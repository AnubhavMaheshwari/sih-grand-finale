import express from "express";
import { auth, isInstitute, isAdmin } from "../middleware/auth.js";
import { uploadRequestFiles } from "../config/fileUpload.js";
import {
    submitRequest,
    getMyRequests,
    getRequest,
    updateRequest,
    deleteRequest,
    getAllRequests,
    reviewRequest,
} from "../controllers/request.controller.js";

const router = express.Router();

// Institute routes - require authentication and institute role
router.post(
    "/submit",
    auth,
    isInstitute,
    uploadRequestFiles.array("files", 5),
    submitRequest
);
router.get("/my-requests", auth, isInstitute, getMyRequests);
router.get("/:requestId", auth, getRequest);
router.put("/:requestId", auth, isInstitute, updateRequest);
router.delete("/:requestId", auth, isInstitute, deleteRequest);

// Admin routes - require authentication and admin role
router.get("/admin/all", auth, isAdmin, getAllRequests);
router.post("/admin/:requestId/review", auth, isAdmin, reviewRequest);

export default router;
