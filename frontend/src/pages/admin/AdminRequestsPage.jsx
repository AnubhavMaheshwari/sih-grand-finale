import { useState, useEffect } from "react";
import { CheckCircle2, XCircle, Clock, FileText, Eye, MessageSquare } from "lucide-react";
import requestApi from "../../api/request.api.js";
import { formatInstituteName } from "../../utils/instituteNameFormatter.js";

const AdminRequestsPage = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState("all");
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [reviewData, setReviewData] = useState({
        status: "",
        comments: "",
    });
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchRequests();
    }, [activeTab]);

    const fetchRequests = async () => {
        try {
            setLoading(true);
            setError(null);

            const filters = {};
            if (activeTab !== "all") {
                filters.status = activeTab;
            }

            const response = await requestApi.getAllRequests(filters);

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

    const handleReview = (request, status) => {
        setSelectedRequest(request);
        setReviewData({ status, comments: "" });
        setShowReviewModal(true);
    };

    const submitReview = async () => {
        if (!reviewData.comments.trim()) {
            alert("Please provide review comments");
            return;
        }

        try {
            setSubmitting(true);
            const response = await requestApi.reviewRequest(selectedRequest.requestId, reviewData);

            if (response.success) {
                setShowReviewModal(false);
                setSelectedRequest(null);
                setReviewData({ status: "", comments: "" });
                fetchRequests(); // Refresh list
            } else {
                alert(response.error || "Failed to submit review");
            }
        } catch (err) {
            console.error("Error submitting review:", err);
            alert(err.response?.data?.error || "Failed to submit review");
        } finally {
            setSubmitting(false);
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
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Request Management</h1>
                    <p className="text-gray-600">Review and process institute requests</p>
                </div>
            </div>

            {error && (
                <div className="p-4 text-sm text-red-700 bg-red-100 rounded-lg">
                    {error}
                </div>
            )}

            {/* Filter Tabs */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                <div className="flex gap-2">
                    {["all", "pending", "approved", "rejected"].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === tab
                                ? "bg-indigo-50 text-indigo-600"
                                : "text-gray-600 hover:bg-gray-50"
                                }`}
                        >
                            {tab.charAt(0).toUpperCase() + tab.slice(1)}
                        </button>
                    ))}
                </div>
            </div>

            {/* Requests List */}
            {requests.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
                    <FileText className="w-16 h-16 mx-auto text-gray-300 mb-3" />
                    <h3 className="text-lg font-medium text-gray-900">No requests found</h3>
                    <p className="text-gray-500 mt-1">
                        {activeTab === "all"
                            ? "No requests have been submitted yet."
                            : `No ${activeTab} requests found.`}
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    {requests.map((request) => (
                        <div
                            key={request.requestId}
                            className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow"
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <h3 className="text-lg font-semibold text-gray-900">
                                            {request.title}
                                        </h3>
                                        {getStatusBadge(request.status)}
                                    </div>
                                    <div className="grid grid-cols-2 gap-4 mb-3">
                                        <div>
                                            <p className="text-sm text-gray-500">Institute</p>
                                            <p className="text-sm font-medium text-gray-900">
                                                {formatInstituteName(request.instituteId)}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Request Type</p>
                                            <p className="text-sm font-medium text-gray-900">
                                                {getRequestTypeLabel(request.requestType)}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Submitted</p>
                                            <p className="text-sm font-medium text-gray-900">
                                                {new Date(request.submittedAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Files</p>
                                            <p className="text-sm font-medium text-gray-900">
                                                {request.files?.length || 0} file(s)
                                            </p>
                                        </div>
                                    </div>
                                    <p className="text-gray-700 mb-3 line-clamp-2">
                                        {request.description}
                                    </p>

                                    {/* Files List */}
                                    {request.files && request.files.length > 0 && (
                                        <div className="mt-3 mb-3">
                                            <p className="text-sm font-medium text-gray-700 mb-2">
                                                Attached Files ({request.files.length}):
                                            </p>
                                            <div className="space-y-1">
                                                {request.files.map((file, index) => (
                                                    <div
                                                        key={index}
                                                        className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 p-2 rounded"
                                                    >
                                                        <FileText className="w-4 h-4 text-gray-400" />
                                                        <span className="flex-1">{file.originalName}</span>
                                                        <span className="text-xs text-gray-500">
                                                            {(file.size / 1024 / 1024).toFixed(2)} MB
                                                        </span>
                                                        <a
                                                            href={`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}/${file.path}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-indigo-600 hover:text-indigo-800 text-xs font-medium"
                                                        >
                                                            View
                                                        </a>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {request.reviewComments && (
                                        <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                                            <p className="text-sm font-medium text-gray-700 flex items-center gap-2">
                                                <MessageSquare className="w-4 h-4" />
                                                Review Comments:
                                            </p>
                                            <p className="text-sm text-gray-600 mt-1">
                                                {request.reviewComments}
                                            </p>
                                        </div>
                                    )}
                                </div>
                                {request.status === "pending" && (
                                    <div className="flex gap-2 ml-4">
                                        <button
                                            onClick={() => handleReview(request, "approved")}
                                            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                                            title="Approve"
                                        >
                                            <CheckCircle2 className="w-4 h-4" />
                                            Approve
                                        </button>
                                        <button
                                            onClick={() => handleReview(request, "rejected")}
                                            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                                            title="Reject"
                                        >
                                            <XCircle className="w-4 h-4" />
                                            Reject
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Review Modal */}
            {showReviewModal && (
                <div className="fixed inset-0 bg-white bg-opacity-70 backdrop-blur-md flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 border-2 border-gray-200 shadow-xl">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                            {reviewData.status === "approved" ? "Approve" : "Reject"} Request
                        </h3>
                        <div className="mb-4">
                            <p className="text-sm text-gray-600 mb-2">
                                Request: <span className="font-medium">{selectedRequest?.title}</span>
                            </p>
                            <p className="text-sm text-gray-600">
                                Institute: <span className="font-medium">{formatInstituteName(selectedRequest?.instituteId)}</span>
                            </p>
                        </div>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Comments *
                            </label>
                            <textarea
                                value={reviewData.comments}
                                onChange={(e) =>
                                    setReviewData({ ...reviewData, comments: e.target.value })
                                }
                                rows={4}
                                placeholder="Provide your review comments..."
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            />
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={submitReview}
                                disabled={submitting}
                                className={`flex-1 px-4 py-2 rounded-lg text-white font-medium ${reviewData.status === "approved"
                                    ? "bg-green-600 hover:bg-green-700"
                                    : "bg-red-600 hover:bg-red-700"
                                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                            >
                                {submitting ? "Submitting..." : "Submit Review"}
                            </button>
                            <button
                                onClick={() => {
                                    setShowReviewModal(false);
                                    setSelectedRequest(null);
                                    setReviewData({ status: "", comments: "" });
                                }}
                                disabled={submitting}
                                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminRequestsPage;
