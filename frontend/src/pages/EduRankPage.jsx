import {
  useState,
  useEffect,
  useMemo,
  useCallback,
} from "react";
import { useNavigate } from "react-router-dom";
import AIIMSDashboard from "../components/charts/AIIMSDashboard";
import Navigation from "../components/layout/Navigation";

const PRIMARY_BLUE = "#4F46E5";
const DEEP_INDIGO = "#3730A3";

const AIIMS_DELHI_PDF_LINK =
  "https://drive.usercontent.google.com/download?id=12Y4FPPyl14Zyo5kUXgL4KWgXEdiXGJP9&export=download&authuser=0&confirm=t&uuid=8eb9e2e3-31c0-43ac-8fcb-5b4eda3f76e0&at=AKSUxGMnKQF63N2Thj8KYYBHea7I:1760378258613";

const CONSOLIDATED_REPORT_LINK = "/consolidated-report-2025.pdf";

import Footer from "../components/layout/Footer";

// ---------------- DATA ----------------
const instituteData = [
  {
    instituteId: "IR-E-U-0456",
    name: "Indian Institute of Technology Madras",
    city: "Chennai",
    state: "Tamil Nadu",
    score: 89.72,
    rank: 1,
    category: "Engineering",
  },
  {
    instituteId: "IR-E-I-1074",
    name: "Indian Institute of Technology Delhi",
    city: "New Delhi",
    state: "Delhi",
    score: 87.74,
    rank: 2,
    category: "Engineering",
  },
  {
    instituteId: "IR-E-U-0306",
    name: "Indian Institute of Technology Bombay",
    city: "Mumbai",
    state: "Maharashtra",
    score: 85.65,
    rank: 3,
    category: "Engineering",
  },
  {
    instituteId: "IR-M-I-1074",
    name: "All India Institute of Medical Sciences, Delhi",
    city: "New Delhi",
    state: "Delhi",
    score: 92.07,
    rank: 1,
    category: "Medical",
  },
  {
    instituteId: "IR-M-U-0070",
    name: "Post Graduate Institute of Medical Education and Research",
    city: "Chandigarh",
    state: "Chandigarh",
    score: 81.1,
    rank: 2,
    category: "Medical",
  },
  {
    instituteId: "IR-B-I-1075",
    name: "Indian Institute of Management Ahmedabad",
    city: "Ahmedabad",
    state: "Gujarat",
    score: 85.32,
    rank: 1,
    category: "Business",
  },
  {
    instituteId: "IR-B-U-0232",
    name: "Indian Institute of Management Bangalore",
    city: "Bangalore",
    state: "Karnataka",
    score: 82.64,
    rank: 2,
    category: "Business",
  },
  {
    instituteId: "IR-A-I-1075",
    name: "Indian Institute of Technology Roorkee",
    city: "Roorkee",
    state: "Uttarakhand",
    score: 82.65,
    rank: 1,
    category: "Architecture",
  },
  {
    instituteId: "IR-P-U-0013",
    name: "Jamia Hamdard",
    city: "New Delhi",
    state: "Delhi",
    score: 79.11,
    rank: 1,
    category: "Pharmacy",
  },
];

// 🔥 Amazon-style categories with sub-filters
const categoryOptions = [
  { value: "all", label: "All Categories" },
  {
    value: "Engineering",
    label: "Engineering",
    subcategories: [
      { value: "top-3", label: "Top 3 in India" },
      { value: "score-80-plus", label: "Score 80+" },
    ],
  },
  {
    value: "Medical",
    label: "Medical",
    subcategories: [
      { value: "top-3", label: "Top 3 in India" },
      { value: "score-80-plus", label: "Score 80+" },
    ],
  },
  {
    value: "Business",
    label: "Business",
    subcategories: [
      { value: "top-3", label: "Top 3 in India" },
      { value: "score-80-plus", label: "Score 80+" },
    ],
  },
  {
    value: "Architecture",
    label: "Architecture",
    subcategories: [
      { value: "top-3", label: "Top 3 in India" },
      { value: "score-80-plus", label: "Score 80+" },
    ],
  },
  {
    value: "Pharmacy",
    label: "Pharmacy",
    subcategories: [
      { value: "top-3", label: "Top 3 in India" },
      { value: "score-80-plus", label: "Score 80+" },
    ],
  },
];

