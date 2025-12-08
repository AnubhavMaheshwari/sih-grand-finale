import { useState, useEffect } from "react";
import axios from "../../api/axios.config.js";

const ContactUsManagement = ({ showToast }) => {
  const [contactInfo, setContactInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    officeName: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    country: "India",
    workingHours: "",
    mapEmbedUrl: "",
    description: "",
  });
  const [newPhone, setNewPhone] = useState({ label: "", number: "" });
  const [newEmail, setNewEmail] = useState({ label: "", email: "" });
  const [newSocial, setNewSocial] = useState({ platform: "", url: "", icon: "" });

  useEffect(() => {
    fetchContactInfo();
  }, []);

  const fetchContactInfo = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/api/contact");
      setContactInfo(response.data.data.contactInfo);
      
      if (response.data.data.contactInfo) {
        setFormData({
          officeName: response.data.data.contactInfo.officeName || "",
          address: response.data.data.contactInfo.address || "",
          city: response.data.data.contactInfo.city || "",
          state: response.data.data.contactInfo.state || "",
          pincode: response.data.data.contactInfo.pincode || "",
          country: response.data.data.contactInfo.country || "India",
          workingHours: response.data.data.contactInfo.workingHours || "",
          mapEmbedUrl: response.data.data.contactInfo.mapEmbedUrl || "",
          description: response.data.data.contactInfo.description || "",
        });
      }
    } catch (error) {
      console.error("Error fetching contact info:", error);
      showToast("Failed to load contact information", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      await axios.put("/api/contact", formData);
      showToast("Contact information updated successfully", "success");
      setEditing(false);
      fetchContactInfo();
    } catch (error) {
      console.error("Error updating contact info:", error);
      showToast("Failed to update contact information", "error");
    }
  };

  const handleAddPhone = async () => {
    if (!newPhone.label || !newPhone.number) {
      showToast("Please fill both label and number", "error");
      return;
    }
    
    try {
      await axios.post("/api/contact/phone", newPhone);
      showToast("Phone number added successfully", "success");
      setNewPhone({ label: "", number: "" });
      fetchContactInfo();
    } catch (error) {
      console.error("Error adding phone number:", error);
      showToast("Failed to add phone number", "error");
    }
  };

  const handleAddEmail = async () => {
    if (!newEmail.label || !newEmail.email) {
      showToast("Please fill both label and email", "error");
      return;
    }
    
    try {
      await axios.post("/api/contact/email", newEmail);
      showToast("Email address added successfully", "success");
      setNewEmail({ label: "", email: "" });
      fetchContactInfo();
    } catch (error) {
      console.error("Error adding email address:", error);
      showToast("Failed to add email address", "error");
    }
  };

  const handleAddSocial = async () => {
    if (!newSocial.platform || !newSocial.url) {
      showToast("Please fill both platform and URL", "error");
      return;
    }
    
    try {
      await axios.post("/api/contact/social", newSocial);
      showToast("Social media link added successfully", "success");
      setNewSocial({ platform: "", url: "", icon: "" });
      fetchContactInfo();
    } catch (error) {
      console.error("Error adding social media link:", error);
      showToast("Failed to add social media link", "error");
    }
  };

  const handleRemovePhone = async (index) => {
    if (!window.confirm("Are you sure you want to remove this phone number?")) {
      return;
    }
    
    try {
      await axios.delete(`/api/contact/phone/${index}`);
      showToast("Phone number removed successfully", "success");
      fetchContactInfo();
    } catch (error) {
      console.error("Error removing phone number:", error);
      showToast("Failed to remove phone number", "error");
    }
  };

  const handleRemoveEmail = async (index) => {
    if (!window.confirm("Are you sure you want to remove this email address?")) {
      return;
    }
    
    try {
      await axios.delete(`/api/contact/email/${index}`);
      showToast("Email address removed successfully", "success");
      fetchContactInfo();
    } catch (error) {
      console.error("Error removing email address:", error);
      showToast("Failed to remove email address", "error");
    }
  };

  const handleRemoveSocial = async (index) => {
    if (!window.confirm("Are you sure you want to remove this social media link?")) {
      return;
    }
    
    try {
      await axios.delete(`/api/contact/social/${index}`);
      showToast("Social media link removed successfully", "success");
      fetchContactInfo();
    } catch (error) {
      console.error("Error removing social media link:", error);
      showToast("Failed to remove social media link", "error");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Basic Information */}
      <div className="bg-gray-50 rounded-xl p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-800">Contact Information</h2>
          <button
            onClick={() => setEditing(!editing)}
            className={`px-4 py-2 rounded-lg font-medium ${editing ? "bg-gray-200 text-gray-700 hover:bg-gray-300" : "bg-indigo-600 text-white hover:bg-indigo-700"}`}
          >
            {editing ? "Cancel Editing" : "Edit Information"}
          </button>
        </div>
        
        {editing ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Office Name
                </label>
                <input
                  type="text"
                  name="officeName"
                  value={formData.officeName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Working Hours
                </label>
                <input
                  type="text"
                  name="workingHours"
                  value={formData.workingHours}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="e.g., Monday - Friday, 9:00 AM - 5:00 PM IST"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Address
              </label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                rows="2"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  City
                </label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  State
                </label>
                <input
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Pincode
                </label>
                <input
                  type="text"
                  name="pincode"
                  value={formData.pincode}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Country
                </label>
                <input
                  type="text"
                  name="country"
                  value={formData.country}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Map Embed URL
              </label>
              <input
                type="text"
                name="mapEmbedUrl"
                value={formData.mapEmbedUrl}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Google Maps embed URL"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows="3"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Brief description about the office"
              />
            </div>
            
            <div className="pt-4">
              <button
                type="submit"
                className="px-6 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Save Changes
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Office Name</h3>
                <p className="text-gray-900">{contactInfo?.officeName || "Not set"}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-500">Working Hours</h3>
                <p className="text-gray-900">{contactInfo?.workingHours || "Not set"}</p>
              </div>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-500">Address</h3>
              <p className="text-gray-900">
                {contactInfo?.address || "Not set"}
                {contactInfo?.city && `, ${contactInfo.city}`}
                {contactInfo?.state && `, ${contactInfo.state}`}
                {contactInfo?.pincode && ` - ${contactInfo.pincode}`}
                {contactInfo?.country && `, ${contactInfo.country}`}
              </p>
            </div>
            
            {contactInfo?.description && (
              <div>
                <h3 className="text-sm font-medium text-gray-500">Description</h3>
                <p className="text-gray-900">{contactInfo.description}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Phone Numbers */}
      <div className="bg-gray-50 rounded-xl p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Phone Numbers</h2>
        
        <div className="space-y-4">
          {/* Add New Phone */}
          <div className="flex space-x-3">
            <input
              type="text"
              value={newPhone.label}
              onChange={(e) => setNewPhone({ ...newPhone, label: e.target.value })}
              placeholder="Label (e.g., Support Hotline)"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
            <input
              type="text"
              value={newPhone.number}
              onChange={(e) => setNewPhone({ ...newPhone, number: e.target.value })}
              placeholder="Phone Number"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
            <button
              onClick={handleAddPhone}
              className="px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              Add
            </button>
          </div>
          
          {/* Phone List */}
          {contactInfo?.phoneNumbers?.length > 0 ? (
            <div className="space-y-2">
              {contactInfo.phoneNumbers.map((phone, index) => (
                <div key={index} className="flex justify-between items-center bg-white p-3 rounded-lg border">
                  <div>
                    <span className="font-medium text-gray-900">{phone.label}:</span>
                    <span className="ml-2 text-gray-600">{phone.number}</span>
                  </div>
                  <button
                    onClick={() => handleRemovePhone(index)}
                    className="text-red-600 hover:text-red-800"
                    title="Remove"
                  >
                    🗑️
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">No phone numbers added yet.</p>
          )}
        </div>
      </div>

      {/* Email Addresses */}
      <div className="bg-gray-50 rounded-xl p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Email Addresses</h2>
        
        <div className="space-y-4">
          {/* Add New Email */}
          <div className="flex space-x-3">
            <input
              type="text"
              value={newEmail.label}
              onChange={(e) => setNewEmail({ ...newEmail, label: e.target.value })}
              placeholder="Label (e.g., Support)"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
            <input
              type="email"
              value={newEmail.email}
              onChange={(e) => setNewEmail({ ...newEmail, email: e.target.value })}
              placeholder="Email Address"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
            <button
              onClick={handleAddEmail}
              className="px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              Add
            </button>
          </div>
          
          {/* Email List */}
          {contactInfo?.emailAddresses?.length > 0 ? (
            <div className="space-y-2">
              {contactInfo.emailAddresses.map((email, index) => (
                <div key={index} className="flex justify-between items-center bg-white p-3 rounded-lg border">
                  <div>
                    <span className="font-medium text-gray-900">{email.label}:</span>
                    <span className="ml-2 text-gray-600">{email.email}</span>
                  </div>
                  <button
                    onClick={() => handleRemoveEmail(index)}
                    className="text-red-600 hover:text-red-800"
                    title="Remove"
                  >
                    🗑️
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">No email addresses added yet.</p>
          )}
        </div>
      </div>

      {/* Social Media Links */}
      <div className="bg-gray-50 rounded-xl p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Social Media Links</h2>
        
        <div className="space-y-4">
          {/* Add New Social Media */}
          <div className="flex space-x-3">
            <input
              type="text"
              value={newSocial.platform}
              onChange={(e) => setNewSocial({ ...newSocial, platform: e.target.value })}
              placeholder="Platform (e.g., Twitter, LinkedIn)"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
            <input
              type="text"
              value={newSocial.url}
              onChange={(e) => setNewSocial({ ...newSocial, url: e.target.value })}
              placeholder="URL"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
            <input
              type="text"
              value={newSocial.icon}
              onChange={(e) => setNewSocial({ ...newSocial, icon: e.target.value })}
              placeholder="Icon (optional)"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
            <button
              onClick={handleAddSocial}
              className="px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              Add
            </button>
          </div>
          
          {/* Social Media List */}
          {contactInfo?.socialMedia?.length > 0 ? (
            <div className="space-y-2">
              {contactInfo.socialMedia.map((social, index) => (
                <div key={index} className="flex justify-between items-center bg-white p-3 rounded-lg border">
                  <div>
                    <span className="font-medium text-gray-900">{social.platform}:</span>
                    <a 
                      href={social.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="ml-2 text-blue-600 hover:underline"
                    >
                      {social.url}
                    </a>
                    {social.icon && (
                      <span className="ml-2 text-gray-500">Icon: {social.icon}</span>
                    )}
                  </div>
                  <button
                    onClick={() => handleRemoveSocial(index)}
                    className="text-red-600 hover:text-red-800"
                    title="Remove"
                  >
                    🗑️
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">No social media links added yet.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContactUsManagement;
