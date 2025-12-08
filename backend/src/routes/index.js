import express from "express";
import authRoutes from "./auth.routes.js";
import faqRoutes from "./faq.routes.js";
import contactUsRoutes from "./contactus.routes.js";
import uploadRoutes from "./upload.routes.js";
import analyticsRoutes from "./analytics.routes.js";
import adminRoutes from "./admin.routes.js";
import instituteRoutes from "./institute.routes.js";

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/faq", faqRoutes);
router.use("/contact", contactUsRoutes);
router.use("/documents", uploadRoutes);
router.use("/analytics", analyticsRoutes);
router.use("/admin", adminRoutes);
router.use("/institute", instituteRoutes);

export default router;