const SortIcon = ({ direction }) => {
  const isAsc = direction === "asc";
  const isDesc = direction === "desc";
  return (
    <span className="ml-1 opacity-50 inline-flex">
      <svg
        className="w-3 h-3"
        aria-hidden="true"
        xmlns="http://www.w3.org/2000/svg"
        fill="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          className={isAsc ? "text-indigo-600" : "text-gray-300"}
          d="M8.574 11.024h6.852a2.075 2.075 0 0 0 1.847-1.086 1.9 1.9 0 0 0-.11-1.986L13.736 2.9a2.122 2.122 0 0 0-3.472 0L6.837 7.952a1.9 1.9 0 0 0-.11 1.986 2.074 2.074 0 0 0 1.847 1.086Z"
        />
        <path
          className={isDesc ? "text-indigo-600" : "text-gray-300"}
          d="M8.574 12.976h6.852a2.075 2.075 0 0 0 1.847-1.087 1.9 1.9 0 0 0-.11-1.985L13.736 7.952a2.122 2.122 0 0 0-3.472 0L6.837 12.976a1.9 1.9 0 0 0-.11 1.985 2.074 2.074 0 0 0 1.847 1.087Z"
        />
      </svg>
    </span>
  );
};

const RowActionButton = ({
  label,
  href,
  onClick,
  disabled,
  download,
  variant = "primary",
}) => {
  const baseClasses =
    "px-3 py-1.5 rounded-md text-[10px] sm:text-xs font-medium text-white shadow-sm transition-colors whitespace-nowrap";

  const variants = {
    primary: "bg-indigo-600 hover:bg-indigo-700",
    success: "bg-emerald-600 hover:bg-emerald-700",
    warning: "bg-amber-500 hover:bg-amber-600",
    neutral: "bg-slate-600 hover:bg-slate-700",
    disabled:
      "bg-gray-300 text-gray-600 cursor-not-allowed opacity-70 shadow-none",
  };

  const classes = disabled ? variants.disabled : variants[variant] || variants.primary;

  if (href && !disabled) {
    const anchorProps = download
      ? { download: true }
      : { target: "_blank", rel: "noopener noreferrer" };

    return (
      <a
        href={href}
        {...anchorProps}
        className={`${baseClasses} ${classes}`}
      >
        {label}
      </a>
    );
  }

  return (
    <button
      type="button"
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      className={`${baseClasses} ${classes}`}
    >
      {label}
    </button>
  );
};

