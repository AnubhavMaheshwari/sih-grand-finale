import { useState } from "react";
import {
  Send,
  ClipboardList,
  MessageSquareWarning,
  CheckCircle2,
  AlertCircle,
  FileWarning,
  FileCheck,
  Clock,
  Loader2,
  UploadCloud,
  Users,
  BookOpen,
  Globe,
} from "lucide-react";

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

// RequestTypeCard Component for grid view
function RequestTypeCard({ type, description, icon: Icon, onClick }) {
  const getCardColor = (type) => {
    switch (type) {
      case "Student Intake":
        return "bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 hover:border-blue-300";
      case "New Course":
        return "bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 hover:border-purple-300";
      case "Online Program":
        return "bg-gradient-to-br from-green-50 to-green-100 border-green-200 hover:border-green-300";
      default:
        return "bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200 hover:border-gray-300";
    }
  };

  const getIconColor = (type) => {
    switch (type) {
      case "Student Intake":
        return "text-blue-600";
      case "New Course":
        return "text-purple-600";
      case "Online Program":
        return "text-green-600";
      default:
        return "text-gray-600";
    }
  };

  return (
    <div
      className={`p-6 rounded-xl border-2 cursor-pointer transition-all hover:shadow-lg hover:scale-[1.02] ${getCardColor(
        type
      )}`}
      onClick={onClick}
    >
      <div className="flex flex-col items-center text-center">
        <div className={`p-3 rounded-lg bg-white mb-4 ${getIconColor(type)}`}>
          <Icon className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-bold text-gray-900 mb-2">{type}</h3>
        <p className="text-sm text-gray-600 mb-4">{description}</p>
        <div className="text-indigo-600 text-base font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
          Create Request <Send className="w-4 h-4" />
        </div>
      </div>
    </div>
  );
}

const RequestCenterPage = () => {
  const [activeTab, setActiveTab] = useState("create"); // create, status, queries
  const [toast, setToast] = useState(null);
  const [requests, setRequests] = useState([
    {
      id: 101,
      type: "Student Intake",
      date: new Date(2023, 10, 15),
      status: "Report Ready",
      missingDocs: [],
      deficiencyReportUrl: null,
    },
    {
      id: 102,
      type: "New Course",
      date: new Date(2023, 11, 5),
      status: "Insufficient Data",
      missingDocs: ["Latest Audit Report", "Faculty List 2024"],
      deficiencyReportUrl: "/sample-deficiency-report.pdf",
    },
    {
      id: 103,
      type: "Online Program",
      date: new Date(2024, 0, 20),
      status: "Checking Data Sufficiency",
      missingDocs: [],
      deficiencyReportUrl: null,
    },
  ]);
  const [queryFiles, setQueryFiles] = useState({});
  const [isUploading, setIsUploading] = useState(false);

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

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

    // Simulate backend processing
    setTimeout(() => {
      setRequests((prev) =>
        prev.map((req) =>
          req.id === newRequest.id
            ? {
                ...req,
                status: "Insufficient Data",
                missingDocs: ["Latest Audit Report", "Faculty List 2024"],
                deficiencyReportUrl: "/sample-deficiency-report.pdf",
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

      // Simulate upload
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

  const renderCreateTab = () => (
    <div className="max-w-6xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <RequestTypeCard
          type="Student Intake"
          description="Request to increase the sanctioned intake for existing programs."
          icon={Users}
          onClick={() => handleRequestSubmit("Student Intake")}
        />
        <RequestTypeCard
          type="New Course"
          description="Apply for adding a new course or specialization to your curriculum."
          icon={BookOpen}
          onClick={() => handleRequestSubmit("New Course")}
        />
        <RequestTypeCard
          type="Online Program"
          description="Request approval for starting a new online degree or certification."
          icon={Globe}
          onClick={() => handleRequestSubmit("Online Program")}
        />
      </div>
    </div>
  );

  const renderStatusTab = () => (
    <div className="max-w-4xl mx-auto">

      <div className="space-y-4">
        {requests.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-xl">
            <p className="text-base text-gray-500">No active requests found.</p>
            <button
              onClick={() => setActiveTab("create")}
              className="text-indigo-600 font-medium mt-2 hover:underline"
            >
              Create a new request
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

  const renderQueriesTab = () => {
    const pendingQueries = requests.filter(
      (req) => req.status === "Insufficient Data"
    );

    return (
      <div className="max-w-4xl mx-auto">
        {pendingQueries.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-300">
            <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-green-500" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">
              No Pending Queries
            </h3>
            <p className="text-base text-gray-500 max-w-sm mx-auto mt-2">
              Great job! All your requests have sufficient data or are under process.
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
    <>
      <div className="h-full overflow-hidden bg-white">
        {/* Tab Navigation */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex space-x-1">
              <button
                onClick={() => setActiveTab("create")}
                className={`px-4 py-3 text-sm font-medium rounded-t-lg transition-colors ${
                  activeTab === "create"
                    ? "bg-indigo-50 text-indigo-700 border-b-2 border-indigo-600"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                <div className="flex items-center gap-2">
                  <Send className="w-4 h-4" />
                  Create New Request
                </div>
              </button>
              <button
                onClick={() => setActiveTab("status")}
                className={`px-4 py-3 text-sm font-medium rounded-t-lg transition-colors ${
                  activeTab === "status"
                    ? "bg-indigo-50 text-indigo-700 border-b-2 border-indigo-600"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                <div className="flex items-center gap-2">
                  <ClipboardList className="w-4 h-4" />
                  Request Status
                </div>
              </button>
              <button
                onClick={() => setActiveTab("queries")}
                className={`px-4 py-3 text-sm font-medium rounded-t-lg transition-colors ${
                  activeTab === "queries"
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
          {activeTab === "create" 
            ? renderCreateTab() 
            : activeTab === "status" 
            ? renderStatusTab() 
            : renderQueriesTab()}
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

export default RequestCenterPage;
