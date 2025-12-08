import { useState } from "react";
import { CheckCircle2, XCircle, Clock, FileText, Filter, Search, Eye } from "lucide-react";

const AdminRequestsPage = () => {
    const [activeTab, setActiveTab] = useState("all");
    const [searchQuery, setSearchQuery] = useState("");

    // Mock data matching the institute side structure
    const [requests, setRequests] = useState([
        {
            id: 101,
            instituteName: "IIT Delhi",
            type: "Student Intake",
            date: new Date(2023, 10, 15),
            status: "Report Ready",
            priority: "High"
        },
        {
            id: 102,
            instituteName: "BITS Pilani",
            type: "New Course",
            date: new Date(2023, 11, 5),
            status: "Insufficient Data",
            priority: "Medium"
        },
        {
            id: 103,
            instituteName: "Anna University",
            type: "Online Program",
            date: new Date(2024, 0, 20),
            status: "Checking Data Sufficiency",
            priority: "Low"
        },
        {
            id: 104,
            instituteName: "NIT Trichy",
            type: "Student Intake",
            date: new Date(2024, 1, 10),
            status: "Pending Report",
            priority: "High"
        }
    ]);

    const getStatusColor = (status) => {
        switch (status) {
            case "Checking Data Sufficiency": return "bg-yellow-100 text-yellow-800";
            case "Data Sufficient": return "bg-green-100 text-green-800";
            case "Insufficient Data": return "bg-red-100 text-red-800";
            case "Pending Report": return "bg-blue-100 text-blue-800";
            case "Report Ready": return "bg-indigo-100 text-indigo-800";
            case "Verifying": return "bg-purple-100 text-purple-800";
            default: return "bg-gray-100 text-gray-800";
        }
    };

    const filteredRequests = requests.filter(req => {
        const matchesSearch = req.instituteName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            req.type.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesTab = activeTab === "all" ? true :
            activeTab === "pending" ? req.status !== "Report Ready" :
                activeTab === "completed" ? req.status === "Report Ready" : true;
        return matchesSearch && matchesTab;
    });

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Request Management</h1>
                    <p className="text-gray-600">Review and process institute requests</p>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 justify-between items-center">
                <div className="flex gap-2">
                    <button
                        onClick={() => setActiveTab("all")}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === "all" ? "bg-indigo-50 text-indigo-600" : "text-gray-600 hover:bg-gray-50"}`}
                    >
                        All Requests
                    </button>
                    <button
                        onClick={() => setActiveTab("pending")}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === "pending" ? "bg-indigo-50 text-indigo-600" : "text-gray-600 hover:bg-gray-50"}`}
                    >
                        Pending
                    </button>
                    <button
                        onClick={() => setActiveTab("completed")}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === "completed" ? "bg-indigo-50 text-indigo-600" : "text-gray-600 hover:bg-gray-50"}`}
                    >
                        Completed
                    </button>
                </div>

                <div className="relative w-full md:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search institute or type..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Request ID</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Institute</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredRequests.map((req) => (
                                <tr key={req.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        #{req.id}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                        {req.instituteName}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                                        {req.type}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {req.date.toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(req.status)}`}>
                                            {req.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button className="text-indigo-600 hover:text-indigo-900 mr-3" title="View Details">
                                            <Eye className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {filteredRequests.length === 0 && (
                                <tr>
                                    <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                                        <FileText className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                                        No requests found matching your filters.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminRequestsPage;
