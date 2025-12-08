import {
  useState,
  useEffect,
  useMemo,
  useCallback,
} from "react";
import { useNavigate } from "react-router-dom";
import AIIMSDashboard from "../components/charts/AIIMSDashboard";
import UGCLayout from "../components/layout/UGCLayout";
import { useAuth } from "../contexts/AuthContext.jsx";

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

// ---------------- MAIN PAGE ----------------
function EduRankPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [showDashboard, setShowDashboard] = useState(false);
  const [selectedInstituteId, setSelectedInstituteId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const filteredData = useMemo(() => {
    let currentData = [...instituteData];

    // Main category filter
    if (categoryFilter !== "all") {
      currentData = currentData.filter(
        (item) => item.category === categoryFilter
      );
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

    return currentData.sort((a, b) => a.rank - b.rank);
  }, [searchTerm, categoryFilter]);

  const handleOpenDashboard = (instituteId) => {
    setSelectedInstituteId(instituteId);
    setShowDashboard(true);
  };

  // ---------- DASHBOARD VIEW ----------
  if (showDashboard) {
    const dashboardContent = (
      <div className="px-2 sm:px-4">
        <AIIMSDashboard
          instituteId={selectedInstituteId}
          onBack={() => setShowDashboard(false)}
        />
      </div>
    );
    
    // Check if user is UGC employee
    if (user?.role === "ugc_employee") {
      return <UGCLayout>{dashboardContent}</UGCLayout>;
    }
    
    // Fallback for non-UGC users
    return (
      <div className="bg-gray-50 font-sans min-h-screen flex flex-col">
        <div className="p-4 bg-white border-b">
          <button
            onClick={() => setShowDashboard(false)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md"
          >
            Back to Rankings
          </button>
        </div>
        <main className="flex-1 py-6 sm:py-8">
          {dashboardContent}
        </main>
      </div>
    );
  }

  const content = (
    <div className="h-full flex flex-col px-2 sm:px-4 py-4 sm:py-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
          Institute Rankings 2025
        </h1>
        <p className="text-sm text-gray-600 mt-2">
          View and analyze institutional performance metrics
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search by name, city, state, ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div className="w-full md:w-48">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="all">All Categories</option>
              <option value="Engineering">Engineering</option>
              <option value="Medical">Medical</option>
              <option value="Business">Business</option>
              <option value="Architecture">Architecture</option>
              <option value="Pharmacy">Pharmacy</option>
            </select>
          </div>
        </div>
      </div>

      {/* Institutes List */}
      <div className="space-y-4">
        {filteredData.map((item) => (
          <div
            key={item.instituteId}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow"
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-mono text-gray-500 bg-gray-100 px-2 py-1 rounded">
                    {item.instituteId}
                  </span>
                  <span className="text-xs font-medium bg-indigo-100 text-indigo-800 px-2 py-1 rounded">
                    {item.category}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {item.name}
                </h3>
                <p className="text-sm text-gray-600">
                  {item.city}, {item.state}
                </p>
              </div>

              <div className="flex flex-col items-end gap-2">
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-900">
                    {item.score.toFixed(2)}
                  </div>
                  <div className="text-sm text-gray-600">Score</div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleOpenDashboard(item.instituteId)}
                    className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700"
                  >
                    View Dashboard
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredData.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No institutions found matching your criteria.</p>
        </div>
      )}
    </div>
  );

  // Wrap content in UGCLayout for UGC employees
  if (user?.role === "ugc_employee") {
    return <UGCLayout>{content}</UGCLayout>;
  }

  // For non-UGC users, return plain content
  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {content}
      </div>
    </div>
  );
}

export default EduRankPage;
