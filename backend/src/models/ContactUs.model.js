import mongoose from "mongoose";

const contactUsSchema = new mongoose.Schema(
  {
    // Office Information
    officeName: {
      type: String,
      default: "SARTHI National Portal",
      trim: true,
    },
    address: {
      type: String,
      required: true,
      trim: true,
    },
    city: {
      type: String,
      default: "",
      trim: true,
    },
    state: {
      type: String,
      default: "",
      trim: true,
    },
    pincode: {
      type: String,
      default: "",
      trim: true,
    },
    country: {
      type: String,
      default: "India",
      trim: true,
    },
    
    // Contact Information
    phoneNumbers: [{
      label: String,
      number: String,
    }],
    emailAddresses: [{
      label: String,
      email: String,
    }],
    
    // Working Hours
    workingHours: {
      type: String,
      default: "Monday - Friday, 9:00 AM - 5:00 PM IST",
    },
    
    // Social Media Links
    socialMedia: [{
      platform: String,
      url: String,
      icon: String,
    }],
    
    // Map Embed URL (Google Maps)
    mapEmbedUrl: {
      type: String,
      default: "",
    },
    
    // Additional Information
    description: {
      type: String,
      default: "",
    },
    
    // Metadata
    lastUpdatedBy: {
      type: String,
      default: "admin",
    },
  },
  { timestamps: true }
);

const ContactUs = mongoose.model("ContactUs", contactUsSchema);

export default ContactUs;
