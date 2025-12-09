import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import adminApi from "../../api/admin.api.js";
import InstituteCard from "../../components/admin/InstituteCard.jsx";

const AdminInstitutesPage = () => {
  const navigate = useNavigate();
  const [institutes, setInstitutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedInstitutes, setSelectedInstitutes] = useState(new Set());

  const toggleSelection = (id) => {
    setSelectedInstitutes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const clearSelection = () => {
    setSelectedInstitutes(new Set());
  };

  const handleCompare = () => {
    if (selectedInstitutes.size < 2) return;
    const ids = Array.from(selectedInstitutes).join(",");
    // Open in new tab
    window.open(`/admin/compare?ids=${ids}`, '_blank');
  };

  // Fetch institutes data
  useEffect(() => {
    fetchInstitutes();
  }, []);

  const fetchInstitutes = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get all institutes with their latest data
      const response = await adminApi.getAllInstitutesWithData();

      if (response.success) {
        // Transform the data for display
        const institutesList = response.data.map(institute => {
          // Determine location - try to extract from data or use default
          let location = "Unknown";
          if (institute.location) {
            location = institute.location;
          } else if (institute.latestData?.extractedParameters) {
            // Handle both Map (from MongoDB) and plain object (from JSON serialization)
            const extractedParams = institute.latestData.extractedParameters;
            if (typeof extractedParams.get === 'function') {
              // It's a Map
              location = extractedParams.get("location") || "Unknown";
            } else if (extractedParams.location) {
              // It's a plain object
              location = extractedParams.location;
            }
          }

          // Determine status based on data completeness and verification
          let status = "Inactive";
          if (institute.latestData) {
            if (institute.isVerified) {
              status = "Verified";
            } else if (institute.completenessScore > 50) {
              status = "Active";
            } else {
              status = "Needs Data";
            }
          }

          // Format upload date
          let uploadDate = "N/A";
          if (institute.lastUpdated) {
            uploadDate = new Date(institute.lastUpdated).toISOString().split('T')[0];
          }

          return {
            id: institute.instituteId,
            name: institute.instituteName,
            type: institute.instituteType,
            location: location,
            established: "N/A", // Not available in current schema
            status: status,
            users: institute.users?.length || 0,
            lastUpdated: uploadDate,
            uploadedBy: institute.uploadedBy || "Unknown",
            uploadDate: uploadDate,
            hasData: institute.latestData !== null,
            latestData: institute.latestData,
            completenessScore: institute.completenessScore || 0,
            isVerified: institute.isVerified || false,
          };
        });

        setInstitutes(institutesList);
      } else {
        setError(response.error || "Failed to load institutes data");
      }
    } catch (err) {
      console.error("Error fetching institutes:", err);
      setError(err.response?.data?.error || "Failed to connect to server");
    } finally {
      setLoading(false);
    }
  };

  const handleViewInsights = (institute) => {
    // Navigate to the analytics page for this institute
    navigate(`/admin/institutes/${institute.id}/analytics`);
  };

  const filteredInstitutes = institutes.filter(institute => {
    return institute.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      institute.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      institute.id.toLowerCase().includes(searchTerm.toLowerCase());
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {error && (
        <div className="p-4 mb-6 text-sm text-red-700 bg-red-100 rounded-lg">
          <div className="flex items-center">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <span>{error}</span>
            <button
              onClick={fetchInstitutes}
              className="ml-auto text-sm font-medium text-red-700 hover:text-red-800"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {/* Search bar */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
        <div className="relative">
          <input
            type="text"
            placeholder="Search institutes by name, location, or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
          <div className="absolute left-3 top-2.5">
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Institutes Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 pb-20">
        {filteredInstitutes.map((institute) => (
          <InstituteCard
            key={institute.id}
            institute={institute}
            onViewInsights={handleViewInsights}
            selected={selectedInstitutes.has(institute.id)}
            onToggleSelect={toggleSelection}
          />
        ))}
      </div>

      {/* Comparison Floating Bar */}
      {selectedInstitutes.size > 0 && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-white rounded-full shadow-xl border border-gray-200 p-2 px-6 flex items-center gap-4 z-50 animate-in fade-in slide-in-from-bottom-4">
          <span className="text-sm font-medium text-gray-700">
            {selectedInstitutes.size} selected
          </span>
          <div className="h-4 w-px bg-gray-300" />
          <button
            onClick={clearSelection}
            className="text-sm text-gray-500 hover:text-gray-700 font-medium"
          >
            Clear
          </button>
          <button
            onClick={handleCompare}
            disabled={selectedInstitutes.size < 2}
            className={`
              bg-indigo-600 text-white px-4 py-1.5 rounded-full text-sm font-medium transition-colors flex items-center gap-2
              ${selectedInstitutes.size < 2 ? 'opacity-50 cursor-not-allowed hidden' : 'hover:bg-indigo-700'}
            `}
          >
            Compare Selected
          </button>
          {selectedInstitutes.size < 2 && (
            <span className="text-xs text-gray-400 italic">Select at least 2</span>
          )}
        </div>
      )}

      {/* No results message */}
      {filteredInstitutes.length === 0 && !loading && (
        <div className="text-center py-12">
          <svg className="w-16 h-16 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="mt-4 text-lg font-medium text-gray-900">No institutes found</h3>
          <p className="mt-1 text-gray-500">Try adjusting your search or filter to find what you're looking for.</p>
        </div>
      )}
    </div>
  );
};

export default AdminInstitutesPage;
