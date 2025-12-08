import UploadedDocument from "../models/UploadedDocument.model.js";
import { upload, moveToInstituteDirectory } from "../middleware/upload.js";
import excelParserService from "../services/excelParser.service.js";
import fs from "fs-extra";
import { successResponse, errorResponse } from "../utils/apiResponse.js";

/**
 * Log helper for consistent logging format in upload controller
 * @param {string} step - Step description
 * @param {any} data - Data to log
 * @param {string} type - Log type (info, success, warning, error)
 */
const logUploadStep = (step, data = null, type = 'info') => {
  const timestamp = new Date().toISOString();
  const prefix = `[Upload Controller] [${timestamp}]`;
  
  switch(type) {
    case 'success':
      console.log(`✅ ${prefix} ${step}`);
      break;
    case 'warning':
      console.warn(`⚠️ ${prefix} ${step}`);
      break;
    case 'error':
      console.error(`❌ ${prefix} ${step}`);
      break;
    default:
      console.log(`📝 ${prefix} ${step}`);
  }
  
  if (data !== null) {
    console.log(`${prefix} Data:`, typeof data === 'object' ? JSON.stringify(data, null, 2) : data);
  }
};

// Handle single file upload
const uploadSingle = (req, res, next) => {
  upload.single("document")(req, res, async (err) => {
    try {
      logUploadStep(`Step 1: Starting file upload process`);
      
      if (err) {
        logUploadStep(`Step 2: Upload error occurred`, err.message, 'error');
        return errorResponse(res, err.message, 400);
      }

      if (!req.file) {
        logUploadStep(`Step 2: No file uploaded`, null, 'error');
        return errorResponse(res, "No file uploaded", 400);
      }

      logUploadStep(`Step 2: File received`, {
        fileName: req.file.originalname,
        fileSize: req.file.size,
        mimeType: req.file.mimetype
      });

      // Get institute ID from authenticated user
      const instituteId = req.user?.instituteId || req.body.instituteId;
      if (!instituteId) {
        logUploadStep(`Step 3: Institute ID missing`, null, 'error');
        // Clean up temp file
        await fs.remove(req.file.path);
        return errorResponse(res, "Institute ID is required", 400);
      }

      logUploadStep(`Step 3: Institute ID found`, instituteId);

      // Get year from request
      const year = parseInt(req.body.year);
      if (!year || year < 2000 || year > new Date().getFullYear() + 1) {
        logUploadStep(`Step 4: Invalid year`, year, 'error');
        await fs.remove(req.file.path);
        return errorResponse(res, "Valid year is required (2000 - current year + 1)", 400);
      }

      logUploadStep(`Step 4: Year validated`, year);

      // Check file type - accept PDF files only
      const fileExtension = req.file.originalname.toLowerCase().split('.').pop();
      const isPdf = fileExtension === 'pdf';
      
      if (!isPdf) {
        logUploadStep(`Step 5: Unsupported file type`, fileExtension, 'error');
        await fs.remove(req.file.path);
        return errorResponse(res, `Unsupported file type: ${fileExtension}. Please upload PDF files only.`, 400);
      }
      
      logUploadStep(`Step 5: File type validated`, {
        extension: fileExtension,
        isPdf: isPdf
      });

      // Move file to institute directory
      const fileInfo = await moveToInstituteDirectory(
        req.file.path,
        instituteId,
        year,
        req.file.originalname
      );

      logUploadStep(`Step 6: File moved to institute directory`, {
        storedFilename: fileInfo.storedFilename,
        filePath: fileInfo.filePath
      });

      // Create document record
      const document = new UploadedDocument({
        instituteId,
        originalFilename: req.file.originalname,
        storedFilename: fileInfo.storedFilename,
        filePath: fileInfo.filePath,
        fileSize: req.file.size,
        year,
        uploadedBy: req.user?._id,
        status: "UPLOADED",
      });

      await document.save();
      logUploadStep(`Step 7: Document record created`, {
        documentId: document._id,
        status: document.status
      });

      // Start background parsing for PDFs
      setTimeout(() => {
        parseDocument(document._id).catch(console.error);
      }, 100);

      // Prepare response
      const responseData = {
        document: {
          id: document._id,
          originalFilename: document.originalFilename,
          storedFilename: document.storedFilename,
          fileSize: document.fileSize,
          year: document.year,
          status: document.status,
          uploadedAt: document.uploadedAt,
          fileUrl: document.fileUrl,
        },
        message: "Document uploaded successfully",
      };

      logUploadStep(`Step 8: Upload process completed successfully`, null, 'success');
      
      return successResponse(res, responseData, 201);
    } catch (error) {
      logUploadStep(`Step 9: Upload error occurred`, error.message, 'error');
      
      // Clean up temp file if it exists
      if (req.file?.path && await fs.pathExists(req.file.path)) {
        await fs.remove(req.file.path).catch(() => {});
      }
      
      return errorResponse(res, error.message || "Failed to upload document", 500);
    }
  });
};

