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
  BarChart3,
  History,
  Eye,
  Check,
  X,
  Sparkles,
  AlertTriangle
} from "lucide-react";
import YearSelector from "../../components/common/YearSelector.jsx";
import instituteDataApi from "../../api/instituteData.api.js";

function ParameterInput({ 
  parameter, 
  value, 
  onChange, 
  error,
  extractedValue = null,
  confidence = 0,
  onAcceptExtracted,
  onRejectExtracted,
  showExtraction = false
}) {
  const { fieldName, label, dataType, notes } = parameter;
  
  const hasExtractedValue = extractedValue !== null && extractedValue !== undefined;
  const isExtractedDifferent = hasExtractedValue && JSON.stringify(value) !== JSON.stringify(extractedValue);
  
  const renderInput = () => {
    const inputClass = `w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
      error ? "border-red-500" : "border-gray-300"
    } ${hasExtractedValue && showExtraction ? 'bg-blue-50 border-blue-200' : ''}`;
    
    switch (dataType) {
      case "STRING":
      case "TEXT":
        return (
          <textarea
            value={value || ""}
            onChange={(e) => onChange(fieldName, e.target.value)}
            className={inputClass}
            rows={dataType === "TEXT" ? 3 : 1}
            placeholder={`Enter ${label.toLowerCase()}...`}
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
            placeholder={`Enter ${label.toLowerCase()}...`}
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
            placeholder={`Enter ${label.toLowerCase()}...`}
          />
        );
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-700">
          {label}
          {notes && <span className="text-xs text-gray-500 ml-2">({notes})</span>}
        </label>
        {hasExtractedValue && showExtraction && (
          <div className="flex items-center gap-2">
            <span className={`text-xs px-2 py-1 rounded-full ${
              confidence >= 80 ? 'bg-green-100 text-green-800' :
              confidence >= 60 ? 'bg-yellow-100 text-yellow-800' :
              'bg-red-100 text-red-800'
            }`}>
              {confidence}% confidence
            </span>
          </div>
        )}
      </div>
      
      {renderInput()}
      
      {/* Extracted Value Display */}
      {hasExtractedValue && showExtraction && (
        <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-900">Extracted from document</span>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => onAcceptExtracted?.(fieldName)}
                className="p-1.5 text-green-600 hover:bg-green-100 rounded"
                title="Accept extracted value"
              >
                <Check className="w-4 h-4" />
              </button>
              <button
                onClick={() => onRejectExtracted?.(fieldName)}
                className="p-1.5 text-red-600 hover:bg-red-100 rounded"
                title="Reject extracted value"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className="text-sm text-blue-800">
            <span className="font-medium">Extracted value:</span> {extractedValue?.toString()}
          </div>
          {isExtractedDifferent && (
            <div className="mt-1 text-xs text-amber-700 flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" />
              Different from current value
            </div>
          )}
        </div>
      )}
      
      {error && (
        <p className="text-sm text-red-600 flex items-center gap-1">
          <AlertCircle className="w-4 h-4" />
          {error}
        </p>
      )}
      <div className="text-xs text-gray-500">
        Data type: <span className="font-medium">{dataType}</span>
      </div>
    </div>
  );
}

// Parameter Category Section
function ParameterCategorySection({ 
  title, 
  parameters, 
  formData, 
  errors, 
  onChange,
  isExpanded,
  onToggle,
  extractedData = {},
  showExtraction = false,
  onAcceptExtracted,
  onRejectExtracted
}) {
  const filledCount = parameters.filter(p => formData[p.fieldName] !== undefined && formData[p.fieldName] !== "").length;
  const totalCount = parameters.length;
  const extractedCount = parameters.filter(p => extractedData[p.fieldName] !== undefined).length;

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
                {extractedCount > 0 && showExtraction && (
                  <span className="ml-2 text-blue-600">
                    ({extractedCount} extracted)
                  </span>
                )}
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
            {parameters.map((param) => {
              const extractedInfo = extractedData[param.fieldName];
              return (
                <ParameterInput
                  key={param.fieldName}
                  parameter={param}
                  value={formData[param.fieldName]}
                  onChange={onChange}
                  error={errors[param.fieldName]}
                  extractedValue={extractedInfo?.extractedValue}
                  confidence={extractedInfo?.confidence}
                  showExtraction={showExtraction}
                  onAcceptExtracted={onAcceptExtracted}
                  onRejectExtracted={onRejectExtracted}
                />
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

const ParameterSubmissionPage = () => {
  const [activeTab, setActiveTab] = useState("form"); // form, dashboard
  const [academicYear, setAcademicYear] = useState(new Date().getFullYear());
  const [parameterMappings, setParameterMappings] = useState({});
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [expandedCategories, setExpandedCategories] = useState({});
  const [existingData, setExistingData] = useState(null);
  const [completenessStats, setCompletenessStats] = useState(null);
  const [extractedParameters, setExtractedParameters] = useState({});
  const [showExtractedValues, setShowExtractedValues] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [extractionMode, setExtractionMode] = useState('review'); // 'review', 'edit', 'normal'
  const [bulkAction, setBulkAction] = useState(null); // 'accept_all', 'reject_all'

  // Load parameter mappings and existing data
  useEffect(() => {
    loadData();
  }, [academicYear]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      
      // Load parameter mappings
      const mappingsResponse = await instituteDataApi.getParameterMappings();
      if (mappingsResponse.success) {
        setParameterMappings(mappingsResponse.data);
        
        // Expand first category by default
        const categories = Object.keys(mappingsResponse.data);
        if (categories.length > 0) {
          const initialExpanded = {};
          categories.forEach((cat, index) => {
            initialExpanded[cat] = index === 0; // Expand first category
          });
          setExpandedCategories(initialExpanded);
        }
      }

      // Load existing data for this year
      const dataResponse = await instituteDataApi.getMyInstituteData(academicYear);
      if (dataResponse.success && dataResponse.data) {
        setExistingData(dataResponse.data);
        setFormData(dataResponse.data);
        
        // Check if there are extracted parameters that need verification
        if (dataResponse.data.needsVerification && dataResponse.data.extractedParameters) {
          setShowExtractedValues(true);
          setExtractionMode('review'); // Start in review mode when there are extracted values
          
          // Convert extracted parameters Map to object with confidence scores
          const extractedObj = {};
          for (const [key, value] of Object.entries(dataResponse.data.extractedParameters)) {
            extractedObj[key] = {
              extractedValue: value,
              confidence: dataResponse.data.extractionMetadata?.confidenceScores?.[key] || 
                         dataResponse.data.extractionConfidence || 70,
              source: dataResponse.data.extractionMetadata?.extractedBy || 'llm_extractor'
            };
          }
          setExtractedParameters(extractedObj);
          
          // Auto-populate form with high-confidence extracted values (>80%)
          const highConfidenceData = {};
          Object.entries(extractedObj).forEach(([key, data]) => {
            if (data.confidence >= 80 && data.extractedValue !== null && data.extractedValue !== undefined) {
              highConfidenceData[key] = data.extractedValue;
            }
          });
          
          if (Object.keys(highConfidenceData).length > 0) {
            setFormData(prev => ({ ...prev, ...highConfidenceData }));
            showToast("info", `Auto-filled ${Object.keys(highConfidenceData).length} high-confidence values from extraction`);
          }
        }
      } else {
        setExistingData(null);
        setFormData({});
      }

      // Load completeness stats
      const statsResponse = await instituteDataApi.getMyCompletenessStats(academicYear);
      if (statsResponse.success) {
        setCompletenessStats(statsResponse.data);
      }
    } catch (error) {
      console.error("Error loading data:", error);
      showToast("error", "Failed to load data");
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
    
    // Basic validation - check required fields
    Object.values(parameterMappings).flat().forEach(param => {
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

  const handleAcceptExtracted = async (parameterName) => {
    try {
      setIsVerifying(true);
      const response = await instituteDataApi.acceptExtractedParameter(parameterName, academicYear);
      
      if (response.success) {
        // Update form data with accepted value
        const extractedValue = extractedParameters[parameterName]?.extractedValue;
        if (extractedValue !== undefined) {
          setFormData(prev => ({
            ...prev,
            [parameterName]: extractedValue
          }));
        }
        
        // Remove from extracted parameters
        const newExtracted = { ...extractedParameters };
        delete newExtracted[parameterName];
        setExtractedParameters(newExtracted);
        
        showToast("success", `Accepted extracted value for ${parameterName}`);
        
        // If no more extracted parameters, switch to normal mode
        if (Object.keys(newExtracted).length === 0) {
          setShowExtractedValues(false);
          setExtractionMode('normal');
        }
      } else {
        showToast("error", response.error || "Failed to accept extracted value");
      }
    } catch (error) {
      console.error("Error accepting extracted value:", error);
      showToast("error", "Failed to accept extracted value");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleRejectExtracted = async (parameterName) => {
    try {
      setIsVerifying(true);
      const response = await instituteDataApi.rejectExtractedParameter(parameterName, academicYear);
      
      if (response.success) {
        // Remove from extracted parameters
        const newExtracted = { ...extractedParameters };
        delete newExtracted[parameterName];
        setExtractedParameters(newExtracted);
        
        showToast("info", `Rejected extracted value for ${parameterName}`);
        
        // If no more extracted parameters, switch to normal mode
        if (Object.keys(newExtracted).length === 0) {
          setShowExtractedValues(false);
          setExtractionMode('normal');
        }
      } else {
        showToast("error", response.error || "Failed to reject extracted value");
      }
    } catch (error) {
      console.error("Error rejecting extracted value:", error);
      showToast("error", "Failed to reject extracted value");
    } finally {
      setIsVerifying(false);
    }
  };


  const toggleCategory = (category) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  // Bulk actions for extracted values
  const handleBulkAcceptAll = async () => {
    try {
      setIsVerifying(true);
      setBulkAction('accept_all');
      
      const extractedKeys = Object.keys(extractedParameters);
      let acceptedCount = 0;
      
      for (const paramName of extractedKeys) {
        const response = await instituteDataApi.acceptExtractedParameter(paramName, academicYear);
        if (response.success) {
          acceptedCount++;
          
          // Update form data
          const extractedValue = extractedParameters[paramName]?.extractedValue;
          if (extractedValue !== undefined) {
            setFormData(prev => ({
              ...prev,
              [paramName]: extractedValue
            }));
          }
        }
      }
      
      // Clear all extracted parameters
      setExtractedParameters({});
      setShowExtractedValues(false);
      setExtractionMode('normal');
      
      showToast("success", `Accepted ${acceptedCount} extracted values`);
    } catch (error) {
      console.error("Error in bulk accept:", error);
      showToast("error", "Failed to accept all extracted values");
    } finally {
      setIsVerifying(false);
      setBulkAction(null);
    }
  };

  const handleBulkRejectAll = async () => {
    try {
      setIsVerifying(true);
      setBulkAction('reject_all');
      
      const extractedKeys = Object.keys(extractedParameters);
      
      for (const paramName of extractedKeys) {
        await instituteDataApi.rejectExtractedParameter(paramName, academicYear);
      }
      
      // Clear all extracted parameters
      setExtractedParameters({});
      setShowExtractedValues(false);
      setExtractionMode('normal');
      
      showToast("info", `Rejected ${extractedKeys.length} extracted values`);
    } catch (error) {
      console.error("Error in bulk reject:", error);
      showToast("error", "Failed to reject all extracted values");
    } finally {
      setIsVerifying(false);
      setBulkAction(null);
    }
  };

  const handleEditExtracted = () => {
    setExtractionMode('edit');
    showToast("info", "Edit mode enabled. You can now modify extracted values.");
  };

  const handleSaveEdited = () => {
    setExtractionMode('review');
    showToast("success", "Changes saved. Review and accept/reject as needed.");
  };

  const handleCancelEdit = () => {
    setExtractionMode('review');
    showToast("info", "Edit mode cancelled.");
  };

  // Get extraction statistics
  const getExtractionStats = () => {
    const totalExtracted = Object.keys(extractedParameters).length;
    const highConfidence = Object.values(extractedParameters).filter(p => p.confidence >= 80).length;
    const mediumConfidence = Object.values(extractedParameters).filter(p => p.confidence >= 60 && p.confidence < 80).length;
    const lowConfidence = Object.values(extractedParameters).filter(p => p.confidence < 60).length;
    
    return { totalExtracted, highConfidence, mediumConfidence, lowConfidence };
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
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Parameter Data Submission</h1>
              <p className="text-gray-600 mt-2">
                Fill in all 27 parameters for academic year {academicYear}
                {existingData?.isVerified && (
                  <span className="ml-2 inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                    <CheckCircle className="w-3 h-3" />
                    Verified by Admin
                  </span>
                )}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <YearSelector
                selectedYear={academicYear}
                onYearChange={setAcademicYear}
              />
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

          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">
                Form Completion: {completionPercentage}%
              </span>
              <span className="text-sm text-gray-600">
                {totalFilled} of {totalParameters} parameters filled
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-indigo-600 h-3 rounded-full transition-all duration-500"
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
          </div>
        </div>

        {/* Extraction Review Banner */}
        {showExtractedValues && extractionMode === 'review' && (
          <div className="mb-8 p-6 bg-blue-50 border border-blue-200 rounded-xl">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <Sparkles className="w-6 h-6 text-blue-600" />
                  <h3 className="text-xl font-semibold text-blue-900">Review Extracted Data</h3>
                </div>
                <p className="text-blue-700">
                  {getExtractionStats().totalExtracted} parameters extracted from your document.
                  Review and accept/reject the extracted values below.
                </p>
                <div className="flex flex-wrap gap-4 mt-3">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-gray-700">
                      High confidence: {getExtractionStats().highConfidence}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <span className="text-sm text-gray-700">
                      Medium confidence: {getExtractionStats().mediumConfidence}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <span className="text-sm text-gray-700">
                      Low confidence: {getExtractionStats().lowConfidence}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleBulkAcceptAll}
                  disabled={isVerifying}
                  className="px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
                >
                  {bulkAction === 'accept_all' ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Check className="w-4 h-4" />
                  )}
                  Accept All
                </button>
                <button
                  onClick={handleBulkRejectAll}
                  disabled={isVerifying}
                  className="px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center gap-2"
                >
                  {bulkAction === 'reject_all' ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <X className="w-4 h-4" />
                  )}
                  Reject All
                </button>
                <button
                  onClick={handleEditExtracted}
                  className="px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 flex items-center gap-2"
                >
                  <Eye className="w-4 h-4" />
                  Edit Values
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Mode Banner */}
        {showExtractedValues && extractionMode === 'edit' && (
          <div className="mb-8 p-6 bg-amber-50 border border-amber-200 rounded-xl">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <AlertTriangle className="w-6 h-6 text-amber-600" />
                  <h3 className="text-xl font-semibold text-amber-900">Edit Extracted Data</h3>
                </div>
                <p className="text-amber-700">
                  You are now editing extracted values. Make changes as needed, then save to continue review.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleSaveEdited}
                  className="px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 flex items-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  Save Changes
                </button>
                <button
                  onClick={handleCancelEdit}
                  className="px-4 py-2 bg-gray-600 text-white font-medium rounded-lg hover:bg-gray-700 flex items-center gap-2"
                >
                  <X className="w-4 h-4" />
                  Cancel Edit
                </button>
              </div>
            </div>
          </div>
        )}

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
              extractedData={extractedParameters}
              showExtraction={showExtractedValues && extractionMode !== 'normal'}
              onAcceptExtracted={handleAcceptExtracted}
              onRejectExtracted={handleRejectExtracted}
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


  const renderDashboardTab = () => {
    if (!completenessStats) {
      return (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-12 h-12 animate-spin text-indigo-600 mb-4" />
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      );
    }

    return (
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Parameter Data Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Overview of your institute's parameter data for {academicYear}
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Completeness</h3>
              <BarChart3 className="w-6 h-6 text-indigo-600" />
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-2">
              {completenessStats.averageCompleteness || 0}%
            </div>
            <p className="text-gray-600">
              {completenessStats.totalRecords || 0} year(s) of data
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Verification</h3>
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-2">
              {completenessStats.verifiedCount || 0}
            </div>
            <p className="text-gray-600">
              Verified year(s) of data
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">History</h3>
              <History className="w-6 h-6 text-purple-600" />
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-2">
              {Object.keys(completenessStats.byYear || {}).length}
            </div>
            <p className="text-gray-600">
              Year(s) with data
            </p>
          </div>
        </div>

        {/* Year-wise Data */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Year-wise Data</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Academic Year</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Completeness</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Status</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Source</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">Last Updated</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(completenessStats.byYear || {}).map(([year, data]) => (
                  <tr key={year} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">{year}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-indigo-600 h-2 rounded-full"
                            style={{ width: `${data.completeness}%` }}
                          />
                        </div>
                        <span>{data.completeness}%</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      {data.isVerified ? (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                          <CheckCircle className="w-3 h-3" />
                          Verified
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">
                          Pending
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {data.source?.replace("_", " ").toLowerCase() || "N/A"}
                    </td>
                    <td className="py-3 px-4">
                      {new Date(data.lastUpdated).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
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
                onClick={() => setActiveTab("dashboard")}
                className={`px-4 py-3 text-sm font-medium rounded-t-lg transition-colors ${
                  activeTab === "dashboard"
                    ? "bg-indigo-50 text-indigo-700 border-b-2 border-indigo-600"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4" />
                  Dashboard
                </div>
              </button>
            </div>
          </div>
        </div>

        <main className="h-full overflow-y-auto p-6 scroll-smooth bg-gray-50/50">
          {/* Year Selector */}
          <div className="mb-6 max-w-7xl mx-auto">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-gray-700">
                <Calendar className="w-5 h-5" />
                <span className="font-medium">Academic Year:</span>
              </div>
              <YearSelector
                selectedYear={academicYear}
                onYearChange={setAcademicYear}
              />
            </div>
          </div>

          {/* Content */}
          {activeTab === "form" && renderFormTab()}
          {activeTab === "dashboard" && renderDashboardTab()}
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

export default ParameterSubmissionPage;
