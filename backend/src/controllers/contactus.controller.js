import ContactUs from "../models/ContactUs.model.js";
import { successResponse, errorResponse } from "../utils/apiResponse.js";

// Get contact information (public)
export const getContactInfo = async (req, res) => {
  try {
    // Get the first contact info document (should only be one)
    let contactInfo = await ContactUs.findOne().select('-__v');
    
    // If no contact info exists, create default
    if (!contactInfo) {
      contactInfo = new ContactUs({
        officeName: "SARTHI National Portal",
        address: "National Institute of Technology Jamshedpur, Adityapur Industrial Area",
        city: "Jamshedpur",
        state: "Jharkhand",
        pincode: "831014",
        country: "India",
        phoneNumbers: [
          { label: "Support Hotline", number: "+91 123-456-7891" }
        ],
        emailAddresses: [
          { label: "Support", email: "support@edurank.gov" },
          { label: "Partnerships", email: "partners@edurank.gov" }
        ],
        workingHours: "Monday - Friday, 9:00 AM - 5:00 PM IST",
        socialMedia: [],
        mapEmbedUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3680.041668468091!2d86.1415411!3d22.7770223!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39f5e5c5c5c5c5c5%3A0x5c5c5c5c5c5c5c5c!2sNational%20Institute%20of%20Technology%20Jamshedpur!5e0!3m2!1sen!2sin!4v1234567890!5m2!1sen!2sin",
        description: "Government portal for educational institution ranking and assessment",
        lastUpdatedBy: "system"
      });
      
      await contactInfo.save();
    }
    
    return successResponse(res, { message: "Contact information fetched successfully", contactInfo });
  } catch (error) {
    console.error("Error fetching contact information:", error);
    return errorResponse(res, "Failed to fetch contact information: " + error.message);
  }
};

// Update contact information (admin only)
export const updateContactInfo = async (req, res) => {
  try {
    const updates = req.body;
    
    // Find existing contact info or create new
    let contactInfo = await ContactUs.findOne();
    
    if (!contactInfo) {
      contactInfo = new ContactUs(updates);
    } else {
      // Update fields
      Object.keys(updates).forEach(key => {
        if (key !== '_id' && key !== '__v' && key !== 'createdAt' && key !== 'updatedAt') {
          contactInfo[key] = updates[key];
        }
      });
    }
    
    contactInfo.lastUpdatedBy = req.user?.userId || "admin";
    contactInfo.updatedAt = new Date();
    
    await contactInfo.save();
    
    return successResponse(res, { message: "Contact information updated successfully", contactInfo });
  } catch (error) {
    console.error("Error updating contact information:", error);
    return errorResponse(res, "Failed to update contact information: " + error.message);
  }
};

// Add phone number (admin only)
export const addPhoneNumber = async (req, res) => {
  try {
    const { label, number } = req.body;
    
    if (!label || !number) {
      return errorResponse(res, "Label and number are required", 400);
    }
    
    let contactInfo = await ContactUs.findOne();
    
    if (!contactInfo) {
      contactInfo = new ContactUs({
        phoneNumbers: [{ label, number }],
        lastUpdatedBy: req.user?.userId || "admin"
      });
    } else {
      contactInfo.phoneNumbers.push({ label, number });
      contactInfo.lastUpdatedBy = req.user?.userId || "admin";
    }
    
    await contactInfo.save();
    
    return successResponse(res, { message: "Phone number added successfully", contactInfo });
  } catch (error) {
    console.error("Error adding phone number:", error);
    return errorResponse(res, "Failed to add phone number: " + error.message);
  }
};

