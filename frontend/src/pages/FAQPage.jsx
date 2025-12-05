import React, { useState } from 'react';
import { Link } from 'react-router-dom';

// Define the two main colors based on the design system
const PRIMARY_BLUE = '#4F46E5'; // Primary Blue
const DEEP_INDIGO = '#3730A3'; // Deep Indigo

// --- Custom Components for Single File Mandate ---

/**
 * Custom Navigation Component
 * Replicates the minimal design structure (Logo left, Links right) + adds the User Profile Dropdown.
 */
const Navigation = ({ currentPage }) => {
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

    // List of public navigation items. Consistent minimal set: Login, FAQ, Contact Us.
    const navItems = [
        { name: 'Login', path: '/' },
        { name: 'FAQ', path: '/faq' },
        { name: 'Contact Us', path: '/contact' },
    ];
    
    const userMenuItems = [
        { label: 'Your Profile', path: '#' },
        { label: 'Settings', path: '#' },
        { label: 'Sign out', path: '/' },
    ];

    const navigateSimulated = (path) => {
        // Simulates navigation using direct URL change (for non-React Router environments)
        if (path === '/') window.location.href = 'index.html';
        else if (path === '/faq') window.location.href = 'faq.html';
        else if (path === '/contact') window.location.href = 'contactUs.html';
    };

    const handleUserMenuClick = (event) => {
        event.stopPropagation(); // Prevents click from closing the menu immediately
        setIsUserMenuOpen(prev => !prev);
    };

    return (
        <nav className="bg-white shadow-md border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="relative flex items-center justify-between h-16">
                    
                    {/* Logo/Title - Left Aligned */}
                    <div className="flex items-center">
                        <a href="#" className="text-2xl font-bold" style={{ color: DEEP_INDIGO }}>SARTHI Portal</a>
                    </div>
                    
                    {/* Desktop Menu & User Icon - Right Aligned */}
                    <div className="flex items-center space-x-6">
                        
                        {/* Main Tabs */}
                        <div className="hidden md:flex items-baseline space-x-4">
                            {navItems.map((item) => (
                                <a
                                    key={item.name}
                                    href="#" 
                                    onClick={() => navigateSimulated(item.path)}
                                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                                        item.name === currentPage
                                            ? 'text-white bg-primary-blue' 
                                            : 'text-gray-700 hover:bg-primary-blue hover:text-white'
                                    }`}
                                    style={{ 
                                        backgroundColor: item.name === currentPage ? PRIMARY_BLUE : undefined,
                                        color: item.name === currentPage ? 'white' : undefined,
                                    }}
                                >
                                    {item.name}
                                </a>
                            ))}
                        </div>
                        
                        {/* User Profile Icon and Dropdown */}
                        <div className="relative flex items-center">
                            {/* User Icon Button */}
                            <button
                                type="button"
                                onClick={handleUserMenuClick}
                                // Replicated styles from original HTML/image for the user circle
                                className="flex items-center justify-center h-10 w-10 bg-gray-100 rounded-full border-2 border-primary-blue text-deep-indigo hover:bg-light-gray focus:outline-none"
                            >
                                <span className="sr-only">User menu</span>
                                {/* Generic User SVG Icon */}
                                <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </button>

                            {/* Dropdown Menu */}
                            {isUserMenuOpen && (
                                <div
                                    className="absolute right-0 top-full mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-10"
                                    onBlur={() => setIsUserMenuOpen(false)}
                                >
                                    {userMenuItems.map((item) => (
                                        <Link
                                            key={item.label}
                                            to={item.path}
                                            onClick={() => {
                                                navigateSimulated(item.path);
                                                setIsUserMenuOpen(false); // Close menu on click
                                            }}
                                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                        >
                                            {item.label}
                                        </Link>
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

/**
 * Custom Footer Component
 */
const Footer = () => (
    <footer className="bg-white border-t border-gray-200 py-6 mt-12">
        <div className="container mx-auto text-center text-sm text-gray-500">
            &copy; 2025 SARTHI National Portal, all rights reserved
        </div>
    </footer>
);


// --- FAQ Data ---
const faqData = [
    {
        question: "What technology is behind this platform?",
        answer: "This platform is powered by a robust technology stack designed for performance and security. At its core, we utilize Artificial Intelligence (AI) and Machine Learning (ML) models to automate the analysis of historical data and generate insightful performance reports.",
    },
    {
        question: "How does the AI evaluate an institution's performance?",
        answer: "Our AI provides an unbiased and data-driven evaluation by systematically analyzing a wide range of inputs, including historical performance data, faculty metrics, and participation in national schemes like NIRF, ensuring every institution is evaluated on the same consistent criteria.",
    },
    {
        question: "What types of reports can the system generate?",
        answer: "Our system generates a variety of detailed reports, including longitudinal trend reports, comparative analysis against peer institutions, and document sufficiency reports that highlight any missing or incomplete submissions, providing a comprehensive overview of institutional performance.",
    },
    {
        question: "How does this tool make the review process more efficient?",
        answer: "This tool makes the review process more efficient by automating repetitive and time-consuming tasks. Instead of manual data analysis, our AI instantly processes records to generate performance reports, allowing human reviewers to focus on critical evaluation and decision-making.",
    },
    {
        question: "What is the expected timeline for review?",
        answer: "The AI provides instantaneous preliminary assessment reports. Final review by UGC/AICTE members, supported by the AI-generated reports, typically takes between 7 to 14 business days, depending on the complexity and volume of the submitted data.",
    },
];

/**
 * Individual FAQ Accordion Item Component
 */
function FAQItem({ question, answer, isOpen, onToggle }) {
    return (
        <div className="rounded-xl bg-indigo-50 p-5 shadow-sm cursor-pointer" onClick={onToggle}>
            <button
                className="flex justify-between items-center w-full text-left text-lg font-semibold focus:outline-none"
                style={{ color: DEEP_INDIGO }}
            >
                <span>{question}</span>
                {/* Custom SVG for toggle arrow */}
                <svg
                    className={`w-6 h-6 transform transition-transform duration-300 ${isOpen ? 'rotate-90' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    style={{ color: PRIMARY_BLUE }}
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M9 5l7 7-7 7"
                    ></path>
                </svg>
            </button>
            <div
                className={`mt-3 text-indigo-700 leading-relaxed ${isOpen ? 'block' : 'hidden'}`}
            >
                {answer}
            </div>
        </div>
    );
}

// --- Main FAQ Page Component ---

function FAQPage() {
    // State to track which FAQ item is open (stores the index)
    const [openIndex, setOpenIndex] = useState(null);
    const [formMessage, setFormMessage] = useState('');

    const handleToggle = (index) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    const handleFormSubmit = (e) => {
        e.preventDefault();
        
        // Use custom message box instead of alert()
        setFormMessage("Question submitted! We'll get back to you soon.");
        e.target.reset();

        setTimeout(() => {
            setFormMessage('');
        }, 5000);
    };

    return (
        <>
            <style jsx="true">{`
                /* Ensure custom colors are defined for Tailwind classes used in the component */
                .text-primary-blue { color: ${PRIMARY_BLUE}; }
                .text-deep-indigo { color: ${DEEP_INDIGO}; }
                .bg-deep-indigo { background-color: ${DEEP_INDIGO}; }
                .focus\\:ring-primary-blue:focus { --tw-ring-color: ${PRIMARY_BLUE}; }
                .bg-primary-blue { background-color: ${PRIMARY_BLUE}; }
                .hover\\:bg-indigo-700:hover { background-color: #4338CA; } /* Slightly darker indigo */
            `}</style>

            <div className="bg-gray-50 font-sans min-h-screen flex flex-col">
                <Navigation currentPage="FAQ" />

                <div className="container mx-auto px-4 py-16 flex-grow">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                        {/* Left Content: FAQ List */}
                        <div>
                            {/* Uses text-primary-blue class */}
                            <span className="font-semibold mb-2 block text-primary-blue">We've Got Answers</span>
                            <h1 className="text-5xl font-extrabold text-gray-900 mb-6 leading-tight">
                                Frequently Asked Questions.
                            </h1>
                            <p className="text-lg text-gray-600 mb-10 max-w-lg">
                                Save time and find instant solutions without the hassle. From detailed guidance to quick tips, everything you need is just a click away.
                            </p>

                            <div className="space-y-4">
                                {faqData.map((item, index) => (
                                    <FAQItem
                                        key={index}
                                        question={item.question}
                                        answer={item.answer}
                                        isOpen={openIndex === index}
                                        onToggle={() => handleToggle(index)}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Right Content: Contact Form */}
                        <div>
                            {/* Uses bg-deep-indigo class */}
                            <div className="p-8 rounded-2xl shadow-lg mt-14 lg:mt-0 bg-deep-indigo">
                                <h2 className="text-2xl font-semibold text-white text-center mb-8">
                                    Any Question For Us?
                                </h2>
                                <form onSubmit={handleFormSubmit} className="space-y-6">
                                    <input type="text" placeholder="Your Name...." required className="w-full p-4 rounded-xl bg-indigo-100 text-deep-indigo placeholder-indigo-400 focus:outline-none focus:ring-2 focus:ring-primary-blue" />
                                    <input type="email" placeholder="Your Email...." required className="w-full p-4 rounded-xl bg-indigo-100 text-deep-indigo placeholder-indigo-400 focus:outline-none focus:ring-2 focus:ring-primary-blue" />
                                    <textarea placeholder="Enter your message...." rows="6" required className="w-full p-4 rounded-xl bg-indigo-100 text-deep-indigo placeholder-indigo-400 focus:outline-none focus:ring-2 focus:ring-primary-blue resize-none"></textarea>
                                    <button
                                        type="submit"
                                        className="w-full bg-primary-blue text-white py-4 rounded-xl font-semibold text-lg shadow-md hover:bg-indigo-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 focus:ring-offset-deep-indigo"
                                    >
                                        Submit Question
                                    </button>
                                    
                                    {/* Success/Error Message Box */}
                                    {formMessage && (
                                        <div className="text-center font-medium pt-4 text-green-300">
                                            {formMessage}
                                        </div>
                                    )}
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
                <Footer />
            </div>
        </>
    );
}

export default FAQPage;