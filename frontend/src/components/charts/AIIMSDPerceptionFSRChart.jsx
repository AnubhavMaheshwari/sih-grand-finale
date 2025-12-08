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

// Example dataset — replace with your own if needed
const data = [
  { Year: 2018, PR: 65, FSR: 40 },
  { Year: 2019, PR: 66, FSR: 42 },
  { Year: 2020, PR: 67, FSR: 41 },
  { Year: 2021, PR: 66, FSR: 44 },
  { Year: 2022, PR: 65, FSR: 46 },
];

const AIIMSDPerceptionFSRChart = () => {
  return (
    <div className="p-4 bg-white rounded-2xl shadow-md w-full max-w-3xl mx-auto">
      <h2 className="text-lg font-semibold mb-3 text-center">
        AIIMS-D: Perception stays flat, FSR drifts
      </h2>

      <ResponsiveContainer width="100%" height={300}>
        <LineChart
          data={data}
          margin={{ top: 20, right: 40, left: 10, bottom: 10 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="Year" />
          <YAxis
            yAxisId="left"
            label={{ value: "PR score", angle: -90, position: "insideLeft" }}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            label={{ value: "FSR score", angle: 90, position: "insideRight" }}
          />
          <Tooltip />
          <Legend verticalAlign="top" height={36} />

          {/* Left-axis line (PR) */}
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="PR"
            stroke="#6366F1"
            strokeWidth={3}
            marker="o"
            activeDot={{ r: 8 }}
            name="Perception (PR)"
          />

          {/* Right-axis line (FSR) */}
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="FSR"
            stroke="#EC4899"
            strokeWidth={3}
            marker="s"
            activeDot={{ r: 8 }}
            name="Faculty–student ratio (FSR)"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default AIIMSDPerceptionFSRChart;