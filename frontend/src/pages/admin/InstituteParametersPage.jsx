import { useState, useEffect, useCallback } from "react";
import { 
  Search, 
  Filter, 
  CheckCircle, 
  XCircle, 
  Eye, 
  Download,
  BarChart3,
  Calendar,
  Building,
  Loader2,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  FileText
} from "lucide-react";
import YearSelector from "../../components/common/YearSelector.jsx";
import adminApi from "../../api/admin.api.js";

// Institute Parameter Card Component
function InstituteParameterCard({ institute, parameterData, onView, onVerify }) {
  const [isExpanded, setIsExpanded] = useState(false);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const getStatusBadge = (isVerified) => {
    if (isVerified) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
          <CheckCircle className="w-3 h-3" />
          Verified
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">
          Pending Verification
        </span>
      );
    }
  };

  const getSourceBadge = (source) => {
    const sourceMap = {
      'WEB_FORM': { color: 'bg-blue-100 text-blue-800', label: 'Web Form' },
      'CSV_UPLOAD': { color: 'bg-purple-100 text-purple-800', label: 'CSV Upload' },
      'PDF_PARSER': { color: 'bg-red-100 text-red-800', label: 'PDF Parser' },
      'ADMIN_VERIFICATION': { color: 'bg-green-100 text-green-800', label: 'Admin Verified' }
    };
    
    const sourceInfo = sourceMap[source] || { color: 'bg-gray-100 text-gray-800', label: source };
    
    return (
      <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${sourceInfo.color}`}>
        {sourceInfo.label}
      </span>
    );
  };

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      <div className="p-6 bg-white">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <Building className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {institute?.instituteName || institute?.name || 'Unknown Institute'}
                </h3>
                <p className="text-sm text-gray-600">
                  ID: {parameterData.instituteId} • Year: {parameterData.academicYear}
                </p>
              </div>
            </div>
            
            <div className="flex flex-wrap items-center gap-2 mt-2">
              {getStatusBadge(parameterData.isVerified)}
              {getSourceBadge(parameterData.source)}
              <span className="text-sm text-gray-600">
                Completeness: <span className="font-medium">{parameterData.completeness}%</span>
              </span>
              <span className="text-sm text-gray-600">
                Last updated: {formatDate(parameterData.updatedAt)}
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
              title={isExpanded ? "Collapse" : "Expand"}
            >
              {isExpanded ? (
                <ChevronUp className="w-5 h-5" />
              ) : (
                <ChevronDown className="w-5 h-5" />
              )}
            </button>
            <button
              onClick={() => onView(parameterData)}
              className="p-2 text-gray-500 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors"
              title="View Details"
            >
              <Eye className="w-5 h-5" />
            </button>
            {!parameterData.isVerified && (
              <button
                onClick={() => onVerify(parameterData._id)}
                className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors"
              >
                Verify
              </button>
            )}
          </div>
        </div>
        
        {isExpanded && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h4 className="text-sm font-semibold text-gray-900 mb-3">Parameter Summary</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-xs text-gray-600">Total Parameters</p>
                <p className="text-lg font-semibold text-gray-900">
                  {Object.keys(parameterData.parameters || {}).length}
                </p>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-xs text-gray-600">Completeness</p>
                <p className="text-lg font-semibold text-gray-900">
                  {parameterData.completeness}%
                </p>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-xs text-gray-600">Source</p>
                <p className="text-lg font-semibold text-gray-900">
                  {parameterData.source.replace('_', ' ')}
                </p>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-xs text-gray-600">Last Updated</p>
                <p className="text-sm font-semibold text-gray-900">
                  {formatDate(parameterData.updatedAt)}
                </p>
              </div>
            </div>
            
            <div className="mt-4">
              <h5 className="text-sm font-medium text-gray-700 mb-2">Sample Parameters:</h5>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {Object.entries(parameterData.parameters || {}).slice(0, 4).map(([key, param]) => (
                  <div key={key} className="flex items-center justify-between p-2 bg-white border border-gray-100 rounded">
                    <span className="text-sm text-gray-700 truncate">{param.originalName}</span>
                    <span className="text-sm font-medium text-gray-900">
                      {typeof param.value === 'boolean' ? (param.value ? 'Yes' : 'No') : param.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const InstituteParametersPage = () => {
  const [academicYear, setAcademicYear] = useState(new Date().getFullYear());
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // all, verified, pending
  const [sourceFilter, setSourceFilter] = useState("all"); // all, web_form, csv_upload, pdf_parser
  const [instituteData, setInstituteData] = useState([]);
  const [institutes, setInstitutes] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isVerifying, setIsVerifying] = useState(false);
  const [toast, setToast] = useState(null);

  // Load institute parameter data
  useEffect(() => {
    loadData();
  }, [academicYear]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      
      // Load all institute parameter data for the selected year
      const response = await adminApi.getAllInstituteData(academicYear);
      
      if (response.success && response.data) {
        setInstituteData(response.data.data || []);
        
        // Load institute details for each data entry
        const instituteIds = [...new Set(response.data.data.map(item => item.instituteId))];
        const institutePromises = instituteIds.map(id => adminApi.getInstituteById(id));
        const instituteResults = await Promise.allSettled(institutePromises);
        
        const instituteMap = {};
        instituteResults.forEach((result, index) => {
          if (result.status === 'fulfilled' && result.value.success) {
            instituteMap[instituteIds[index]] = result.value.data;
          }
        });
        
        setInstitutes(instituteMap);
      }
    } catch (error) {
      console.error("Error loading institute parameter data:", error);
      showToast("error", "Failed to load institute parameter data");
    } finally {
      setIsLoading(false);
    }
  };

  const showToast = useCallback((type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  }, []);

  const handleVerify = async (dataId) => {
    if (!window.confirm("Are you sure you want to verify this institute's parameter data?")) {
      return;
    }

    try {
      setIsVerifying(true);
      const response = await adminApi.verifyInstituteData(dataId);
      
      if (response.success) {
        showToast("success", "Institute data verified successfully");
        loadData(); // Refresh data
      } else {
        showToast("error", response.error || "Failed to verify institute data");
      }
    } catch (error) {
      console.error("Error verifying institute data:", error);
      showToast("error", "Failed to verify institute data");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleViewDetails = (parameterData) => {
    // Open modal or navigate to detailed view
    const detailsWindow = window.open('', '_blank');
    if (detailsWindow) {
      detailsWindow.document.write(`
        <html>
          <head>
            <title>Institute Parameter Details</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 20px; }
              .header { background: #f3f4f6; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
              .parameter { border: 1px solid #e5e7eb; padding: 12px; margin-bottom: 8px; border-radius: 6px; }
              .parameter-name { font-weight: bold; color: #374151; }
              .parameter-value { color: #059669; }
              .parameter-type { color: #6b7280; font-size: 0.875rem; }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>Institute Parameter Details</h1>
              <p><strong>Institute ID:</strong> ${parameterData.instituteId}</p>
              <p><strong>Academic Year:</strong> ${parameterData.academicYear}</p>
              <p><strong>Status:</strong> ${parameterData.isVerified ? 'Verified' : 'Pending'}</p>
              <p><strong>Completeness:</strong> ${parameterData.completeness}%</p>
              <p><strong>Source:</strong> ${parameterData.source}</p>
              <p><strong>Last Updated:</strong> ${new Date(parameterData.updatedAt).toLocaleString()}</p>
            </div>
            <h2>Parameters (${Object.keys(parameterData.parameters || {}).length})</h2>
            ${Object.entries(parameterData.parameters || {}).map(([key, param]) => `
              <div class="parameter">
                <div class="parameter-name">${param.originalName}</div>
                <div class="parameter-value">Value: ${typeof param.value === 'boolean' ? (param.value ? 'Yes' : 'No') : param.value}</div>
                <div class="parameter-type">Type: ${param.dataType} • Last Updated: ${new Date(param.lastUpdated).toLocaleString()}</div>
              </div>
            `).join('')}
          </body>
        </html>
      `);
      detailsWindow.document.close();
    }
  };

  const handleExportData = async () => {
    try {
      // Create CSV data
      const csvRows = [];
      
      // Header row
      const headers = ['Institute ID', 'Institute Name', 'Academic Year', 'Status', 'Completeness', 'Source', 'Last Updated'];
      csvRows.push(headers.join(','));
      
      // Data rows
      instituteData.forEach(data => {
        const institute = institutes[data.instituteId];
        const row = [
          data.instituteId,
          institute?.instituteName || institute?.name || 'N/A',
          data.academicYear,
          data.isVerified ? 'Verified' : 'Pending',
          `${data.completeness}%`,
          data.source,
          new Date(data.updatedAt).toISOString()
        ];
        csvRows.push(row.map(cell => `"${cell}"`).join(','));
      });
      
      // Create and download CSV file
      const csvContent = csvRows.join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `institute_parameters_${academicYear}_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      showToast("success", "Data exported successfully");
    } catch (error) {
      console.error("Error exporting data:", error);
      showToast("error", "Failed to export data");
    }
  };

  // Filter data based on search and filters
  const filteredData = instituteData.filter(data => {
    const institute = institutes[data.instituteId];
    const instituteName = institute?.instituteName || institute?.name || '';
    
    // Search filter
    if (searchQuery && !instituteName.toLowerCase().includes(searchQuery.toLowerCase()) && 
        !data.instituteId.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    
    // Status filter
    if (statusFilter !== 'all') {
      if (statusFilter === 'verified' && !data.isVerified) return false;
      if (statusFilter === 'pending' && data.isVerified) return false;
    }
    
    // Source filter
    if (sourceFilter !== 'all' && data.source !== sourceFilter) {
      return false;
    }
    
    return true;
  });

  const stats = {
    total: instituteData.length,
    verified: instituteData.filter(d => d.isVerified).length,
    pending: instituteData.filter(d => !d.isVerified).length,
    averageCompleteness: instituteData.length > 0 
      ? Math.round(instituteData.reduce((sum, d) => sum + d.completeness, 0) / instituteData.length)
      : 0
  };

  return (
    <div className="h-full overflow-hidden bg-white">
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Institute Parameter Management</h1>
                <p className="text-gray-600 mt-2">
                  View and verify parameter data submitted by institutes
                </p>
              </div>
              <div className="flex items-center gap-4">
                <YearSelector
                  selectedYear={academicYear}
                  onYearChange={setAcademicYear}
                />
                <button
                  onClick={handleExportData}
                  className="px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Export Data
                </button>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-gray-600">Total Institutes</h3>
                  <Building className="w-5 h-5 text-indigo-600" />
                </div>
                <p className="text-2xl font-bold text-gray-900 mt-2">{stats.total}</p>
              </div>
              
              <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-gray-600">Verified</h3>
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </div>
                <p className="text-2xl font-bold text-gray-900 mt-2">{stats.verified}</p>
              </div>
              
              <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-gray-600">Pending</h3>
                  <AlertCircle className="w-5 h-5 text-yellow-600" />
                </div>
                <p className="text-2xl font-bold text-gray-900 mt-2">{stats.pending}</p>
              </div>
              
              <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-gray-600">Avg. Completeness</h3>
                  <BarChart3 className="w-5 h-5 text-indigo-600" />
                </div>
                <p className="text-2xl font-bold text-gray-900 mt-2">{stats.averageCompleteness}%</p>
              </div>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm mb-6">
              <div className="flex flex-col md:flex-row md:items-center gap-4">
                {/* Search */}
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search by institute name or ID..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                </div>
                
                {/* Status Filter */}
                <div className="flex items-center gap-2">
                  <Filter className="w-5 h-5 text-gray-400" />
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="all">All Status</option>
                    <option value="verified">Verified Only</option>
                    <option value="pending">Pending Only</option>
                  </select>
                </div>
                
                {/* Source Filter */}
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-gray-400" />
                  <select
                    value={sourceFilter}
                    onChange={(e) => setSourceFilter(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="all">All Sources</option>
                    <option value="WEB_FORM">Web Form</option>
                    <option value="CSV_UPLOAD">CSV Upload</option>
                    <option value="PDF_PARSER">PDF Parser</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="w-12 h-12 animate-spin text-indigo-600 mb-4" />
              <p className="text-gray-600">Loading institute parameter data...</p>
            </div>
          ) : filteredData.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
                <Building className="w-8 h-8 text-gray-300" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">
                No institute parameter data found
              </h3>
              <p className="text-base text-gray-500 max-w-sm mt-2 text-center">
                {searchQuery || statusFilter !== 'all' || sourceFilter !== 'all'
                  ? "No data matches your filters. Try adjusting your search criteria."
                  : `No institute has submitted parameter data for academic year ${academicYear} yet.`}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredData.map((data) => (
                <InstituteParameterCard
                  key={data._id}
                  institute={institutes[data.instituteId]}
                  parameterData={data}
                  onView={handleViewDetails}
                  onVerify={handleVerify}
                />
              ))}
            </div>
          )}
        </div>
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
            <CheckCircle className="w-5 h-5" />
          ) : (
            <AlertCircle className="w-5 h-5" />
          )}
          <span className="text-base">{toast.message}</span>
        </div>
      )}
    </div>
  );
};

export default InstituteParametersPage;
