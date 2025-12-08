import { useState, useEffect } from "react";
import YearSelector from "../components/common/YearSelector";
import {
  BarChart3,
  PieChart,
  TrendingUp,
  FileText,
  CheckCircle,
  AlertCircle,
  Clock,
  Download,
  Filter,
  Calendar,
} from "lucide-react";

// Mock data for visualizations
const mockData = {
  years: [2020, 2021, 2022, 2023, 2024],
  documentsByYear: {
    2020: 5,
    2021: 8,
    2022: 12,
    2023: 15,
    2024: 7,
  },
  documentStatus: {
    parsed: 32,
    parsing: 5,
    error: 3,
    uploaded: 8,
  },
  complianceMetrics: {
    studentIntake: 85,
    facultyRatio: 92,
    infrastructure: 78,
    researchOutput: 65,
  },
  monthlyUploads: [3, 5, 7, 4, 6, 8, 10, 9, 7, 8, 6, 5],
};


// MetricCard Component
function MetricCard({ title, value, icon: Icon, color, trend }) {
  return (
    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-2 rounded-lg ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        {trend && (
          <span className={`text-sm font-medium ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
            {trend > 0 ? '+' : ''}{trend}%
          </span>
        )}
      </div>
      <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
      <p className="text-sm text-gray-500 mt-1">{title}</p>
    </div>
  );
}

// BarChart Component
function SimpleBarChart({ data, labels, color = "#4F46E5" }) {
  const maxValue = Math.max(...data);
  
  return (
    <div className="w-full h-48 flex items-end justify-between gap-1">
      {data.map((value, index) => (
        <div key={index} className="flex flex-col items-center flex-1">
          <div
            className="w-3/4 rounded-t-lg transition-all hover:opacity-80"
            style={{
              height: `${(value / maxValue) * 100}%`,
              backgroundColor: color,
            }}
          />
          <span className="text-xs text-gray-500 mt-2">{labels[index]}</span>
        </div>
      ))}
    </div>
  );
}

// PieChart Component
function SimplePieChart({ data, colors }) {
  const total = Object.values(data).reduce((sum, value) => sum + value, 0);
  let cumulativePercent = 0;

  return (
    <div className="relative w-48 h-48">
      <svg viewBox="0 0 100 100" className="w-full h-full">
        {Object.entries(data).map(([key, value], index) => {
          const percent = (value / total) * 100;
          const startPercent = cumulativePercent;
          cumulativePercent += percent;
          
          return (
            <circle
              key={key}
              cx="50"
              cy="50"
              r="40"
              fill="transparent"
              stroke={colors[index % colors.length]}
              strokeWidth="20"
              strokeDasharray={`${percent} ${100 - percent}`}
              strokeDashoffset={`${-startPercent + 25}`}
              transform="rotate(-90 50 50)"
            />
          );
        })}
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900">{total}</div>
          <div className="text-xs text-gray-500">Total</div>
        </div>
      </div>
    </div>
  );
}

const AnalyticsInsightsPage = () => {
  const [selectedYear, setSelectedYear] = useState(null);
  const [availableYears, setAvailableYears] = useState(mockData.years);
  const [filteredData, setFilteredData] = useState(mockData);

  useEffect(() => {
    // Filter data based on selected year
    if (selectedYear) {
      setFilteredData({
        ...mockData,
        documentsByYear: {
          [selectedYear]: mockData.documentsByYear[selectedYear] || 0,
        },
        // In a real app, you would filter all data by year
      });
    } else {
      setFilteredData(mockData);
    }
  }, [selectedYear]);

  const documentStatusColors = ["#10B981", "#F59E0B", "#EF4444", "#3B82F6"];
  const complianceColors = ["#4F46E5", "#10B981", "#F59E0B", "#8B5CF6"];

  return (
      <div className="h-full overflow-hidden bg-gray-50">
        <div className="max-w-7xl mx-auto p-6">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Analytics & Insights</h1>
              <p className="text-base text-gray-500 mt-1">
                Visualize your institute's data and track compliance metrics.
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
              title="Total Documents"
              value={Object.values(filteredData.documentsByYear).reduce((a, b) => a + b, 0)}
              icon={FileText}
              color="bg-indigo-500"
              trend={12}
            />
            <MetricCard
              title="Parsed Successfully"
              value={filteredData.documentStatus.parsed}
              icon={CheckCircle}
              color="bg-green-500"
              trend={8}
            />
            <MetricCard
              title="Under Processing"
              value={filteredData.documentStatus.parsing}
              icon={Clock}
              color="bg-yellow-500"
              trend={-3}
            />
            <MetricCard
              title="Requires Attention"
              value={filteredData.documentStatus.error}
              icon={AlertCircle}
              color="bg-red-500"
              trend={2}
            />
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Documents by Year */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">Documents by Year</h2>
                <BarChart3 className="w-5 h-5 text-gray-400" />
              </div>
              <SimpleBarChart
                data={Object.values(filteredData.documentsByYear)}
                labels={Object.keys(filteredData.documentsByYear)}
                color="#4F46E5"
              />
              <div className="mt-4 text-sm text-gray-500">
                {selectedYear 
                  ? `Showing documents for ${selectedYear}`
                  : "Showing documents across all years"}
              </div>
            </div>

            {/* Document Status Distribution */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900">Document Status</h2>
                <PieChart className="w-5 h-5 text-gray-400" />
              </div>
              <div className="flex flex-col md:flex-row items-center justify-between">
                <SimplePieChart
                  data={filteredData.documentStatus}
                  colors={documentStatusColors}
                />
                <div className="mt-6 md:mt-0 md:ml-6 space-y-3">
                  {Object.entries(filteredData.documentStatus).map(([key, value], index) => (
                    <div key={key} className="flex items-center">
                      <div
                        className="w-3 h-3 rounded-full mr-2"
                        style={{ backgroundColor: documentStatusColors[index] }}
                      />
                      <span className="text-sm text-gray-700 capitalize">{key}:</span>
                      <span className="ml-2 text-sm font-semibold">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Compliance Metrics */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm mb-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Compliance Metrics</h2>
                <p className="text-sm text-gray-500">Based on uploaded documents and UGC/AICTE standards</p>
              </div>
              <TrendingUp className="w-5 h-5 text-gray-400" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {Object.entries(filteredData.complianceMetrics).map(([key, value], index) => (
                <div key={key} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700 capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </span>
                    <span className="text-sm font-semibold text-gray-900">{value}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="h-2 rounded-full"
                      style={{
                        width: `${value}%`,
                        backgroundColor: complianceColors[index],
                      }}
                    />
                  </div>
                  <div className="flex items-center text-xs text-gray-500">
                    {value >= 90 ? "Excellent" : value >= 75 ? "Good" : value >= 60 ? "Fair" : "Needs Improvement"}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Monthly Upload Trend */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Monthly Upload Trend</h2>
                <p className="text-sm text-gray-500">Document upload activity over the past year</p>
              </div>
              <Filter className="w-5 h-5 text-gray-400" />
            </div>
            <SimpleBarChart
              data={filteredData.monthlyUploads}
              labels={['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']}
              color="#10B981"
            />
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-4 bg-blue-50 rounded-lg">
                <h3 className="text-sm font-semibold text-gray-900 mb-2">Peak Upload Month</h3>
                <p className="text-2xl font-bold text-gray-900">July</p>
                <p className="text-sm text-gray-500">10 documents uploaded</p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <h3 className="text-sm font-semibold text-gray-900 mb-2">Average Monthly Uploads</h3>
                <p className="text-2xl font-bold text-gray-900">6.8</p>
                <p className="text-sm text-gray-500">Documents per month</p>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg">
                <h3 className="text-sm font-semibold text-gray-900 mb-2">Year-over-Year Growth</h3>
                <p className="text-2xl font-bold text-gray-900">+24%</p>
                <p className="text-sm text-gray-500">Compared to last year</p>
              </div>
            </div>
          </div>

          {/* Insights Summary */}
          <div className="mt-8 p-6 bg-indigo-50 rounded-xl border border-indigo-200">
            <h3 className="text-lg font-semibold text-indigo-900 mb-3">Key Insights</h3>
            <ul className="space-y-2 text-indigo-800">
              <li className="flex items-start">
                <CheckCircle className="w-5 h-5 mr-2 mt-0.5 text-indigo-600" />
                <span>Your institute has excellent faculty ratio compliance (92%)</span>
              </li>
              <li className="flex items-start">
                <AlertCircle className="w-5 h-5 mr-2 mt-0.5 text-indigo-600" />
                <span>Research output compliance needs improvement (65%) - consider uploading more research publications</span>
              </li>
              <li className="flex items-start">
                <TrendingUp className="w-5 h-5 mr-2 mt-0.5 text-indigo-600" />
                <span>Document upload activity shows positive growth trend (+24% YoY)</span>
              </li>
              <li className="flex items-start">
                <FileText className="w-5 h-5 mr-2 mt-0.5 text-indigo-600" />
                <span>Most documents are successfully parsed (32 out of 48 total)</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
  );
};

export default AnalyticsInsightsPage;
