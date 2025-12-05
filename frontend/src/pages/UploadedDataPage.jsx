// src/pages/UploadedDataPage.jsx
import React, { useState, useMemo } from "react";
import Navigation from "../components/Navigation";

const PRIMARY_BLUE = "#4F46E5";
const DEEP_INDIGO = "#3730A3";

// --- Mock data: replace URLs with your real file locations ---
const uploadedInstitutions = [
  {
    instituteId: "IR-M-I-1074",
    name: "All India Institute of Medical Sciences, Delhi",
    city: "New Delhi",
    state: "Delhi",
    category: "Medical",
    submissions: [
      {
        id: 1,
        type: "NIRF Performance Report",
        year: 2025,
        fileName: "AIIMS_NIRF_2025.pdf",
        url: "#",
      },
      {
        id: 2,
        type: "Compliance & Affiliation Report",
        year: 2024,
        fileName: "AIIMS_Compliance_2024.pdf",
        url: "#",
      },
    ],
  },
  {
    instituteId: "IR-E-U-0456",
    name: "Indian Institute of Technology Madras",
    city: "Chennai",
    state: "Tamil Nadu",
    category: "Engineering",
    submissions: [
      {
        id: 3,
        type: "Infrastructure & Faculty Report",
        year: 2025,
        fileName: "IITM_Infrastructure_2025.pdf",
        url: "#",
      },
      {
        id: 4,
        type: "Student Outcomes Report",
        year: 2024,
        fileName: "IITM_Outcomes_2024.pdf",
        url: "#",
      },
    ],
  },
  {
    instituteId: "IR-B-I-1075",
    name: "Indian Institute of Management Ahmedabad",
    city: "Ahmedabad",
    state: "Gujarat",
    category: "Business",
    submissions: [
      {
        id: 5,
        type: "Accreditation Support Report",
        year: 2025,
        fileName: "IIMA_Accreditation_2025.pdf",
        url: "#",
      },
    ],
  },
];

function UploadedDataPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedInstituteId, setExpandedInstituteId] = useState(null);
  const [selectedYear, setSelectedYear] = useState("all"); // "all" or a number

  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 5 }, (_, i) => currentYear - i); // last 5 years

  const handleToggleExpand = (instituteId) => {
    setExpandedInstituteId((prev) =>
      prev === instituteId ? null : instituteId
    );
  };

  const handleDownloadAllForYear = () => {
    if (selectedYear === "all") {
      alert("Please select a specific year to download all documents for that year.");
      return;
    }

    const filesForYear = uploadedInstitutions.flatMap((inst) =>
      inst.submissions.filter((s) => s.year === selectedYear)
    );

    if (!filesForYear.length) {
      alert(`No documents uploaded for year ${selectedYear}.`);
      return;
    }

    // 🔗 Placeholder: integrate with backend to download a ZIP or batch
    alert(
      `Triggering download for all ${filesForYear.length} document(s) of year ${selectedYear}. Integrate this with your backend API.`
    );
  };

  // Filter by institution name + selected year
  const filteredInstitutions = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();

    return uploadedInstitutions
      .map((inst) => {
        const submissionsForYear =
          selectedYear === "all"
            ? inst.submissions
            : inst.submissions.filter((s) => s.year === selectedYear);

        return {
          ...inst,
          submissions: submissionsForYear,
        };
      })
      .filter((inst) => {
        const matchesName = term
          ? inst.name.toLowerCase().includes(term)
          : true;
        const hasSubmissions = inst.submissions.length > 0;
        return matchesName && hasSubmissions;
      });
  }, [searchTerm, selectedYear]);

  return (
    <>
      <style jsx="true">{`
        .bg-primary-blue {
          background-color: ${PRIMARY_BLUE};
        }
        .text-primary-blue {
          color: ${PRIMARY_BLUE};
        }
        .text-deep-indigo {
          color: ${DEEP_INDIGO};
        }
      `}</style>

      <div className="bg-gray-50 min-h-screen flex flex-col">
        {/* Top bar – highlight Uploaded Data for UGC users */}
        <Navigation currentPage="Uploaded Data" />

        <main className="flex-1 py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Single-column layout (no left sidebar) */}
            <section className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 sm:p-8">
              <header className="mb-6">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                  Uploaded Data Repository
                </h1>
                <p className="mt-2 text-sm text-gray-600 max-w-2xl">
                  Search for any institution and download PDFs submitted over the
                  last five years to the SARTHI portal.
                </p>
              </header>

              {/* Filters row: search + year filter + bulk download */}
              <div className="mb-6 space-y-4">
                {/* Search + count */}
                <div className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between">
                  <div className="w-full sm:w-1/2 relative">
                    <input
                      type="text"
                      placeholder="Search by institution name..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full border-2 border-gray-200 rounded-lg pl-10 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
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
                    </span>
                  </div>

                  <div className="text-xs sm:text-sm text-gray-500">
                    {filteredInstitutions.length}{" "}
                    {filteredInstitutions.length === 1
                      ? "institution found"
                      : "institutions found"}
                  </div>
                </div>

                {/* Year filter + bulk download */}
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase mb-2">
                      Years (last 5)
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedYear("all")}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                          selectedYear === "all"
                            ? "bg-indigo-600 text-white border-indigo-600"
                            : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
                        }`}
                      >
                        All Years
                      </button>
                      {yearOptions.map((year) => (
                        <button
                          key={year}
                          type="button"
                          onClick={() => setSelectedYear(year)}
                          className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                            selectedYear === year
                              ? "bg-indigo-600 text-white border-indigo-600"
                              : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
                          }`}
                        >
                          {year}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex lg:justify-end">
                    <button
                      type="button"
                      onClick={handleDownloadAllForYear}
                      className="inline-flex items-center px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm"
                    >
                      ⬇ Download all PDFs for{" "}
                      {selectedYear === "all" ? "selected year" : selectedYear}
                    </button>
                  </div>
                </div>
              </div>

              {/* List of institutions */}
              <div className="space-y-4">
                {filteredInstitutions.length === 0 && (
                  <div className="border border-dashed border-gray-300 rounded-lg p-6 text-center text-sm text-gray-500">
                    No institutions match your search / year filter. Try
                    changing the filters.
                  </div>
                )}

                {filteredInstitutions.map((inst) => {
                  const isExpanded = expandedInstituteId === inst.instituteId;
                  return (
                    <div
                      key={inst.instituteId}
                      className="border border-gray-200 rounded-lg p-4 sm:p-5 hover:shadow-md transition-shadow bg-white"
                    >
                      {/* Top row: basic info + button */}
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h2 className="text-base sm:text-lg font-semibold text-gray-900">
                              {inst.name}
                            </h2>
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-indigo-50 text-indigo-700 border border-indigo-100">
                              {inst.category}
                            </span>
                          </div>
                          <p className="text-xs sm:text-sm text-gray-500 mt-1">
                            {inst.instituteId} • {inst.city}, {inst.state}
                          </p>
                        </div>

                        <div className="flex justify-start sm:justify-end">
                          <button
                            type="button"
                            onClick={() =>
                              handleToggleExpand(inst.instituteId)
                            }
                            className={`text-xs sm:text-sm font-semibold px-4 py-2 rounded-lg border transition-colors ${
                              isExpanded
                                ? "bg-indigo-600 text-white border-indigo-600"
                                : "bg-white text-indigo-700 border-indigo-200 hover:bg-indigo-50"
                            }`}
                          >
                            {isExpanded
                              ? "Hide PDFs & Reports"
                              : "View PDFs & Reports"}
                          </button>
                        </div>
                      </div>

                      {/* Expanded section: list of submissions */}
                      {isExpanded && (
                        <div className="mt-4 border-t border-gray-100 pt-4">
                          {inst.submissions.length === 0 ? (
                            <p className="text-xs sm:text-sm text-gray-500">
                              No files submitted yet for this institution in the
                              selected year.
                            </p>
                          ) : (
                            <table className="w-full text-xs sm:text-sm text-gray-600">
                              <thead>
                                <tr className="text-gray-800 border-b text-left">
                                  <th className="py-2 font-semibold">
                                    Report Type
                                  </th>
                                  <th className="py-2 font-semibold">Year</th>
                                  <th className="py-2 font-semibold">File</th>
                                  <th className="py-2 font-semibold text-right">
                                    Actions
                                  </th>
                                </tr>
                              </thead>
                              <tbody>
                                {inst.submissions.map((file) => (
                                  <tr
                                    key={file.id}
                                    className="border-b hover:bg-gray-50"
                                  >
                                    <td className="py-2 pr-2">{file.type}</td>
                                    <td className="py-2 pr-2">{file.year}</td>
                                    <td className="py-2 pr-2 font-medium text-gray-800">
                                      {file.fileName}
                                    </td>
                                    <td className="py-2 text-right space-x-2">
                                      <a
                                        href={file.url}
                                        className="inline-flex items-center px-3 py-1 rounded-md text-[11px] font-medium border border-indigo-300 bg-white text-indigo-700 hover:bg-indigo-50"
                                      >
                                        ⬇ Download
                                      </a>
                                      <button
                                        type="button"
                                        onClick={() =>
                                          alert(
                                            `Viewing AI Report for ${file.fileName}`
                                          )
                                        }
                                        className="inline-flex items-center px-3 py-1 rounded-md text-[11px] font-medium border border-purple-300 bg-white text-purple-700 hover:bg-purple-50"
                                      >
                                        📊 View AI Report
                                      </button>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          </div>
        </main>
      </div>
    </>
  );
}

export default UploadedDataPage;
