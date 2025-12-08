import { useState } from "react";
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

// ----------------- HELPERS -----------------
const formatCr = (value) => (value / 10000000).toFixed(2); // 1 Cr = 1,00,00,000
const formatCrLabel = (value) => `${formatCr(value)} Cr`;

// Color palette for charts
const CHART_COLORS = {
  library: "#2563eb", // blue
  labs: "#16a34a", // green
  workshops: "#ca8a04", // yellow
  otherAssets: "#7c3aed", // purple
  salaries: "#dc2626", // red
  maintenance: "#0ea5e9", // cyan
  capital: "#9333ea", // violet
  operational: "#f97316", // orange
};

const PIE_COLORS = [
  CHART_COLORS.library,
  CHART_COLORS.labs,
  CHART_COLORS.workshops,
  CHART_COLORS.otherAssets,
];

// ---------- RAW DATA BY CATEGORY & YEAR (IN RUPEES, DO NOT CHANGE) ----------
const capitalByYear = [
  {
    year: "2021-22",
    library: 16159011,
    labs: 32702870,
    workshops: 10276185,
    otherAssets: 116807266,
  },
  {
    year: "2022-23",
    library: 26960364,
    labs: 40039505,
    workshops: 15642801,
    otherAssets: 205437744,
  },
  {
    year: "2023-24",
    library: 64619296,
    labs: 37165334,
    workshops: 7808673,
    otherAssets: 117932029,
  },
];

const operationalByYear = [
  {
    year: "2021-22",
    salaries: 654305850,
    maintenance: 270257352,
  },
  {
    year: "2022-23",
    salaries: 740051982,
    maintenance: 325776674,
  },
  {
    year: "2023-24",
    salaries: 892977412,
    maintenance: 470807984,
  },
];

// Capital vs Operational totals (still using original rupee data)
const capVsOpByYear = capitalByYear.map((capRow, idx) => {
  const opRow = operationalByYear[idx];
  const capitalTotal =
    capRow.library +
    capRow.labs +
    capRow.workshops +
    capRow.otherAssets;
  const operationalTotal = opRow.salaries + opRow.maintenance;

  return {
    year: capRow.year,
    capital: capitalTotal,
    operational: operationalTotal,
  };
});

// Pie chart for 2023–24 capital composition
const capital2023 = capitalByYear.find((d) => d.year === "2023-24");
const capital2023Breakdown = [
  { name: "Library", value: capital2023.library },
  { name: "Labs", value: capital2023.labs },
  { name: "Workshops", value: capital2023.workshops },
  { name: "Other Capital Assets", value: capital2023.otherAssets },
];

const axisStyles = {
  x: {
    stroke: "#111827",
    tick: { fill: "#374151", fontSize: 12 },
  },
  y: {
    stroke: "#111827",
    tick: { fill: "#374151", fontSize: 12 },
  },
};

const gridStyle = {
  strokeDasharray: "3 3",
  stroke: "#E5E7EB",
};

