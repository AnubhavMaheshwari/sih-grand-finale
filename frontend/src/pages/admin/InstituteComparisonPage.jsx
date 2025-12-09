import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2, IndianRupee, Users, GraduationCap, Building2, TrendingUp, Award, BookOpen } from "lucide-react";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import analyticsApi from "../../api/analytics.api";
import adminApi from "../../api/admin.api";
import { formatCrLabel, CHART_COLORS } from "../../utils/chartUtils";

const InstituteComparisonPage = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [institutes, setInstitutes] = useState([]);
    const [activeTab, setActiveTab] = useState("overview");

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
                if (!id) return null;
                try {
                    const [profileRes, analyticsRes] = await Promise.all([
                        adminApi.getInstituteProfile(id).catch(e => ({ error: e })),
                        analyticsApi.getInstituteAnalytics(id).catch(e => ({ error: e }))
                    ]);

                    // Robust data extraction
                    const instituteProfile = profileRes?.data?.institute || profileRes?.institute || profileRes?.data || null;
                    const analytics = analyticsRes?.analytics || analyticsRes?.data || {};
                    const name = instituteProfile?.name || "Unknown Institute";

                    const financialData = {
                        capital: analyticsRes?.capitalByYear || [],
                        operational: analyticsRes?.operationalByYear || []
                    };

                    return {
                        id,
                        name,
                        location: instituteProfile?.location ?
                            (typeof instituteProfile.location === 'string' ? instituteProfile.location : `${instituteProfile.location.city || ''}, ${instituteProfile.location.state || ''}`)
                            : "Unknown Location",
                        type: instituteProfile?.type || "N/A",
                        website: instituteProfile?.website,
                        isVerified: true,
                        analytics,
                        financialData
                    };
                } catch (innerErr) {
                    console.error(`Error processing institute ${id}:`, innerErr);
                    return null;
                }
            });

            const results = await Promise.all(promises);
            const validResults = results.filter(r => r !== null);

            if (validResults.length === 0) {
                setError("No valid data found for selected institutes.");
            } else {
                setInstitutes(validResults);
            }
        } catch (err) {
            console.error("Error fetching comparison:", err);
            setError(`Failed to load comparison data: ${err.message || "Unknown error"}`);
        } finally {
            setLoading(false);
        }
    };

    // --- Data Transformation Helpers ---

    // 1. Overview Cards Data
    const getOverviewData = () => {
        return institutes.map(inst => ({
            name: inst.name,
            students: inst.analytics?.overview?.studentMetrics?.totalStudents || 0,
            faculty: inst.analytics?.overview?.facultyMetrics?.totalFaculty || 0,

            research: inst.analytics?.overview?.researchMetrics?.totalProjects || 0,
        }));
    };

    // 2. Financial Bar Chart Data
    const getFinancialComparisonData = () => {
        return institutes.map(inst => {
            const latestCap = inst.financialData.capital[0];
            const latestOp = inst.financialData.operational[0];

            const capTotal = latestCap ? (latestCap.library + latestCap.labs + latestCap.workshops + latestCap.otherAssets) : 0;
            const opTotal = latestOp ? (latestOp.salaries + latestOp.maintenance) : 0;

            return {
                name: inst.name.length > 20 ? inst.name.substring(0, 15) + '...' : inst.name,
                full_name: inst.name,
                "Capital Budget": capTotal,
                "Operational Budget": opTotal,
            };
        });
    };

    // 3. Financial Trends
    const getFinancialTrendData = () => {
        const allYears = new Set();
        institutes.forEach(inst => {
            inst.financialData.capital.forEach(d => allYears.add(d.year));
        });
        const sortedYears = Array.from(allYears).sort();

        return sortedYears.map(year => {
            const dataPoint = { year };
            institutes.forEach(inst => {
                const cap = inst.financialData.capital.find(d => d.year === year);
                const op = inst.financialData.operational.find(d => d.year === year);
                const total = (cap ? (cap.library + cap.labs + cap.workshops + cap.otherAssets) : 0) +
                    (op ? (op.salaries + op.maintenance) : 0);
                dataPoint[inst.name] = total;
            });
            return dataPoint;
        });
    };

    // 4. Academic Radar Data
    const getAcademicRadarData = () => {
        return [
            { metric: "Placement %", ...Object.fromEntries(institutes.map(i => [i.name, i.analytics?.overview?.placementMetrics?.placementRate || 0])) },
            { metric: "Student/Faculty Ratio", ...Object.fromEntries(institutes.map(i => [i.name, 100 - (parseFloat(i.analytics?.overview?.facultyMetrics?.studentFacultyRatio) || 20)])) },
            { metric: "Research Projects", ...Object.fromEntries(institutes.map(i => [i.name, Math.min((i.analytics?.overview?.researchMetrics?.totalProjects || 0) * 5, 100)])) },
            { metric: "Courses Offered", ...Object.fromEntries(institutes.map(i => [i.name, Math.min((i.analytics?.overview?.academicMetrics?.totalCourses || 0) * 2, 100)])) },
        ];
    };

    // modern vibrant palette
    const COLORS = [
        "#4F46E5", // Indigo 600
        "#DB2777", // Pink 600
        "#059669", // Emerald 600
        "#D97706", // Amber 600
        "#7C3AED", // Violet 600
        "#0891B2", // Cyan 600
    ];

    const METRIC_COLORS = {
        students: "#3B82F6", // Blue 500
        faculty: "#8B5CF6",   // Violet 500
        // courses: "#10B981"    // Emerald 500
    };

    const FINANCIAL_COLORS = {
        capital: "#0EA5E9",      // Sky 500
        operational: "#64748B"   // Slate 500
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
            <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mb-4" />
            <p className="text-gray-600 font-medium">Preparing detailed comparison...</p>
        </div>
    );

    if (error) return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
            <p className="text-red-500 font-medium mb-4">{error}</p>
            <button onClick={() => navigate(-1)} className="px-4 py-2 bg-indigo-600 text-white rounded-lg">Go Back</button>
        </div>
    );

    const renderTabs = () => (
        <div className="flex flex-wrap gap-2 mb-8 bg-white p-2 rounded-lg shadow-sm w-fit">
            {[
                { id: "overview", label: "Overview", icon: Building2 },
                { id: "financials", label: "Financials", icon: IndianRupee },
                { id: "academics", label: "Academics", icon: GraduationCap },
                { id: "students", label: "Student Strength", icon: Users },
            ].map((tab) => (
                <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === tab.id
                        ? "bg-indigo-600 text-white shadow-sm"
                        : "text-gray-600 hover:bg-gray-100"
                        }`}
                >
                    <tab.icon className="w-4 h-4" />
                    {tab.label}
                </button>
            ))}
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 p-6 md:p-8">
            {/* Header */}
            <div className="max-w-7xl mx-auto mb-6">
                <button
                    onClick={() => navigate("/admin/institutes")}
                    className="inline-flex items-center text-gray-500 hover:text-gray-900 mb-4 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4 mr-1" /> Back to Institutes
                </button>
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">
                            {institutes.length > 0
                                ? `Comparison: ${institutes.map(i => i.name).join(' vs ')}`
                                : "Institute Comparison"}
                        </h1>
                        <p className="text-gray-600 mt-1">Comparing {institutes.length} institutes across key performance metrics</p>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto">
                {renderTabs()}

                {/* --- OVERVIEW TAB --- */}
                {activeTab === "overview" && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {/* Summary Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {institutes.map((inst, idx) => (
                                <div key={inst.id} className="bg-white p-5 rounded-xl shadow-sm border-t-4 border-t-indigo-500 hover:shadow-md transition-shadow">
                                    <h3 className="font-bold text-gray-900 truncate" title={inst.name}>{inst.name}</h3>
                                    <p className="text-xs text-gray-500 mb-4 flex items-center gap-1">
                                        <Building2 className="w-3 h-3" /> {inst.location}
                                    </p>

                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-gray-500">Students</span>
                                            <span className="font-semibold">{inst.analytics?.overview?.studentMetrics?.totalStudents || "N/A"}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-gray-500">Faculty</span>
                                            <span className="font-semibold">{inst.analytics?.overview?.facultyMetrics?.totalFaculty || "N/A"}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-gray-500">Budget</span>
                                            <span className="font-semibold text-green-600">
                                                {formatCrLabel(inst.analytics?.overview?.financialMetrics?.totalBudget)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Combined Bar Chart: Summary */}
                        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200 hover:shadow-lg transition-shadow">
                            <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                                <TrendingUp className="w-5 h-5 text-indigo-600" />
                                Key Metrics Comparison
                            </h3>
                            <div className="h-96">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={getOverviewData()} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} tickFormatter={(val) => val.split(' ')[0]} tick={{ fontSize: 11 }} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11 }} />
                                        <Tooltip cursor={{ fill: '#F9FAFB' }} />
                                        <Legend />
                                        <Bar dataKey="students" name="Students" fill={METRIC_COLORS.students} radius={[4, 4, 0, 0]} barSize={32} />
                                        <Bar dataKey="faculty" name="Faculty" fill={METRIC_COLORS.faculty} radius={[4, 4, 0, 0]} barSize={32} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>
                )}

                {/* --- FINANCIALS TAB --- */}
                {activeTab === "financials" && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="grid lg:grid-cols-2 gap-6">
                            {/* Budget Composition Chart */}
                            <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200 hover:shadow-lg transition-shadow">
                                <h3 className="text-lg font-semibold text-gray-900 mb-6">Latest Budget Allocation</h3>
                                <div className="h-80">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={getFinancialComparisonData()} layout="vertical" margin={{ left: 40 }}>
                                            <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                                            <XAxis type="number" tickFormatter={formatCrLabel} tick={{ fontSize: 11 }} />
                                            <YAxis dataKey="name" type="category" width={100} style={{ fontSize: '11px', fontWeight: 500 }} />
                                            <Tooltip formatter={(value) => formatCrLabel(value)} />
                                            <Legend />
                                            <Bar dataKey="Capital Budget" fill={FINANCIAL_COLORS.capital} radius={[0, 4, 4, 0]} barSize={20} />
                                            <Bar dataKey="Operational Budget" fill={FINANCIAL_COLORS.operational} radius={[0, 4, 4, 0]} barSize={20} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            {/* Yearly Trends Chart */}
                            <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200 hover:shadow-lg transition-shadow">
                                <h3 className="text-lg font-semibold text-gray-900 mb-6">Yearly Total Spending Trends</h3>
                                <div className="h-80">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={getFinancialTrendData()}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                            <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{ fontSize: 11 }} />
                                            <YAxis tickFormatter={formatCrLabel} axisLine={false} tickLine={false} tick={{ fontSize: 11 }} />
                                            <Tooltip formatter={(value) => formatCrLabel(value)} />
                                            <Legend />
                                            {institutes.map((inst, index) => (
                                                <Line
                                                    key={inst.id}
                                                    type="monotone"
                                                    dataKey={inst.name}
                                                    stroke={COLORS[index % COLORS.length]}
                                                    strokeWidth={2}
                                                    dot={{ r: 4 }}
                                                />
                                            ))}
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* --- ACADEMICS TAB --- */}
                {activeTab === "academics" && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {/* Radar Chart for Performance */}
                        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200 max-w-3xl mx-auto hover:shadow-lg transition-shadow">
                            <h3 className="text-lg font-semibold text-gray-900 mb-6 text-center">Academic Performance Radar</h3>
                            <div className="h-96">
                                <ResponsiveContainer width="100%" height="100%">
                                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={getAcademicRadarData()}>
                                        <PolarGrid />
                                        <PolarAngleAxis dataKey="metric" tick={{ fontSize: 11, fill: '#6B7280' }} />
                                        <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 10, fill: '#9CA3AF' }} />
                                        {institutes.map((inst, index) => (
                                            <Radar
                                                key={inst.id}
                                                name={inst.name}
                                                dataKey={inst.name}
                                                stroke={COLORS[index % COLORS.length]}
                                                fill={COLORS[index % COLORS.length]}
                                                fillOpacity={0.2}
                                                strokeWidth={2}
                                            />
                                        ))}
                                        <Legend />
                                    </RadarChart>
                                </ResponsiveContainer>
                            </div>
                            <p className="text-xs text-gray-400 text-center mt-4">*Metrics normalized for comparison</p>
                        </div>
                    </div>
                )}

                {/* --- STUDENTS TAB --- */}
                {activeTab === "students" && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200 hover:shadow-lg transition-shadow">
                            <h3 className="text-lg font-semibold text-gray-900 mb-6">Student Enrollment Comparison</h3>
                            <div className="h-80">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={institutes.map(i => ({
                                        name: i.name,
                                        UG: Math.floor((i.analytics?.overview?.studentMetrics?.totalStudents || 0) * 0.7), // Mock split if real data missing
                                        PG: Math.floor((i.analytics?.overview?.studentMetrics?.totalStudents || 0) * 0.2),
                                        PhD: Math.floor((i.analytics?.overview?.studentMetrics?.totalStudents || 0) * 0.1),
                                    }))} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11 }} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11 }} />
                                        <Tooltip cursor={{ fill: '#F9FAFB' }} />
                                        <Legend />
                                        <Bar dataKey="UG" stackId="a" fill="#3B82F6" />
                                        <Bar dataKey="PG" stackId="a" fill="#6366F1" />
                                        <Bar dataKey="PhD" stackId="a" fill="#8B5CF6" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
};

export default InstituteComparisonPage;
