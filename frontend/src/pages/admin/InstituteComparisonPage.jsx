import { useSearchParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import InstituteAnalyticsPage from "./InstituteAnalyticsPage";

const InstituteComparisonPage = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const idsString = searchParams.get("ids");
    const ids = idsString ? idsString.split(",") : [];

    if (ids.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-6">
                <p className="text-gray-600 font-medium mb-4">No institutes selected for comparison.</p>
                <button
                    onClick={() => navigate(-1)}
                    className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                >
                    Go Back
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6 md:p-8">
            {/* Header */}
            <div className="max-w-[1920px] mx-auto mb-8 flex items-center justify-between">
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

            {/* Side by Side Grid */}
            <div className={`grid gap-8 ${ids.length > 1 ? 'lg:grid-cols-2' : ''} max-w-[1920px] mx-auto`}>
                {ids.map((id) => (
                    <div key={id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 overflow-y-auto max-h-[calc(100vh-150px)]">
                        <InstituteAnalyticsPage instituteId={id} embedded={true} />
                    </div>
                ))}
            </div>
        </div>
    );
};

export default InstituteComparisonPage;
