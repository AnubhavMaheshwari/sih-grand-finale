import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { 
  Upload, 
  FileText, 
  BarChart3, 
  HelpCircle, 
  Mail, 
  ChevronLeft, 
  ChevronRight,
  LogOut,
  User
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext.jsx";
import Toast from "../common/Toast.jsx";
import sarthiLogo from "../../assets/images/sarthiLogo.png";

const InstituteLayout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [toast, setToast] = useState({ message: "", type: "" });
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const showToast = (message, type) => {
    setToast({ message, type });
    setTimeout(() => setToast({ message: "", type: "" }), 3000);
  };

  const handleLogout = () => {
    logout();
    showToast("Logged out successfully", "success");
    navigate("/");
  };

  const menuItems = [
    {
      id: "upload",
      label: "Upload Data",
      icon: <Upload className="w-5 h-5" />,
      path: "/upload",
    },
    {
      id: "reports",
      label: "My Submitted Reports",
      icon: <FileText className="w-5 h-5" />,
      path: "/upload?panel=reports",
    },
    {
      id: "insights",
      label: "Insights & Dashboard",
      icon: <BarChart3 className="w-5 h-5" />,
      path: "/upload?panel=insights",
    },
    {
      id: "faq",
      label: "FAQ",
      icon: <HelpCircle className="w-5 h-5" />,
      path: "/faq",
    },
    {
      id: "contact",
      label: "Contact Us",
      icon: <Mail className="w-5 h-5" />,
      path: "/contact",
    },
  ];

  const isActive = (path) => {
    if (path === "/upload") {
      return location.pathname === "/upload" && !location.search;
    }
    if (path === "/upload?panel=reports") {
      return location.pathname === "/upload" && location.search.includes("panel=reports");
    }
    if (path === "/upload?panel=insights") {
      return location.pathname === "/upload" && location.search.includes("panel=insights");
    }
    return location.pathname === path;
  };

  const getActiveLabel = () => {
    const activeItem = menuItems.find(item => isActive(item.path));
    if (activeItem) return activeItem.label;
    
    if (location.pathname === "/upload") {
      if (location.search.includes("panel=reports")) return "My Submitted Reports";
      if (location.search.includes("panel=insights")) return "Insights & Dashboard";
      return "Upload Data";
    }
    
    return "Institute Dashboard";
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? "w-64" : "w-20"} bg-white border-r border-gray-200 flex flex-col transition-all duration-300`}>
        {/* Logo */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            {sidebarOpen ? (
              <div className="flex items-center space-x-3">
                <img src={sarthiLogo} alt="SARTHI Logo" className="w-10 h-10 rounded-lg" />
                <h1 className="text-xl font-bold text-gray-800">Institute Panel</h1>
              </div>
            ) : (
              <img src={sarthiLogo} alt="SARTHI Logo" className="w-10 h-10 rounded-lg mx-auto" />
            )}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-1.5 rounded-lg hover:bg-gray-100"
            >
              {sidebarOpen ? (
                <ChevronLeft className="w-5 h-5 text-gray-600" />
              ) : (
                <ChevronRight className="w-5 h-5 text-gray-600" />
              )}
            </button>
          </div>
        </div>

        {/* Menu */}
        <nav className="flex-1 p-4 space-y-1">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                if (item.path.includes("?panel=")) {
                  navigate(`/upload${item.path.split("?")[1] ? `?${item.path.split("?")[1]}` : ""}`);
                } else {
                  navigate(item.path);
                }
              }}
              className={`w-full flex items-center ${sidebarOpen ? "justify-start px-4" : "justify-center"} py-3 rounded-lg transition-colors ${
                isActive(item.path)
                  ? "bg-indigo-50 text-indigo-700 border-l-4 border-indigo-600"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <span className={`shrink-0 ${isActive(item.path) ? "text-indigo-600" : "text-gray-500"}`}>
                {item.icon}
              </span>
              {sidebarOpen && <span className="ml-3 font-medium text-left flex-1">{item.label}</span>}
            </button>
          ))}
        </nav>

        {/* User Profile & Logout */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center">
            {sidebarOpen ? (
              <>
                <div className="p-2 bg-indigo-100 rounded-lg">
                  <User className="w-5 h-5 text-indigo-600" />
                </div>
                <div className="ml-3 flex-1">
                  <p className="text-sm font-medium text-gray-900">{user?.fullName || "Institute User"}</p>
                  <p className="text-xs text-gray-500">Institute Account</p>
                </div>
              </>
            ) : (
              <div className="p-2 bg-indigo-100 rounded-lg mx-auto">
                <User className="w-5 h-5 text-indigo-600" />
              </div>
            )}
          </div>
          {sidebarOpen ? (
            <button
              onClick={handleLogout}
              className="w-full mt-4 flex items-center justify-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </button>
          ) : (
            <button
              onClick={handleLogout}
              className="w-full mt-4 flex items-center justify-center p-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-800">
                {getActiveLabel()}
              </h2>
              <p className="text-sm text-gray-600">Institute Portal</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">
                Welcome, <span className="font-semibold">{user?.fullName || "Institute User"}</span>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>

      {/* Toast Notification */}
      {toast.message && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ message: "", type: "" })}
        />
      )}
    </div>
  );
};

export default InstituteLayout;