// Add email address (admin only)
export const addEmailAddress = async (req, res) => {
  try {
    const { label, email } = req.body;
    
    if (!label || !email) {
      return errorResponse(res, "Label and email are required", 400);
    }
    
    let contactInfo = await ContactUs.findOne();
    
    if (!contactInfo) {
      contactInfo = new ContactUs({
        emailAddresses: [{ label, email }],
        lastUpdatedBy: req.user?.userId || "admin"
      });
    } else {
      contactInfo.emailAddresses.push({ label, email });
      contactInfo.lastUpdatedBy = req.user?.userId || "admin";
    }
    
    await contactInfo.save();
    
    return successResponse(res, { message: "Email address added successfully", contactInfo });
  } catch (error) {
    console.error("Error adding email address:", error);
    return errorResponse(res, "Failed to add email address: " + error.message);
  }
};

// Add social media link (admin only)
export const addSocialMedia = async (req, res) => {
  try {
    const { platform, url, icon } = req.body;
    
    if (!platform || !url) {
      return errorResponse(res, "Platform and URL are required", 400);
    }
    
    let contactInfo = await ContactUs.findOne();
    
    if (!contactInfo) {
      contactInfo = new ContactUs({
        socialMedia: [{ platform, url, icon }],
        lastUpdatedBy: req.user?.userId || "admin"
      });
    } else {
      contactInfo.socialMedia.push({ platform, url, icon });
      contactInfo.lastUpdatedBy = req.user?.userId || "admin";
    }
    
    await contactInfo.save();
    
    return successResponse(res, { message: "Social media link added successfully", contactInfo });
  } catch (error) {
    console.error("Error adding social media link:", error);
    return errorResponse(res, "Failed to add social media link: " + error.message);
  }
};

// Remove phone number (admin only)
export const removePhoneNumber = async (req, res) => {
  try {
    const { index } = req.params;
    
    let contactInfo = await ContactUs.findOne();
    
    if (!contactInfo) {
      return errorResponse(res, "Contact information not found", 404);
    }
    
    if (index < 0 || index >= contactInfo.phoneNumbers.length) {
      return errorResponse(res, "Invalid phone number index", 400);
    }
    
    contactInfo.phoneNumbers.splice(index, 1);
    contactInfo.lastUpdatedBy = req.user?.userId || "admin";
    
    await contactInfo.save();
    
    return successResponse(res, { message: "Phone number removed successfully", contactInfo });
  } catch (error) {
    console.error("Error removing phone number:", error);
    return errorResponse(res, "Failed to remove phone number: " + error.message);
  }
};

// Remove email address (admin only)
export const removeEmailAddress = async (req, res) => {
  try {
    const { index } = req.params;
    
    let contactInfo = await ContactUs.findOne();
    
    if (!contactInfo) {
      return errorResponse(res, "Contact information not found", 404);
    }
    
    if (index < 0 || index >= contactInfo.emailAddresses.length) {
      return errorResponse(res, "Invalid email address index", 400);
    }
    
    contactInfo.emailAddresses.splice(index, 1);
    contactInfo.lastUpdatedBy = req.user?.userId || "admin";
    
    await contactInfo.save();
    
    return successResponse(res, { message: "Email address removed successfully", contactInfo });
  } catch (error) {
    console.error("Error removing email address:", error);
    return errorResponse(res, "Failed to remove email address: " + error.message);
  }
};

// Remove social media link (admin only)
export const removeSocialMedia = async (req, res) => {
  try {
    const { index } = req.params;
    
    let contactInfo = await ContactUs.findOne();
    
    if (!contactInfo) {
      return errorResponse(res, "Contact information not found", 404);
    }
    
    if (index < 0 || index >= contactInfo.socialMedia.length) {
      return errorResponse(res, "Invalid social media index", 400);
    }
    
    contactInfo.socialMedia.splice(index, 1);
    contactInfo.lastUpdatedBy = req.user?.userId || "admin";
    
    await contactInfo.save();
    
    return successResponse(res, { message: "Social media link removed successfully", contactInfo });
  } catch (error) {
    console.error("Error removing social media link:", error);
    return errorResponse(res, "Failed to remove social media link: " + error.message);
  }
};
