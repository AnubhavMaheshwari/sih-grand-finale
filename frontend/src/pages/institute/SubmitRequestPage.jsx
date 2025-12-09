import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Users, BookOpen, Globe, Upload } from "lucide-react";
import requestApi from "../../api/request.api.js";
import instituteDataApi from "../../api/instituteData.api.js";

const SubmitRequestPage = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        requestType: "",
        title: "",
        description: "",
        year: "",
    });
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [dragActive, setDragActive] = useState(false);
    const [availableYears, setAvailableYears] = useState([]);
    const [loadingYears, setLoadingYears] = useState(true);

    const requestTypes = [
        {
            value: "student_intake",
            label: "Student Intake",
            description: "Request to increase the sanctioned intake for existing programs.",
            icon: Users,
        },
        {
            value: "new_program",
            label: "New Course",
            description: "Apply for adding a new course or specialization to your curriculum.",
            icon: BookOpen,
        },
        {
            value: "new_online_program",
            label: "Online Program",
            description: "Request approval for starting a new online degree or certification.",
            icon: Globe,
        },
    ];

    useEffect(() => {
        fetchAvailableYears();
    }, []);

    const fetchAvailableYears = async () => {
        try {
            setLoadingYears(true);
            const years = await instituteDataApi.getAvailableYears();

            if (years && years.length > 0) {
                setAvailableYears(years);
                setError(null);
            } else {
                setAvailableYears([]);
                setError("Please submit institute data for at least one year before creating a request");
            }
        } catch (err) {
            console.error("Error fetching years:", err);
            setAvailableYears([]);
            setError("Unable to fetch available years. Please ensure you have submitted data.");
        } finally {
            setLoadingYears(false);
        }
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleTypeSelect = (type) => {
        setFormData({
            ...formData,
            requestType: type,
        });
    };

    const handleFileChange = (e) => {
        const selectedFiles = Array.from(e.target.files);
        if (files.length + selectedFiles.length > 5) {
            setError("Maximum 5 files allowed");
            return;
        }
        setFiles([...files, ...selectedFiles]);
        setError(null);
    };

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        const droppedFiles = Array.from(e.dataTransfer.files);
        if (files.length + droppedFiles.length > 5) {
            setError("Maximum 5 files allowed");
            return;
        }
        setFiles([...files, ...droppedFiles]);
        setError(null);
    };

    const removeFile = (index) => {
        setFiles(files.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (!formData.requestType || !formData.title || !formData.description || !formData.year) {
                setError("All fields are required");
                setLoading(false);
                return;
            }

            if (availableYears.length === 0) {
                setError("Please submit institute data for at least one year before creating a request");
                setLoading(false);
                return;
            }

            const submitData = new FormData();
            submitData.append("requestType", formData.requestType);
            submitData.append("title", formData.title);
            submitData.append("description", formData.description);
            submitData.append("year", formData.year);

            files.forEach((file) => {
                submitData.append("files", file);
            });

            const response = await requestApi.submitRequest(submitData);

            if (response.success) {
                setFormData({
                    requestType: "",
                    title: "",
                    description: "",
                    year: "",
                });
                setFiles([]);
                navigate("/institute/my-requests");
            } else {
                setError(response.error || "Failed to submit request");
            }
        } catch (err) {
            console.error("Error submitting request:", err);
            setError(err.response?.data?.error || "Failed to submit request");
        } finally {
            setLoading(false);
        }
    };

    if (loadingYears) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Submit New Request</h1>
                <p className="text-gray-600 mt-2">Submit a request to UGC/AICTE for approval</p>
            </div>

            {error && (
                <div className="p-4 text-sm text-red-700 bg-red-100 rounded-lg">{error}</div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Request Type Cards */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                        Request Type *
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {requestTypes.map((type) => {
                            const Icon = type.icon;
                            const isSelected = formData.requestType === type.value;

                            const getCardColor = () => {
                                if (type.value === "student_intake") {
                                    return isSelected
                                        ? "bg-gradient-to-br from-blue-100 to-blue-200 border-blue-300"
                                        : "bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 hover:border-blue-300";
                                } else if (type.value === "new_program") {
                                    return isSelected
                                        ? "bg-gradient-to-br from-purple-100 to-purple-200 border-purple-300"
                                        : "bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 hover:border-purple-300";
                                } else {
                                    return isSelected
                                        ? "bg-gradient-to-br from-green-100 to-green-200 border-green-300"
                                        : "bg-gradient-to-br from-green-50 to-green-100 border-green-200 hover:border-green-300";
                                }
                            };

                            const getIconColor = () => {
                                if (type.value === "student_intake") return "text-blue-600";
                                if (type.value === "new_program") return "text-purple-600";
                                return "text-green-600";
                            };

                            return (
                                <button
                                    key={type.value}
                                    type="button"
                                    onClick={() => handleTypeSelect(type.value)}
                                    className={`p-6 rounded-xl border-2 cursor-pointer transition-all hover:shadow-lg hover:scale-[1.02] ${getCardColor()}`}
                                >
                                    <div className="flex flex-col items-center text-center">
                                        <div className={`p-3 rounded-lg bg-white mb-4 ${getIconColor()}`}>
                                            <Icon className="w-8 h-8" />
                                        </div>
                                        <h3 className="text-lg font-bold text-gray-900 mb-2">{type.label}</h3>
                                        <p className="text-sm text-gray-600 mb-4">{type.description}</p>
                                        {isSelected && (
                                            <div className="flex items-center gap-1 text-indigo-600 text-sm font-medium">
                                                <div className="w-2 h-2 rounded-full bg-indigo-600"></div>
                                                Selected
                                            </div>
                                        )}
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Year Selection */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Select Year *</label>
                    <select
                        name="year"
                        value={formData.year}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    >
                        <option value="">Select a year</option>
                        {availableYears.map((year) => (
                            <option key={year} value={year}>
                                {year}
                            </option>
                        ))}
                    </select>
                    <p className="text-xs text-gray-500 mt-2">
                        Select the year for which you want to submit this request. Only years with submitted data are available.
                    </p>
                </div>

                {/* Title and Description */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
                        <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            required
                            placeholder="Enter request title"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            required
                            rows={6}
                            placeholder="Provide detailed description of your request"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                    </div>
                </div>

                {/* File Upload */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Attach Files (Max 5 files, 10MB each)
                    </label>
                    <div
                        className={`border-2 border-dashed rounded-lg p-8 text-center ${dragActive ? "border-indigo-500 bg-indigo-50" : "border-gray-300"
                            }`}
                        onDragEnter={handleDrag}
                        onDragLeave={handleDrag}
                        onDragOver={handleDrag}
                        onDrop={handleDrop}
                    >
                        <Upload className="mx-auto h-12 w-12 text-gray-400" />
                        <div className="mt-4">
                            <label className="cursor-pointer">
                                <span className="text-indigo-600 hover:text-indigo-500 font-medium">
                                    Upload files
                                </span>
                                <input
                                    type="file"
                                    multiple
                                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.xls,.xlsx"
                                    onChange={handleFileChange}
                                    className="hidden"
                                />
                            </label>
                            <p className="text-gray-500 text-sm mt-1">or drag and drop</p>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                            PDF, JPG, PNG, DOC, DOCX, XLS, XLSX up to 10MB
                        </p>
                    </div>

                    {files.length > 0 && (
                        <div className="mt-4 space-y-2">
                            {files.map((file, index) => (
                                <div
                                    key={index}
                                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                                >
                                    <div className="flex items-center space-x-3">
                                        <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                                            <path
                                                fillRule="evenodd"
                                                d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"
                                                clipRule="evenodd"
                                            />
                                        </svg>
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">{file.name}</p>
                                            <p className="text-xs text-gray-500">
                                                {(file.size / 1024 / 1024).toFixed(2)} MB
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => removeFile(index)}
                                        className="text-red-600 hover:text-red-800"
                                    >
                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                            <path
                                                fillRule="evenodd"
                                                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                                clipRule="evenodd"
                                            />
                                        </svg>
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Submit Button */}
                <div className="flex gap-4">
                    <button
                        type="submit"
                        disabled={loading || availableYears.length === 0}
                        className="flex-1 bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? "Submitting..." : "Submit Request"}
                    </button>
                    <button
                        type="button"
                        onClick={() => navigate("/institute/my-requests")}
                        className="px-6 py-3 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50"
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
};

export default SubmitRequestPage;
