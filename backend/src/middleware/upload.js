import multer from "multer";
import path from "path";
import fs from "fs-extra";
import { v4 as uuidv4 } from "uuid";

// Ensure uploads directory exists
const UPLOADS_DIR = path.join(process.cwd(), "uploads");

// Create directory structure
const createUploadsDirectory = () => {
  const dirs = [
    UPLOADS_DIR,
    path.join(UPLOADS_DIR, "institutes"),
    path.join(UPLOADS_DIR, "temp"),
  ];
  
  dirs.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
};

createUploadsDirectory();

// Configure storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Store in temp first, then move to institute directory after validation
    cb(null, path.join(UPLOADS_DIR, "temp"));
  },
  filename: function (req, file, cb) {
    // Generate unique filename with timestamp
    const uniqueSuffix = `${Date.now()}-${uuidv4().slice(0, 8)}`;
    const ext = path.extname(file.originalname);
    cb(null, `temp-${uniqueSuffix}${ext}`);
  },
});

// File filter - only allow PDFs
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = ["application/pdf"];
  const allowedExtensions = [".pdf", ".PDF"];
  
  const ext = path.extname(file.originalname).toLowerCase();
  const isPdfMime = allowedMimeTypes.includes(file.mimetype);
  const isPdfExt = allowedExtensions.includes(ext);
  
  if (isPdfMime && isPdfExt) {
    cb(null, true);
  } else {
    cb(new Error("Only PDF files are allowed"), false);
  }
};

// Configure multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
    files: 5, // Max 5 files per request
  },
});

// Middleware to move file to institute directory
const moveToInstituteDirectory = async (tempFilePath, instituteId, year, originalFilename) => {
  try {
    // Create institute directory if it doesn't exist
    const instituteDir = path.join(UPLOADS_DIR, "institutes", instituteId);
    await fs.ensureDir(instituteDir);
    
    // Create year subdirectory
    const yearDir = path.join(instituteDir, year.toString());
    await fs.ensureDir(yearDir);
    
    // Generate final filename
    const uniqueSuffix = `${Date.now()}-${uuidv4().slice(0, 8)}`;
    const ext = path.extname(originalFilename);
    const finalFilename = `${year}-${uniqueSuffix}${ext}`;
    const finalPath = path.join(yearDir, finalFilename);
    
    // Move file
    await fs.move(tempFilePath, finalPath, { overwrite: false });
    
    return {
      storedFilename: finalFilename,
      filePath: finalPath,
      relativePath: path.relative(process.cwd(), finalPath),
    };
  } catch (error) {
    // Clean up temp file if move fails
    try {
      await fs.remove(tempFilePath);
    } catch (cleanupError) {
      console.error("Failed to clean up temp file:", cleanupError);
    }
    throw error;
  }
};

// Clean up temp files older than 24 hours
const cleanupTempFiles = async () => {
  try {
    const tempDir = path.join(UPLOADS_DIR, "temp");
    if (!fs.existsSync(tempDir)) return;
    
    const files = await fs.readdir(tempDir);
    const now = Date.now();
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours
    
    for (const file of files) {
      const filePath = path.join(tempDir, file);
      const stats = await fs.stat(filePath);
      
      if (now - stats.mtimeMs > maxAge) {
        await fs.remove(filePath);
        console.log(`Cleaned up old temp file: ${file}`);
      }
    }
  } catch (error) {
    console.error("Error cleaning up temp files:", error);
  }
};

// Run cleanup on startup
cleanupTempFiles();

// Schedule cleanup every 6 hours
setInterval(cleanupTempFiles, 6 * 60 * 60 * 1000);

export {
  upload,
  moveToInstituteDirectory,
  UPLOADS_DIR,
  cleanupTempFiles,
};