// Handle multiple file uploads
const uploadMultiple = (req, res, next) => {
  upload.array("documents", 5)(req, res, async (err) => {
    try {
      if (err) {
        return errorResponse(res, err.message, 400);
      }

      if (!req.files || req.files.length === 0) {
        return errorResponse(res, "No files uploaded", 400);
      }

      const instituteId = req.user?.instituteId || req.body.instituteId;
      if (!instituteId) {
        // Clean up all temp files
        await Promise.all(
          req.files.map(file => fs.remove(file.path).catch(() => {}))
        );
        return errorResponse(res, "Institute ID is required", 400);
      }

      const year = parseInt(req.body.year);
      if (!year || year < 2000 || year > new Date().getFullYear() + 1) {
        await Promise.all(
          req.files.map(file => fs.remove(file.path).catch(() => {}))
        );
        return errorResponse(res, "Valid year is required (2000 - current year + 1)", 400);
      }

      const uploadedDocuments = [];

      for (const file of req.files) {
        try {
          // Move file to institute directory
          const fileInfo = await moveToInstituteDirectory(
            file.path,
            instituteId,
            year,
            file.originalname
          );

          // Create document record
          const document = new UploadedDocument({
            instituteId,
            originalFilename: file.originalname,
            storedFilename: fileInfo.storedFilename,
            filePath: fileInfo.filePath,
            fileSize: file.size,
            year,
            uploadedBy: req.user?._id,
            status: "UPLOADED",
          });

          await document.save();
          uploadedDocuments.push(document);

          // Start parsing in background
          setTimeout(() => {
            parseDocument(document._id).catch(console.error);
          }, 100);
        } catch (fileError) {
          console.error(`Error processing file ${file.originalname}:`, fileError);
          // Continue with other files
        }
      }

      if (uploadedDocuments.length === 0) {
        return errorResponse(res, "Failed to upload any documents", 500);
      }

      return successResponse(res, {
        documents: uploadedDocuments.map(doc => ({
          id: doc._id,
          originalFilename: doc.originalFilename,
          storedFilename: doc.storedFilename,
          fileSize: doc.fileSize,
          year: doc.year,
          status: doc.status,
          uploadedAt: doc.uploadedAt,
          fileUrl: doc.fileUrl,
        })),
        successCount: uploadedDocuments.length,
        totalCount: req.files.length,
        message: `Successfully uploaded ${uploadedDocuments.length} of ${req.files.length} documents`,
      }, 201);
    } catch (error) {
      console.error("Multiple upload error:", error);
      
      // Clean up all temp files
      if (req.files) {
        await Promise.all(
          req.files.map(file => 
            file.path && fs.pathExists(file.path) 
              ? fs.remove(file.path).catch(() => {}) 
              : Promise.resolve()
          )
        );
      }
      
      return errorResponse(res, error.message || "Failed to upload documents", 500);
    }
  });
};

