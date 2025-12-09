import {
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  ComposedChart,
} from "recharts";
import { formatCrLabel, CHART_COLORS, PIE_COLORS, axisStyles, gridStyle } from "../../utils/chartUtils.js";

const InstituteInsightsModal = ({
  institute,
  insightsData,
  loading,
  onClose,
}) => {
  if (!institute) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Modal header */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {institute.name} - Analytics Insights
              </h2>
              <p className="text-gray-600 mt-1">
                Financial and operational analysis with visual charts
              </p>
            </div>
            <button
              onClick={onClose}
              className="ml-4 rounded-full border border-gray-200 w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition"
              aria-label="Close modal"
            >
              ×
            </button>
          </div>

          {/* Loading state */}
          {loading && (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
          )}

          {/* No data available */}
          {!loading && !insightsData && (
            <div className="text-center py-12">
              <svg className="w-16 h-16 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="mt-4 text-lg font-medium text-gray-900">No analytics data available</h3>
              <p className="mt-1 text-gray-500">This institute doesn't have any uploaded data for analysis yet.</p>
            </div>
          )}

          {/* Charts grid */}
          {!loading && insightsData && insightsData.capitalByYear && insightsData.capitalByYear.length > 0 && (
            <div className="space-y-8">
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
    </div>
  );
};

export default InstituteInsightsModal;
