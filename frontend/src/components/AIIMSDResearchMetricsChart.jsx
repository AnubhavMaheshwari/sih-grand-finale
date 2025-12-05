import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

// Example data — replace with your own if needed
const data = [
  { Year: 2018, IPR: 18, RD: 25, WD: 21 },
  { Year: 2019, IPR: 20, RD: 27, WD: 23 },
  { Year: 2020, IPR: 19, RD: 26, WD: 22 },
  { Year: 2021, IPR: 17, RD: 24, WD: 20 },
  { Year: 2022, IPR: 16, RD: 23, WD: 19 },
];

const AIIMSDResearchMetricsChart = () => {
  return (
    <div className="p-4 bg-white rounded-2xl shadow-md w-full max-w-3xl mx-auto">
      <h2 className="text-lg font-semibold mb-3 text-center">
        AIIMS-D: Research metrics erode
      </h2>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data} margin={{ top: 20, right: 20, bottom: 10, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="Year" />
          <YAxis label={{ value: "Score", angle: -90, position: "insideLeft" }} />
          <Tooltip />
          <Legend verticalAlign="top" height={36} />

          <Line
            type="monotone"
            dataKey="IPR"
            stroke="#1f77b4"
            strokeWidth={2}
            activeDot={{ r: 6 }}
            name="IPR"
          />
          <Line
            type="monotone"
            dataKey="RD"
            stroke="#ff7f0e"
            strokeWidth={2}
            activeDot={{ r: 6 }}
            name="RD"
          />
          <Line
            type="monotone"
            dataKey="WD"
            stroke="#2ca02c"
            strokeWidth={2}
            activeDot={{ r: 6 }}
            name="WD"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default AIIMSDResearchMetricsChart;