import { useState, useEffect, useRef } from 'react';
import {
  Upload,
  FileText,
  Trash2,
  Eye,
  CheckCircle,
  AlertCircle,
  X,
  Loader2,
  History,
  Filter,
  Download
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../../api/axios.config';

const ReportsManagementPage = () => {
  const [activeTab, setActiveTab] = useState('upload'); // 'upload' or 'view'
  const [dragActive, setDragActive] = useState(false);
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const inputRef = useRef(null);

  // Fetch documents on mount or when tab/year changes
  useEffect(() => {
    if (activeTab === 'view') {
      fetchDocuments();
    }
  }, [activeTab, selectedYear]);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/upload/institute?year=${selectedYear}`);

      if (response.data.success) {
        setDocuments(response.data.data.documents || []);
      }
    } catch (error) {
      console.error('Error fetching documents:', error);
      toast.error('Failed to load documents');
    } finally {
      setLoading(false);
    }
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

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files);
    }
  };

  const handleFiles = (newFiles) => {
    const validFiles = Array.from(newFiles).filter(file => {
      // Validate file type (PDF only)
      const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
      if (!isPdf) {
        toast.error(`${file.name} is not a PDF file`);
        return false;
      }
      // Validate size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error(`${file.name} is too large (max 10MB)`);
        return false;
      }
      return true;
    });

    setFiles(prev => [...prev, ...validFiles]);
  };

  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (files.length === 0) return;

    setUploading(true);
    setUploadProgress(0);

    const formData = new FormData();
    files.forEach(file => {
      formData.append('documents', file);
    });
    formData.append('year', selectedYear);

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      const response = await api.post('/upload/multiple', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (response.data.success) {
        toast.success(`Successfully uploaded ${files.length} documents`);
        setFiles([]);
        setTimeout(() => {
          setActiveTab('view');
          setUploadProgress(0);
        }, 1000);
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error.response?.data?.message || 'Failed to upload documents');
      setUploadProgress(0);
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteDocument = async (id) => {
    if (!window.confirm('Are you sure you want to delete this document?')) return;

    try {
      await api.delete(`/upload/${id}`);
      toast.success('Document deleted successfully');
      fetchDocuments();
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete document');
    }
  };

  const handleViewDocument = async (id, filename) => {
    try {
      const response = await api.get(`/upload/${id}/view`, {
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename); // or target="_blank" to view
      document.body.appendChild(link);
      link.click();
      link.remove(); // Clean up
      window.URL.revokeObjectURL(url);

      // Alternatively, open in new tab
      // window.open(url, '_blank');
    } catch (error) {
      console.error('View error:', error);
      toast.error('Failed to view document');
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Report Management</h1>
          <p className="text-gray-500 mt-2">Upload and manage your institute's reports and documents.</p>
        </div>

        {/* Year Selector */}
        <div className="flex items-center gap-2 bg-white p-2 rounded-lg border border-gray-200 shadow-sm">
          <span className="text-sm font-medium text-gray-700 px-2">Academic Year:</span>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            className="border-none bg-transparent focus:ring-0 text-sm font-semibold text-indigo-600 cursor-pointer"
          >
            {[...Array(5)].map((_, i) => {
              const year = new Date().getFullYear() - i + 1;
              return <option key={year} value={year}>{year} - {year + 1}</option>;
            })}
          </select>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8" aria-label="Tabs">
          <button
            onClick={() => setActiveTab('upload')}
            className={`
              whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200
              ${activeTab === 'upload'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
            `}
          >
            <div className="flex items-center gap-2">
              <Upload className="w-4 h-4" />
              Upload Reports
            </div>
          </button>
          <button
            onClick={() => setActiveTab('view')}
            className={`
              whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200
              ${activeTab === 'view'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
            `}
          >
            <div className="flex items-center gap-2">
              <History className="w-4 h-4" />
              View History
            </div>
          </button>
        </nav>
      </div>

      {/* Upload Tab Content */}
      {activeTab === 'upload' && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div
            className={`
              relative border-2 border-dashed rounded-xl p-12 text-center transition-all duration-200 ease-in-out
              ${dragActive ? 'border-indigo-500 bg-indigo-50 scale-[1.01]' : 'border-gray-300 hover:border-indigo-400 hover:bg-gray-50'}
              ${uploading ? 'pointer-events-none opacity-50' : ''}
            `}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              ref={inputRef}
              type="file"
              multiple
              accept=".pdf" // Changed to only accept PDF
              onChange={handleChange}
              className="hidden"
            />

            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="p-4 bg-indigo-100 rounded-full text-indigo-600">
                <Upload className="w-8 h-8" />
              </div>
              <div>
                <p className="text-xl font-semibold text-gray-900">
                  Click to upload or drag and drop
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  PDF files only (Max 10MB per file)
                </p>
              </div>
              <button
                onClick={() => inputRef.current?.click()}
                className="px-6 py-2.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
              >
                Select Files
              </button>
            </div>
          </div>

          {files.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                <h3 className="font-semibold text-gray-900">Selected Files ({files.length})</h3>
                <button
                  onClick={() => setFiles([])}
                  className="text-xs text-red-600 hover:text-red-700 font-medium hover:underline"
                >
                  Clear All
                </button>
              </div>
              <ul className="divide-y divide-gray-100">
                {files.map((file, idx) => (
                  <li key={idx} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-red-100 rounded-lg">
                        <FileText className="w-5 h-5 text-red-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 truncate max-w-xs">{file.name}</p>
                        <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => removeFile(idx)}
                      className="p-1.5 text-gray-400 hover:text-red-500 transition-colors rounded-full hover:bg-red-50"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </li>
                ))}
              </ul>
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end">
                <button
                  onClick={handleUpload}
                  disabled={uploading}
                  className={`
                    flex items-center gap-2 px-6 py-2.5 rounded-lg font-medium text-white shadow-sm transition-all
                    ${uploading
                      ? 'bg-indigo-400 cursor-not-allowed'
                      : 'bg-indigo-600 hover:bg-indigo-700 hover:shadow-md'}
                  `}
                >
                  {uploading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Uploading... {uploadProgress}%
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4" />
                      Upload {files.length} Files
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* View Tab Content */}
      {activeTab === 'view' && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mb-4" />
              <p className="text-gray-500">Loading documents...</p>
            </div>
          ) : documents.length === 0 ? (
            <div className="text-center py-20 bg-gray-50 rounded-xl border border-dashed border-gray-300">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900">No documents found</h3>
              <p className="text-gray-500 mt-1">Upload documents to see them here.</p>
              <button
                onClick={() => setActiveTab('upload')}
                className="mt-6 text-indigo-600 font-medium hover:underline"
              >
                Go to Upload
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {documents.map((doc) => (
                <div key={doc.id} className="group bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col">
                  <div className="p-5 flex-1">
                    <div className="flex items-start justify-between mb-4">
                      <div className="p-2.5 bg-red-50 rounded-lg group-hover:bg-red-100 transition-colors">
                        <FileText className="w-6 h-6 text-red-600" />
                      </div>
                      <div className={`
                        px-2.5 py-1 rounded-full text-xs font-medium
                        ${doc.status === 'PARSED' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}
                      `}>
                        {doc.status}
                      </div>
                    </div>
                    <h3 className="font-semibold text-gray-900 truncate mb-1" title={doc.originalFilename}>
                      {doc.originalFilename}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-gray-500 mb-4">
                      <span>{formatFileSize(doc.fileSize)}</span>
                      <span>•</span>
                      <span>{new Date(doc.uploadedAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                    <button
                      onClick={() => handleViewDocument(doc.id, doc.originalFilename)}
                      className="text-sm font-medium text-gray-600 hover:text-indigo-600 flex items-center gap-1.5 transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                      View
                    </button>
                    <button
                      onClick={() => handleDeleteDocument(doc.id)}
                      className="text-sm font-medium text-gray-400 hover:text-red-600 flex items-center gap-1.5 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ReportsManagementPage;
