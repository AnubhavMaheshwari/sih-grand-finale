import { useState, useEffect } from "react";
import axios from "../../api/axios.config.js";

const FAQManagement = ({ showToast }) => {
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    question: "",
    answer: "",
    category: "general",
    order: 0,
    isActive: true,
  });

  const categories = [
    { value: "general", label: "General" },
    { value: "technical", label: "Technical" },
    { value: "submission", label: "Submission" },
    { value: "account", label: "Account" },
    { value: "other", label: "Other" },
  ];

  useEffect(() => {
    fetchFAQs();
  }, []);

  const fetchFAQs = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/api/faq/admin/all");
      setFaqs(response.data.data.faqs || []);
    } catch (error) {
      console.error("Error fetching FAQs:", error);
      showToast("Failed to load FAQs", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (editingId) {
        // Update existing FAQ
        await axios.put(`/api/faq/${editingId}`, formData);
        showToast("FAQ updated successfully", "success");
      } else {
        // Create new FAQ
        await axios.post("/api/faq", formData);
        showToast("FAQ created successfully", "success");
      }
      
      resetForm();
      fetchFAQs();
    } catch (error) {
      console.error("Error saving FAQ:", error);
      showToast("Failed to save FAQ", "error");
    }
  };

  const handleEdit = (faq) => {
    setEditingId(faq._id);
    setFormData({
      question: faq.question,
      answer: faq.answer,
      category: faq.category,
      order: faq.order,
      isActive: faq.isActive,
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this FAQ?")) {
      return;
    }
    
    try {
      await axios.delete(`/api/faq/${id}`);
      showToast("FAQ deleted successfully", "success");
      fetchFAQs();
    } catch (error) {
      console.error("Error deleting FAQ:", error);
      showToast("Failed to delete FAQ", "error");
    }
  };

  const handleToggleActive = async (faq) => {
    try {
      await axios.put(`/api/faq/${faq._id}`, {
        ...faq,
        isActive: !faq.isActive,
      });
      showToast(`FAQ ${!faq.isActive ? "activated" : "deactivated"}`, "success");
      fetchFAQs();
    } catch (error) {
      console.error("Error toggling FAQ status:", error);
      showToast("Failed to update FAQ status", "error");
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({
      question: "",
      answer: "",
      category: "general",
      order: 0,
      isActive: true,
    });
  };

  const handleReorder = async (direction, index) => {
    if (
      (direction === "up" && index === 0) ||
      (direction === "down" && index === faqs.length - 1)
    ) {
      return;
    }

    const newFaqs = [...faqs];
    const newIndex = direction === "up" ? index - 1 : index + 1;
    
    // Swap order values
    const tempOrder = newFaqs[index].order;
    newFaqs[index].order = newFaqs[newIndex].order;
    newFaqs[newIndex].order = tempOrder;
    
    // Swap positions in array
    [newFaqs[index], newFaqs[newIndex]] = [newFaqs[newIndex], newFaqs[index]];
    
    setFaqs(newFaqs);

    try {
      await axios.put("/api/faq/admin/reorder", { faqs: newFaqs });
      showToast("FAQs reordered successfully", "success");
    } catch (error) {
      console.error("Error reordering FAQs:", error);
      showToast("Failed to reorder FAQs", "error");
      fetchFAQs(); // Revert to original order
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
      {/* Form */}
      <div className="bg-gray-50 rounded-xl p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          {editingId ? "Edit FAQ" : "Add New FAQ"}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Question *
              </label>
              <input
                type="text"
                name="question"
                value={formData.question}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Enter question"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                {categories.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Answer *
            </label>
            <textarea
              name="answer"
              value={formData.answer}
              onChange={handleInputChange}
              required
              rows="4"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Enter detailed answer"
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Order
              </label>
              <input
                type="number"
                name="order"
                value={formData.order}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                min="0"
              />
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="isActive"
                name="isActive"
                checked={formData.isActive}
                onChange={handleInputChange}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label htmlFor="isActive" className="ml-2 block text-sm text-gray-700">
                Active
              </label>
            </div>
          </div>
          
          <div className="flex space-x-3 pt-4">
            <button
              type="submit"
              className="px-6 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              {editingId ? "Update FAQ" : "Add FAQ"}
            </button>
            
            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="px-6 py-2 bg-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* FAQ List */}
      <div>
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Manage FAQs ({faqs.length})
        </h2>
        
        {faqs.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-xl">
            <p className="text-gray-500">No FAQs found. Add your first FAQ above.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div
                key={faq._id}
                className={`border rounded-xl p-4 ${faq.isActive ? "border-gray-200 bg-white" : "border-gray-100 bg-gray-50"}`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <span className={`px-2 py-1 text-xs font-medium rounded ${faq.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}>
                        {faq.isActive ? "Active" : "Inactive"}
                      </span>
                      <span className="px-2 py-1 text-xs font-medium bg-indigo-100 text-indigo-800 rounded">
                        {categories.find(c => c.value === faq.category)?.label || faq.category}
                      </span>
                      <span className="text-sm text-gray-500">Order: {faq.order}</span>
                    </div>
                    
                    <h3 className="font-medium text-gray-900 mb-1">{faq.question}</h3>
                    <p className="text-gray-600 text-sm">{faq.answer}</p>
                  </div>
                  
                  <div className="flex space-x-2 ml-4">
                    <button
                      onClick={() => handleReorder("up", index)}
                      disabled={index === 0}
                      className={`p-1 rounded ${index === 0 ? "text-gray-300 cursor-not-allowed" : "text-gray-600 hover:bg-gray-100"}`}
                      title="Move up"
                    >
                      ↑
                    </button>
                    <button
                      onClick={() => handleReorder("down", index)}
                      disabled={index === faqs.length - 1}
                      className={`p-1 rounded ${index === faqs.length - 1 ? "text-gray-300 cursor-not-allowed" : "text-gray-600 hover:bg-gray-100"}`}
                      title="Move down"
                    >
                      ↓
                    </button>
                    <button
                      onClick={() => handleEdit(faq)}
                      className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                      title="Edit"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => handleToggleActive(faq)}
                      className={`p-1 rounded ${faq.isActive ? "text-yellow-600 hover:bg-yellow-50" : "text-green-600 hover:bg-green-50"}`}
                      title={faq.isActive ? "Deactivate" : "Activate"}
                    >
                      {faq.isActive ? "⏸️" : "▶️"}
                    </button>
                    <button
                      onClick={() => handleDelete(faq._id)}
                      className="p-1 text-red-600 hover:bg-red-50 rounded"
                      title="Delete"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FAQManagement;
