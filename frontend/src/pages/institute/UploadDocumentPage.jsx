import {
  useState,
  useCallback,
  useRef,
  useEffect,
} from "react";
import InstituteLayout from "../../components/layout/InstituteLayout";
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
  Send,
  ClipboardList,
  Clock,
  FileCheck,
  MessageSquareWarning,
  FileWarning,
} from "lucide-react";
import documentsApi from "../../api/documents.api.js";

const DEEP_INDIGO = "#3730A3";

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
            <Loader2
              className="w-6 h-6 animate-spin"
              style={{ color: DEEP_INDIGO }}
            />
          ) : (
            <FileText className="w-6 h-6" style={{ color: DEEP_INDIGO }} />
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

// --- Request Item Component ---
function RequestItem({ request, onDownloadDeficiencyReport }) {
  const getStatusColor = (status) => {
    switch (status) {
      case "Checking Data Sufficiency":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "Data Sufficient":
        return "bg-green-100 text-green-800 border-green-200";
      case "Insufficient Data":
        return "bg-red-100 text-red-800 border-red-200";
      case "Pending Report":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "Report Ready":
        return "bg-indigo-100 text-indigo-800 border-indigo-200";
      case "Verifying":
        return "bg-purple-100 text-purple-800 border-purple-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <div className="flex flex-col p-4 rounded-xl bg-white border border-gray-200 shadow-sm">
      <div className="flex justify-between items-start mb-2">
        <h4 className="font-semibold text-gray-800 text-base">
          {request.type} Request
        </h4>
        <span
          className={`text-[10px] px-2 py-0.5 rounded-full font-medium border ${getStatusColor(
            request.status
          )}`}
        >
          {request.status}
        </span>
      </div>
      <p className="text-sm text-gray-500 mb-3">
        Submitted on {new Date(request.date).toLocaleDateString()}
      </p>

      {request.status === "Data Sufficient" && (
        <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 p-2 rounded border border-green-100">
          <CheckCircle2 className="w-4 h-4" />
          <span>Data is sufficient for this request. Report generating...</span>
        </div>
      )}

      {request.status === "Insufficient Data" && (
        <div className="mt-3">
          <div className="flex items-center gap-2 text-sm text-red-700 bg-red-50 p-2 rounded border border-red-100 mb-2">
            <AlertCircle className="w-4 h-4" />
            <span>Missing documents detected.</span>
          </div>
          <button
            onClick={() => onDownloadDeficiencyReport(request)}
            className="w-full py-2 flex items-center justify-center gap-2 text-sm font-medium text-red-600 bg-white border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
          >
            <FileWarning className="w-4 h-4" /> Download Deficiency Report
          </button>
        </div>
      )}

      {request.status === "Report Ready" && (
        <button className="mt-2 w-full py-2 flex items-center justify-center gap-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors">
          <FileCheck className="w-4 h-4" /> View Approval Report
        </button>
      )}

      {request.status === "Pending Report" && (
        <div className="mt-2 text-xs text-blue-600 flex items-center gap-1">
          <Clock className="w-3 h-3" /> Report expected in 2 days
        </div>
      )}

      {request.status === "Verifying" && (
        <div className="mt-2 text-sm text-purple-600 flex items-center gap-1">
          <Loader2 className="w-3 h-3 animate-spin" /> Verifying uploaded
          documents...
        </div>
      )}
    </div>
  );
}

// --- Main UploadDocumentPage Component ---
function UploadDocumentPage() {
  // State for Navigation
  const [activeTab, setActiveTab] = useState("requests"); // requests, status, queries

  // Upload/Docs State
  const [isDragOver, setIsDragOver] = useState(false);
  const [files, setFiles] = useState({});
  const [toast, setToast] = useState(null); // {type, message}
  const [documents, setDocuments] = useState([]);
  const [reportYear, setReportYear] = useState(new Date().getFullYear());
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Request System State (Mocked)
  const [requests, setRequests] = useState([
    {
      id: 101,
      type: "Student Intake",
      date: new Date(2023, 10, 15),
      status: "Report Ready",
      missingDocs: [],
      deficiencyReportUrl: null,
    },
  ]);

  // Files selected for responding to queries per request
  const [queryFiles, setQueryFiles] = useState({}); // { [requestId]: File[] }

  const fileInputRef = useRef(null);

  // Load documents on component mount + poll when any doc is PARSING
  useEffect(() => {
    loadDocuments();

    const interval = setInterval(() => {
      const hasParsing = documents.some((doc) => doc.status === "PARSING");
      if (hasParsing) {
        loadDocuments();
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [documents.length]);

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
      showToast(
        "error",
        error.response?.data?.error || "Failed to load documents"
      );
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
          setActiveTab("dashboard"); // Go back to list
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
          setActiveTab("dashboard");
        }
      }
    } catch (error) {
      console.error("Upload error:", error);
      showToast(
        "error",
        error.response?.data?.error || "Failed to upload documents"
      );
      showToast(
        "error",
        error.response?.data?.error || "Failed to delete document"
      );
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

  // When institute submits request to UGC/AICTE
  const handleRequestSubmit = async (type) => {
    const newRequest = {
      id: Date.now(),
      type: type,
      date: new Date(),
      status: "Checking Data Sufficiency",
      missingDocs: [],
      deficiencyReportUrl: null,
    };

    setRequests((prev) => [newRequest, ...prev]);
    showToast("success", `${type} request submitted to UGC/AICTE.`);
    setActiveTab("status");

    setTimeout(() => {
      setRequests((prev) =>
        prev.map((req) =>
          req.id === newRequest.id
            ? {
              ...req,
              status: "Insufficient Data",
              missingDocs: ["Latest Audit Report", "Faculty List 2024"],
              deficiencyReportUrl: "/sample-deficiency-report.pdf", // TODO: from backend
            }
            : req
        )
      );
    }, 3000);
  };

  const handleDownloadDeficiencyReport = (request) => {
    if (!request.deficiencyReportUrl) {
      showToast("error", "Deficiency report not available yet.");
      return;
    }
    window.open(request.deficiencyReportUrl, "_blank");
  };

  const handleQueryFilesChange = (requestId, fileList) => {
    const filesArray = Array.from(fileList || []);
    setQueryFiles((prev) => ({
      ...prev,
      [requestId]: filesArray,
    }));
  };

  const handleQueryResponseUpload = async (requestId) => {
    const filesForRequest = queryFiles[requestId] || [];
    if (!filesForRequest.length) {
      showToast("error", "Please select at least one document to upload.");
      return;
    }

    try {
      setIsUploading(true);

      // TODO: call backend API to upload missing docs for this request
      // const response = await requestsApi.uploadMissingDocs(requestId, filesForRequest);
      // setRequests(response.requests);

      // TEMPORARY simulation
      setTimeout(() => {
        setRequests((prev) =>
          prev.map((req) =>
            req.id === requestId ? { ...req, status: "Verifying" } : req
          )
        );
        showToast("success", "Missing documents uploaded. Verifying...");
        setQueryFiles((prev) => {
          const clone = { ...prev };
          delete clone[requestId];
          return clone;
        });
        setIsUploading(false);

        // After verifying, mark as Data Sufficient
        setTimeout(() => {
          setRequests((prev) =>
            prev.map((req) =>
              req.id === requestId
                ? { ...req, status: "Data Sufficient", missingDocs: [] }
                : req
            )
          );
        }, 3000);
      }, 1500);
    } catch (error) {
      console.error(error);
      showToast("error", "Failed to upload query response.");
      setIsUploading(false);
    }
  };

  // --- Render Helpers ---

  const renderContent = () => {
    switch (activeTab) {
      case "requests":
        return renderRequestPanel();
      case "status":
        return renderStatusPanel();
      case "queries":
        return renderQueryResponsePanel();
      default:
        return renderRequestPanel();
    }
  };

  const renderUploadPanel = () => {
    const totalFiles = Object.keys(files).length;
    return (
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Upload Reports</h1>
          <p className="text-base text-gray-500 mt-1">
            Upload your institute&apos;s annual reports and audit documents.
          </p>
        </div>

        {/* Drag & drop area */}
        <div
          className={`border-2 border-dashed rounded-xl p-10 text-center transition-all ${isDragOver
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

  const renderRequestPanel = () => (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Submit New Request
        </h1>
        <p className="text-base text-gray-500 mt-1">
          Initiate official requests to UGC/AICTE. Your uploaded documents will
          be used for verification.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div
          className="bg-white p-6 rounded-xl border border-gray-200 hover:shadow-lg transition-all hover:border-indigo-300 group cursor-pointer"
          onClick={() => handleRequestSubmit("Student Intake")}
        >
          <div className="w-12 h-12 bg-indigo-50 rounded-lg flex items-center justify-center mb-4 group-hover:bg-indigo-100 transition-colors">
            <CheckCircle2 className="w-6 h-6 text-indigo-600" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">
            Increase Student Intake
          </h3>
          <p className="text-sm text-gray-500 mb-4">
            Request to increase the sanctioned intake for existing programs.
          </p>
          <div className="text-indigo-600 text-base font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
            Send Request <Send className="w-4 h-4" />
          </div>
        </div>

        <div
          className="bg-white p-6 rounded-xl border border-gray-200 hover:shadow-lg transition-all hover:border-indigo-300 group cursor-pointer"
          onClick={() => handleRequestSubmit("New Course")}
        >
          <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center mb-4 group-hover:bg-purple-100 transition-colors">
            <FileText className="w-6 h-6 text-purple-600" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">
            Start New Course
          </h3>
          <p className="text-sm text-gray-500 mb-4">
            Apply for adding a new course or specialization to your curriculum.
          </p>
          <div className="text-purple-600 text-base font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
            Send Request <Send className="w-4 h-4" />
          </div>
        </div>

        <div
          className="bg-white p-6 rounded-xl border border-gray-200 hover:shadow-lg transition-all hover:border-indigo-300 group cursor-pointer"
          onClick={() => handleRequestSubmit("Online Program")}
        >
          <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center mb-4 group-hover:bg-blue-100 transition-colors">
            <UploadCloud className="w-6 h-6 text-blue-600" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">
            New Online Program
          </h3>
          <p className="text-sm text-gray-500 mb-4">
            Request approval for starting a new online degree or certification.
          </p>
          <div className="text-blue-600 text-base font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
            Send Request <Send className="w-4 h-4" />
          </div>
        </div>
      </div>
    </div>
  );

  const renderStatusPanel = () => (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Track Request Status
        </h1>
        <p className="text-base text-gray-500 mt-1">
          Monitor the progress of your requests and view data sufficiency
          reports.
        </p>
      </div>

      <div className="space-y-4">
        {requests.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-xl">
            <p className="text-base text-gray-500">No active requests found.</p>
            <button
              onClick={() => setActiveTab("requests")}
              className="text-indigo-600 font-medium mt-2 hover:underline"
            >
              Submit a new request
            </button>
          </div>
        ) : (
          requests.map((req) => (
            <RequestItem
              key={req.id}
              request={req}
              onDownloadDeficiencyReport={handleDownloadDeficiencyReport}
            />
          ))
        )}
      </div>
    </div>
  );

  const renderInsightsPanel = () => (
    <div className="max-w-4xl mx-auto text-center py-20">
      <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-6">
        <BarChart3 className="w-10 h-10 text-indigo-600" />
      </div>
      <h2 className="text-3xl font-bold text-gray-900 mb-3">
        Insights Dashboard
      </h2>
      <p className="text-base text-gray-500 max-w-lg mx-auto mb-8">
        View detailed analytics, compliance readiness, and predictive insights
        based on your uploaded reports.
      </p>
      <button
        onClick={() => (window.location.href = "/edu")}
        className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors shadow-md"
      >
        Go to Performance Dashboard
      </button>
    </div>
  );

  const renderQueryResponsePanel = () => {
    const pendingQueries = requests.filter(
      (req) => req.status === "Insufficient Data"
    );

    return (
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Respond to Queries
          </h1>
          <p className="text-base text-gray-500 mt-1">
            Upload missing documents to resolve pending queries from UGC/AICTE.
          </p>
        </div>

        {pendingQueries.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-300">
            <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-green-500" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">
              No Pending Queries
            </h3>
            <p className="text-base text-gray-500 max-w-sm mx-auto mt-2">
              Great job! All your requests have sufficient data or are under
              process.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {pendingQueries.map((req) => (
              <div
                key={req.id}
                className="bg-white p-6 rounded-xl border border-red-200 shadow-sm"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <span className="text-xs font-bold text-red-600 uppercase tracking-wider bg-red-50 px-2 py-1 rounded">
                      Action Required
                    </span>
                    <h3 className="text-xl font-bold text-gray-900 mt-2">
                      {req.type} Request - Query #{req.id}
                    </h3>
                    <p className="text-sm text-gray-500">
                      Raised on {new Date(req.date).toLocaleDateString()}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDownloadDeficiencyReport(req)}
                    className="text-sm text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1"
                  >
                    <FileWarning className="w-4 h-4" /> View Deficiency Report
                  </button>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg mb-6">
                  <h4 className="text-sm font-semibold text-gray-800 mb-2">
                    Missing Documents:
                  </h4>
                  <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                    {req.missingDocs?.map((doc, idx) => (
                      <li key={idx}>{doc}</li>
                    ))}
                  </ul>
                </div>

                <div className="border-t border-gray-100 pt-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-3">
                    Upload Required Documents
                  </h4>
                  <div className="flex gap-4 items-center">
                    {/* File input for this specific request */}
                    <label className="flex-1 border border-gray-300 border-dashed rounded-lg p-3 text-sm text-gray-500 hover:bg-gray-50 hover:border-indigo-400 transition-colors text-center cursor-pointer">
                      Click to select files
                      <input
                        type="file"
                        multiple
                        className="hidden"
                        onChange={(e) =>
                          handleQueryFilesChange(req.id, e.target.files)
                        }
                      />
                    </label>

                    <button
                      onClick={() => handleQueryResponseUpload(req.id)}
                      disabled={isUploading}
                      className="px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors flex items-center gap-2"
                    >
                      {isUploading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <UploadCloud className="w-4 h-4" />
                      )}
                      Submit Response
                    </button>
                  </div>

                  {queryFiles[req.id]?.length > 0 && (
                    <p className="mt-2 text-xs text-gray-500 text-left">
                      Selected files:{" "}
                      {queryFiles[req.id].map((f) => f.name).join(", ")}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <InstituteLayout>
      <div className="h-full overflow-hidden bg-white">
        {/* Tab Navigation */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex space-x-1">
              <button
                onClick={() => setActiveTab("requests")}
                className={`px-4 py-3 text-sm font-medium rounded-t-lg transition-colors ${activeTab === "requests"
                    ? "bg-indigo-50 text-indigo-700 border-b-2 border-indigo-600"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  }`}
              >
                <div className="flex items-center gap-2">
                  <Send className="w-4 h-4" />
                  Submit Request
                </div>
              </button>
              <button
                onClick={() => setActiveTab("status")}
                className={`px-4 py-3 text-sm font-medium rounded-t-lg transition-colors ${activeTab === "status"
                    ? "bg-indigo-50 text-indigo-700 border-b-2 border-indigo-600"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  }`}
              >
                <div className="flex items-center gap-2">
                  <ClipboardList className="w-4 h-4" />
                  Track Status
                </div>
              </button>
              <button
                onClick={() => setActiveTab("queries")}
                className={`px-4 py-3 text-sm font-medium rounded-t-lg transition-colors ${activeTab === "queries"
                    ? "bg-indigo-50 text-indigo-700 border-b-2 border-indigo-600"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  }`}
              >
                <div className="flex items-center gap-2">
                  <MessageSquareWarning className="w-4 h-4" />
                  Respond to Queries
                </div>
              </button>
            </div>
          </div>
        </div>

        <main className="h-full overflow-y-auto p-6 scroll-smooth bg-gray-50/50">
          {renderContent()}
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
    </InstituteLayout>
  );
}

export default UploadDocumentPage;
