import { Calendar } from "lucide-react";

const YearSelector = ({ 
  selectedYear, 
  onYearChange, 
  availableYears = [], 
  label = "Report Year:",
  showAllOption = true,
  className = ""
}) => {
  const currentYear = new Date().getFullYear();
  const years = availableYears.length > 0 
    ? availableYears 
    : Array.from({ length: 10 }, (_, i) => currentYear - i);

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {label && (
        <>
          <Calendar className="w-5 h-5 text-gray-500" />
          <label className="text-sm font-medium text-gray-700">{label}</label>
        </>
      )}
      <select
        value={selectedYear || (showAllOption ? "all" : years[0])}
        onChange={(e) => {
          const value = e.target.value;
          if (value === "all") {
            onYearChange(null);
          } else {
            onYearChange(parseInt(value));
          }
        }}
        className="px-3 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
      >
        {showAllOption && <option value="all">All Years</option>}
        {years.map((year) => (
          <option key={year} value={year}>
            {year}
          </option>
        ))}
      </select>
    </div>
  );
};

export default YearSelector;
