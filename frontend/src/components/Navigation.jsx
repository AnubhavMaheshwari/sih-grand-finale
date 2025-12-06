import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const PRIMARY_BLUE = "#4F46E5";
const DEEP_INDIGO = "#3730A3";

const Navigation = () => {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const isInstitutionLoggedIn =
    typeof window !== "undefined" &&
    localStorage.getItem("institutionLoggedIn") === "true";

  const isUGCLoggedIn =
    typeof window !== "undefined" &&
    localStorage.getItem("ugcMemberLoggedIn") === "true";

  const navItems = isInstitutionLoggedIn
    ? [
        { name: "Institute Dashboard", path: "/upload" },
        { name: "FAQ", path: "/faq" },
        { name: "Contact Us", path: "/contact" },
      ]
    : isUGCLoggedIn
    ? [
        { name: "UGC/AICTE Dashboard", path: "/edu" },
        { name: "Uploaded Data", path: "/uploaded-data" },
        { name: "FAQ", path: "/faq" },
        { name: "Contact Us", path: "/contact" },
      ]
    : [
        { name: "Login", path: "/" },
        { name: "EduRank", path: "/edu" },
        { name: "FAQ", path: "/faq" },
        { name: "Contact Us", path: "/contact" },
      ];

  const userMenuItems = isInstitutionLoggedIn
    ? [
        { label: "Your Profile", path: "/upload" },
        { label: "Sign out", path: "/" },
      ]
    : isUGCLoggedIn
    ? [
        { label: "Your Profile", path: "/edu" },
        { label: "Sign out", path: "/" },
      ]
    : [{ label: "Login", path: "/" }];

  const navigateSimulated = (path) => {
    navigate(path);
  };

  const handleUserMenuClick = (event) => {
    event.stopPropagation();
    setIsUserMenuOpen((prev) => !prev);
  };

  const handleUserMenuItemClick = (item) => {
    if (item.label === "Sign out") {
      localStorage.removeItem("institutionLoggedIn");
      localStorage.removeItem("ugcMemberLoggedIn");
    }
    navigateSimulated(item.path);
    setIsUserMenuOpen(false);
  };

  return (
    <nav className="bg-white border-b border-gray-200 shadow-md">
      <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="relative flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <button
              onClick={() => navigateSimulated("/")}
              className="text-2xl font-bold focus:outline-none"
              style={{ color: DEEP_INDIGO }}
            >
              SARTHI Portal
            </button>
          </div>

          <div className="flex items-center space-x-6">
            {/* Main Tabs */}
            <div className="items-baseline hidden space-x-4 md:flex">
              {navItems.map((item) => {
                const isActive = location.pathname === item.path;

                return (
                  <button
                    key={item.name}
                    onClick={() => navigateSimulated(item.path)}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive
                        ? "text-white"
                        : "text-gray-700 hover:text-blue-700"
                    }`}
                    style={{
                      backgroundColor: isActive ? PRIMARY_BLUE : undefined,
                    }}
                  >
                    {item.name}
                  </button>
                );
              })}
            </div>

            {/* User Profile Icon and Dropdown */}
            <div className="relative flex items-center">
              <button
                type="button"
                onClick={handleUserMenuClick}
                className="flex items-center justify-center w-10 h-10 bg-gray-100 border-2 rounded-full border-primary-blue text-deep-indigo hover:bg-gray-200 focus:outline-none"
              >
                <span className="sr-only">User menu</span>
                <svg
                  className="w-6 h-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </button>

              {isUserMenuOpen && (
                <div className="absolute right-0 z-10 w-48 py-1 mt-2 origin-top-right bg-white rounded-md shadow-lg top-full ring-1 ring-black ring-opacity-5 focus:outline-none">
                  {userMenuItems.map((item) => (
                    <button
                      key={item.label}
                      type="button"
                      onClick={() => handleUserMenuItemClick(item)}
                      className="block w-full px-4 py-2 text-sm text-left text-gray-700 hover:bg-gray-100"
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
