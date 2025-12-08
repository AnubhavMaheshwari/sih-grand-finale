import {
  useState,
  useCallback,
  useRef,
  useEffect,
  useMemo,
} from "react";
import InstituteLayout from "../components/layout/InstituteLayout";
import {
  FileText,
  UploadCloud,
  X,
  CheckCircle2,
  AlertCircle,
  BarChart3,
  Loader2,
  Eye,
  Trash2,
  RefreshCw,
} from "lucide-react";
import documentsApi from "../api/documents.api.js";

const PRIMARY_BLUE = "#4F46E5";
const DEEP_INDIGO = "#3730A3";

// --- FilePreview Component (PDF only) ---
function FilePreview({ file, onRemove, isUploading = false }) {
  const formatFileSize = (bytes) =>
    bytes > 1024 * 1024
      ? `${(bytes / (1024 * 1024)).toFixed(1)} MB`
      : `${(bytes / 1024).toFixed(1)} KB`;

  return (
    <div className="flex items-center justify-between p-4 transition-all bg-gray-100 rounded-lg">
      <div className="flex items-center gap-4">
        <div className="flex items-center justify-center w-12 h-12 bg-white rounded-md shadow-sm flex-shrink:0">
          {isUploading ? (
            <Loader2 className="w-6 h-6 animate-spin" style={{ color: DEEP_INDIGO }} />
          ) : (
            <FileText className="w-6 h-6" style={{ color: DEEP_INDIGO }} />
          )}
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-800 truncate max-w-48 sm:max-w-md">
            {file.name}
          </p>
          <p className="text-xs text-gray-500">
            {formatFileSize(file.size)} · PDF
            {isUploading && " · Uploading..."}
          </p>
        </div>
      </div>
      {!isUploading && (
        <button
          onClick={() => onRemove(file.name)}
          className="p-1 transition-colors rounded-full hover:bg-red-50"
          title="Remove file"
        >
          <X className="w-4 h-4 text-gray-500 hover:text-red-500" />
        </button>
      )}
    </div>
  );
}

