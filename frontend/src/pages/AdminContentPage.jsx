import { useState } from "react";
import { useAuth } from "../contexts/AuthContext.jsx";
import FAQManagement from "../components/admin/FAQManagement.jsx";
import ContactUsManagement from "../components/admin/ContactUsManagement.jsx";

const AdminContentPage = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("faq");
  const [toast, setToast] = useState({ message: "", type: "" });

  const showToast = (message, type) => {
    setToast({ message, type });
    setTimeout(() => setToast({ message: "", type: "" }), 3000);
  };

  const tabs = [
    { id: "faq", label: "FAQ Management"},
    { id: "contact", label: "Contact Us"},
  ];

  if (user?.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Access Denied</h1>
          <p className="text-gray-600">You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Tabs */}
      <div className="mb-8">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                    py-4 px-1 border-b-2 font-medium text-sm
                    ${activeTab === tab.id
                    ? "border-indigo-600 text-indigo-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }
                  `}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        {activeTab === "faq" && (
          <FAQManagement showToast={showToast} />
        )}

        {activeTab === "contact" && (
          <ContactUsManagement showToast={showToast} />
        )}
      </div>
    </div>
  );
};

export default AdminContentPage;