// ---------------- MAIN PAGE ----------------
function EduRankPage() {
  const navigate = useNavigate();

  const isInstitutionLoggedIn =
    typeof window !== "undefined" &&
    localStorage.getItem("institutionLoggedIn") === "true";

  const isUGCLoggedIn =
    typeof window !== "undefined" &&
    localStorage.getItem("ugcMemberLoggedIn") === "true";

  const currentNavTab = isInstitutionLoggedIn
    ? "Institute Performance"
    : "My Dashboard";

  const [showDashboard, setShowDashboard] = useState(false);
  const [selectedInstituteId, setSelectedInstituteId] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  // NEW: subcategory filter + which category is expanded (Amazon-style)
  const [subCategoryFilter, setSubCategoryFilter] = useState(null);
  const [expandedCategory, setExpandedCategory] = useState(null);

  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [sort, setSort] = useState({ column: "rank", direction: "asc" });

  const filteredAndSortedData = useMemo(() => {
    let currentData = [...instituteData];

    // Main category filter
    if (categoryFilter !== "all") {
      currentData = currentData.filter(
        (item) => item.category === categoryFilter
      );
    }

    // Subcategory filter (generic, works for all categories)
    if (subCategoryFilter === "top-3") {
      currentData = currentData.filter((item) => item.rank <= 3);
    } else if (subCategoryFilter === "score-80-plus") {
      currentData = currentData.filter((item) => item.score >= 80);
    }

    // Search
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      currentData = currentData.filter(
        (item) =>
          item.name.toLowerCase().includes(term) ||
          item.city.toLowerCase().includes(term) ||
          item.state.toLowerCase().includes(term) ||
          item.instituteId.toLowerCase().includes(term)
      );
    }

    // Compute ranks based on score (within filtered set)
    const rankedData = currentData
      .sort((a, b) => b.score - a.score)
      .map((item, index) => ({ ...item, rank: index + 1 }));

    rankedData.sort((a, b) => {
      let aVal = a[sort.column];
      let bVal = b[sort.column];
      if (typeof aVal === "string") aVal = aVal.toLowerCase();
      if (typeof bVal === "string") bVal = bVal.toLowerCase();
      const isAsc = sort.direction === "asc";
      if (aVal < bVal) return isAsc ? -1 : 1;
      if (aVal > bVal) return isAsc ? 1 : -1;
      return 0;
    });

    return rankedData;
  }, [searchTerm, categoryFilter, subCategoryFilter, sort]);

  const pageCount = Math.ceil(filteredAndSortedData.length / entriesPerPage);
  const startIndex = (currentPage - 1) * entriesPerPage;
  const endIndex = Math.min(
    startIndex + entriesPerPage,
    filteredAndSortedData.length
  );
  const paginatedData = filteredAndSortedData.slice(startIndex, endIndex);

  const entriesInfo = useMemo(() => {
    const total = filteredAndSortedData.length;
    if (total === 0) return "Showing 0 to 0 of 0 entries";
    return `Showing ${startIndex + 1} to ${endIndex} of ${total} institutions`;
  }, [filteredAndSortedData.length, startIndex, endIndex]);

  const handleSort = useCallback((column) => {
    setSort((prevSort) => ({
      column,
      direction:
        prevSort.column === column && prevSort.direction === "asc"
          ? "desc"
          : "asc",
    }));
    setCurrentPage(1);
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, categoryFilter, subCategoryFilter, entriesPerPage]);

  const handleViewSubmittedPdfs = (instituteId) => {
    navigate("/uploaded-data", {
      state: {
        instituteId,
        viewLastFiveYears: true,
      },
    });
  };

  const handleOpenDashboard = (instituteId) => {
    setSelectedInstituteId(instituteId);
    setShowDashboard(true);
  };

  // ---------- DASHBOARD VIEW ----------
  if (showDashboard) {
    return (
      <div className="bg-gray-50 font-sans min-h-screen flex flex-col">
        <Navigation currentPage={currentNavTab} />
        <main className="flex-1 py-6 sm:py-8">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <AIIMSDashboard
              instituteId={selectedInstituteId}
              onBack={() => setShowDashboard(false)}
            />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const PaginationButton = ({ page, isActive, isDisabled, children }) => (
    <button
      onClick={() => !isDisabled && setCurrentPage(page)}
      disabled={isDisabled}
      className={`inline-flex items-center justify-center px-3 h-8 text-xs sm:text-sm font-medium rounded-md transition-colors ${isActive
        ? "bg-indigo-600 text-white"
        : "bg-white text-gray-600 hover:bg-gray-100"
        } ${isDisabled ? "opacity-50 cursor-not-allowed" : ""}`}
      aria-current={isActive ? "page" : undefined}
    >
      {children}
    </button>
  );

  const PaginationControls = () => {
    if (pageCount <= 1) return null;
    const pages = Array.from({ length: pageCount }, (_, i) => i + 1);
    return (
      <div className="flex items-center space-x-2">
        <PaginationButton page={currentPage - 1} isDisabled={currentPage === 1}>
          Prev
        </PaginationButton>
        {pages.map((p) => (
          <PaginationButton key={p} page={p} isActive={currentPage === p}>
            {p}
          </PaginationButton>

        ))}
        <PaginationButton
          page={currentPage + 1}
          isDisabled={currentPage === pageCount}
        >
          Next
        </PaginationButton>
      </div>
    );
  };

  const currentCategoryOption =
    categoryOptions.find((opt) => opt.value === categoryFilter) ||
    categoryOptions[0];

  const currentSubcategoryLabel =
    currentCategoryOption.subcategories?.find(
      (sub) => sub.value === subCategoryFilter
    )?.label || null;

  const currentCategoryLabel = currentSubcategoryLabel
    ? `${currentCategoryOption.label} • ${currentSubcategoryLabel}`
    : currentCategoryOption.label;

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

      <div className="bg-slate-50 font-sans h-screen flex flex-col">
        {/* Top navbar */}
        <Navigation currentPage={currentNavTab} />

        {/* Main layout: LEFT FIXED, RIGHT SCROLLABLE */}
        <main className="flex-1 flex overflow-hidden">
          {/* LEFT SIDEBAR (static on md+) */}
          <aside className="hidden md:flex w-64 lg:w-72 bg-white border-r border-gray-200 flex-col">
            <div className="p-4 space-y-6 flex-1 overflow-y-auto scrollbar-thin">
              <div className="flex items-center justify-between mb-1">
                <h2 className="text-sm font-semibold text-gray-800">
                  Filters
                </h2>
                <span className="text-[10px] text-gray-400 uppercase tracking-wide">
                  NIRF & Category
                </span>
              </div>

              {/* Amazon-style category filter */}
              <div className="bg-slate-50 rounded-xl border border-slate-100 p-3 space-y-2">
                <p className="text-[11px] font-semibold text-gray-500 uppercase mb-1">
                  Category
                </p>
                <div className="space-y-1 text-sm">
                  {categoryOptions.map((opt) => {
                    const isActive = categoryFilter === opt.value;
                    const hasSub = !!opt.subcategories?.length;
                    const isExpanded = expandedCategory === opt.value;

                    return (
                      <div
                        key={opt.value}
                        className="border-b border-gray-100 pb-2 last:border-none last:pb-0"
                      >
                        <button
                          type="button"
                          onClick={() => {
                            setCategoryFilter(opt.value);
                            setSubCategoryFilter(null);
                            setExpandedCategory((prev) =>
                              prev === opt.value ? null : opt.value
                            );
                          }}
                          className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md transition-colors ${isActive
                            ? "bg-indigo-600 text-white"
                            : "bg-white text-gray-800 hover:bg-slate-100 border border-transparent hover:border-slate-200"
                            }`}
                        >
                          <span className="text-xs font-medium">
                            {opt.label}
                          </span>
                          {hasSub && (
                            <span
                              className={`ml-2 transform text-[10px] ${isExpanded ? "rotate-90" : ""
                                }`}
                            >
                              ▶
                            </span>
                          )}
                        </button>

                        {/* Subcategory list */}
                        {hasSub && isExpanded && (
                          <div className="mt-2 space-y-1 pl-2">
                            {opt.subcategories.map((sub) => (
                              <label
                                key={sub.value}
                                className="flex items-center gap-2 text-[11px] text-gray-700 cursor-pointer"
                              >
                                <input
                                  type="radio"
                                  name={`sub-${opt.value}`}
                                  className="h-3 w-3 rounded-sm border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                  checked={subCategoryFilter === sub.value}
                                  onChange={() =>
                                    setSubCategoryFilter(sub.value)
                                  }
                                />
                                <span>{sub.label}</span>
                              </label>
                            ))}
                            <button
                              type="button"
                              onClick={() => setSubCategoryFilter(null)}
                              className="mt-1 text-[11px] text-indigo-600 hover:underline"
                            >
                              Clear sub-filter
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Uploaded / Submitted Data link */}
              <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3">
                <p className="text-[11px] font-semibold text-emerald-700 uppercase mb-2">
                  Uploaded / Submitted Data
                </p>
                <a
                  href="/uploaded-data"
                  className="inline-flex items-center justify-center w-full px-3 py-2 rounded-lg text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm transition-colors"
                >
                  View Uploaded Documents
                </a>
              </div>

              {/* Summary */}
              <div className="bg-indigo-50 rounded-xl p-3 border border-indigo-100">
                <p className="text-[11px] font-semibold text-indigo-700 uppercase mb-1">
                  Summary
                </p>
                <p className="text-sm text-indigo-900 font-semibold">
                  {filteredAndSortedData.length}{" "}
                  <span className="font-normal text-indigo-700">
                    institutions in view
                  </span>
                </p>
                <p className="text-[11px] text-indigo-700 mt-1">
                  Filter:{" "}
                  <span className="font-semibold">{currentCategoryLabel}</span>
                </p>
              </div>
            </div>
          </aside>

          {/* RIGHT CONTENT – ONLY THIS PART SCROLLS */}
          <section className="flex-1 flex flex-col overflow-y-auto">
            <div className="h-full flex flex-col max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
              {/* Header card */}
              {/* Simple header (clean) */}
              <div className="mt-2 mb-3">
                <h1 className="text-xl sm:text-3xl font-bold text-gray-900">
                  Institute Rankings 2025
                </h1>

              </div>


              {/* Controls bar */}
              <div className="mt-4 bg-white rounded-2xl shadow-sm border border-slate-200 px-3 py-3 sm:px-4 sm:py-4">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 sm:gap-4">
                  {/* Left: entries per page + summary */}
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-5 text-xs sm:text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <span>Show</span>
                      <select
                        value={entriesPerPage}
                        onChange={(e) =>
                          setEntriesPerPage(Number(e.target.value))
                        }
                        className="bg-white border border-gray-300 text-gray-900 text-xs sm:text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-auto px-2 py-1"
                      >
                        <option value="5">5</option>
                        <option value="10">10</option>
                        <option value="25">25</option>
                      </select>
                      <span>institutions per page</span>
                    </div>
                    <div className="hidden sm:block h-4 w-px bg-gray-200" />
                    <div className="text-xs text-gray-500">
                      {entriesInfo}
                    </div>
                  </div>

                  {/* Right: search */}
                  <div className="w-full lg:w-72 relative">
                    <input
                      type="text"
                      placeholder="Search by name, city, state, ID..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="bg-slate-50 border border-gray-300 text-gray-900 text-xs sm:text-sm rounded-full focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-9 pr-3 py-2"
                    />
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg
                        className="w-4 h-4 text-gray-400"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              {/* Cards list */}
              <div className="mt-4 flex-1 overflow-y-auto space-y-4 pb-4 scrollbar-thin">
                {paginatedData.length > 0 ? (
                  paginatedData.map((item) => {
                    const hasPdf =
                      item.name ===
                      "All India Institute of Medical Sciences, Delhi";

                    return (
                      <div
                        key={item.instituteId}
                        className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-4 sm:p-5 hover:shadow-md hover:border-indigo-100 transition-colors"
                      >
                        {/* Top content */}
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                          <div className="space-y-1.5">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-[10px] sm:text-[11px] font-mono text-gray-400 bg-slate-50 border border-slate-200 rounded-full px-2 py-0.5">
                                {item.instituteId}
                              </span>
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-indigo-50 text-indigo-700 border border-indigo-100">
                                {item.category}
                              </span>
                            </div>
                            <h2 className="text-sm sm:text-lg font-semibold text-gray-900">
                              {item.name}
                            </h2>
                            <p className="text-xs sm:text-sm text-gray-500">
                              {item.city}, {item.state}
                            </p>
                          </div>

                          <div className="flex items-center gap-4 sm:gap-6">
                            <div className="text-right">
                              <p className="text-[10px] sm:text-[11px] uppercase text-gray-400">
                                Overall Score
                              </p>
                              <p className="text-lg sm:text-2xl font-bold text-emerald-600">
                                {item.score.toFixed(2)}
                              </p>
                              <p className="text-[11px] text-gray-400">
                                AI-evaluated
                              </p>
                            </div>
                            <div className="flex flex-col items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-linear-to-br from-indigo-600 to-indigo-800 text-white text-xs shadow-sm">
                              <span className="uppercase text-[9px] tracking-wide">
                                Rank
                              </span>
                              <span className="text-base sm:text-lg font-bold">
                                {item.rank}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Divider */}
                        <div className="my-3 border-t border-dashed border-slate-200" />

                        {/* Bottom row: actions */}
                        <div className="flex flex-wrap gap-2 justify-start sm:justify-end">
                          {/* 1️⃣ Statistics (dashboard) */}
                          <RowActionButton
                            label="Statistics"
                            variant="primary"
                            onClick={() => handleOpenDashboard(item.instituteId)}
                          />

                          {/* 2️⃣ Consolidated Reports */}
                          <RowActionButton
                            label="Consolidated Reports"
                            variant="success"
                            href={CONSOLIDATED_REPORT_LINK}
                            download
                          />

                          {/* 3️⃣ Submitted PDFs -> Uploaded Data Page for that institute */}
                          <RowActionButton
                            label="Submitted PDFs (5-year view)"
                            variant="warning"
                            onClick={() =>
                              handleViewSubmittedPdfs(item.instituteId)
                            }
                          />

                          {/* 4️⃣ Generate AI Report */}
                          <RowActionButton
                            label="Generate AI Report"
                            variant="neutral"
                            onClick={() => handleOpenDashboard(item.instituteId)}
                          />
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center text-gray-500 text-sm py-10">
                    No matching institutions found for this filter/search.
                  </div>
                )}
              </div>

              {/* Footer info + pagination */}
              <div className="pt-2 mt-2 border-t border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-3">
                <div className="text-xs sm:text-sm text-gray-600">
                  {entriesInfo}
                </div>
                <PaginationControls />
              </div>
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </>
  );
}

export default EduRankPage;
