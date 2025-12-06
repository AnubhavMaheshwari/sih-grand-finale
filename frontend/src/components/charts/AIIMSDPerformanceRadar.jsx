import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Legend,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

// Data converted from your Python DataFrame structure
const data = [
  { metric: "FSR",  "2021": 30, "2025": 35 },
  { metric: "FQE",  "2021": 28, "2025": 33 },
  { metric: "FRU",  "2021": 24, "2025": 29 },
  { metric: "PU",   "2021": 20, "2025": 27 },
  { metric: "QP",   "2021": 26, "2025": 31 },
  { metric: "IPR",  "2021": 18, "2025": 24 },
  { metric: "FPPP", "2021": 22, "2025": 26 },
  { metric: "RD",   "2021": 25, "2025": 30 },
  { metric: "WD",   "2021": 21, "2025": 28 },
  { metric: "PCS",  "2021": 19, "2025": 25 },
];

const AIIMSDPerformanceRadar = () => {
  return (
    <div className="p-4 bg-white rounded-2xl shadow-md w-full max-w-xl mx-auto">
      <h2 className="text-lg font-semibold text-center mb-2">
        AIIMS-D: 2021 vs 2025 Performance Comparison
      </h2>

      <ResponsiveContainer width="100%" height={400}>
        <RadarChart outerRadius={140} data={data}>
          <PolarGrid />
          <PolarAngleAxis dataKey="metric" />
          <PolarRadiusAxis angle={30} domain={[0, 40]} tickCount={5} />
          <Tooltip />
          <Legend verticalAlign="bottom" height={36} />

          <Radar
            name="2021"
            dataKey="2021"
            stroke="#1f77b4"
            fill="#1f77b4"
            fillOpacity={0.4}
          />
          <Radar
            name="2025"
            dataKey="2025"
            stroke="#ff7f0e"
            fill="#ff7f0e"
            fillOpacity={0.4}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default AIIMSDPerformanceRadar;