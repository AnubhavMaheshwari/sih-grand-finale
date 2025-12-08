import FAQ from "../models/FAQ.model.js";
import { successResponse, errorResponse } from "../utils/apiResponse.js";

// Get all active FAQs (public)
export const getFAQs = async (req, res) => {
  try {
    const { category } = req.query;
    
    const filter = { isActive: true };
    if (category && category !== 'all') {
      filter.category = category;
    }
    
    const faqs = await FAQ.find(filter)
      .sort({ order: 1, createdAt: -1 })
      .select('-__v');
    
    return successResponse(res, { message: "FAQs fetched successfully", faqs });
  } catch (error) {
    console.error("Error fetching FAQs:", error);
    return errorResponse(res, "Failed to fetch FAQs: " + error.message);
  }
};

// Get all FAQs (admin only)
export const getAllFAQs = async (req, res) => {
  try {
    const faqs = await FAQ.find()
      .sort({ order: 1, createdAt: -1 })
      .select('-__v');
    
    return successResponse(res, { message: "All FAQs fetched successfully", faqs });
  } catch (error) {
    console.error("Error fetching all FAQs:", error);
    return errorResponse(res, "Failed to fetch FAQs: " + error.message);
  }
};

// Get single FAQ
export const getFAQ = async (req, res) => {
  try {
    const { id } = req.params;
    
    const faq = await FAQ.findById(id).select('-__v');
    
    if (!faq) {
      return errorResponse(res, "FAQ not found", 404);
    }
    
    return successResponse(res, { message: "FAQ fetched successfully", faq });
  } catch (error) {
    console.error("Error fetching FAQ:", error);
    return errorResponse(res, "Failed to fetch FAQ: " + error.message);
  }
};

// Create FAQ (admin only)
export const createFAQ = async (req, res) => {
  try {
    const { question, answer, category, order, isActive } = req.body;
    
    if (!question || !answer) {
      return errorResponse(res, "Question and answer are required", 400);
    }
    
    const faq = new FAQ({
      question,
      answer,
      category: category || "general",
      order: order || 0,
      isActive: isActive !== undefined ? isActive : true,
      createdBy: req.user?.userId || "admin",
      updatedBy: req.user?.userId || "admin",
    });
    
    await faq.save();
    
    return successResponse(res, { message: "FAQ created successfully", faq }, 201);
  } catch (error) {
    console.error("Error creating FAQ:", error);
    return errorResponse(res, "Failed to create FAQ: " + error.message);
  }
};

// Update FAQ (admin only)
export const updateFAQ = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const faq = await FAQ.findById(id);
    
    if (!faq) {
      return errorResponse(res, "FAQ not found", 404);
    }
    
    // Update fields
    Object.keys(updates).forEach(key => {
      if (key !== '_id' && key !== '__v') {
        faq[key] = updates[key];
      }
    });
    
    faq.updatedBy = req.user?.userId || "admin";
    faq.updatedAt = new Date();
    
    await faq.save();
    
    return successResponse(res, { message: "FAQ updated successfully", faq });
  } catch (error) {
    console.error("Error updating FAQ:", error);
    return errorResponse(res, "Failed to update FAQ: " + error.message);
  }
};

// Delete FAQ (admin only)
export const deleteFAQ = async (req, res) => {
  try {
    const { id } = req.params;
    
    const faq = await FAQ.findByIdAndDelete(id);
    
    if (!faq) {
      return errorResponse(res, "FAQ not found", 404);
    }
    
    return successResponse(res, { message: "FAQ deleted successfully" });
  } catch (error) {
    console.error("Error deleting FAQ:", error);
    return errorResponse(res, "Failed to delete FAQ: " + error.message);
  }
};

// Reorder FAQs (admin only)
export const reorderFAQs = async (req, res) => {
  try {
    const { faqs } = req.body;
    
    if (!Array.isArray(faqs)) {
      return errorResponse(res, "FAQs array is required", 400);
    }
    
    const updatePromises = faqs.map((faq, index) => 
      FAQ.findByIdAndUpdate(faq._id, { order: index }, { new: true })
    );
    
    await Promise.all(updatePromises);
    
    const updatedFAQs = await FAQ.find().sort({ order: 1 });
    
    return successResponse(res, { message: "FAQs reordered successfully", faqs: updatedFAQs });
  } catch (error) {
    console.error("Error reordering FAQs:", error);
    return errorResponse(res, "Failed to reorder FAQs: " + error.message);
  }
};
