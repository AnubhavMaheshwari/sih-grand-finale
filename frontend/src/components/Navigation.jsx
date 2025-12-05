import React, { useState } from 'react';
import { Link } from 'react-router-dom';

// Default links used if no links are provided by the parent component (e.g., for the Upload Doc page)
const defaultNavLinks = [
    { to: "/upload", label: "Upload Doc" },
    { to: "/faq", label: "FAQ" },
    { to: "/contact", label: "Contact Us" },
];

const defaultUserMenuItems = ["Your Profile", "Settings", "Sign out"];

/**
 * Navigation Component
 * Renders links based on the 'navLinks' prop or falls back to 'defaultNavLinks'.
 * @param {string} currentPage - The label of the current active page.
 * @param {Array} navLinks - Custom list of { to: string, label: string } links.
 */
function Navigation({ currentPage, navLinks }) {
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    
    // Use the custom links if provided, otherwise use the default.
    const effectiveNavLinks = navLinks || defaultNavLinks;

    const handleUserMenuClick = (event) => {
        event.stopPropagation();
        setIsUserMenuOpen(prev => !prev);
    };
    
    const handleMobileMenuClick = (event) => {
        event.stopPropagation();
        setIsMobileMenuOpen(prev => !prev);
    };

    return (
        <nav className="bg-white shadow-md">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="relative flex items-center justify-center h-16">
                    {/* Logo/Title */}
                    <div className="absolute inset-y-0 left-0 flex items-center">
                        <Link to="/" className="flex-shrink-0">
                            <h1 className="text-2xl font-bold text-deep-indigo">
                                SARTHI National Portal
                            </h1>
                        </Link>
                    </div>

                    {/* Desktop Menu */}
                    <div className="hidden md:block">
                        <div className="flex items-baseline space-x-4">
                            {effectiveNavLinks.map((link) => (
                                <Link
                                    key={link.to}
                                    to={link.to}
                                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                                        currentPage === link.label || link.to === window.location.pathname
                                          ? 'text-white bg-primary-blue'
                                          : 'text-gray-700 hover:bg-primary-blue hover:text-white'
                                    }`}
                                    aria-current={currentPage === link.label ? 'page' : undefined}
                                >
                                    {link.label}
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* User Menu & Mobile Button */}
                    <div className="absolute inset-y-0 right-0 flex items-center space-x-3">
                        {/* User Dropdown */}
                        <div className="relative">
                            <button
                                type="button"
                                onClick={handleUserMenuClick}
                                className="flex items-center justify-center h-10 w-10 bg-gray-100 rounded-full text-deep-indigo hover:bg-light-gray focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-blue"
                            >
                                <span className="sr-only">User menu</span>
                                <i className="fas fa-user"></i>
                            </button>

                            {isUserMenuOpen && (
                                <div
                                    className="absolute right-0 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-10"
                                    onBlur={() => setIsUserMenuOpen(false)}
                                >
                                    {defaultUserMenuItems.map((item) => (
                                        <Link
                                            key={item}
                                            to={item === "Sign out" ? "/" : "#"}
                                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                        >
                                            {item}
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Mobile Menu Button */}
                        <div className="flex md:hidden">
                            <button
                                type="button"
                                onClick={handleMobileMenuClick}
                                className="bg-gray-100 inline-flex items-center justify-center p-2 rounded-md text-gray-600 hover:text-white hover:bg-primary-blue focus:outline-none"
                            >
                                <span className="sr-only">Open main menu</span>
                                <i className={`fas ${isMobileMenuOpen ? 'fa-times' : 'fa-bars'}`}></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile Menu Content */}
            {isMobileMenuOpen && (
                <div className="md:hidden">
                    <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                        {effectiveNavLinks.map((link) => (
                            <Link
                                key={link.to}
                                to={link.to}
                                className="text-gray-700 hover:bg-primary-blue hover:text-white block px-3 py-2 rounded-md text-base font-medium"
                            >
                                {link.label}
                            </Link>
                        ))}
                    </div>
                </div>
            )}
        </nav>
    );
}

export default Navigation;