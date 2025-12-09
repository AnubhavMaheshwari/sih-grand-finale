import axiosInstance from "./axios.config.js";

const requestApi = {
    // Submit a new request with files
    submitRequest: async (formData) => {
        const response = await axiosInstance.post("/requests/submit", formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });
        return response.data;
    },

    // Get all requests for the logged-in institute
    getMyRequests: async (filters = {}) => {
        const queryParams = new URLSearchParams();
        if (filters.status) queryParams.append("status", filters.status);
        if (filters.requestType) queryParams.append("requestType", filters.requestType);

        const url = `/requests/my-requests${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;
        const response = await axiosInstance.get(url);
        return response.data;
    },

    // Get a specific request by ID
    getRequestById: async (requestId) => {
        const response = await axiosInstance.get(`/requests/${requestId}`);
        return response.data;
    },

    // Update a pending request
    updateRequest: async (requestId, data) => {
        const response = await axiosInstance.put(`/requests/${requestId}`, data);
        return response.data;
    },

    // Delete a pending request
    deleteRequest: async (requestId) => {
        const response = await axiosInstance.delete(`/requests/${requestId}`);
        return response.data;
    },

    // Admin: Get all requests
    getAllRequests: async (filters = {}) => {
        const queryParams = new URLSearchParams();
        if (filters.status) queryParams.append("status", filters.status);
        if (filters.requestType) queryParams.append("requestType", filters.requestType);
        if (filters.instituteId) queryParams.append("instituteId", filters.instituteId);

        const url = `/requests/admin/all${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;
        const response = await axiosInstance.get(url);
        return response.data;
    },

    // Admin: Review a request
    reviewRequest: async (requestId, reviewData) => {
        const response = await axiosInstance.post(`/requests/admin/${requestId}/review`, reviewData);
        return response.data;
    },
};

export default requestApi;
