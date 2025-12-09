import * as requestService from "../services/request.service.js";
import { successResponse, errorResponse } from "../utils/apiResponse.js";

export const submitRequest = async (req, res) => {
    try {
        const { requestType, title, description } = req.body;
        const files = req.files || [];

        // Check if user is authenticated
        if (!req.user || !req.user.id) {
            console.error("User not authenticated:", req.user);
            return errorResponse(res, "User not authenticated", 401);
        }

        const userId = req.user.id;
        const instituteId = req.user.instituteId;

        console.log("Submit Request - User ID:", userId);
        console.log("Submit Request - Institute ID:", instituteId);

        // Validation
        if (!requestType || !title || !description) {
            return errorResponse(
                res,
                "Request type, title, and description are required",
                400
            );
        }

        const requestData = {
            instituteId,
            requestType,
            title,
            description,
        };

        const request = await requestService.createRequest(
            requestData,
            files,
            userId
        );
        successResponse(res, { request }, 201);
    } catch (error) {
        console.error("Error submitting request:", error);
        errorResponse(res, error.message || "Failed to submit request");
    }
};

export const getMyRequests = async (req, res) => {
    try {
        const instituteId = req.user.instituteId;
        const { status, requestType } = req.query;

        const filters = {};
        if (status) filters.status = status;
        if (requestType) filters.requestType = requestType;

        const requests = await requestService.getRequestsByInstitute(
            instituteId,
            filters
        );
        successResponse(res, { requests, count: requests.length });
    } catch (error) {
        console.error("Error fetching requests:", error);
        errorResponse(res, error.message || "Failed to fetch requests");
    }
};

export const getRequest = async (req, res) => {
    try {
        const { requestId } = req.params;
        const request = await requestService.getRequestById(requestId);

        // Check if user has access to this request
        if (
            req.user.role !== "admin" &&
            request.instituteId !== req.user.instituteId
        ) {
            return errorResponse(res, "Access denied", 403);
        }

        successResponse(res, { request });
    } catch (error) {
        console.error("Error fetching request:", error);
        if (error.message === "Request not found") {
            return errorResponse(res, error.message, 404);
        }
        errorResponse(res, error.message || "Failed to fetch request");
    }
};

export const updateRequest = async (req, res) => {
    try {
        const { requestId } = req.params;
        const updateData = req.body;
        const userId = req.user.id;

        // First get the request to check ownership
        const existingRequest = await requestService.getRequestById(requestId);
        if (existingRequest.instituteId !== req.user.instituteId) {
            return errorResponse(res, "Access denied", 403);
        }

        const request = await requestService.updateRequest(
            requestId,
            updateData,
            userId
        );
        successResponse(res, { request }, 200);
    } catch (error) {
        console.error("Error updating request:", error);
        if (error.message === "Request not found") {
            return errorResponse(res, error.message, 404);
        }
        errorResponse(res, error.message || "Failed to update request");
    }
};

export const deleteRequest = async (req, res) => {
    try {
        const { requestId } = req.params;

        // First get the request to check ownership
        const existingRequest = await requestService.getRequestById(requestId);
        if (existingRequest.instituteId !== req.user.instituteId) {
            return errorResponse(res, "Access denied", 403);
        }

        const result = await requestService.deleteRequest(requestId);
        successResponse(res, result);
    } catch (error) {
        console.error("Error deleting request:", error);
        if (error.message === "Request not found") {
            return errorResponse(res, error.message, 404);
        }
        errorResponse(res, error.message || "Failed to delete request");
    }
};

// Admin endpoints
export const getAllRequests = async (req, res) => {
    try {
        const { status, requestType, instituteId } = req.query;

        const filters = {};
        if (status) filters.status = status;
        if (requestType) filters.requestType = requestType;
        if (instituteId) filters.instituteId = instituteId;

        const requests = await requestService.getAllRequests(filters);
        successResponse(res, { requests, count: requests.length });
    } catch (error) {
        console.error("Error fetching all requests:", error);
        errorResponse(res, error.message || "Failed to fetch requests");
    }
};

export const reviewRequest = async (req, res) => {
    try {
        const { requestId } = req.params;
        const { status, comments } = req.body;
        const adminId = req.user.id;

        if (!status || !["approved", "rejected"].includes(status)) {
            return errorResponse(
                res,
                "Valid status (approved/rejected) is required",
                400
            );
        }

        const reviewData = { status, comments };
        const request = await requestService.reviewRequest(
            requestId,
            reviewData,
            adminId
        );
        successResponse(res, { request }, 200);
    } catch (error) {
        console.error("Error reviewing request:", error);
        if (error.message === "Request not found") {
            return errorResponse(res, error.message, 404);
        }
        errorResponse(res, error.message || "Failed to review request");
    }
};
