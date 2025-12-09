import mongoose from "mongoose";

const requestSchema = new mongoose.Schema(
    {
        requestId: {
            type: String,
            required: true,
            unique: true,
            index: true,
        },
        instituteId: {
            type: String,
            required: true,
            index: true,
        },
        requestType: {
            type: String,
            required: true,
            enum: ["student_intake", "new_program", "new_online_program"],
        },
        title: {
            type: String,
            required: true,
            trim: true,
        },
        description: {
            type: String,
            required: true,
        },
        status: {
            type: String,
            required: true,
            enum: ["pending", "approved", "rejected"],
            default: "pending",
        },
        files: [
            {
                filename: {
                    type: String,
                    required: true,
                },
                originalName: {
                    type: String,
                    required: true,
                },
                path: {
                    type: String,
                    required: true,
                },
                mimetype: {
                    type: String,
                    required: true,
                },
                size: {
                    type: Number,
                    required: true,
                },
                uploadedAt: {
                    type: Date,
                    default: Date.now,
                },
            },
        ],
        submittedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        submittedAt: {
            type: Date,
            default: Date.now,
        },
        reviewedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
        reviewedAt: {
            type: Date,
        },
        reviewComments: {
            type: String,
        },
    },
    {
        timestamps: true,
    }
);

// Index for faster queries
requestSchema.index({ instituteId: 1, status: 1 });
requestSchema.index({ submittedAt: -1 });

const Request = mongoose.model("Request", requestSchema);

export default Request;
