import multer from "multer";
import path from "path";
import fs from "fs";

// Ensure uploads directory exists
const uploadsDir = "uploads/requests";
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        // Create directory structure: uploads/requests/{instituteId}/{requestId}
        const instituteId = req.user.instituteId;
        const requestId = req.body.requestId || Date.now().toString();
        const uploadPath = path.join(uploadsDir, instituteId, requestId);

        // Create directory if it doesn't exist
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }

        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        // Generate unique filename: timestamp-originalname
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        const ext = path.extname(file.originalname);
        const nameWithoutExt = path.basename(file.originalname, ext);
        cb(null, `${nameWithoutExt}-${uniqueSuffix}${ext}`);
    },
});

// File filter - accept only specific file types
const fileFilter = (req, file, cb) => {
    const allowedMimes = [
        "application/pdf",
        "image/jpeg",
        "image/jpg",
        "image/png",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/vnd.ms-excel",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ];

    if (allowedMimes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(
            new Error(
                "Invalid file type. Only PDF, JPG, PNG, DOC, DOCX, XLS, XLSX are allowed."
            ),
            false
        );
    }
};

// Configure multer
export const uploadRequestFiles = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB per file
        files: 5, // Maximum 5 files per request
    },
});
