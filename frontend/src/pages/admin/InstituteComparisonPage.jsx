import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2, Award, Users, DollarSign, Briefcase } from "lucide-react";
import analyticsApi from "../../api/analytics.api";
import adminApi from "../../api/admin.api";

const InstituteComparisonPage = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [comparisonData, setComparisonData] = useState([]);

    useEffect(() => {
        fetchComparisonData();
    }, [searchParams]);

    const fetchComparisonData = async () => {
        const ids = searchParams.get("ids")?.split(",") || [];

        if (ids.length < 2) {
            setError("Please select at least two institutes to compare.");
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError(null);

            const promises = ids.map(async (id) => {
                // Fetch institute profile (Name, Type, Location)
                const profileRes = await adminApi.getInstituteProfile(id);
                // Fetch analytics (trends, overview)
                const analyticsRes = await analyticsApi.getInstituteAnalytics(id);

                const institute = profileRes.success ? profileRes.data.institute : null;

                // Map details for the view
                const details = institute ? {
                    instituteName: institute.name,
                    location: institute.location ? `${institute.location.city || ''}, ${institute.location.state || ''}` : "Unknown",
                    instituteType: institute.type,
                    website: institute.website || "N/A",
                    isVerified: true // Assuming active institutes are verified for now, or check specific field if added
                } : null;

                return {
                    id,
                    details,
                    analytics: analyticsRes.success ? analyticsRes.analytics : null,
                };
            });

            const results = await Promise.all(promises);
            const validResults = results.filter(r => r.details); // Filter out failed fetches

            if (validResults.length === 0) {
                setError("Failed to load data for the selected institutes.");
            } else {
                setComparisonData(validResults);
            }
        } catch (err) {
            console.error("Error fetching comparison data:", err);
            setError("An unexpected error occurred while fetching data.");
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
                <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mb-4" />
                <p className="text-gray-600 font-medium">Preparing comparison...</p>
            </div>
        );
    }

    // Helper to safely get nested values
    const getValue = (data, path) => {
        return path.split('.').reduce((obj, key) => (obj && obj[key] !== 'undefined') ? obj[key] : 'N/A', data);
    };

    const metrics = [
        { label: "Total Students", path: "analytics.overview.studentMetrics.totalStudents", icon: Users },
        { label: "Faculty Count", path: "analytics.overview.facultyMetrics.totalFaculty", icon: Users },
        { label: "Student/Faculty Ratio", path: "analytics.overview.facultyMetrics.studentFacultyRatio", format: (v) => v ? v.toFixed(2) : "N/A" },
        { label: "Placement Rate", path: "analytics.overview.placementMetrics.placementRate", format: (v) => v ? `${v.toFixed(1)}%` : "N/A", icon: Briefcase },
        { label: "Total Research Projects", path: "analytics.overview.researchMetrics.totalProjects", icon: Award },
        { label: "Total Budget", path: "analytics.overview.financialMetrics.totalBudget", format: (v) => v ? `₹${(v / 100000).toFixed(2)} Lakhs` : "N/A", icon: DollarSign },
    ];

    return (
        <div className="min-h-screen bg-gray-50 p-6 md:p-8">
            {/* Header */}
            <div className="max-w-7xl mx-auto mb-8 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-2 hover:bg-gray-200 rounded-full transition-colors"
                    >
                        <ArrowLeft className="w-6 h-6 text-gray-600" />
                    </button>
                    <h1 className="text-3xl font-bold text-gray-900">Institute Comparison</h1>
                </div>
            </div>

            {error ? (
                <div className="max-w-2xl mx-auto p-6 bg-red-50 border border-red-200 rounded-xl text-center">
                    <p className="text-red-600 text-lg mb-4">{error}</p>
                    <button
                        onClick={() => navigate(-1)}
                        className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                    >
                        Go Back
                    </button>
                </div>
            ) : (
                <div className="max-w-7xl mx-auto overflow-x-auto">
                    <table className="w-full bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-200">
                                <th className="p-6 text-left text-sm font-semibold text-gray-500 uppercase tracking-wider w-48 sticky left-0 bg-gray-50 z-10 border-r border-gray-200">
                                    Feature / Metric
                                </th>
                                {comparisonData.map((data) => (
                                    <th key={data.id} className="p-6 text-left min-w-[200px]">
                                        <div className="flex flex-col gap-1">
                                            <span className="text-lg font-bold text-gray-900 line-clamp-2">{data.details.instituteName}</span>
                                            <span className="text-sm font-medium text-gray-500">{data.details.location || "Location N/A"}</span>
                                            <span className={`inline-flex w-fit items-center px-2 py-0.5 rounded text-xs font-medium ${data.details.isVerified ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                                                }`}>
                                                {data.details.isVerified ? "Verified" : "Pending Verification"}
                                            </span>
                                        </div>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {/* General Info Section */}
                            <tr className="bg-gray-50/50">
                                <td colSpan={comparisonData.length + 1} className="px-6 py-3 text-xs font-bold text-gray-500 uppercase bg-gray-100/50 sticky left-0">
                                    General Information
                                </td>
                            </tr>
                            <tr>
                                <td className="p-6 font-medium text-gray-900 sticky left-0 bg-white border-r border-gray-200">Institute Type</td>
                                {comparisonData.map(data => (
                                    <td key={data.id} className="p-6 text-gray-600">{data.details.instituteType || "N/A"}</td>
                                ))}
                            </tr>
                            <tr>
                                <td className="p-6 font-medium text-gray-900 sticky left-0 bg-white border-r border-gray-200">Website</td>
                                {comparisonData.map(data => (
                                    <td key={data.id} className="p-6 text-gray-600">
                                        {data.details.website ? (
                                            <a href={data.details.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline truncate block max-w-[200px]">
                                                {data.details.website}
                                            </a>
                                        ) : "N/A"}
                                    </td>
                                ))}
                            </tr>

                            {/* Analytics Metrics */}
                            <tr className="bg-gray-50/50">
                                <td colSpan={comparisonData.length + 1} className="px-6 py-3 text-xs font-bold text-gray-500 uppercase bg-gray-100/50 sticky left-0">
                                    Performance Metrics
                                </td>
                            </tr>
                            {metrics.map((metric) => (
                                <tr key={metric.label} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="p-6 font-medium text-gray-900 sticky left-0 bg-white border-r border-gray-200 flex items-center gap-2">
                                        {metric.icon && <metric.icon className="w-4 h-4 text-gray-400" />}
                                        {metric.label}
                                    </td>
                                    {comparisonData.map(data => {
                                        const rawVal = getValue(data, metric.path);
                                        const displayVal = metric.format ? metric.format(rawVal) : rawVal;
                                        return (
                                            <td key={data.id} className="p-6 text-gray-600">
                                                {displayVal}
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default InstituteComparisonPage;
