import { useState, useEffect, useCallback, useRef } from "react";
import YearSelector from "../../components/common/YearSelector";
import {
  UploadCloud,
  FileText,
  Eye,
  Trash2,
  RefreshCw,
  Loader2,
  X,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import documentsApi from "../../api/documents.api.js";

// FilePreview Component
function FilePreview({ file, onRemove, isUploading = false }) {
  const formatFileSize = (bytes) =>
    bytes > 1024 * 1024
      ? `${(bytes / (1024 * 1024)).toFixed(1)} MB`
      : `${(bytes / 1024).toFixed(1)} KB`;

  return (
    <div className="flex items-center justify-between p-4 transition-all bg-gray-100 rounded-lg border border-gray-200">
      <div className="flex items-center gap-4">
        <div className="flex items-center justify-center w-12 h-12 bg-white rounded-md shadow-sm shrink-0">
          {isUploading ? (
            <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
          ) : (
            <FileText className="w-6 h-6 text-indigo-600" />
          )}
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-800 truncate max-w-[150px] sm:max-w-xs">
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
          className="p-1 transition-colors rounded-full hover:bg-red-50 group"
          title="Remove file"
        >
          <X className="w-4 h-4 text-gray-400 group-hover:text-red-500" />
        </button>
      )}
    </div>
  );
}