// --- DocumentItem Component for uploaded documents ---
function DocumentItem({ document, onView, onDelete, onRefresh }) {
  const formatFileSize = (bytes) =>
    bytes > 1024 * 1024
      ? `${(bytes / (1024 * 1024)).toFixed(1)} MB`
      : `${(bytes / 1024).toFixed(1)} KB`;

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "UPLOADED":
        return "bg-blue-100 text-blue-800";
      case "PARSING":
        return "bg-yellow-100 text-yellow-800";
      case "PARSED":
        return "bg-green-100 text-green-800";
      case "ERROR":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "UPLOADED":
        return "Uploaded";
      case "PARSING":
        return "Parsing...";
      case "PARSED":
        return "Parsed";
      case "ERROR":
        return "Error";
      default:
        return status;
    }
  };

  return (
    <div className="flex items-start justify-between p-4 rounded-lg bg-indigo-50 hover:bg-indigo-100 transition-colors">
      <div className="flex items-start gap-3 flex-1">
        <FileText className="w-6 h-6 text-indigo-600 mt-1 shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-800 truncate">
            {document.originalFilename}
          </p>
          <div className="flex flex-wrap items-center gap-2 mt-1">
            <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(document.status)}`}>
              {getStatusText(document.status)}
            </span>
            <span className="text-xs text-gray-600">
              Year: <span className="font-medium">{document.year}</span>
            </span>
            <span className="text-xs text-gray-600">
              Size: {formatFileSize(document.fileSize)}
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Uploaded on {formatDate(document.uploadedAt)}
          </p>
          {document.parsingStats && (
            <div className="mt-2 text-xs text-gray-600">
              <span className="font-medium">Parsing Stats:</span>{" "}
              {document.parsingStats.sectionsParsed || 0} sections parsed ·{" "}
              {document.parsingStats.confidenceScore || 0}% confidence
            </div>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2 ml-2">
        {document.status === "PARSED" && (
          <button
            onClick={() => onView(document)}
            className="p-1.5 text-indigo-600 hover:bg-indigo-200 rounded transition-colors"
            title="View PDF"
          >
            <Eye className="w-4 h-4" />
          </button>
        )}
        {document.status === "ERROR" && (
          <button
            onClick={() => onRefresh(document._id)}
            className="p-1.5 text-yellow-600 hover:bg-yellow-200 rounded transition-colors"
            title="Retry parsing"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        )}
        <button
          onClick={() => onDelete(document._id)}
          className="p-1.5 text-red-600 hover:bg-red-200 rounded transition-colors"
          title="Delete document"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

// --- Main UploadDocumentPage Component ---
function UploadDocumentPage() {
  const [isDragOver, setIsDragOver] = useState(false);
  const [files, setFiles] = useState({});
  const [toast, setToast] = useState(null); // {type, message}
  const [activePanel, setActivePanel] = useState("upload");
  const [documents, setDocuments] = useState([]);
  const [reportYear, setReportYear] = useState(new Date().getFullYear());
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});

  const fileInputRef = useRef(null);

  // Load documents on component mount
  useEffect(() => {
    loadDocuments();
    
    // Set up interval to refresh documents every 10 seconds if any are parsing
    const interval = setInterval(() => {
      const hasParsing = documents.some(doc => doc.status === "PARSING");
      if (hasParsing) {
        loadDocuments();
      }
    }, 10000);
    
    return () => clearInterval(interval);
  }, []);

  const loadDocuments = async () => {
    try {
      setIsLoading(true);
      console.log("Loading documents...");
      const response = await documentsApi.getInstituteDocuments();
      console.log("Full API Response:", response);
      console.log("Response success:", response.success);
      console.log("Response documents:", response.documents);
      console.log("Response keys:", Object.keys(response));
      
      if (response.success) {
        // Response structure: { success: true, documents: [], pagination: {}, message: "" }
        console.log(`Setting ${response.documents?.length || 0} documents`);
        setDocuments(response.documents || []);
      } else {
        // Handle error response
        console.log("API returned error:", response.error);
        showToast("error", response.error || "Failed to load documents");
        setDocuments([]);
      }
    } catch (error) {
      console.error("Error loading documents:", error);
      console.error("Error details:", error.response?.data);
      showToast("error", error.response?.data?.error || "Failed to load documents");
      setDocuments([]);
    } finally {
      setIsLoading(false);
    }
  };

  const showToast = useCallback((type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  }, []);

  const handleFiles = useCallback(
    (fileList) => {
      const valid = [];
      const rejected = [];

      Array.from(fileList).forEach((file) => {
        const isPdf =
          file.type === "application/pdf" ||
          file.name.toLowerCase().endsWith(".pdf");
        if (!isPdf) {
          rejected.push(file.name);
          return;
        }

        if (!files[file.name]) {
          valid.push(file);
        }
      });

      if (rejected.length) {
        showToast(
          "error",
          `Only PDF files are allowed. Skipped: ${rejected
            .slice(0, 3)
            .join(", ")}${rejected.length > 3 ? "..." : ""}`
        );
      }

      if (valid.length) {
        const newFiles = valid.reduce((acc, file) => {
          acc[file.name] = file;
          return acc;
        }, {});
        setFiles((prev) => ({ ...prev, ...newFiles }));
      }
    },
    [files, showToast]
  );

  const handleRemoveFile = useCallback((fileName) => {
    setFiles((prev) => {
      const newFiles = { ...prev };
      delete newFiles[fileName];
      return newFiles;
    });
  }, []);

  const handleUpload = async () => {
    const selectedFiles = Object.values(files);
    if (!selectedFiles.length) {
      showToast("error", "Please select at least one PDF file to upload.");
      return;
    }

    try {
      setIsUploading(true);
      
      if (selectedFiles.length === 1) {
        // Single file upload
        const response = await documentsApi.uploadDocument(selectedFiles[0], reportYear);
        if (response.success) {
          showToast("success", response.message || "Document uploaded successfully");
          setFiles({});
          loadDocuments();
          setActivePanel("reports");
        }
      } else {
        // Multiple files upload
        const response = await documentsApi.uploadMultipleDocuments(selectedFiles, reportYear);
        if (response.success) {
          showToast("success", response.message || "Documents uploaded successfully");
          setFiles({});
          loadDocuments();
          setActivePanel("reports");
        }
      }
    } catch (error) {
      console.error("Upload error:", error);
      showToast("error", error.response?.data?.error || "Failed to upload documents");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteDocument = async (documentId) => {
    if (!window.confirm("Are you sure you want to delete this document?")) {
      return;
    }

    try {
      const response = await documentsApi.deleteDocument(documentId);
      if (response.success) {
        showToast("success", "Document deleted successfully");
        loadDocuments();
      }
    } catch (error) {
      console.error("Delete error:", error);
      showToast("error", error.response?.data?.error || "Failed to delete document");
    }
  };

  const handleViewDocument = async (document) => {
    try {
      const pdfUrl = await documentsApi.viewDocument(document._id);
      window.open(pdfUrl, "_blank");
    } catch (error) {
      console.error("View error:", error);
      showToast("error", "Failed to view document");
    }
  };

  const handleRefreshDocument = async (documentId) => {
    try {
      // TODO: Implement retry parsing endpoint
      showToast("info", "Retry parsing feature coming soon");
    } catch (error) {
      console.error("Refresh error:", error);
      showToast("error", "Failed to retry parsing");
    }
  };

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragOver(false);
      handleFiles(e.dataTransfer.files);
    },
    [handleFiles]
  );

  const dropAreaClasses = `border-2 border-dashed rounded-lg p-8 text-center transition-all ${isDragOver
      ? "border-indigo-500 bg-indigo-100"
      : "border-gray-300 hover:border-indigo-500 hover:bg-indigo-50"
    }`;

  const totalFiles = Object.keys(files).length;

  // Filter documents by year
  const [documentYearFilter, setDocumentYearFilter] = useState("all");
  const filteredDocuments = useMemo(() => {
    if (documentYearFilter === "all") return documents;
    return documents.filter(doc => String(doc.year) === String(documentYearFilter));
  }, [documents, documentYearFilter]);

  const yearOptions = useMemo(() => {
    const set = new Set(documents.map(doc => doc.year));
    return Array.from(set).sort((a, b) => b - a);
  }, [documents]);

  // Determine active panel from URL
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const panel = searchParams.get("panel");
    if (panel === "reports") {
      setActivePanel("reports");
    } else if (panel === "insights") {
      setActivePanel("insights");
    } else {
      setActivePanel("upload");
    }
  }, []);

  const content = (
    <div className="flex flex-col w-full h-full px-2 py-6 sm:px-4">
      {/* Right content (cards, upload, reports, insights) */}
      {activePanel === "upload" && (
        <section className="flex flex-col h-full p-6 bg-white shadow-lg rounded-xl sm:p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2
                className="text-2xl font-extrabold sm:text-3xl"
                style={{ color: DEEP_INDIGO }}
              >
                Upload Your Reports (PDF)
              </h2>
              <p className="max-w-xl mt-2 text-sm text-gray-500">
                Upload your annual performance reports in PDF format.
                Once submitted, they will be automatically parsed and
                available in <span className="font-medium text-indigo-600">My Submitted Reports</span>.
                The SARTHI AI engine will generate insights from your data.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setActivePanel("reports")}
              className="px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors"
            >
              View Uploaded Reports
            </button>
          </div>

          {/* Year selection */}
          <div className="flex items-center gap-3 mb-4 text-sm">
            <span className="text-gray-700">Report Year:</span>
            <select
              value={reportYear}
              onChange={(e) => setReportYear(Number(e.target.value))}
              className="bg-white border-2 border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 px-3 py-1.5"
              disabled={isUploading}
            >
              {Array.from({ length: 6 }).map((_, idx) => {
                const y = new Date().getFullYear() - idx;
                return (
                  <option key={y} value={y}>
                    {y}
                  </option>
                );
              })}
            </select>
          </div>

          {/* Drag & drop area */}
          <div
            className={dropAreaClasses}
            onDragEnter={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsDragOver(true);
            }}
            onDragOver={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            onDragLeave={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsDragOver(false);
            }}
            onDrop={handleDrop}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={(e) => handleFiles(e.target.files)}
              className="hidden"
              accept="application/pdf,.pdf"
              multiple
              disabled={isUploading}
            />
            <div className="flex flex-col items-center justify-center space-y-4">
              {isUploading ? (
                <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
              ) : (
                <UploadCloud className="w-10 h-10 text-gray-400" />
              )}
              <p className="text-sm text-gray-600 sm:text-base">
                {isUploading ? "Uploading files..." : "Drag & drop your PDF reports here"}
              </p>
              <p className="text-xs text-gray-400">
                Only <strong>PDF</strong> files are allowed (max 50MB each).
              </p>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-5 py-2 text-sm font-semibold text-white rounded-md shadow-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: PRIMARY_BLUE }}
                disabled={isUploading}
              >
                {isUploading ? "Uploading..." : "Browse PDF Files"}
              </button>
            </div>
          </div>

          {/* Selected files */}
          <div className="flex-1 mt-6 space-y-4 overflow-y-auto">
            {Object.values(files).length === 0 ? (
              <p className="text-xs italic text-gray-400">
                No files selected yet. Drag & drop or click "Browse PDF Files" above.
              </p>
            ) : (
              Object.values(files).map((file) => (
                <FilePreview
                  key={file.name}
                  file={file}
                  onRemove={handleRemoveFile}
                  isUploading={isUploading}
                />
              ))
            )}
          </div>

          {totalFiles > 0 && !isUploading && (
            <div className="pt-4 mt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={handleUpload}
                className="w-full text-white py-3 rounded-xl font-semibold text-base sm:text-lg shadow-lg transition-transform duration-150 hover:scale-[1.01] disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: DEEP_INDIGO }}
                disabled={isUploading}
              >
                {isUploading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Uploading...
                  </span>
                ) : (
                  `Upload All Reports (${totalFiles})`
                )}
              </button>
            </div>
          )}
        </section>
      )}

      {activePanel === "reports" && (
        <section className="flex flex-col h-full p-6 bg-white shadow-lg rounded-xl sm:p-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2
                className="text-2xl font-bold"
                style={{ color: DEEP_INDIGO }}
              >
                My Submitted Reports
              </h2>
              <p className="max-w-xl mt-1 text-sm text-gray-500">
                Below are the reports submitted by your institute. These
                are automatically parsed and used by SARTHI for your
                institution's AI-based insights.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setActivePanel("upload")}
                className="px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors"
              >
                Upload New Report
              </button>
              <div className="flex flex-col items-end gap-2">
                <label className="text-xs text-gray-500">
                  Filter by year:
                </label>
                <select
                  value={documentYearFilter}
                  onChange={(e) => setDocumentYearFilter(e.target.value)}
                  className="px-2 py-1 text-xs bg-white border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="all">All Years</option>
                  {yearOptions.map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="flex-1 mt-2 space-y-3 overflow-y-auto">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center h-full text-sm text-center text-gray-500">
                <Loader2 className="w-10 h-10 mb-2 text-gray-300 animate-spin" />
                <p>Loading documents...</p>
              </div>
            ) : filteredDocuments.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-sm text-center text-gray-500">
                <FileText className="w-10 h-10 mb-2 text-gray-300" />
                <p>No reports submitted yet for your institute.</p>
                <button
                  type="button"
                  onClick={() => setActivePanel("upload")}
                  className="px-4 py-2 mt-3 text-xs font-medium text-white rounded-md"
                  style={{ backgroundColor: PRIMARY_BLUE }}
                >
                  Upload Your First Report
                </button>
              </div>
            ) : (
              filteredDocuments.map((document) => (
                <DocumentItem
                  key={document._id}
                  document={document}
                  onView={handleViewDocument}
                  onDelete={handleDeleteDocument}
                  onRefresh={handleRefreshDocument}
                />
              ))
            )}
          </div>
        </section>
      )}

      {activePanel === "insights" && (
        <section className="flex flex-col h-full p-6 bg-white shadow-lg rounded-xl sm:p-8">
          <div className="flex items-center gap-3 mb-4">
            <BarChart3 className="text-indigo-600 w-7 h-7" />
            <div>
              <h2
                className="text-2xl font-bold"
                style={{ color: DEEP_INDIGO }}
              >
                Insights & AI Dashboard
              </h2>
              <p className="max-w-xl mt-1 text-sm text-gray-500">
                The SARTHI AI engine uses your submitted reports to
                compute trends, risk areas, and compliance readiness.
                Access your live dashboard to see institution-specific
                insights.
              </p>
            </div>
          </div>

          <div className="p-4 mt-4 text-sm text-gray-700 rounded-lg bg-indigo-50">
            <p className="mb-2">
              <strong>How it works:</strong>
            </p>
            <ul className="space-y-1 text-xs list-disc list-inside sm:text-sm">
              <li>
                Every PDF report you upload (by year) is processed and
                converted into structured indicators.
              </li>
              <li>
                These indicators feed into your institute's AI
                dashboard, visible under the performance / EduRank view.
              </li>
              <li>
                Only the reports submitted from your institute are used –
                you cannot see or affect any other institute's data.
              </li>
              <li>
                Parsing happens automatically after upload. Check the
                status in "My Submitted Reports".
              </li>
            </ul>
          </div>

          <div className="mt-6">
            <button
              type="button"
              onClick={() => {
                window.location.href = "/edu";
              }}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-lg text-white font-semibold text-sm shadow-md hover:shadow-lg transition-transform hover:scale-[1.01]"
              style={{ backgroundColor: PRIMARY_BLUE }}
            >
              Open Performance Dashboard
            </button>
          </div>
        </section>
      )}

      {/* Toast message */}
      {toast && (
        <div
          className="fixed flex items-center gap-2 px-4 py-3 text-sm -translate-x-1/2 rounded-lg shadow-2xl bottom-8 left-1/2"
          style={{
            backgroundColor: toast.type === "success" ? "#047857" : "#B91C1C",
            color: "white",
          }}
          role="alert"
        >
          {toast.type === "success" ? (
            <CheckCircle2 className="w-5 h-5" />
          ) : (
            <AlertCircle className="w-5 h-5" />
          )}
          <span>{toast.message}</span>
        </div>
      )}
    </div>
  );

  return <InstituteLayout>{content}</InstituteLayout>;
}

export default UploadDocumentPage;
