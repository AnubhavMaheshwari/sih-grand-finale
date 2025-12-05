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

const data = [
  { Year: 2018, GPH: 90, GUE: 80, GSS: 75 },
  { Year: 2019, GPH: 91, GUE: 82, GSS: 77 },
  { Year: 2020, GPH: 90, GUE: 83, GSS: 76 },
  { Year: 2021, GPH: 92, GUE: 84, GSS: 78 },
  { Year: 2022, GPH: 91, GUE: 83, GSS: 79 },
];

const GraduationPillarsChart = () => {
  return (
    <div className="p-4 bg-white rounded-2xl shadow-md">
      <h2 className="text-lg font-semibold mb-2 text-center">
        AIIMS-D: Graduation-output pillars rock-solid
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
            dataKey="GPH"
            stroke="#1f77b4"
            activeDot={{ r: 8 }}
            strokeWidth={2}
          />
          <Line
            type="monotone"
            dataKey="GUE"
            stroke="#ff7f0e"
            strokeWidth={2}
          />
          <Line
            type="monotone"
            dataKey="GSS"
            stroke="#2ca02c"
            strokeWidth={2}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default GraduationPillarsChart;