// DocumentItem Component
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
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "UPLOADED":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "PARSING":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "PARSED":
        return "bg-green-100 text-green-800 border-green-200";
      case "ERROR":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
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
    <div className="group flex items-start justify-between p-4 rounded-xl bg-white border border-gray-200 hover:border-indigo-300 hover:shadow-md transition-all duration-200">
      <div className="flex items-start gap-3 flex-1">
        <div className="bg-indigo-50 p-2 rounded-lg">
          <FileText className="w-5 h-5 text-indigo-600" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-gray-800 truncate">
            {document.originalFilename}
          </p>
          <div className="flex flex-wrap items-center gap-2 mt-1.5">
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full font-medium border ${getStatusColor(
                document.status
              )}`}
            >
              {getStatusText(document.status)}
            </span>
            <span className="text-xs text-gray-500">{document.year}</span>
            <span className="text-[10px] text-gray-400">
              • {formatFileSize(document.fileSize)}
            </span>
            <span className="text-[10px] text-gray-400">
              • {formatDate(document.uploadedAt)}
            </span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-1 ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
        {document.status === "PARSED" && (
          <button
            onClick={() => onView(document)}
            className="p-2 text-gray-500 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg transition-colors"
            title="View PDF"
          >
            <Eye className="w-4 h-4" />
          </button>
        )}
        {document.status === "ERROR" && (
          <button
            onClick={() => onRefresh(document._id)}
            className="p-2 text-gray-500 hover:bg-yellow-50 hover:text-yellow-600 rounded-lg transition-colors"
            title="Retry parsing"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        )}
        <button
          onClick={() => onDelete(document._id)}
          className="p-2 text-gray-500 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors"
          title="Delete document"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}


const ReportsManagementPage = () => {
  const [activeTab, setActiveTab] = useState("upload"); // upload or view
  const [isDragOver, setIsDragOver] = useState(false);
  const [files, setFiles] = useState({});
  const [toast, setToast] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [reportYear, setReportYear] = useState(new Date().getFullYear());
  const [selectedViewYear, setSelectedViewYear] = useState(new Date().getFullYear());
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  // Load documents on component mount
  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    try {
      setIsLoading(true);
      const response = await documentsApi.getInstituteDocuments();
      if (response.success) {
        setDocuments(response.documents || []);
      } else {
        showToast("error", response.error || "Failed to load documents");
        setDocuments([]);
      }
    } catch (error) {
      console.error("Error loading documents:", error);
      showToast("error", "Failed to load documents");
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
        const response = await documentsApi.uploadDocument(
          selectedFiles[0],
          reportYear
        );
        if (response.success) {
          showToast("success", "Document uploaded successfully");
          setFiles({});
          loadDocuments();
          setActiveTab("view");
        }
      } else {
        const response = await documentsApi.uploadMultipleDocuments(
          selectedFiles,
          reportYear
        );
        if (response.success) {
          showToast("success", "Documents uploaded successfully");
          setFiles({});
          loadDocuments();
          setActiveTab("view");
        }
      }
    } catch (error) {
      console.error("Upload error:", error);
      showToast("error", "Failed to upload documents");
    } finally {
      setIsUploading(false);
    }
  };

  const handleViewDocument = async (document) => {
    try {
      const pdfUrl = await documentsApi.viewDocument(document._id);
      window.open(pdfUrl, "_blank");
    } catch (error) {
      showToast("error", "Failed to view document");
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
      } else {
        showToast("error", response.error || "Failed to delete document");
      }
    } catch (error) {
      console.error("Delete error:", error);
      showToast("error", "Failed to delete document");
    }
  };

  const handleRefreshDocument = async (documentId) => {
    try {
      const response = await documentsApi.retryParsing(documentId);
      if (response.success) {
        showToast("success", "Document parsing retried");
        loadDocuments();
      } else {
        showToast("error", response.error || "Failed to retry parsing");
      }
    } catch (error) {
      console.error("Refresh error:", error);
      showToast("error", "Failed to retry parsing");
    }
  };

  const renderUploadTab = () => {
    const totalFiles = Object.keys(files).length;
    return (
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Upload New Report</h1>
        </div>

        {/* Year Selection */}
        <div className="mb-6">
          <YearSelector
            selectedYear={reportYear}
            onYearChange={setReportYear}
          />
        </div>

        {/* Drag & drop area */}
        <div
          className={`border-2 border-dashed rounded-xl p-10 text-center transition-all ${
            isDragOver
              ? "border-indigo-500 bg-indigo-50"
              : "border-gray-300 hover:border-indigo-400 hover:bg-gray-50"
          }`}
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
          onDrop={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsDragOver(false);
            handleFiles(e.dataTransfer.files);
          }}
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
            <div className="p-4 bg-indigo-100 rounded-full">
              {isUploading ? (
                <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
              ) : (
                <UploadCloud className="w-8 h-8 text-indigo-600" />
              )}
            </div>
            <div>
              <p className="text-xl font-medium text-gray-700">
                {isUploading
                  ? "Uploading files..."
                  : "Drag & drop PDFs here"}
              </p>
              <p className="text-base text-gray-500 mt-1">
                or click to browse from your computer
              </p>
            </div>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-6 py-2.5 text-base font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-all"
              disabled={isUploading}
            >
              Browse Files
            </button>
          </div>
        </div>

        {/* Selected files */}
        {totalFiles > 0 && (
          <div className="mt-8">
            <h3 className="text-base font-semibold text-gray-700 mb-3">
              Selected Files ({totalFiles})
            </h3>
            <div className="space-y-3">
              {Object.values(files).map((file) => (
                <FilePreview
                  key={file.name}
                  file={file}
                  onRemove={handleRemoveFile}
                  isUploading={isUploading}
                />
              ))}
            </div>
            {!isUploading && (
              <div className="mt-6 flex justify-end">
                <button
                  onClick={handleUpload}
                  className="px-8 py-3 bg-indigo-600 text-white font-semibold rounded-xl shadow-md hover:bg-indigo-700 transition-all hover:scale-[1.02]"
                >
                  Upload {totalFiles} Files
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  const renderViewTab = () => {
    const availableYears = [...new Set(documents.map(doc => doc.year))].sort((a, b) => b - a);
    
    const filteredDocuments = documents.filter(doc => 
      selectedViewYear ? doc.year === selectedViewYear : true
    );

    return (
      <div className="max-w-5xl mx-auto h-full flex flex-col">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Submitted Reports</h1>
          </div>
          <div className="flex items-center gap-4">
            <YearSelector
              selectedYear={selectedViewYear}
              onYearChange={setSelectedViewYear}
              availableYears={availableYears}
            />
            <button
              onClick={() => setActiveTab("upload")}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm text-base font-medium"
            >
              <UploadCloud className="w-4 h-4" /> Upload New
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
            <Loader2 className="w-10 h-10 animate-spin mb-3 text-indigo-500" />
            <p>Fetching your documents...</p>
          </div>
        ) : filteredDocuments.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
              <FileText className="w-8 h-8 text-gray-300" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">
              No documents found
            </h3>
            <p className="text-base text-gray-500 max-w-sm mt-2 mb-6">
              {selectedViewYear 
                ? `You haven't uploaded any reports for ${selectedViewYear} yet.`
                : "You haven't uploaded any reports yet."}
            </p>
            <button
              onClick={() => setActiveTab("upload")}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium"
            >
              Upload Document
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 pb-10">
            {filteredDocuments.map((doc) => (
              <DocumentItem
                key={doc._id}
                document={doc}
                onView={handleViewDocument}
                onDelete={handleDeleteDocument}
                onRefresh={handleRefreshDocument}
              />
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <div className="h-full overflow-hidden bg-white">
        {/* Tab Navigation */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex space-x-1">
              <button
                onClick={() => setActiveTab("upload")}
                className={`px-4 py-3 text-sm font-medium rounded-t-lg transition-colors ${
                  activeTab === "upload"
                    ? "bg-indigo-50 text-indigo-700 border-b-2 border-indigo-600"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                <div className="flex items-center gap-2">
                  <UploadCloud className="w-4 h-4" />
                  Upload New Report
                </div>
              </button>
              <button
                onClick={() => setActiveTab("view")}
                className={`px-4 py-3 text-sm font-medium rounded-t-lg transition-colors ${
                  activeTab === "view"
                    ? "bg-indigo-50 text-indigo-700 border-b-2 border-indigo-600"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  View Submitted Reports
                </div>
              </button>
            </div>
          </div>
        </div>

        <main className="h-full overflow-y-auto p-6 scroll-smooth bg-gray-50/50">
          {activeTab === "upload" ? renderUploadTab() : renderViewTab()}
        </main>
      </div>

      {/* Toast */}
      {toast && (
        <div
          className={`fixed bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-3 px-4 py-3 rounded-lg shadow-xl text-white text-sm font-medium z-50 animate-in fade-in slide-in-from-bottom-4`}
          style={{
            backgroundColor:
              toast.type === "success" ? "#059669" : "#DC2626",
          }}
        >
          {toast.type === "success" ? (
            <CheckCircle2 className="w-5 h-5" />
          ) : (
            <AlertCircle className="w-5 h-5" />
          )}
          <span className="text-base">{toast.message}</span>
        </div>
      )}
    </>
  );
};

export default ReportsManagementPage;
