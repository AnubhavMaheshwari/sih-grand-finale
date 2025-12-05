import React, { useState, useEffect, useMemo, useCallback } from "react";
// Removed unnecessary imports from 'react-router-dom' based on the state-based approach
import { Link } from "react-router-dom"; 

// 🎯 FIX: Assuming this import statement correctly brings the component from the external file.
import AIIMSDashboard from "../components/AIIMSDashboard";

// Define the two main colors based on the design system
const PRIMARY_BLUE = "#4F46E5"; // Primary Blue
const DEEP_INDIGO = "#3730A3"; // Deep Indigo

// --- MODIFIED: Add your direct download link here ---
const AIIMS_DELHI_PDF_LINK =
  "https://drive.usercontent.google.com/download?id=12Y4FPPyl14Zyo5kUXgL4KWgXEdiXGJP9&export=download&authuser=0&confirm=t&uuid=8eb9e2e3-31c0-43ac-8fcb-5b4eda3f76e0&at=AKSUxGMnKQF63N2Thj8KYYBHea7I:1760378258613";

// --- Custom Navigation Component (Shared Design) ---
const Navigation = ({ currentPage }) => {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const navItems = [
    { name: "FAQ", path: "/faq" },
    { name: "Contact Us", path: "/contact" },
  ];
  const userMenuItems = [
    { label: "Your Profile", path: "#" },
    { label: "Settings", path: "#" },
    { label: "Sign out", path: "/" },
  ];
  const navigateSimulated = (path) => {
    if (path === "/") window.location.href = "index.html";
    else if (path === "/faq") window.location.href = "faq.html";
    else if (path === "/contact") window.location.href = "contactUs.html";
  };
  const handleUserMenuClick = (event) => {
    event.stopPropagation();
    setIsUserMenuOpen((prev) => !prev);
  };
  return (
    <nav className="bg-white shadow-md border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative flex items-center justify-between h-16">
          <div className="flex items-center">
            <a
              href="/"
              className="text-2xl font-bold"
              style={{ color: DEEP_INDIGO }}
            >
              SARTHI Portal
            </a>
          </div>
          <div className="flex items-center space-x-6">
            <div className="hidden md:flex items-baseline space-x-4">
              {navItems.map((item) => (
                <a
                  key={item.name}
                  href={item.path}
                  onClick={(e) => {
                    e.preventDefault();
                    navigateSimulated(item.path);
                  }}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    item.name === currentPage
                      ? "text-white"
                      : "text-gray-700 hover:bg-indigo-500 hover:text-white"
                  }`}
                  style={{
                    backgroundColor:
                      item.name === currentPage ? PRIMARY_BLUE : undefined,
                  }}
                >
                  {item.name}
                </a>
              ))}
            </div>
            <div className="relative flex items-center">
              <button
                type="button"
                onClick={handleUserMenuClick}
                className="flex items-center justify-center h-10 w-10 bg-gray-100 rounded-full border-2 border-indigo-500 text-indigo-800 hover:bg-gray-200 focus:outline-none"
              >
                <span className="sr-only">User menu</span>
                <svg
                  className="h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </button>
              {isUserMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
                  {userMenuItems.map((item) => (
                    <Link
                      key={item.label}
                      to={item.path}
                      onClick={() => {
                        if (item.path !== "#") navigateSimulated(item.path);
                        setIsUserMenuOpen(false);
                      }}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

// --- Custom Footer Component ---
const Footer = () => (
  <footer className="bg-white border-t border-gray-200 py-6 mt-12">
    <div className="container mx-auto text-center text-sm text-gray-500">
      &copy; 2025 SARTHI National Portal, all rights reserved
    </div>
  </footer>
);

// --- Hardcoded Data (Simulating fetch) ---
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

// --- Constants ---
const categoryOptions = [
  { value: "all", label: "All Categories" },
  { value: "Engineering", label: "Engineering" },
  { value: "Medical", label: "Medical" },
  { value: "Business", label: "Business" },
  { value: "Architecture", label: "Architecture" },
  { value: "Pharmacy", label: "Pharmacy" },
];

// --- Helper Components ---
const SortIcon = ({ direction }) => {
  const isAsc = direction === "asc";
  const isDesc = direction === "desc";
  return (
    <span className="sort-icon ml-auto opacity-40 transition-opacity group-hover:opacity-100">
      <svg
        className="w-4 h-4"
        aria-hidden="true"
        xmlns="http://www.w3.org/2000/svg"
        fill="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          className={`transition-colors ${
            isAsc ? "text-indigo-600" : "text-gray-400"
          }`}
          d="M8.574 11.024h6.852a2.075 2.075 0 0 0 1.847-1.086 1.9 1.9 0 0 0-.11-1.986L13.736 2.9a2.122 2.122 0 0 0-3.472 0L6.837 7.952a1.9 1.9 0 0 0-.11 1.986 2.074 2.074 0 0 0 1.847 1.086Z"
        />
        <path
          className={`transition-colors ${
            isDesc ? "text-indigo-600" : "text-gray-400"
          }`}
          d="M8.574 12.976h6.852a2.075 2.075 0 0 0 1.847-1.087 1.9 1.9 0 0 0-.11-1.985L13.736 7.952a2.122 2.122 0 0 0-3.472 0L6.837 12.976a1.9 1.9 0 0 0-.11 1.985 2.074 2.074 0 0 0 1.847 1.087Z"
        />
      </svg>
    </span>
  );
};

// --- Main Page Component ---
function EduRankPage() {
  // 💥 FIX: HOOKS MOVED HERE (UNCONDITIONALLY)
  const [showDashboard, setShowDashboard] = useState(false);
  const [selectedInstituteId, setSelectedInstituteId] = useState(null); 
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [sort, setSort] = useState({ column: "rank", direction: "asc" });

  // Memoized values and callbacks moved here
  const filteredAndSortedData = useMemo(() => {
    let currentData = [...instituteData];
    if (categoryFilter !== "all") {
      currentData = currentData.filter(
        (item) => item.category === categoryFilter
      );
    }
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
  }, [searchTerm, categoryFilter, sort]);

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
    return `Showing ${startIndex + 1} to ${endIndex} of ${total} entries`;
  }, [filteredAndSortedData.length, startIndex, endIndex]);

  const handleSort = useCallback((column) => {
    setSort((prevSort) => ({
      column: column,
      direction:
        prevSort.column === column && prevSort.direction === "asc"
          ? "desc"
          : "asc",
    }));
    setCurrentPage(1);
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, categoryFilter, entriesPerPage]);
  // 💥 END OF HOOKS

  
  // --- CONDITIONAL RETURN (Dashboard) ---
  // The conditional logic itself is fine, it just needs to follow the hooks.
  if (showDashboard) {
    return (
      <div className="bg-gray-50 font-sans min-h-screen flex flex-col">
        <Navigation currentPage={null} />
        <main className="py-10 flex-grow">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <AIIMSDashboard 
              instituteId={selectedInstituteId} 
              onBack={() => setShowDashboard(false)}
              // Note: AIIMSDashboard must accept these props
            />
          </div>
        </main>
        <Footer />
      </div>
    );
  }
  // --- END CONDITIONAL RETURN ---


  // --- RENDER TABLE (If showDashboard is false) ---
  const PaginationButton = ({ page, isActive, isDisabled, children }) => (
    <button
      onClick={() => !isDisabled && setCurrentPage(page)}
      disabled={isDisabled}
      className={`inline-flex items-center justify-center px-3 h-8 text-sm font-medium border rounded-md transition-colors ${
        isActive
          ? "bg-indigo-600 text-white border-indigo-600"
          : "bg-white text-gray-500 border-gray-300 hover:bg-gray-100"
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
          Previous
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

  const TableHeader = ({ column, title }) => (
    <th
      scope="col"
      className={`px-6 py-4 font-semibold group cursor-pointer ${
        sort.column === column ? "bg-gray-100" : ""
      }`}
      onClick={() => handleSort(column)}
    >
      <div className="flex items-center">
        {title}
        <SortIcon direction={sort.column === column ? sort.direction : null} />
      </div>
    </th>
  );

  const currentCategoryLabel =
    categoryOptions.find((opt) => opt.value === categoryFilter)?.label ||
    "All Institutions";

  return (
    <>
      <style jsx="true">{`
        #table-body tr {
          border-bottom: 1px solid #e5e7eb;
          transition: all 0.2s ease-in-out;
        }
        #table-body tr:last-child {
          border-bottom: none;
        }
        #table-body tr:hover {
          transform: scale(1.02);
          background-color: white;
          box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1),
            0 4px 6px -4px rgb(0 0 0 / 0.1);
          position: relative;
          z-index: 10;
        }
        #table-body tr:nth-child(even) {
          background-color: #f9fafb;
        }
        #table-body tr:nth-child(even):hover {
          background-color: white;
        }
      `}</style>
      <div className="bg-gray-50 font-sans min-h-screen flex flex-col">
        <Navigation currentPage={null} />

        <main className="py-10 flex-grow">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white p-6 sm:p-8 rounded-xl shadow-lg border border-gray-200">
              <header className="text-left mb-8">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
                  Institute Rankings 2025:{" "}
                  <span className="text-indigo-600">
                    {currentCategoryLabel}
                  </span>
                </h1>
              </header>

              <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span>Show</span>
                  <select
                    value={entriesPerPage}
                    onChange={(e) => setEntriesPerPage(Number(e.target.value))}
                    className="bg-white border-2 border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-auto p-2"
                  >
                    <option value="10">10</option>
                    <option value="25">25</option>
                    <option value="50">50</option>
                    <option value="100">100</option>
                  </select>
                  <span>entries</span>
                </div>
                <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="bg-white border-2 border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5"
                  >
                    {categoryOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  <div className="relative w-full sm:w-auto">
                    <input
                      type="text"
                      placeholder="Search..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="bg-white border-2 border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 p-2.5"
                    />
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg
                        className="w-5 h-5 text-gray-400"
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

              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-500">
                  <thead className="text-sm text-gray-800 border-b-2 border-gray-200">
                    <tr>
                      <TableHeader column="instituteId" title="Institute ID" />
                      <TableHeader column="name" title="Name" />
                      <TableHeader column="city" title="City" />
                      <TableHeader column="state" title="State" />
                      <TableHeader column="score" title="Score" />
                      <TableHeader column="rank" title="Rank" />
                      <th
                        scope="col"
                        className="px-6 py-4 font-semibold text-center"
                      >
                        Download
                      </th>
                    </tr>
                  </thead>
                  <tbody id="table-body">
                    {paginatedData.length > 0 ? (
                      paginatedData.map((item) => (
                        <tr key={item.instituteId} className="group">
                          <td className="px-6 py-4 text-gray-900 whitespace-nowrap">
                            {item.instituteId}
                          </td>
                          <td className="px-6 py-4 font-medium text-gray-900">
                            <div>{item.name}</div>
                            <div className="text-xs text-indigo-600 mt-1 space-x-2">
                              {/* 🎯 FIX: Use span with onClick to control state */}
                              <span
                                className="hover:underline text-indigo-600 cursor-pointer"
                                onClick={() => {
                                  setSelectedInstituteId(item.instituteId);
                                  setShowDashboard(true);
                                }}
                              >
                                **Statistics**
                              </span>
                              <span>|</span>
                              <Link to="/" className="hover:underline">
                                📄
                              </Link>
                              <span>|</span>
                              <Link to="/" className="hover:underline">
                                📊
                              </Link>
                            </div>
                          </td>
                          <td className="px-6 py-4">{item.city}</td>
                          <td className="px-6 py-4">{item.state}</td>
                          <td className="px-6 py-4">{item.score.toFixed(2)}</td>
                          <td className="px-6 py-4 font-bold text-gray-800">
                            {item.rank}
                          </td>
                          <td className="px-6 py-4 text-center">
                            {item.name ===
                            "All India Institute of Medical Sciences, Delhi" ? (
                              <a
                                href={AIIMS_DELHI_PDF_LINK}
                                className="text-indigo-600 hover:text-indigo-800 transition-colors"
                                title="Download Report"
                              >
                                <svg
                                  className="w-6 h-6 mx-auto"
                                  xmlns="http://www.w3.org/2000/svg"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  strokeWidth="1.5"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"
                                  />
                                </svg>
                              </a>
                            ) : (
                              <span
                                className="text-gray-400 cursor-not-allowed"
                                title="No report available"
                              >
                                <svg
                                  className="w-6 h-6 mx-auto"
                                  xmlns="http://www.w3.org/2000/svg"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  strokeWidth="1.5"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"
                                  />
                                </svg>
                              </span>
                            )}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan="7"
                          className="px-6 py-4 text-center text-gray-500"
                        >
                          No matching records found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              <div className="flex flex-col sm:flex-row justify-between items-center mt-4">
                <div className="text-sm text-gray-600 mb-2 sm:mb-0">
                  {entriesInfo}
                </div>
                <PaginationControls />
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
}

export default EduRankPage;