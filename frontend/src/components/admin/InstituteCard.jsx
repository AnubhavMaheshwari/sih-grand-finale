const InstituteCard = ({ institute, onViewInsights, selected, onToggleSelect }) => {
  return (
    <div
      className={`bg-white p-6 rounded-xl shadow-sm border transition-all duration-200 ${selected ? 'border-indigo-500 ring-1 ring-indigo-500 shadow-md' : 'border-gray-100 hover:shadow-md'
        }`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-3">
          {onToggleSelect && (
            <input
              type="checkbox"
              checked={selected || false}
              onChange={(e) => {
                e.stopPropagation();
                onToggleSelect(institute.id);
              }}
              className="mt-1.5 h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600 cursor-pointer"
            />
          )}
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{institute.name}</h3>
          </div>
        </div>
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${institute.status === "Verified" ? "bg-green-100 text-green-800" :
            institute.status === "Active" ? "bg-blue-100 text-blue-800" :
              institute.status === "Needs Data" ? "bg-yellow-100 text-yellow-800" :
                "bg-gray-100 text-gray-800"
          }`}>
          {institute.status}
        </span>
      </div>

      <div className="space-y-3 mb-6">
        <div className="flex items-center text-sm text-gray-600">
          <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          <span>Type: {institute.type}</span>
        </div>
        <div className="flex items-center text-sm text-gray-600">
          <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <span>Uploaded by: {institute.uploadedBy}</span>
        </div>
        <div className="flex items-center text-sm text-gray-600">
          <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span>Upload date: {institute.uploadDate}</span>
        </div>
      </div>

      <button
        onClick={() => onViewInsights(institute)}
        className="w-full inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition"
      >
        View Insights
      </button>
    </div>
  );
};

export default InstituteCard;
