import { useState, useEffect } from "react";
import YearSelector from "../components/common/YearSelector";
import instituteDataApi from "../api/instituteData.api.js";
import {
  BarChart3,
  TrendingUp,
  Users,
  Building,
  GraduationCap,
  BookOpen,
  DollarSign,
  Download,
  Calendar,
  CheckCircle,
  AlertCircle,
  Loader2,
  PieChart as PieChartIcon,
} from "lucide-react";

// Professional minimal color palette
const COLORS = {
  primary: "#4F46E5", // Indigo
  secondary: "#10B981", // Emerald
  tertiary: "#F59E0B", // Amber
  quaternary: "#8B5CF6", // Violet
  success: "#10B981",
  warning: "#F59E0B",
  error: "#EF4444",
  neutral: "#6B7280",
};

// MetricCard Component
function MetricCard({ title, value, icon: Icon, color, subtitle }) {
  return (
    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        {subtitle && (
          <span className="text-sm font-medium text-gray-500">{subtitle}</span>
        )}
      </div>
      <h3 className="text-3xl font-bold text-gray-900 mb-1">{value}</h3>
      <p className="text-sm text-gray-600">{title}</p>
    </div>
  );
}

// Parameter Progress Chart
function ParameterProgressChart({ data, year }) {
  const categories = [
    { name: "Academic", color: COLORS.primary, count: 3 },
    { name: "Infrastructure", color: COLORS.secondary, count: 5 },
    { name: "Facilities", color: COLORS.tertiary, count: 6 },
    { name: "Administrative", color: COLORS.quaternary, count: 10 },
    { name: "Financial", color: COLORS.neutral, count: 2 },
  ];

  const filledCounts = categories.map(cat => {
    const categoryParams = getParametersByCategory(cat.name);
    return categoryParams.filter(param => data[param.fieldName] !== undefined && data[param.fieldName] !== "" && data[param.fieldName] !== null).length;
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Parameter Completion by Category</h3>
        <span className="text-sm text-gray-500">{year}</span>
      </div>
      <div className="space-y-3">
        {categories.map((category, index) => {
          const filled = filledCounts[index];
          const total = category.count;
          const percentage = Math.round((filled / total) * 100);
          
          return (
            <div key={category.name} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: category.color }}
                  />
                  <span className="text-sm font-medium text-gray-700">{category.name}</span>
                </div>
                <span className="text-sm font-semibold text-gray-900">
                  {filled}/{total} ({percentage}%)
                </span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div
                  className="h-2 rounded-full transition-all duration-500"
                  style={{
                    width: `${percentage}%`,
                    backgroundColor: category.color,
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Comparison Chart
function YearComparisonChart({ allData, selectedYear }) {
  const years = [...new Set(allData.map(d => d.academicYear))].sort((a, b) => a - b);
  
  // Calculate completion percentage for each year
  const completionData = years.map(year => {
    const data = allData.find(d => d.academicYear === year);
    if (!data) return 0;
    
    const totalParams = 27;
    const filledParams = Object.values(data).filter(v => 
      v !== undefined && v !== "" && v !== null && 
      typeof v !== 'object' && !['_id', 'instituteId', 'academicYear', 'createdAt', 'updatedAt', 'isVerified', 'source', 'uploadedBy', 'verifiedBy'].includes(v)
    ).length;
    
    return Math.round((filledParams / totalParams) * 100);
  });

  const maxValue = Math.max(...completionData, 100);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Year-over-Year Completion</h3>
        <TrendingUp className="w-5 h-5 text-gray-400" />
      </div>
      <div className="w-full h-48 flex items-end justify-between gap-2">
        {years.map((year, index) => {
          const isSelected = selectedYear === year;
          const value = completionData[index];
          
          return (
            <div key={year} className="flex flex-col items-center flex-1">
              <div
                className={`w-4/5 rounded-t-lg transition-all hover:opacity-90 ${
                  isSelected ? 'ring-2 ring-offset-2' : ''
                }`}
                style={{
                  height: `${(value / maxValue) * 100}%`,
                  backgroundColor: isSelected ? COLORS.primary : COLORS.neutral,
                  ringColor: COLORS.primary,
                }}
              />
              <span className="text-xs text-gray-500 mt-2">{year}</span>
              <span className="text-xs font-semibold text-gray-900 mt-1">{value}%</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Helper function to get parameters by category
function getParametersByCategory(category) {
  const parameterMappings = [
    // ACADEMIC PARAMETERS
    { fieldName: "teacherStudentRatio", label: "Teacher-Student Ratio", category: "Academic", dataType: "STRING" },
    { fieldName: "placementPercentage", label: "Placement percentage", category: "Academic", dataType: "INTEGER" },
    { fieldName: "studentsGoingForHigherStudies", label: "Students going for higher studies", category: "Academic", dataType: "INTEGER" },
    
    // INFRASTRUCTURE PARAMETERS
    { fieldName: "vacancyBoysHostelUG", label: "Vacancy in BOYS hostel (UG)", category: "Infrastructure", dataType: "INTEGER" },
    { fieldName: "vacancyGirlsHostelUG", label: "Vacancy in GIRLS hostel (UG)", category: "Infrastructure", dataType: "INTEGER" },
    { fieldName: "classroomCapacity", label: "Classroom capacity", category: "Infrastructure", dataType: "INTEGER" },
    { fieldName: "liftAvailable", label: "Lift available", category: "Infrastructure", dataType: "BOOLEAN" },
    { fieldName: "landAreaSqKm", label: "Land area (sqkm)", category: "Infrastructure", dataType: "DECIMAL" },
    
    // FACILITIES PARAMETERS
    { fieldName: "labsFacilities", label: "Labs facilities", category: "Facilities", dataType: "TEXT" },
    { fieldName: "labEquipments", label: "Lab equipments", category: "Facilities", dataType: "INTEGER" },
    { fieldName: "facultyStrength", label: "Faculty strength", category: "Facilities", dataType: "INTEGER" },
    { fieldName: "libraryResources", label: "Library resources", category: "Facilities", dataType: "TEXT" },
    { fieldName: "ictFacilities", label: "ICT facilities", category: "Facilities", dataType: "TEXT" },
    { fieldName: "availableWorkshops", label: "Available workshops", category: "Facilities", dataType: "INTEGER" },
    
    // ADMINISTRATIVE PARAMETERS
    { fieldName: "academicPlan", label: "Academic plan", category: "Administrative", dataType: "TEXT" },
    { fieldName: "complianceCertificate", label: "Compliance certificate", category: "Administrative", dataType: "TEXT" },
    { fieldName: "researchEnvironment", label: "Research environment", category: "Administrative", dataType: "TEXT" },
    { fieldName: "programJustification", label: "Program justification", category: "Administrative", dataType: "TEXT" },
    { fieldName: "qualificationOfFaculties", label: "Qualification of faculties", category: "Administrative", dataType: "TEXT" },
    { fieldName: "landOwnershipAndPossession", label: "Land ownership and possession", category: "Administrative", dataType: "TEXT" },
    { fieldName: "buildingPlanRequirement", label: "Building plan requirement", category: "Administrative", dataType: "TEXT" },
    { fieldName: "leadershipQualifications", label: "Leadership qualifications", category: "Administrative", dataType: "TEXT" },
    { fieldName: "institutionalNameNorms", label: "Institutional name norms", category: "Administrative", dataType: "TEXT" },
    { fieldName: "safetyCertificates", label: "Safety certificates", category: "Administrative", dataType: "TEXT" },
    
    // FINANCIAL PARAMETERS
    { fieldName: "financialCapacity", label: "Financial capacity", category: "Financial", dataType: "LONG" },
    { fieldName: "budgetAllocation", label: "Budget allocation", category: "Financial", dataType: "LONG" },
  ];

  return parameterMappings.filter(param => param.category === category);
}

const AnalyticsInsightsPage = () => {
  const [selectedYear, setSelectedYear] = useState(null);
  const [availableYears, setAvailableYears] = useState([]);
  const [allData, setAllData] = useState([]);
  const [selectedData, setSelectedData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load institute data
  useEffect(() => {
    loadInstituteData();
  }, []);

  // Update selected data when year changes
  useEffect(() => {
    if (selectedYear && allData.length > 0) {
      const data = allData.find(d => d.academicYear === selectedYear);
      setSelectedData(data || null);
    } else if (allData.length > 0) {
      // Default to most recent year
      const mostRecentYear = Math.max(...allData.map(d => d.academicYear));
      const data = allData.find(d => d.academicYear === mostRecentYear);
      setSelectedData(data || null);
      setSelectedYear(mostRecentYear);
    }
  }, [selectedYear, allData]);

  const loadInstituteData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Load all institute data
      const response = await instituteDataApi.getMyInstituteData();
      if (response.success) {
        const data = response.data?.data || response.data || [];
        setAllData(data);
        
        // Extract available years
        const years = [...new Set(data.map(d => d.academicYear))].sort((a, b) => b - a);
        setAvailableYears(years);
        
        if (years.length > 0) {
          setSelectedYear(years[0]);
        }
      } else {
        setError("Failed to load institute data");
      }
    } catch (err) {
      console.error("Error loading institute data:", err);
      setError("Failed to load institute data");
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate metrics
  const calculateMetrics = () => {
    if (!selectedData) return null;

    const totalParams = 27;
    const filledParams = Object.values(selectedData).filter(v => 
      v !== undefined && v !== "" && v !== null && 
      typeof v !== 'object' && !['_id', 'instituteId', 'academicYear', 'createdAt', 'updatedAt', 'isVerified', 'source', 'uploadedBy', 'verifiedBy'].includes(v)
    ).length;
    
    const completionPercentage = Math.round((filledParams / totalParams) * 100);

    // Calculate category-wise completion
    const categories = ["Academic", "Infrastructure", "Facilities", "Administrative", "Financial"];
    const categoryCompletion = categories.map(category => {
      const params = getParametersByCategory(category);
      const filled = params.filter(param => selectedData[param.fieldName] !== undefined && selectedData[param.fieldName] !== "" && selectedData[param.fieldName] !== null).length;
      return Math.round((filled / params.length) * 100);
    });

    return {
      completionPercentage,
      filledParams,
      totalParams,
      categoryCompletion,
      isVerified: selectedData.isVerified || false,
      lastUpdated: selectedData.updatedAt ? new Date(selectedData.updatedAt).toLocaleDateString() : 'N/A',
    };
  };

  const metrics = calculateMetrics();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto p-6">
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-12 h-12 animate-spin text-indigo-600 mb-4" />
            <p className="text-gray-600">Loading analytics data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto p-6">
          <div className="flex flex-col items-center justify-center py-20">
            <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Data</h3>
            <p className="text-gray-600">{error}</p>
            <button
              onClick={loadInstituteData}
              className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (allData.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto p-6">
          <div className="flex flex-col items-center justify-center py-20">
            <BarChart3 className="w-12 h-12 text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Data Available</h3>
            <p className="text-gray-600 mb-4">Submit parameter data to see analytics and insights</p>
            <a
              href="/institute/reports"
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              Go to Parameter Form
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Analytics & Insights</h1>
            <p className="text-base text-gray-500 mt-1">
              Visualize your institute's parameter data and track progress
            </p>
          </div>
          <div className="flex items-center gap-4">
            <YearSelector
              selectedYear={selectedYear || "all"}
              onYearChange={setSelectedYear}
              availableYears={availableYears}
            />
            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium">
              <Download className="w-4 h-4" /> Export Report
            </button>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricCard
            title="Data Completion"
            value={`${metrics?.completionPercentage || 0}%`}
            icon={CheckCircle}
            color="bg-emerald-500"
            subtitle={`${metrics?.filledParams || 0}/${metrics?.totalParams || 27} parameters`}
          />
          <MetricCard
            title="Academic Year"
            value={selectedYear || "N/A"}
            icon={Calendar}
            color="bg-indigo-500"
            subtitle="Selected period"
          />
          <MetricCard
            title="Verification Status"
            value={selectedData?.isVerified ? "Verified" : "Pending"}
            icon={selectedData?.isVerified ? CheckCircle : AlertCircle}
            color={selectedData?.isVerified ? "bg-emerald-500" : "bg-amber-500"}
            subtitle={metrics?.lastUpdated}
          />
          <MetricCard
            title="Data Source"
            value={selectedData?.source ? selectedData.source.replace("_", " ").toLowerCase() : "Web Form"}
            icon={BookOpen}
            color="bg-violet-500"
            subtitle="Submission method"
          />
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Parameter Progress by Category */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            {selectedData && (
              <ParameterProgressChart data={selectedData} year={selectedYear} />
            )}
          </div>

          {/* Year-over-Year Comparison */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <YearComparisonChart allData={allData} selectedYear={selectedYear} />
          </div>
        </div>

        {/* Category Performance */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Category Performance</h2>
              <p className="text-sm text-gray-500">Completion rates across parameter categories</p>
            </div>
            <PieChartIcon className="w-5 h-5 text-gray-400" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            {["Academic", "Infrastructure", "Facilities", "Administrative", "Financial"].map((category, index) => {
              const colors = [COLORS.primary, COLORS.secondary, COLORS.tertiary, COLORS.quaternary, COLORS.neutral];
              const percentage = metrics?.categoryCompletion?.[index] || 0;
              const params = getParametersByCategory(category);
              const filled = params.filter(param => selectedData?.[param.fieldName] !== undefined && selectedData?.[param.fieldName] !== "" && selectedData?.[param.fieldName] !== null).length;
              
              return (
                <div key={category} className="text-center">
                  <div className="relative w-32 h-32 mx-auto mb-4">
                    <svg className="w-full h-full" viewBox="0 0 100 100">
                      {/* Background circle */}
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        fill="none"
                        stroke="#E5E7EB"
                        strokeWidth="8"
                      />
                      {/* Progress circle */}
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        fill="none"
                        stroke={colors[index]}
                        strokeWidth="8"
                        strokeDasharray={`${percentage} ${100 - percentage}`}
                        strokeDashoffset="25"
                        transform="rotate(-90 50 50)"
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div>
                        <div className="text-2xl font-bold text-gray-900">{percentage}%</div>
                        <div className="text-xs text-gray-500">{filled}/{params.length}</div>
                      </div>
                    </div>
                  </div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-1">{category}</h3>
                  <p className="text-xs text-gray-500">{params.length} parameters</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Key Metrics Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="p-6 bg-indigo-50 rounded-xl border border-indigo-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <Users className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-900">Student Metrics</h3>
                <p className="text-xs text-gray-500">Placement & Higher Studies</p>
              </div>
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">Placement Percentage</p>
                <p className="text-xl font-bold text-gray-900">
                  {selectedData?.placementPercentage || "N/A"}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Higher Studies</p>
                <p className="text-xl font-bold text-gray-900">
                  {selectedData?.studentsGoingForHigherStudies || "N/A"}
                </p>
              </div>
            </div>
          </div>

          <div className="p-6 bg-emerald-50 rounded-xl border border-emerald-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-emerald-100 rounded-lg">
                <Building className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-900">Infrastructure</h3>
                <p className="text-xs text-gray-500">Capacity & Facilities</p>
              </div>
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">Classroom Capacity</p>
                <p className="text-xl font-bold text-gray-900">
                  {selectedData?.classroomCapacity || "N/A"}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Faculty Strength</p>
                <p className="text-xl font-bold text-gray-900">
                  {selectedData?.facultyStrength || "N/A"}
                </p>
              </div>
            </div>
          </div>

          <div className="p-6 bg-amber-50 rounded-xl border border-amber-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-amber-100 rounded-lg">
                <DollarSign className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-900">Financial</h3>
                <p className="text-xs text-gray-500">Budget & Capacity</p>
              </div>
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">Financial Capacity</p>
                <p className="text-xl font-bold text-gray-900">
                  {selectedData?.financialCapacity ? `₹${selectedData.financialCapacity.toLocaleString()}` : "N/A"}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Budget Allocation</p>
                <p className="text-xl font-bold text-gray-900">
                  {selectedData?.budgetAllocation ? `₹${selectedData.budgetAllocation.toLocaleString()}` : "N/A"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Insights Summary */}
        <div className="p-6 bg-gray-50 rounded-xl border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Key Insights</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-emerald-500 mt-0.5" />
                <div>
                  <h4 className="text-sm font-semibold text-gray-900">Data Quality</h4>
                  <p className="text-sm text-gray-600">
                    {metrics?.completionPercentage >= 80 
                      ? "Excellent data completeness. All major parameters are filled."
                      : metrics?.completionPercentage >= 60
                      ? "Good data coverage. Consider filling remaining parameters for better insights."
                      : "Data completeness needs improvement. Fill more parameters for comprehensive analysis."}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <TrendingUp className="w-5 h-5 text-indigo-500 mt-0.5" />
                <div>
                  <h4 className="text-sm font-semibold text-gray-900">Trend Analysis</h4>
                  <p className="text-sm text-gray-600">
                    {allData.length > 1 
                      ? `Data available for ${allData.length} academic years. Track progress over time using the year comparison chart.`
                      : "Single year data available. Submit data for more years to enable trend analysis."}
                  </p>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                {selectedData?.isVerified ? (
                  <CheckCircle className="w-5 h-5 text-emerald-500 mt-0.5" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-amber-500 mt-0.5" />
                )}
                <div>
                  <h4 className="text-sm font-semibold text-gray-900">Verification Status</h4>
                  <p className="text-sm text-gray-600">
                    {selectedData?.isVerified
                      ? "Data has been verified by administrators. This data is ready for official reporting."
                      : "Data is pending verification. Once verified, it will be marked as official."}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <GraduationCap className="w-5 h-5 text-violet-500 mt-0.5" />
                <div>
                  <h4 className="text-sm font-semibold text-gray-900">Recommendations</h4>
                  <p className="text-sm text-gray-600">
                    {metrics?.completionPercentage < 100
                      ? "Complete all 27 parameters for comprehensive institutional analysis and better compliance reporting."
                      : "All parameters are complete. Consider updating data annually to maintain accuracy."}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsInsightsPage;
