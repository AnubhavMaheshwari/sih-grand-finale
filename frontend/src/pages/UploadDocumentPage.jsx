import {
  useState,
  useCallback,
  useRef,
  useEffect,
  useMemo,
} from "react";
import Navigation from "../components/layout/Navigation";
import {
  FileText,
  UploadCloud,
  X,
  CheckCircle2,
  AlertCircle,
  BarChart3,
} from "lucide-react";

const PRIMARY_BLUE = "#4F46E5";
const DEEP_INDIGO = "#3730A3";

// --- Footer Component ---
const Footer = () => (
  <footer className="py-6 mt-4 bg-white border-t border-gray-200">
    <div className="container mx-auto text-sm text-center text-gray-500">
      &copy; 2025 SARTHI National Portal, all rights reserved
    </div>
  </footer>
);

// --- Small left sidebar for Institute view ---
const instituteSideItems = [
  { id: "upload", label: "Upload Data" },
  { id: "reports", label: "My Submitted Reports" },
  { id: "insights", label: "Insights & Dashboard" },
];

function InstituteSideNavbar({ activeId, onChange }) {
  return (
    <div className="flex-1 p-4 space-y-4 overflow-y-auto scrollbar-thin">
      <div>
        <h2
          className="text-sm font-semibold tracking-wide uppercase"
          style={{ color: DEEP_INDIGO }}
        >
          Institute Panel
        </h2>
        <p className="mt-1 text-xs text-gray-500">
          Upload reports and view AI insights.
        </p>
      </div>

      <div className="border bg-slate-50 rounded-xl border-slate-100">
        <nav className="py-1">
          {instituteSideItems.map((item) => {
            const isActive = item.id === activeId;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onChange && onChange(item.id)}
                className={`w-full flex items-center px-4 py-3 text-sm font-medium text-left transition-colors border-l-4 ${
                  isActive
                    ? "bg-indigo-50 text-indigo-700 border-indigo-600"
                    : "text-gray-700 hover:bg-gray-50 border-transparent"
                }`}
              >
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
}

// --- FilePreview Component (PDF only) ---
function FilePreview({ file, onRemove }) {
  const formatFileSize = (bytes) =>
    bytes > 1024 * 1024
      ? `${(bytes / (1024 * 1024)).toFixed(1)} MB`
      : `${(bytes / 1024).toFixed(1)} KB`;

  return (
    <div className="flex items-center justify-between p-4 transition-all bg-gray-100 rounded-lg">
      <div className="flex items-center gap-4">
        <div className="flex items-center justify-center w-12 h-12 bg-white rounded-md shadow-sm flex-shrink:0">
          <FileText className="w-6 h-6" style={{ color: DEEP_INDIGO }} />
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-800 truncate max-w-48 sm:max-w-md">
            {file.name}
          </p>
          <p className="text-xs text-gray-500">
            {formatFileSize(file.size)} · PDF
          </p>
        </div>
      </div>
      <button
        onClick={() => onRemove(file.name)}
        className="p-1 transition-colors rounded-full hover:bg-red-50"
      >
        <X className="w-4 h-4 text-gray-500 hover:text-red-500" />
      </button>
    </div>
  );
}

// --- Main UploadDocumentPage Component ---
function UploadDocumentPage() {
  const [isDragOver, setIsDragOver] = useState(false);
  const [files, setFiles] = useState({});
  const [toast, setToast] = useState(null); // {type, message}
  const [activePanel, setActivePanel] = useState("upload");
  const [submittedReports, setSubmittedReports] = useState([]);
  const [reportYear, setReportYear] = useState(new Date().getFullYear());

  const fileInputRef = useRef(null);
  const [institutionCode, setInstitutionCode] = useState(null);

  // ✅ Establish an institution code so that reports are isolated per institute
  useEffect(() => {
    if (typeof window === "undefined") return;

    const existing =
      localStorage.getItem("institutionCode") || "INSTITUTE-001-MOCK";
    localStorage.setItem("institutionCode", existing);
    setInstitutionCode(existing);

    const stored = localStorage.getItem(`sarthi_reports_${existing}`);
    if (stored) {
      try {
        setSubmittedReports(JSON.parse(stored));
      } catch {
        setSubmittedReports([]);
      }
    }
  }, []);

  const saveReports = useCallback(
    (reports) => {
      if (!institutionCode) return;
      setSubmittedReports(reports);
      localStorage.setItem(
        `sarthi_reports_${institutionCode}`,
        JSON.stringify(reports)
      );
    },
    [institutionCode]
  );

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

  const handleSubmit = useCallback(() => {
    const selectedFiles = Object.values(files);
    if (!selectedFiles.length) {
      showToast("error", "Please select at least one PDF file to submit.");
      return;
    }
    if (!institutionCode) {
      showToast(
        "error",
        "Institution context not set. Please log in again as an institution."
      );
      return;
    }

    const now = new Date().toISOString();

    const newReports = selectedFiles.map((file) => ({
      id: `${Date.now()}-${file.name}`,
      name: file.name,
      size: file.size,
      uploadedAt: now,
      year: reportYear,
      institutionCode,
    }));

    const updated = [...submittedReports, ...newReports];
    saveReports(updated);

    setFiles({});
    showToast(
      "success",
      "Your reports have been submitted successfully and are now visible in 'My Submitted Reports' and dashboard insights."
    );
    setActivePanel("reports");
  }, [
    files,
    submittedReports,
    saveReports,
    reportYear,
    showToast,
    institutionCode,
  ]);

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragOver(false);
      handleFiles(e.dataTransfer.files);
    },
    [handleFiles]
  );

  const dropAreaClasses = `border-2 border-dashed rounded-lg p-8 text-center transition-all ${
    isDragOver
      ? "border-indigo-500 bg-indigo-100"
      : "border-gray-300 hover:border-indigo-500 hover:bg-indigo-50"
  }`;

  const totalFiles = Object.keys(files).length;

  // Filter reports by year in Reports panel
  const [reportYearFilter, setReportYearFilter] = useState("all");
  const filteredReports = useMemo(() => {
    if (!institutionCode) return [];
    const ownReports = submittedReports.filter(
      (r) => r.institutionCode === institutionCode
    );
    if (reportYearFilter === "all") return ownReports;
    return ownReports.filter((r) => String(r.year) === String(reportYearFilter));
  }, [submittedReports, reportYearFilter, institutionCode]);

  const yearOptions = useMemo(() => {
    const set = new Set(submittedReports.map((r) => r.year));
    return Array.from(set).sort((a, b) => b - a);
  }, [submittedReports]);

  return (
    <>
      <style jsx="true">{`
        .scrollbar-thin::-webkit-scrollbar {
          width: 6px;
        }
        .scrollbar-thin::-webkit-scrollbar-track {
          background: transparent;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb {
          background-color: rgba(148, 163, 184, 0.8);
          border-radius: 999px;
        }
      `}</style>

      <div className="flex flex-col min-h-screen font-sans bg-gray-50">
        {/* Top navbar */}
        <Navigation currentPage="My Dashboard" />

        {/* Main layout (same style as EduRank: left static, right scrollable) */}
        <main className="flex flex-1 overflow-hidden">
          {/* LEFT SIDEBAR (static on md+) */}
          <aside className="flex-col hidden w-64 bg-white border-r border-gray-200 md:flex lg:w-72">
            <InstituteSideNavbar
              activeId={activePanel}
              onChange={setActivePanel}
            />
          </aside>

          {/* RIGHT CONTENT – ONLY THIS PART SCROLLS */}
          <section className="flex flex-col flex-1 overflow-y-auto">
            <div className="flex flex-col w-full h-full px-4 py-6 mx-auto max-w-7xl sm:px-6 lg:px-8">
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
                        Once submitted, they will be available in{" "}
                        <span className="font-medium text-indigo-600">
                          My Submitted Reports
                        </span>{" "}
                        and used by the SARTHI AI engine to generate insights
                        on your dashboard.
                      </p>
                    </div>

                    <div className="flex-col items-end hidden text-xs text-gray-500 sm:flex">
                      <span className="font-semibold text-gray-700">
                        Logged in Institute
                      </span>
                      <span className="font-mono text-[11px]">
                        {institutionCode || "Loading..."}
                      </span>
                    </div>
                  </div>

                  {/* Year selection */}
                  <div className="flex items-center gap-3 mb-4 text-sm">
                    <span className="text-gray-700">Report Year:</span>
                    <select
                      value={reportYear}
                      onChange={(e) => setReportYear(Number(e.target.value))}
                      className="bg-white border-2 border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 px-3 py-1.5"
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
                    />
                    <div className="flex flex-col items-center justify-center space-y-4">
                      <UploadCloud className="w-10 h-10 text-gray-400" />
                      <p className="text-sm text-gray-600 sm:text-base">
                        Drag & drop your PDF reports here
                      </p>
                      <p className="text-xs text-gray-400">
                        Only <strong>PDF</strong> files are allowed.
                      </p>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-5 py-2 text-sm font-semibold text-white rounded-md shadow-sm sm:text-base"
                        style={{ backgroundColor: PRIMARY_BLUE }}
                      >
                        Browse PDF Files
                      </button>
                    </div>
                  </div>

                  {/* Selected files */}
                  <div className="flex-1 mt-6 space-y-4 overflow-y-auto">
                    {Object.values(files).length === 0 ? (
                      <p className="text-xs italic text-gray-400">
                        No files selected yet.
                      </p>
                    ) : (
                      Object.values(files).map((file) => (
                        <FilePreview
                          key={file.name}
                          file={file}
                          onRemove={handleRemoveFile}
                        />
                      ))
                    )}
                  </div>

                  {totalFiles > 0 && (
                    <div className="pt-4 mt-6 border-t border-gray-200">
                      <button
                        type="button"
                        onClick={handleSubmit}
                        className="w-full text-white py-3 rounded-xl font-semibold text-base sm:text-lg shadow-lg transition-transform duration-150 hover:scale-[1.01]"
                        style={{ backgroundColor: DEEP_INDIGO }}
                      >
                        Submit All Reports ({totalFiles})
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
                        are the only documents used by SARTHI for your
                        institution’s AI-based insights.
                      </p>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      <label className="text-xs text-gray-500">
                        Filter by year:
                      </label>
                      <select
                        value={reportYearFilter}
                        onChange={(e) => setReportYearFilter(e.target.value)}
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

                  <div className="flex-1 mt-2 space-y-3 overflow-y-auto">
                    {filteredReports.length === 0 ? (
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
                      filteredReports.map((report) => (
                        <div
                          key={report.id}
                          className="flex items-start justify-between px-4 py-3 rounded-lg bg-indigo-50"
                        >
                          <div className="flex items-center gap-3">
                            <FileText className="w-6 h-6 text-indigo-600" />
                            <div>
                              <p className="text-sm font-semibold text-gray-800 truncate max-w-48 sm:max-w-lg">
                                {report.name}
                              </p>
                              <p className="text-xs text-gray-500">
                                Year:{" "}
                                <span className="font-medium">
                                  {report.year}
                                </span>{" "}
                                · Uploaded on{" "}
                                {new Date(report.uploadedAt).toLocaleString()}
                              </p>
                              <p className="text-[11px] text-gray-400 mt-1">
                                Institution:{" "}
                                <span className="font-mono">
                                  {report.institutionCode}
                                </span>
                              </p>
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-1">
                            <span className="text-[10px] uppercase tracking-wide bg-indigo-600 text-white px-2 py-0.5 rounded-full">
                              Stored
                            </span>
                          </div>
                        </div>
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
                        These indicators feed into your institute’s AI
                        dashboard, visible under the performance / EduRank view.
                      </li>
                      <li>
                        Only the reports submitted from{" "}
                        <span className="font-mono text-[11px] bg-white px-1.5 py-0.5 rounded border border-gray-200">
                          {institutionCode || "INSTITUTE"}
                        </span>{" "}
                        are used – you cannot see or affect any other
                        institute’s data.
                      </li>
                    </ul>
                  </div>

                  <div className="mt-6">
                    <button
                      type="button"
                      onClick={() => {
                        // adapt this if you use React Router routing instead of static HTML
                        window.location.href = "edu.html";
                      }}
                      className="inline-flex items-center gap-2 px-5 py-3 rounded-lg text-white font-semibold text-sm shadow-md hover:shadow-lg transition-transform hover:scale-[1.01]"
                      style={{ backgroundColor: PRIMARY_BLUE }}
                    >
                      Open Performance Dashboard
                    </button>
                  </div>
                </section>
              )}
            </div>
          </section>
        </main>

        <Footer />

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
    </>
  );
}

export default UploadDocumentPage;
