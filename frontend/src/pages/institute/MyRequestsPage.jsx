import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import requestApi from "../../api/request.api.js";

const MyRequestsPage = () => {
    const navigate = useNavigate();
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filter, setFilter] = useState("all");

    useEffect(() => {
        fetchRequests();
    }, [filter]);

    const fetchRequests = async () => {
        try {
            setLoading(true);
            setError(null);

            const filters = {};
            if (filter !== "all") {
                filters.status = filter;
            }

            const response = await requestApi.getMyRequests(filters);

            if (response.success) {
                setRequests(response.requests);
            } else {
                setError(response.error || "Failed to load requests");
            }
        } catch (err) {
            console.error("Error fetching requests:", err);
            setError(err.response?.data?.error || "Failed to connect to server");
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (status) => {
        const styles = {
            pending: "bg-yellow-100 text-yellow-800",
            approved: "bg-green-100 text-green-800",
            rejected: "bg-red-100 text-red-800",
        };
        return (
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${styles[status]}`}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
        );
    };

    const getRequestTypeLabel = (type) => {
        const labels = {
            student_intake: "Student Intake Increase",
            new_program: "New Program Approval",
            new_online_program: "New Online Program",
        };
        return labels[type] || type;
    };

    const handleDelete = async (requestId) => {
        if (!window.confirm("Are you sure you want to delete this request?")) {
            return;
        }

        try {
            const response = await requestApi.deleteRequest(requestId);
            if (response.success) {
                fetchRequests(); // Refresh list
            }
        } catch (err) {
            console.error("Error deleting request:", err);
            alert(err.response?.data?.error || "Failed to delete request");
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">My Requests</h1>
                    <p className="text-gray-600 mt-2">
                        View and manage your submitted requests
                    </p>
                </div>
                <button
                    onClick={() => navigate("/institute/submit-request")}
                    className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-indigo-700"
                >
                    + New Request
                </button>
            </div>

            {error && (
                <div className="p-4 text-sm text-red-700 bg-red-100 rounded-lg">
                    {error}
                </div>
            )}

            {/* Filter Tabs */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                <div className="flex gap-2">
                    {["all", "pending", "approved", "rejected"].map((status) => (
                        <button
                            key={status}
                            onClick={() => setFilter(status)}
                            className={`px-4 py-2 rounded-lg font-medium transition-colors ${filter === status
                                    ? "bg-indigo-600 text-white"
                                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                }`}
                        >
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                        </button>
                    ))}
                </div>
            </div>

            {/* Requests List */}
            {requests.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-200">
                    <svg
                        className="w-16 h-16 mx-auto text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                    </svg>
                    <h3 className="mt-4 text-lg font-medium text-gray-900">
                        No requests found
                    </h3>
                    <p className="mt-1 text-gray-500">
                        {filter === "all"
                            ? "You haven't submitted any requests yet."
                            : `No ${filter} requests found.`}
                    </p>
                    <button
                        onClick={() => navigate("/institute/submit-request")}
                        className="mt-4 bg-indigo-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-indigo-700"
                    >
                        Submit Your First Request
                    </button>
                </div>
            ) : (
                <div className="space-y-4">
                    {requests.map((request) => (
                        <div
                            key={request.requestId}
                            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <h3 className="text-lg font-semibold text-gray-900">
                                            {request.title}
                                        </h3>
                                        {getStatusBadge(request.status)}
                                    </div>
                                    <p className="text-sm text-gray-600 mb-2">
                                        {getRequestTypeLabel(request.requestType)}
                                    </p>
                                    <p className="text-gray-700 mb-4 line-clamp-2">
                                        {request.description}
                                    </p>
                                    <div className="flex items-center gap-4 text-sm text-gray-500">
                                        <span>
                                            Submitted:{" "}
                                            {new Date(request.submittedAt).toLocaleDateString()}
                                        </span>
                                        {request.files && request.files.length > 0 && (
                                            <span className="flex items-center gap-1">
                                                <svg
                                                    className="w-4 h-4"
                                                    fill="currentColor"
                                                    viewBox="0 0 20 20"
                                                >
                                                    <path
                                                        fillRule="evenodd"
                                                        d="M8 4a3 3 0 00-3 3v4a5 5 0 0010 0V7a1 1 0 112 0v4a7 7 0 11-14 0V7a5 5 0 0110 0v4a3 3 0 11-6 0V7a1 1 0 012 0v4a1 1 0 102 0V7a3 3 0 00-3-3z"
                                                        clipRule="evenodd"
                                                    />
                                                </svg>
                                                {request.files.length} file(s)
                                            </span>
                                        )}
                                    </div>
                                    {request.reviewComments && (
                                        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                                            <p className="text-sm font-medium text-gray-700">
                                                Review Comments:
                                            </p>
                                            <p className="text-sm text-gray-600 mt-1">
                                                {request.reviewComments}
                                            </p>
                                        </div>
                                    )}
                                </div>
                                <div className="flex gap-2 ml-4">
                                    {request.status === "pending" && (
                                        <>
                                            <button
                                                onClick={() =>
                                                    navigate(`/institute/edit-request/${request.requestId}`)
                                                }
                                                className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg"
                                                title="Edit"
                                            >
                                                <svg
                                                    className="w-5 h-5"
                                                    fill="currentColor"
                                                    viewBox="0 0 20 20"
                                                >
                                                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                                                </svg>
                                            </button>
                                            <button
                                                onClick={() => handleDelete(request.requestId)}
                                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                                                title="Delete"
                                            >
                                                <svg
                                                    className="w-5 h-5"
                                                    fill="currentColor"
                                                    viewBox="0 0 20 20"
                                                >
                                                    <path
                                                        fillRule="evenodd"
                                                        d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                                                        clipRule="evenodd"
                                                    />
                                                </svg>
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MyRequestsPage;
