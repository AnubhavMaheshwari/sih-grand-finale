import { useState, useEffect, useCallback } from "react";
import { 
  Save, 
  FileText, 
  CheckCircle, 
  AlertCircle,
  Loader2,
  ChevronDown,
  ChevronUp,
  Calendar,
  Trash2,
  Edit,
  Database
} from "lucide-react";
import instituteDataApi from "../../api/instituteData.api.js";

function ParameterInput({ 
  parameter, 
  value, 
  onChange, 
  error
}) {
  // Add defensive checks
  if (!parameter) {
    return (
      <div className="space-y-2 p-4 border border-red-200 bg-red-50 rounded-lg">
        <p className="text-sm text-red-600">Error: Missing parameter configuration</p>
      </div>
    );
  }
  
  const { fieldName, label, dataType, notes } = parameter;
  
  const renderInput = () => {
    const inputClass = `w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
      error ? "border-red-500" : "border-gray-300"
    }`;
    
    switch (dataType) {
      case "STRING":
      case "TEXT":
        return (
          <textarea
            value={value || ""}
            onChange={(e) => onChange(fieldName, e.target.value)}
            className={inputClass}
            rows={dataType === "TEXT" ? 3 : 1}
            placeholder={`Enter ${label?.toLowerCase() || 'value'}...`}
          />
        );
      
      case "INTEGER":
      case "DECIMAL":
      case "LONG":
        return (
          <input
            type="number"
            value={value || ""}
            onChange={(e) => onChange(fieldName, e.target.value)}
            className={inputClass}
            placeholder={`Enter ${label?.toLowerCase() || 'value'}...`}
            step={dataType === "DECIMAL" ? "0.01" : "1"}
            min="0"
          />
        );
      
      case "BOOLEAN":
        return (
          <select
            value={value || ""}
            onChange={(e) => onChange(fieldName, e.target.value === "true")}
            className={inputClass}
          >
            <option value="">Select...</option>
            <option value="true">Yes</option>
            <option value="false">No</option>
          </select>
        );
      
      default:
        return (
          <input
            type="text"
            value={value || ""}
            onChange={(e) => onChange(fieldName, e.target.value)}
            className={inputClass}
            placeholder={`Enter ${label?.toLowerCase() || 'value'}...`}
          />
        );
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-700">
          {label || fieldName || "Unknown Parameter"}
          {notes && notes.trim() && <span className="text-xs text-gray-500 ml-2">({notes})</span>}
        </label>
      </div>
      
      {renderInput()}
      
      {error && (
        <p className="text-sm text-red-600 flex items-center gap-1">
          <AlertCircle className="w-4 h-4" />
          {error}
        </p>
      )}
      <div className="text-xs text-gray-500">
        Data type: <span className="font-medium">{dataType || "Unknown"}</span>
      </div>
    </div>
  );
}

function ParameterCategorySection({ 
  title, 
  parameters, 
  formData, 
  errors, 
  onChange,
  isExpanded,
  onToggle
}) {
  const filledCount = parameters.filter(p => formData[p.fieldName] !== undefined && formData[p.fieldName] !== "").length;
  const totalCount = parameters.length;

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full px-6 py-4 bg-gray-50 hover:bg-gray-100 flex items-center justify-between transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${isExpanded ? 'bg-indigo-100' : 'bg-gray-200'}`}>
            {isExpanded ? (
              <ChevronUp className="w-5 h-5 text-indigo-600" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-600" />
            )}
          </div>
            <div className="text-left">
              <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
              <p className="text-sm text-gray-600">
                {filledCount} of {totalCount} parameters filled
              </p>
            </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-32 bg-gray-200 rounded-full h-2">
            <div 
              className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(filledCount / totalCount) * 100}%` }}
            />
          </div>
          <span className="text-sm font-medium text-gray-700">
            {Math.round((filledCount / totalCount) * 100)}%
          </span>
        </div>
      </button>
      
      {isExpanded && (
        <div className="p-6 bg-white">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {parameters.map((param) => (
              <ParameterInput
                key={param.fieldName}
                parameter={param}
                value={formData[param.fieldName]}
                onChange={onChange}
                error={errors[param.fieldName]}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

const ReportsManagementPage = () => {
  const [activeTab, setActiveTab] = useState("form"); // form, data
  const [academicYear, setAcademicYear] = useState(new Date().getFullYear());
  const [parameterMappings, setParameterMappings] = useState({});
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [expandedCategories, setExpandedCategories] = useState({});
  const [existingData, setExistingData] = useState(null);
  const [allData, setAllData] = useState([]);
  const [isDeleting, setIsDeleting] = useState(false);

  // Load parameter mappings and existing data
  useEffect(() => {
    loadData();
  }, [academicYear]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      console.log("Loading data for academic year:", academicYear);
      
      // Load parameter mappings
      const mappingsResponse = await instituteDataApi.getParameterMappings();
      console.log("Parameter mappings response:", mappingsResponse);
      
      if (mappingsResponse.success && mappingsResponse.data) {
        // Ensure each parameter has a notes field
        const processedMappings = {};
        Object.entries(mappingsResponse.data).forEach(([category, parameters]) => {
          processedMappings[category] = parameters.map(param => ({
            ...param,
            notes: param.notes || "" // Add default notes field if missing
          }));
        });
        
        setParameterMappings(processedMappings);
        
        // Expand first category by default
        const categories = Object.keys(processedMappings);
        console.log("Loaded categories:", categories);
        if (categories.length > 0) {
          const initialExpanded = {};
          categories.forEach((cat, index) => {
            initialExpanded[cat] = index === 0; // Expand first category
          });
          setExpandedCategories(initialExpanded);
        }
      } else {
        console.error("Failed to load parameter mappings:", mappingsResponse);
        showToast("error", "Failed to load parameter mappings");
      }

      // Load existing data for this year
      const dataResponse = await instituteDataApi.getMyInstituteData(academicYear);
      console.log("Existing data response:", dataResponse);
      
      if (dataResponse.success && dataResponse.data) {
        setExistingData(dataResponse.data);
        setFormData(dataResponse.data);
      } else {
        setExistingData(null);
        setFormData({});
      }

      // Load all data for the institute
      const allDataResponse = await instituteDataApi.getMyInstituteData();
      console.log("All data response:", allDataResponse);
      
      if (allDataResponse.success) {
        // Handle different response structures
        let allData = [];
        if (allDataResponse.data && allDataResponse.data.data) {
          // Structure: { data: { data: [...] } }
          allData = allDataResponse.data.data || [];
        } else if (Array.isArray(allDataResponse.data)) {
          // Structure: { data: [...] }
          allData = allDataResponse.data;
        } else if (allDataResponse.data && Array.isArray(allDataResponse.data.data)) {
          // Alternative structure
          allData = allDataResponse.data.data;
        }
        console.log("Processed all data:", allData);
        setAllData(allData);
      }
    } catch (error) {
      console.error("Error loading data:", error);
      showToast("error", `Failed to load data: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const showToast = useCallback((type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  }, []);

  const handleParameterChange = (fieldName, value) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: value
    }));
    
    // Clear error for this field
    if (errors[fieldName]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[fieldName];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Check if parameterMappings is loaded
    if (Object.keys(parameterMappings).length === 0) {
      return true; // No mappings loaded yet, skip validation
    }
    
    // Basic validation - check required fields
    Object.values(parameterMappings).flat().forEach(param => {
      if (!param || !param.fieldName) return; // Skip invalid parameters
      
      const value = formData[param.fieldName];
      
      // For numeric fields, validate they're numbers
      if (value !== undefined && value !== "" && value !== null) {
        if (["INTEGER", "DECIMAL", "LONG"].includes(param.dataType)) {
          const numValue = Number(value);
          if (isNaN(numValue)) {
            newErrors[param.fieldName] = "Please enter a valid number";
          } else if (numValue < 0) {
            newErrors[param.fieldName] = "Value cannot be negative";
          }
        }
        
        // For teacher-student ratio, validate format
        if (param.fieldName === "teacherStudentRatio" && !value.includes(":")) {
          newErrors[param.fieldName] = "Please use format like '1:30'";
        }
      }
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      showToast("error", "Please fix the errors in the form");
      return;
    }

    try {
      setIsSaving(true);
      
      // Filter out empty values
      const dataToSave = Object.keys(formData).reduce((acc, key) => {
        if (formData[key] !== undefined && formData[key] !== "" && formData[key] !== null) {
          acc[key] = formData[key];
        }
        return acc;
      }, {});

      const response = existingData
        ? await instituteDataApi.updateMyInstituteData(dataToSave, academicYear)
        : await instituteDataApi.saveMyInstituteData(dataToSave, academicYear);

      if (response.success) {
        showToast("success", existingData ? "Data updated successfully" : "Data saved successfully");
        setExistingData(response.data);
        loadData(); // Refresh data
      } else {
        showToast("error", response.error || "Failed to save data");
      }
    } catch (error) {
      console.error("Error saving data:", error);
      showToast("error", "Failed to save data");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteData = async (year) => {
    if (!confirm(`Are you sure you want to delete data for academic year ${year}?`)) {
      return;
    }

    try {
      setIsDeleting(true);
      const response = await instituteDataApi.deleteInstituteData(year);
      
      if (response.success) {
        showToast("success", `Data for ${year} deleted successfully`);
        loadData(); // Refresh data
        
        // If we deleted the current year's data, clear the form
        if (year === academicYear) {
          setExistingData(null);
          setFormData({});
        }
      } else {
        showToast("error", response.error || "Failed to delete data");
      }
    } catch (error) {
      console.error("Error deleting data:", error);
      showToast("error", "Failed to delete data");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEditData = (year) => {
    // Find the data for the selected year
    const dataToEdit = allData.find(data => data.academicYear === year);
    if (dataToEdit) {
      setAcademicYear(year);
      setExistingData(dataToEdit);
      setFormData(dataToEdit);
      setActiveTab("form");
      showToast("info", `Editing data for academic year ${year}`);
    }
  };

  const toggleCategory = (category) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  const renderFormTab = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-12 h-12 animate-spin text-indigo-600 mb-4" />
          <p className="text-gray-600">Loading parameter form...</p>
        </div>
      );
    }

    const categories = Object.entries(parameterMappings);
    const totalFilled = Object.values(formData).filter(v => v !== undefined && v !== "" && v !== null).length;
    const totalParameters = categories.reduce((sum, [_, params]) => sum + params.length, 0);
    const completionPercentage = Math.round((totalFilled / totalParameters) * 100);

    return (
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-4">
              {/* Year Dropdown 2020-2025 */}
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-gray-500" />
                <select
                  value={academicYear}
                  onChange={(e) => setAcademicYear(parseInt(e.target.value))}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  {[2025, 2024, 2023, 2022, 2021].map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isSaving ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Save className="w-5 h-5" />
                )}
                {existingData ? "Update Data" : "Save Data"}
              </button>
            </div>
          </div>

        </div>

        {/* Parameter Categories */}
        <div className="space-y-6">
          {categories.map(([category, parameters]) => (
            <ParameterCategorySection
              key={category}
              title={category}
              parameters={parameters}
              formData={formData}
              errors={errors}
              onChange={handleParameterChange}
              isExpanded={expandedCategories[category] || false}
              onToggle={() => toggleCategory(category)}
            />
          ))}
        </div>

        {/* Save Button at Bottom */}
        <div className="mt-10 pt-6 border-t border-gray-200">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-gray-600">
                {existingData ? "Data last updated: " : "New data entry for "}
                {existingData ? new Date(existingData.updatedAt).toLocaleDateString() : academicYear}
              </p>
              {existingData?.source && (
                <p className="text-sm text-gray-500">
                  Source: {existingData.source.replace("_", " ").toLowerCase()}
                </p>
              )}
            </div>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-8 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSaving ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Save className="w-5 h-5" />
              )}
              {existingData ? "Update Data" : "Save Data"}
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderDataTab = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-12 h-12 animate-spin text-indigo-600 mb-4" />
          <p className="text-gray-600">Loading data...</p>
        </div>
      );
    }

    if (allData.length === 0) {
      return (
        <div className="max-w-4xl mx-auto text-center py-12">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Database className="w-10 h-10 text-gray-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">No Data Found</h2>
          <p className="text-gray-600 mb-6">
            You haven't submitted any parameter data yet. Use the form tab to enter your institute data.
          </p>
          <button
            onClick={() => setActiveTab("form")}
            className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700"
          >
            Go to Form
          </button>
        </div>
      );
    }

    return (
      <div className="max-w-6xl mx-auto">

        <div className="space-y-4">
          {allData.map((data) => {
            const lastUpdated = new Date(data.updatedAt).toLocaleDateString();
            
            return (
              <div key={data._id} className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  {/* Left side: Academic Year */}
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-indigo-50 rounded-xl">
                      <Calendar className="w-8 h-8 text-indigo-600" />
                    </div>
                    <div>
                      <p className="text-4xl font-bold text-indigo-700">{data.academicYear}</p>
                      <p className="text-sm text-gray-500 mt-1">Academic Year</p>
                    </div>
                  </div>
                  
                  {/* Middle: Last Updated and Status */}
                  <div className="flex-1">
                    <div className="space-y-2">
                      <div>
                        <p className="text-sm text-gray-500">Last Updated</p>
                        <p className="text-base font-medium text-gray-900">{lastUpdated}</p>
                      </div>
                      {data.isVerified && (
                        <div className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                          <CheckCircle className="w-3 h-3" />
                          Verified
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Right side: Actions */}
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleEditData(data.academicYear)}
                      className="px-4 py-2 bg-indigo-50 text-indigo-700 font-medium rounded-lg hover:bg-indigo-100 flex items-center gap-2"
                      title="Edit data"
                    >
                      <Edit className="w-4 h-4" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteData(data.academicYear)}
                      disabled={isDeleting}
                      className="px-4 py-2 bg-red-50 text-red-700 font-medium rounded-lg hover:bg-red-100 flex items-center gap-2 disabled:opacity-50"
                      title="Delete data"
                    >
                      {isDeleting ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    );
  };

  return (
    <>
      {/* Tab Navigation */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex space-x-1">
            <button
              onClick={() => setActiveTab("form")}
              className={`px-4 py-3 text-sm font-medium rounded-t-lg transition-colors ${
                activeTab === "form"
                  ? "bg-indigo-50 text-indigo-700 border-b-2 border-indigo-600"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Parameter Form
              </div>
            </button>
            <button
              onClick={() => setActiveTab("data")}
              className={`px-4 py-3 text-sm font-medium rounded-t-lg transition-colors ${
                activeTab === "data"
                  ? "bg-indigo-50 text-indigo-700 border-b-2 border-indigo-600"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4" />
                Submitted Data
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-6 bg-gray-50/50">
          {/* Content */}
          {activeTab === "form" && renderFormTab()}
          {activeTab === "data" && renderDataTab()}
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
    </>
  );
};

export default ReportsManagementPage;
