import React, { useState } from "react";

const PRIMARY_BLUE = "#4F46E5";
const DEEP_INDIGO = "#3730A3";

const Navigation = ({ currentPage }) => {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const isInstitutionLoggedIn =
    typeof window !== "undefined" &&
    localStorage.getItem("institutionLoggedIn") === "true";

  const isUGCLoggedIn =
    typeof window !== "undefined" &&
    localStorage.getItem("ugcMemberLoggedIn") === "true";

  const navItems = isInstitutionLoggedIn
    ? [
        { name: "My Dashboard", path: "/upload" },
        { name: "Institute Performance", path: "/edu" },
        { name: "FAQ", path: "/faq" },
        { name: "Contact Us", path: "/contact" },
      ]
    : isUGCLoggedIn
    ? [
        { name: "My Dashboard", path: "/edu" },
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
    if (path === "/") window.location.href = "index.html";
    else if (path === "/faq") window.location.href = "faq.html";
    else if (path === "/contact") window.location.href = "contactUs.html";
    else if (path === "/upload") window.location.href = "uploadDoc.html";
    else if (path === "/edu") window.location.href = "edu.html";
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
    <nav className="bg-white shadow-md border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative flex items-center justify-between h-16">
          <div className="flex items-center">
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                navigateSimulated("/");
              }}
              className="text-2xl font-bold"
              style={{ color: DEEP_INDIGO }}
            >
              SARTHI Portal
            </a>
          </div>

          <div className="flex items-center space-x-6">
            <div className="hidden md:flex items-baseline space-x-4">
              {navItems.map((item) => (
                <a
                  key={item.name}
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    navigateSimulated(item.path);
                  }}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    item.name === currentPage
                      ? "text-white bg-primary-blue"
                      : "text-gray-700 hover:bg-primary-blue hover:text-blue-700"
                  }`}
                  style={{
                    backgroundColor:
                      item.name === currentPage ? PRIMARY_BLUE : undefined,
                    color: item.name === currentPage ? "white" : undefined,
                  }}
                >
                  {item.name}
                </a>
              ))}
            </div>

            <div className="relative flex items-center">
              <button
                type="button"
                onClick={handleUserMenuClick}
                className="flex items-center justify-center h-10 w-10 bg-gray-100 rounded-full border-2 border-primary-blue text-deep-indigo hover:bg-gray-200 focus:outline-none"
              >
                <span className="sr-only">User menu</span>
                <svg
                  className="h-6 w-6"
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
                <div className="absolute right-0 top-full mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
                  {userMenuItems.map((item) => (
                    <button
                      key={item.label}
                      type="button"
                      onClick={() => handleUserMenuItemClick(item)}
                      className="w-full text-left block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
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
