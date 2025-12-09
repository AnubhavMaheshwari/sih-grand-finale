import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import adminApi from "../../api/admin.api.js";
import analyticsApi from "../../api/analytics.api.js";
import FloatingInstituteChatbot from "../../components/chatbot/FloatingInstituteChatbot.jsx";
import { transformFinancialData } from "../../utils/chartUtils.js";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  ComposedChart,
} from "recharts";
import { formatCrLabel, CHART_COLORS, PIE_COLORS, axisStyles, gridStyle } from "../../utils/chartUtils.js";

const InstituteAnalyticsPage = () => {
  const { instituteId } = useParams();
  const navigate = useNavigate();
  const [institute, setInstitute] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [insightsData, setInsightsData] = useState(null);
  const [insightsLoading, setInsightsLoading] = useState(false);

  // Log institute data when it changes
  useEffect(() => {
    if (institute) {
      console.log("Current institute state:", institute);
    }
  }, [institute]);

  // Log insights data when it changes
  useEffect(() => {
    if (insightsData) {
      console.log("Current insightsData state:", insightsData);
    }
  }, [insightsData]);

  // Fetch institute details
  useEffect(() => {
    fetchInstituteDetails();
  }, [instituteId]);

  // Fetch insights data
  useEffect(() => {
    if (instituteId) {
      fetchInstituteInsights();
    }
  }, [instituteId]);

  const fetchInstituteDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get institute data
      const response = await adminApi.getInstituteData(instituteId);
      
      // Log the raw institute data response
      console.log("Institute Details API Response:", response);
      console.log("Institute Details Data:", response.data);
      
      if (response.success) {
        // Log before setting institute data
        console.log("Setting institute data to state:", response.data);
        setInstitute(response.data);
      } else {
        setError(response.error || "Failed to load institute details");
      }
    } catch (err) {
      console.error("Error fetching institute details:", err);
      setError(err.response?.data?.error || "Failed to connect to server");
    } finally {
      setLoading(false);
    }
  };

  const fetchInstituteInsights = async () => {
    try {
      setInsightsLoading(true);
      const response = await analyticsApi.getInstituteFinancialData(instituteId);
      
      // Log the raw financial data response
      console.log("Financial Insights API Response:", response);
      console.log("Financial Insights Data:", response.data);
      
      if (response.success) {
        const transformedData = transformFinancialData(response.data);
        // Log the transformed data
        console.log("Transformed Financial Data:", transformedData);
        // Log before setting insights data
        console.log("Setting insights data to state:", transformedData);
        setInsightsData(transformedData);
      } else {
        setInsightsData(null);
      }
    } catch (err) {
      console.error("Error fetching insights:", err);
      setInsightsData(null);
    } finally {
      setInsightsLoading(false);
    }
  };

  const handleBack = () => {
    navigate("/admin/institutes");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="p-4 mb-6 text-sm text-red-700 bg-red-100 rounded-lg">
          <div className="flex items-center">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <span>{error}</span>
            <button
              onClick={fetchInstituteDetails}
              className="ml-auto text-sm font-medium text-red-700 hover:text-red-800"
            >
              Retry
            </button>
          </div>
        </div>
        <button
          onClick={handleBack}
          className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          ← Back to Institutes
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <button
              onClick={handleBack}
              className="inline-flex items-center mb-4 text-sm font-medium text-gray-600 hover:text-gray-900"
            >
              ← Back to Institutes
            </button>
            <h1 className="text-3xl font-bold text-gray-900">
              {institute?.instituteName || institute?.name || "Institute"} - Analytics Insights
            </h1>
            <p className="text-gray-600 mt-2">
              Financial and operational analysis with visual charts
            </p>
          </div>
          <div className="text-sm text-gray-500">
            Institute ID: {instituteId}
          </div>
        </div>
      </div>

      {/* Main content grid */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Charts section - 2/3 width */}
        <div className="lg:col-span-3 space-y-6">
          {/* Loading state for insights */}
          {insightsLoading && (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
          )}

          {/* No data available */}
          {!insightsLoading && !insightsData && (
            <div className="text-center py-12 border rounded-lg">
              <svg className="w-16 h-16 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="mt-4 text-lg font-medium text-gray-900">No analytics data available</h3>
              <p className="mt-1 text-gray-500">This institute doesn't have any uploaded data for analysis yet.</p>
            </div>
          )}

          {/* Charts grid */}
          {!insightsLoading && insightsData && insightsData.capitalByYear && insightsData.capitalByYear.length > 0 && (
            <div className="space-y-6">
              {/* Capital vs Operational Comparison */}
              <div className="border rounded-lg p-4">
                <h3 className="font-semibold text-gray-800 mb-4">
                  Capital vs Operational Expenditure Comparison
                </h3>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart
                      data={insightsData.capVsOpByYear || []}
                      margin={{ top: 10, right: 20, left: 10, bottom: 20 }}
                    >
                      <CartesianGrid {...gridStyle} />
                      <XAxis
                        dataKey="year"
                        stroke={axisStyles.x.stroke}
                        tick={axisStyles.x.tick}
                      />
                      <YAxis
                        stroke={axisStyles.y.stroke}
                        tick={axisStyles.y.tick}
                        tickFormatter={formatCrLabel}
                        label={{
                          value: "₹ (Crores)",
                          angle: -90,
                          position: "insideLeft",
                          fill: "#4b5563",
                          fontSize: 11,
                        }}
                      />
                      <Tooltip
                        formatter={(value) => formatCrLabel(value)}
                        wrapperStyle={{ fontSize: "12px" }}
                      />
                      <Legend />
                      <Bar
                        dataKey="capital"
                        name="Capital"
                        fill={CHART_COLORS.capital}
                      />
                      <Line
                        type="monotone"
                        dataKey="operational"
                        name="Operational"
                        stroke={CHART_COLORS.operational}
                        strokeWidth={2}
                        dot
                      />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Capital Expenditure Breakdown */}
              <div className="grid gap-6 md:grid-cols-2">
                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold text-gray-800 mb-4">
                    Capital Expenditure by Category
                  </h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={insightsData.capitalByYear}
                        margin={{ top: 10, right: 20, left: 10, bottom: 20 }}
                      >
                        <CartesianGrid {...gridStyle} />
                        <XAxis
                          dataKey="year"
                          stroke={axisStyles.x.stroke}
                          tick={axisStyles.x.tick}
                        />
                        <YAxis
                          stroke={axisStyles.y.stroke}
                          tick={axisStyles.y.tick}
                          tickFormatter={formatCrLabel}
                        />
                        <Tooltip
                          formatter={(value) => formatCrLabel(value)}
                          wrapperStyle={{ fontSize: "12px" }}
                        />
                        <Legend />
                        <Bar
                          dataKey="library"
                          name="Library"
                          fill={CHART_COLORS.library}
                        />
                        <Bar
                          dataKey="labs"
                          name="Labs"
                          fill={CHART_COLORS.labs}
                        />
                        <Bar
                          dataKey="workshops"
                          name="Workshops"
                          fill={CHART_COLORS.workshops}
                        />
                        <Bar
                          dataKey="otherAssets"
                          name="Other Assets"
                          fill={CHART_COLORS.otherAssets}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Operational Expenditure */}
                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold text-gray-800 mb-4">
                    Operational Expenditure
                  </h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart
                        data={insightsData.operationalByYear}
                        margin={{ top: 10, right: 20, left: 10, bottom: 20 }}
                      >
                        <CartesianGrid {...gridStyle} />
                        <XAxis
                          dataKey="year"
                          stroke={axisStyles.x.stroke}
                          tick={axisStyles.x.tick}
                        />
                        <YAxis
                          stroke={axisStyles.y.stroke}
                          tick={axisStyles.y.tick}
                          tickFormatter={formatCrLabel}
                        />
                        <Tooltip
                          formatter={(value) => formatCrLabel(value)}
                          wrapperStyle={{ fontSize: "12px" }}
                        />
                        <Legend />
                        <Area
                          type="monotone"
                          dataKey="salaries"
                          name="Salaries"
                          stroke={CHART_COLORS.salaries}
                          fill={CHART_COLORS.salaries + "33"}
                          strokeWidth={2}
                        />
                        <Area
                          type="monotone"
                          dataKey="maintenance"
                          name="Maintenance"
                          stroke={CHART_COLORS.maintenance}
                          fill={CHART_COLORS.maintenance + "33"}
                          strokeWidth={2}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Pie Chart for Capital Breakdown */}
              {insightsData.capital2023Breakdown && insightsData.capital2023Breakdown.length > 0 && (
                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold text-gray-800 mb-4">
                    2023-24 Capital Expenditure Composition
                  </h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Tooltip
                          formatter={(value) => formatCrLabel(value)}
                          wrapperStyle={{ fontSize: "12px" }}
                        />
                        <Legend />
                        <Pie
                          data={insightsData.capital2023Breakdown}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          label={(entry) =>
                            `${entry.name} (${formatCrLabel(entry.value)})`
                          }
                        >
                          {insightsData.capital2023Breakdown.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={PIE_COLORS[index % PIE_COLORS.length]}
                            />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Floating Chatbot Component */}
      <FloatingInstituteChatbot instituteData={institute} />
    </div>
  );
};

export default InstituteAnalyticsPage;
