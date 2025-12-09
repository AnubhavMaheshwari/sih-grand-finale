import axiosInstance from "./axios.config.js";

const documentsApi = {
  // Upload single document
  uploadDocument: async (file, year) => {
    const formData = new FormData();
    formData.append("document", file);
    formData.append("year", year);

    const response = await axiosInstance.post("/documents/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  // Upload multiple documents
  uploadMultipleDocuments: async (files, year) => {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append("documents", file);
    });
    formData.append("year", year);

    const response = await axiosInstance.post("/documents/upload/multiple", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  // Get institute documents
  getInstituteDocuments: async (params = {}) => {
    const queryParams = new URLSearchParams();

    if (params.year) queryParams.append("year", params.year);
    if (params.status) queryParams.append("status", params.status);
    if (params.page) queryParams.append("page", params.page);
    if (params.limit) queryParams.append("limit", params.limit);

    const url = `/documents/documents${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;
    const response = await axiosInstance.get(url);
    return response.data;
  },

  // Get single document
  getDocument: async (documentId) => {
    const response = await axiosInstance.get(`/documents/documents/${documentId}`);
    return response.data;
  },

  // Delete document
  deleteDocument: async (documentId) => {
    const response = await axiosInstance.delete(`/documents/documents/${documentId}`);
    return response.data;
  },

  // View document (returns blob URL)
  viewDocument: async (documentId) => {
    const response = await axiosInstance.get(`/documents/documents/${documentId}/view`, {
      responseType: "blob",
    });

    // Create blob URL for viewing
    const contentType = response.headers['content-type'] || 'application/pdf';
    const blob = new Blob([response.data], { type: contentType });
    return URL.createObjectURL(blob);
  },

  // Get document parsing status
  getDocumentStatus: async (documentId) => {
    const response = await axiosInstance.get(`/documents/documents/${documentId}`);
    return response.data.document?.status || "UNKNOWN";
  },

  // Get parsed data
  getParsedData: async (documentId) => {
    const response = await axiosInstance.get(`/documents/documents/${documentId}`);
    return response.data.document?.parsedData || null;
  },

  // Admin: Get all documents
  getAllDocuments: async (params = {}) => {
    const queryParams = new URLSearchParams();

    if (params.year) queryParams.append("year", params.year);
    if (params.status) queryParams.append("status", params.status);
    if (params.page) queryParams.append("page", params.page);
    if (params.limit) queryParams.append("limit", params.limit);
    if (params.instituteId) queryParams.append("instituteId", params.instituteId);

    const url = `/documents/admin/documents${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;
    const response = await axiosInstance.get(url);
    return response.data;
  },
};

export default documentsApi;