const AdminInstitutesPage = () => {
  const [showCharts, setShowCharts] = useState(false);

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Institute Management
        </h1>
        <p className="text-gray-600 mt-2">
          Manage educational institutions
        </p>
      </div>

      {/* Conditional view */}
      {!showCharts ? (
        // -------------------- CARD VIEW --------------------
        <div className="grid gap-6 md:grid-cols-2">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                NIT Jamshedpur
              </h2>
              <p className="text-gray-600 mt-2">
                Capital & operational expenditure analysis (last 3
                years).
              </p>
            </div>

            <button
              onClick={() => setShowCharts(true)}
              className="mt-6 inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition"
            >
              View Charts
            </button>
          </div>
        </div>
      ) : (
        // -------------------- CHARTS VIEW --------------------
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                NIT Jamshedpur – Expenditure Overview
              </h2>
              <p className="text-gray-600 mt-1">
                Annual capital & operational expenditure for the
                previous 3 years. (Y-axis in ₹ Crores)
              </p>
            </div>

            {/* Cross button to go back */}
            <button
              onClick={() => setShowCharts(false)}
              className="ml-4 rounded-full border border-gray-200 w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition"
              aria-label="Close charts"
            >
              ×
            </button>
          </div>

          {/* CHART GRID */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* 1. Library – Bar (in Cr) */}
            <div className="h-72 border rounded-lg p-4">
              <h3 className="font-semibold text-gray-800 mb-1">
                Library Capital Expenditure
              </h3>
              <p className="text-xs text-gray-500 mb-2">
                Amount in ₹ Crores
              </p>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={capitalByYear}
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
                    dataKey="library"
                    name="Library"
                    fill={CHART_COLORS.library}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* 2. New Equipment & Software – Grouped Bar (in Cr) */}
            <div className="h-72 border rounded-lg p-4">
              <h3 className="font-semibold text-gray-800 mb-1">
                New Equipment & Software for Labs
              </h3>
              <p className="text-xs text-gray-500 mb-2">
                Amount in ₹ Crores
              </p>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={capitalByYear}
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
                    dataKey="labs"
                    name="Labs & Software"
                    fill={CHART_COLORS.labs}
                    barSize={40}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* 3. Engineering Workshops – Line Chart (in Cr) */}
            <div className="h-72 border rounded-lg p-4">
              <h3 className="font-semibold text-gray-800 mb-1">
                Engineering Workshops
              </h3>
              <p className="text-xs text-gray-500 mb-2">
                Amount in ₹ Crores
              </p>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={capitalByYear}
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
                  <Line
                    type="monotone"
                    dataKey="workshops"
                    name="Workshops"
                    stroke={CHART_COLORS.workshops}
                    strokeWidth={2}
                    dot
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* 4. Other Capital Assets – Area Chart (in Cr) */}
            <div className="h-72 border rounded-lg p-4">
              <h3 className="font-semibold text-gray-800 mb-1">
                Other Capital Assets
              </h3>
              <p className="text-xs text-gray-500 mb-2">
                Amount in ₹ Crores
              </p>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={capitalByYear}
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
                  <Area
                    type="monotone"
                    dataKey="otherAssets"
                    name="Other Capital Assets"
                    stroke={CHART_COLORS.otherAssets}
                    fill={CHART_COLORS.otherAssets + "33"}
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* 5. Capital – Stacked Bar by Category (in Cr) */}
            <div className="h-72 border rounded-lg p-4">
              <h3 className="font-semibold text-gray-800 mb-1">
                Capital Expenditure by Category (Stacked)
              </h3>
              <p className="text-xs text-gray-500 mb-2">
                Amount in ₹ Crores
              </p>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={capitalByYear}
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
                    dataKey="library"
                    stackId="cap"
                    name="Library"
                    fill={CHART_COLORS.library}
                  />
                  <Bar
                    dataKey="labs"
                    stackId="cap"
                    name="Labs"
                    fill={CHART_COLORS.labs}
                  />
                  <Bar
                    dataKey="workshops"
                    stackId="cap"
                    name="Workshops"
                    fill={CHART_COLORS.workshops}
                  />
                  <Bar
                    dataKey="otherAssets"
                    stackId="cap"
                    name="Other Assets"
                    fill={CHART_COLORS.otherAssets}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* 6. Salaries – Area Chart (in Cr) */}
            <div className="h-72 border rounded-lg p-4">
              <h3 className="font-semibold text-gray-800 mb-1">
                Salaries (Teaching & Non-Teaching)
              </h3>
              <p className="text-xs text-gray-500 mb-2">
                Amount in ₹ Crores
              </p>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={operationalByYear}
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
                  <Area
                    type="monotone"
                    dataKey="salaries"
                    name="Salaries"
                    stroke={CHART_COLORS.salaries}
                    fill={CHART_COLORS.salaries + "33"}
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* 7. Maintenance – Line Chart (in Cr) */}
            <div className="h-72 border rounded-lg p-4">
              <h3 className="font-semibold text-gray-800 mb-1">
                Maintenance of Academic Infrastructure & Consumables
              </h3>
              <p className="text-xs text-gray-500 mb-2">
                Amount in ₹ Crores
              </p>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={operationalByYear}
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
                  <Line
                    type="monotone"
                    dataKey="maintenance"
                    name="Maintenance"
                    stroke={CHART_COLORS.maintenance}
                    strokeWidth={2}
                    dot
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* 8. Operational – Stacked Area (in Cr) */}
            <div className="h-72 border rounded-lg p-4">
              <h3 className="font-semibold text-gray-800 mb-1">
                Operational Expenditure (Stacked)
              </h3>
              <p className="text-xs text-gray-500 mb-2">
                Amount in ₹ Crores
              </p>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={operationalByYear}
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
                  <Area
                    type="monotone"
                    dataKey="salaries"
                    stackId="op"
                    name="Salaries"
                    stroke={CHART_COLORS.salaries}
                    fill={CHART_COLORS.salaries + "33"}
                  />
                  <Area
                    type="monotone"
                    dataKey="maintenance"
                    stackId="op"
                    name="Maintenance"
                    stroke={CHART_COLORS.maintenance}
                    fill={CHART_COLORS.maintenance + "33"}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* 9. Capital vs Operational – Composed Chart (Bar + Line, in Cr) */}
            <div className="h-72 border rounded-lg p-4">
              <h3 className="font-semibold text-gray-800 mb-1">
                Capital vs Operational – Year-wise Comparison
              </h3>
              <p className="text-xs text-gray-500 mb-2">
                Amount in ₹ Crores
              </p>
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart
                  data={capVsOpByYear}
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

            {/* 10. 2023–24 Capital Composition – Pie (labels in Cr) */}
            <div className="h-72 border rounded-lg p-4">
              <h3 className="font-semibold text-gray-800 mb-1">
                2023–24 Capital Expenditure Composition
              </h3>
              <p className="text-xs text-gray-500 mb-2">
                Values shown in ₹ Crores
              </p>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip
                    formatter={(value) => formatCrLabel(value)}
                    wrapperStyle={{ fontSize: "12px" }}
                  />
                  <Legend />
                  <Pie
                    data={capital2023Breakdown}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={(entry) =>
                      `${entry.name} (${formatCrLabel(entry.value)})`
                    }
                  >
                    {capital2023Breakdown.map((entry, index) => (
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
        </div>
      )}
    </div>
  );
};

export default AdminInstitutesPage;
