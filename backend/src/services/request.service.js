import Request from "../models/Request.model.js";
import User from "../models/User.model.js";
import { v4 as uuidv4 } from "uuid";

export const createRequest = async (requestData, files, userId) => {
    // Generate unique request ID
    const requestId = `REQ-${Date.now()}-${uuidv4().substring(0, 8)}`;

    // Process uploaded files
    const fileData = files.map((file) => ({
        filename: file.filename,
        originalName: file.originalname,
        path: file.path,
        mimetype: file.mimetype,
        size: file.size,
        uploadedAt: new Date(),
    }));

    // Create request object
    const request = new Request({
        requestId,
        instituteId: requestData.instituteId,
        requestType: requestData.requestType,
        title: requestData.title,
        description: requestData.description,
        status: "pending",
        files: fileData,
        submittedBy: userId,
        submittedAt: new Date(),
    });

    await request.save();
    return request;
};

export const getRequestsByInstitute = async (instituteId, filters = {}) => {
    const query = { instituteId };

    // Apply filters
    if (filters.status) {
        query.status = filters.status;
    }
    if (filters.requestType) {
        query.requestType = filters.requestType;
    }

    const requests = await Request.find(query)
        .sort({ submittedAt: -1 });

    return requests;
};

export const getRequestById = async (requestId) => {
    const request = await Request.findOne({ requestId });

    if (!request) {
        throw new Error("Request not found");
    }

    return request;
};

export const updateRequest = async (requestId, updateData, userId) => {
    const request = await Request.findOne({ requestId });

    if (!request) {
        throw new Error("Request not found");
    }

    // Only allow updates if status is pending
    if (request.status !== "pending") {
        throw new Error("Cannot update request that is not pending");
    }

    // Update allowed fields
    if (updateData.title) request.title = updateData.title;
    if (updateData.description) request.description = updateData.description;
    if (updateData.requestType) request.requestType = updateData.requestType;

    await request.save();
    return request;
};

export const deleteRequest = async (requestId) => {
    const request = await Request.findOne({ requestId });

    if (!request) {
        throw new Error("Request not found");
    }

    // Only allow deletion if status is pending
    if (request.status !== "pending") {
        throw new Error("Cannot delete request that is not pending");
    }

    await Request.deleteOne({ requestId });
    return { message: "Request deleted successfully" };
};

export const getAllRequests = async (filters = {}) => {
    const query = {};

    // Apply filters
    if (filters.status) {
        query.status = filters.status;
    }
    if (filters.requestType) {
        query.requestType = filters.requestType;
    }
    if (filters.instituteId) {
        query.instituteId = filters.instituteId;
    }

    const requests = await Request.find(query)
        .sort({ submittedAt: -1 });

    return requests;
};

export const reviewRequest = async (requestId, reviewData, adminId) => {
    const request = await Request.findOne({ requestId });

    if (!request) {
        throw new Error("Request not found");
    }

    request.status = reviewData.status;
    request.reviewedBy = adminId;
    request.reviewedAt = new Date();
    request.reviewComments = reviewData.comments || "";

    await request.save();

    // Send email notification to the institute
    try {
        // Get user email from submittedBy ID
        const user = await User.findById(request.submittedBy);
        if (user && user.email) {
            const { sendRequestReviewEmail } = await import("../utils/emailService.js");
            await sendRequestReviewEmail(
                user.email,
                {
                    requestId: request.requestId,
                    title: request.title,
                    requestType: request.requestType,
                },
                reviewData.status,
                reviewData.comments
            );
            console.log(`Email notification sent to ${user.email}`);
        }
    } catch (emailError) {
        console.error("Error sending email notification:", emailError);
        // Don't fail the request if email fails
    }

    return request;
};