// Get institute documents
const getInstituteDocuments = async (req, res) => {
  try {
    // Get institute ID from user, params, or query (for admin/UGC users)
    let instituteId = req.user?.instituteId || req.params.instituteId;
    
    // If still no instituteId, check query parameters (for admin/UGC users)
    if (!instituteId && req.query.instituteId) {
      instituteId = req.query.instituteId;
    }
    
    // For admin users, if no instituteId specified, return all documents
    const isAdmin = req.user?.role === "admin";
    if (!instituteId && !isAdmin) {
      return errorResponse(res, "Institute ID is required", 400);
    }

    const { year, status, page = 1, limit = 20 } = req.query;
    const query = { status: { $ne: "DELETED" } };
    
    // Only filter by instituteId if specified (admin can see all)
    if (instituteId) {
      query.instituteId = instituteId;
    }

    if (year) query.year = parseInt(year);
    if (status) query.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const documents = await UploadedDocument.find(query)
      .sort({ uploadedAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate("uploadedBy", "fullName email")
      .lean();

    const total = await UploadedDocument.countDocuments(query);

    return successResponse(res, {
      documents,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
      message: "Documents retrieved successfully",
    });
  } catch (error) {
    console.error("Get documents error:", error);
    return errorResponse(res, error.message || "Failed to retrieve documents", 500);
  }
};

// Get single document
const getDocument = async (req, res) => {
  try {
    const document = await UploadedDocument.findById(req.params.id)
      .populate("uploadedBy", "fullName email")
      .populate("parsedData")
      .lean();

    if (!document) {
      return errorResponse(res, "Document not found", 404);
    }

    // Check access permissions
    const instituteId = req.user?.instituteId;
    const isAdmin = req.user?.role === "admin";
    
    if (!isAdmin && document.instituteId !== instituteId) {
      return errorResponse(res, "Access denied", 403);
    }

    // Update access stats
    await UploadedDocument.findByIdAndUpdate(req.params.id, {
      $inc: { accessCount: 1 },
      lastAccessedAt: new Date(),
    });

    return successResponse(res, { 
      document,
      message: "Document retrieved successfully",
    });
  } catch (error) {
    console.error("Get document error:", error);
    return errorResponse(res, error.message || "Failed to retrieve document", 500);
  }
};

// Delete document (soft delete)
const deleteDocument = async (req, res) => {
  try {
    const document = await UploadedDocument.findById(req.params.id);

    if (!document) {
      return errorResponse(res, "Document not found", 404);
    }

    // Check access permissions
    const instituteId = req.user?.instituteId;
    const isAdmin = req.user?.role === "admin";
    
    if (!isAdmin && document.instituteId !== instituteId) {
      return errorResponse(res, "Access denied", 403);
    }

    // Soft delete
    await document.softDelete(req.user?._id);

    return successResponse(res, { 
      message: "Document deleted successfully",
    });
  } catch (error) {
    console.error("Delete document error:", error);
    return errorResponse(res, error.message || "Failed to delete document", 500);
  }
};

// View PDF file
const viewDocument = async (req, res) => {
  try {
    const document = await UploadedDocument.findById(req.params.id);

    if (!document) {
      return errorResponse(res, "Document not found", 404);
    }

    // Check access permissions
    const instituteId = req.user?.instituteId;
    const isAdmin = req.user?.role === "admin";
    
    if (!isAdmin && document.instituteId !== instituteId) {
      return errorResponse(res, "Access denied", 403);
    }

    if (!await fs.pathExists(document.filePath)) {
      return errorResponse(res, "File not found on server", 404);
    }

    // Set headers for PDF viewing
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `inline; filename="${document.originalFilename}"`);
    
    // Stream the file
    const fileStream = fs.createReadStream(document.filePath);
    fileStream.pipe(res);
  } catch (error) {
    console.error("View document error:", error);
    return errorResponse(res, error.message || "Failed to view document", 500);
  }
};

// Parse document (background job) - PDF files only
const parseDocument = async (documentId) => {
  try {
    const document = await UploadedDocument.findById(documentId);
    if (!document || document.status === "DELETED") {
      return;
    }

    // Mark as parsing
    await document.startParsing();

    // Check if file exists
    if (!await fs.pathExists(document.filePath)) {
      throw new Error(`File not found: ${document.filePath}`);
    }

    // Check file type - we only accept PDF files now
    const fileExtension = document.originalFilename.toLowerCase().split('.').pop();
    
    if (fileExtension === 'pdf') {
      // For PDF files, mark as PARSED since they're handled by PDF processor separately
      console.log(`Document ${documentId} is PDF, marking as PARSED`);
      await UploadedDocument.findByIdAndUpdate(documentId, {
        status: 'PARSED',
        parsedAt: new Date(),
      });
    } else {
      console.log(`Skipping parsing for unsupported file type: ${fileExtension}`);
      // Mark as PARSED for other file types (shouldn't happen since we only accept PDFs)
      await UploadedDocument.findByIdAndUpdate(documentId, {
        status: 'PARSED',
        parsedAt: new Date(),
      });
    }
  } catch (error) {
    console.error(`Error parsing document ${documentId}:`, error);
    
    try {
      const document = await UploadedDocument.findById(documentId);
      if (document) {
        await document.markAsError([
          {
            section: "general",
            error: error.message,
            timestamp: new Date(),
          },
        ]);
      }
    } catch (markError) {
      console.error("Failed to mark document as error:", markError);
    }
  }
};

// Parse parameter CSV/Excel file (DEPRECATED - CSV/Excel uploads no longer supported)
const parseParameterFile = async (req, res) => {
  return errorResponse(res, "CSV/Excel file uploads are no longer supported. Please use the parameter form for data entry.", 410); // 410 Gone
};

export {
  uploadSingle,
  uploadMultiple,
  getInstituteDocuments,
  getDocument,
  deleteDocument,
  viewDocument,
  parseDocument,
  parseParameterFile,
};
