import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext.jsx";

const PRIMARY_BLUE = "#4F46E5";
const DEEP_INDIGO = "#3730A3";

const Navigation = ({ currentPage, onLogout }) => {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();

  // Navigation items based on user role and authentication
  const getNavItems = () => {
    if (!isAuthenticated()) {
      return [
        { name: "Login", path: "/" },
        { name: "EduRank", path: "/edu" },
        { name: "FAQ", path: "/faq" },
        { name: "Contact Us", path: "/contact" },
      ];
    }

    switch (user?.role) {
      case "institute":
        return [
          { name: "My Dashboard", path: "/upload" },
          { name: "FAQ", path: "/faq" },
          { name: "Contact Us", path: "/contact" },
        ];
      case "ugc_employee":
        return [
          { name: "My Dashboard", path: "/edu" },
          { name: "Uploaded Data", path: "/uploaded-data" },
          { name: "FAQ", path: "/faq" },
          { name: "Contact Us", path: "/contact" },
        ];
      case "admin":
        return [
          { name: "Admin Dashboard", path: "/admin/dashboard" },
          { name: "User Management", path: "/admin/dashboard" },
        ];
      default:
        return [
          { name: "Dashboard", path: "/" },
          { name: "FAQ", path: "/faq" },
          { name: "Contact Us", path: "/contact" },
        ];
    }
  };

  // User menu items based on authentication
  const getUserMenuItems = () => {
    if (!isAuthenticated()) {
      return [{ label: "Login", path: "/" }];
    }

    const baseItems = [
      { label: "Your Profile", path: getProfilePath() },
      { label: "Sign out", action: "logout" },
    ];

    return baseItems;
  };

  const getProfilePath = () => {
    if (!user?.role) return "/";
    
    switch (user.role) {
      case "institute":
        return "/upload";
      case "ugc_employee":
        return "/edu";
      case "admin":
        return "/admin/dashboard";
      default:
        return "/";
    }
  };

  const handleNavigation = (path) => {
    navigate(path);
  };

  const handleUserMenuClick = (event) => {
    event.stopPropagation();
    setIsUserMenuOpen((prev) => !prev);
  };

  const handleUserMenuItemClick = (item) => {
    if (item.action === "logout") {
      logout();
      if (onLogout) {
        onLogout();
      }
      navigate("/");
    } else {
      handleNavigation(item.path);
    }
    setIsUserMenuOpen(false);
  };

  const getUserInitials = () => {
    if (!user?.fullName) return "U";
    return user.fullName
      .split(" ")
      .map(name => name[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  const getUserDisplayName = () => {
    if (!user) return "Guest";
    
    if (user.fullName) {
      return user.fullName.split(" ")[0]; // First name only
    }
    
    return user.role === "institute" ? "Institute User" : 
           user.role === "ugc_employee" ? "UGC Employee" : 
           user.role === "admin" ? "Admin" : "User";
  };

  const navItems = getNavItems();
  const userMenuItems = getUserMenuItems();

  return (
    <nav className="bg-white shadow-md border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <button
              onClick={() => handleNavigation("/")}
              className="text-2xl font-bold focus:outline-none"
              style={{ color: DEEP_INDIGO }}
            >
              SARTHI Portal
            </button>
          </div>

          <div className="flex items-center space-x-6">
            {/* Main Tabs */}
            <div className="hidden md:flex items-baseline space-x-4">
              {navItems.map((item) => (
                <button
                  key={item.name}
                  onClick={() => handleNavigation(item.path)}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    item.name === currentPage
                      ? "text-white bg-primary-blue"
                      : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                  }`}
                  style={{
                    backgroundColor:
                      item.name === currentPage ? PRIMARY_BLUE : undefined,
                    color: item.name === currentPage ? "white" : undefined,
                  }}
                >
                  {item.name}
                </button>
              ))}
            </div>

            {/* User Profile Icon and Dropdown */}
            <div className="relative flex items-center">
              <div className="mr-3 hidden md:block">
                <span className="text-sm text-gray-700">
                  Welcome, <span className="font-semibold">{getUserDisplayName()}</span>
                </span>
              </div>
              
              <button
                type="button"
                onClick={handleUserMenuClick}
                className="flex items-center justify-center h-10 w-10 bg-indigo-100 rounded-full border-2 border-primary-blue text-deep-indigo hover:bg-indigo-200 focus:outline-none transition-colors"
                aria-label="User menu"
              >
                <span className="font-semibold text-sm">
                  {getUserInitials()}
                </span>
              </button>

              {isUserMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <p className="text-sm font-medium text-gray-900">{getUserDisplayName()}</p>
                    <p className="text-xs text-gray-500 truncate">
                      {user?.email || user?.userId || ""}
                    </p>
                    <p className="text-xs text-gray-500 capitalize mt-1">
                      {user?.role || "Guest"}
                    </p>
                  </div>
                  
                  {userMenuItems.map((item) => (
                    <button
                      key={item.label}
                      type="button"
                      onClick={() => handleUserMenuItemClick(item)}
                      className="w-full text-left block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
