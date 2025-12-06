// src/components/SideNavbar.jsx
import React from "react";

const PRIMARY_BLUE = "#4F46E5";
const DEEP_INDIGO = "#3730A3";

const sideNavItems = [
  { id: "uploaded-data", label: "Uploaded Data" },
  { id: "statistics", label: "Statistics" },
  { id: "consolidated-reports", label: "Consolidated Reports" },
];

function SideNavbar({ activeId = "uploaded-data", onChange }) {
  return (
    <aside className="w-full md:w-64 bg-white rounded-xl shadow-sm border border-gray-200">
      <div className="px-4 py-4 border-b border-gray-100">
        <h2 className="text-sm font-semibold uppercase tracking-wide" style={{ color: DEEP_INDIGO }}>
          UGC Workspace
        </h2>
        <p className="text-xs text-gray-500 mt-1">
          Review submitted documents and AI reports.
        </p>
      </div>

      <nav className="py-2">
        {sideNavItems.map((item) => {
          const isActive = item.id === activeId;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onChange && onChange(item.id)}
              className={`w-full flex items-center px-4 py-3 text-sm font-medium text-left transition-colors ${
                isActive
                  ? "bg-indigo-50 text-indigo-700 border-l-4 border-indigo-600"
                  : "text-gray-700 hover:bg-gray-50 border-l-4 border-transparent"
              }`}
            >
              <span className="truncate">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
}

export default SideNavbar;
