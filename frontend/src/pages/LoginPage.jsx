
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
// Removed useNavigate import and replaced the implementation to avoid Router context error.
// Icons are defined as inline SVG React components below to avoid dependency errors.

// --- Icon Components (Inline SVGs) ---

/** Standard Eye Icon (Open) - Replacement for faEye */
const EyeIcon = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/>
        <circle cx="12" cy="12" r="3"/>
    </svg>
);

/** Standard Eye Slash Icon (Closed) - Replacement for faEyeSlash */
const EyeSlashIcon = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
        <path d="M17.94 17.94A10 10 0 0 1 12 20c-7 0-10-7-10-7a1.14 1.14 0 0 1 .15-.22m1.9-1.93a10 10 0 0 1 10 10m-3.9-3.9a3 3 0 1 0-4.24-4.24M1 1l22 22"/>
        <line x1="1" x2="23" y1="1" y2="23"/>
    </svg>
);

// --- Hardcoded User Database ---
const userDatabase = {
    institute: {
        "AI987654": "collegepass1",
        "RT543210": "collegepass2",
        "GH112233": "collegepass3",
        "LP808080": "collegepass4",
        "QK001122": "collegepass5",
    },
    ugc_member: {
        "UGCM123456": "employeepass1",
        "AITC987654": "employeepass2",
        "SARTHI0001": "employeepass3",
        "GESCOS7777": "employeepass4",
        "FEDC909090": "employeepass5",
    }
};

/**
 * Validates the ID format based on the selected role
 */
function validateIdFormat(role, id) {
    const upperId = id.toUpperCase();
    if (role === 'institute') {
        // 2 letters (A-Z), 6 numbers, exactly 8 chars
        return /^[A-Z]{2}[0-9]{6}$/.test(upperId);
    } else if (role === 'ugc_member') {
        // 4 letters (A-Z), 6 numbers, exactly 10 chars
        return /^[A-Z]{4}[0-9]{6}$/.test(upperId);
    }
    return false;
}

/**
 * Handles authentication check against the hardcoded database
 */
function authenticateUser(role, id, password) {
    const upperId = id.toUpperCase();
    
    if (userDatabase[role]) {
        const userCredentials = userDatabase[role];
        
        if (userCredentials[upperId] && userCredentials[upperId] === password) {
            return true; // Authentication successful
        }
    }
    return false; // Authentication failed
}

// Custom navigation function to simulate routing behavior in the Canvas environment
const navigateSimulated = (path) => {
    // Matches index.js behavior: redirecting using window.location.href
    if (path === '/upload') {
        window.location.href = 'uploadDoc.html';
    } else if (path === '/edu') {
        window.location.href = 'edu.html';
    }
    console.log('Simulating navigation to:', path);
};


function LoginPage() {
    // Use the simulated navigation function instead of the useNavigate hook
    const navigate = navigateSimulated;
    
    // --- State Management ---
    const [role, setRole] = useState('');
    const [id, setId] = useState('');
    const [password, setPassword] = useState('');
    const [termsAccepted, setTermsAccepted] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    
    // UI Feedback State
    const [buttonText, setButtonText] = useState('Login');
    // Using hover:bg-blue-600 to match index.html button styles
    const [buttonClass, setButtonClass] = useState('bg-primary-blue hover:bg-blue-600'); 
    const [isSubmitting, setIsSubmitting] = useState(false);

    // --- ID Field Logic ---
    const getIDConfig = () => {
        switch (role) {
            case 'institute':
                return {
                    label: 'Institute ID (Registered Users Only)',
                    placeholder: 'e.g., AI987654',
                    hint: 'Format: Exactly 8 characters (2 letters A-Z, 6 numbers).',
                    maxLength: 8,
                    isDisabled: false,
                };
            case 'ugc_member':
                return {
                    label: 'User ID (UGC/AICTE Employee Only)',
                    placeholder: 'e.g., UGCM123456',
                    hint: 'Format: Exactly 10 characters (4 letters A-Z, 6 numbers).',
                    maxLength: 10,
                    isDisabled: false,
                };
            default:
                return {
                    label: 'User/Institute ID',
                    placeholder: 'Select a role above',
                    hint: '',
                    maxLength: 20,
                    isDisabled: true,
                };
        }
    };

    const idConfig = getIDConfig();

    // Reset ID field when role changes (matching updateIdField in index.js)
    useEffect(() => {
        setId('');
        setButtonText('Login');
        // Reset button class back to initial state
        setButtonClass('bg-primary-blue hover:bg-blue-600');
    }, [role]);

    // Initial console log of test credentials
    useEffect(() => {
        console.log("--- Available Test Credentials ---");
        console.log("Institute IDs (Password: collegepass1-5):", Object.keys(userDatabase.institute));
        console.log("UGC/AICTE IDs (Password: employeepass1-5):", Object.keys(userDatabase.ugc_member));
    }, []);

    // --- Helper for Error State (matching handleLogin error logic) ---
    const setErrorState = (message) => {
        setButtonText(message);
        setButtonClass('bg-red-500 hover:bg-red-600');
        
        // This clears the terms checkbox and password on failure, matching index.js behavior
        setTermsAccepted(false); 
        setPassword(''); 
        
        // Reset state after 3 seconds
        setTimeout(() => {
            setButtonText('Login');
            setButtonClass('bg-primary-blue hover:bg-blue-600'); // Reset to original button class
            setIsSubmitting(false);
        }, 3000);
    };

    // --- Final Login and Redirection (matching finalLoginSuccess) ---
    const finalLoginSuccess = (currentRole) => {
        setButtonText("Login Successful!");
        setButtonClass('bg-green-500 hover:bg-green-600');

        setTimeout(() => {
            if (currentRole === 'institute') {
                // Redirect Institute users to uploadDoc.html
                navigate('/upload'); 
            } else if (currentRole === 'ugc_member') {
                // Redirect UGC/AICTE employees to edu.html
                navigate('/edu'); 
            }
        }, 1500); 
    };


    // --- Form Submission Handler (matching handleLogin validation flow) ---
    const handleSubmit = (event) => {
        event.preventDefault(); 
        setIsSubmitting(true);

        // 1. Check if a role is selected
        if (role === "") {
            setErrorState("Please Select a Role!");
            return;
        }

        // 2. Validate the ID format
        if (!validateIdFormat(role, id)) {
            setErrorState("Invalid ID Format!");
            return;
        }
        
        // 3. Authenticate Credentials
        if (!authenticateUser(role, id, password)) {
            setErrorState("Wrong User ID or Password!");
            return;
        }

        // 4. Check Terms Acceptance 
        if (!termsAccepted) {
            setErrorState("Must accept Terms & Privacy!");
            return;
        }

        // 5. Authentication Successful -> Redirect based on role
        console.log("Credentials Verified. Simulating successful login...");
        finalLoginSuccess(role);
    };

    return (
        // Use a Fragment to contain both the style block and the main layout div
        <>
            <style jsx="true">{`
                /* Custom styles pulled from index.html to ensure aesthetic classes are defined */
                .promo-gradient {
                    background: linear-gradient(135deg, #3730A3 0%, #4F46E5 100%); /* Deeper Indigo to Primary Blue */
                }
                /* Defined colors matching tailwind.config in index.html */
                .bg-primary-blue {
                    background-color: #4F46E5; 
                }
                .text-primary-blue {
                    color: #4F46E5;
                }
                .text-deep-indigo {
                    color: #3730A3; /* Darker indigo for headings */
                }
                /* shadow-primary-blue/30 is defined by Tailwind */
                .no-scrollbar::-webkit-scrollbar {
                    display: none; /* Hide scrollbar for webkit browsers */
                }
                .no-scrollbar {
                    -ms-overflow-style: none; /* IE and Edge */
                    scrollbar-width: none; /* Firefox */
                }
            `}</style>
            
            {/* Main Layout Container */}
            <div className="flex flex-col lg:flex-row min-h-screen bg-white lg:bg-transparent font-sans">
                
                {/* Login Form Section (Left Side) */}
                <div className="lg:w-1/2 w-full p-10 md:p-16 lg:p-20 flex flex-col justify-between no-scrollbar bg-white shadow-xl lg:shadow-none overflow-y-auto">
                    
                    <div className="flex flex-col">
                        <div className="mb-10 text-right space-x-4">
                            {/* Note: Link components will only work if a Router context is eventually provided. For standalone Canvas, these behave like simple anchors. */}
                            <Link to="/faq" className="text-sm text-gray-600 hover:text-primary-blue hover:underline">FAQs</Link>
                            <Link to="/contact" className="text-sm text-gray-600 hover:text-primary-blue hover:underline">Contact Us</Link>
                        </div>

                        <div className="max-w-md mx-auto w-full">
                            <h1 className="text-4xl sm:text-5xl font-black mb-4 text-deep-indigo leading-snug">
                                Welcome to SARTHI National Portal
                            </h1>
                            <p className="text-gray-500 mb-8">Enter your credentials to access your account</p>

                            <form onSubmit={handleSubmit} id="loginForm">
                                {/* Role Select */}
                                <div className="mb-4">
                                    <label htmlFor="loginRole" className="block text-sm font-medium text-gray-700 mb-1">Login as</label>
                                    <select 
                                        id="loginRole" 
                                        value={role} 
                                        onChange={(e) => setRole(e.target.value)}
                                        // Restored py-2 to match index.html input styling
                                        className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-blue transition duration-150" 
                                        required
                                        disabled={isSubmitting}
                                    >
                                        <option value="" disabled>Select Role</option>
                                        <option value="institute">Institute</option>
                                        <option value="ugc_member">UGC/AICTE Employee</option>
                                    </select>
                                </div>

                                {/* ID Input */}
                                <div className="mb-4">
                                    <label htmlFor="idInput" id="idLabel" className="block text-sm font-medium text-gray-700 mb-1">{idConfig.label}</label>
                                    <input 
                                        type="text" id="idInput" name="idInput" 
                                        placeholder={idConfig.placeholder}
                                        value={id}
                                        onChange={(e) => setId(e.target.value)}
                                        // Restored py-2 to match index.html input styling
                                        className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-blue transition duration-150 uppercase" 
                                        required 
                                        disabled={idConfig.isDisabled || isSubmitting}
                                        maxLength={idConfig.maxLength}
                                    />
                                    <p id="idFormatHint" className="text-xs text-gray-500 mt-1">{idConfig.hint}</p>
                                </div>

                                {/* Password Input */}
                                <div className="mb-6">
                                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                                    <div className="relative">
                                        <input 
                                            type={showPassword ? "text" : "password"} 
                                            id="password" name="password" 
                                            placeholder="min 8 chars" 
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            // Restored py-2 to match index.html input styling
                                            className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-blue transition duration-150" 
                                            required minLength="8"
                                            disabled={isSubmitting}
                                        />
                                        <button 
                                            type="button" 
                                            onClick={() => setShowPassword(!showPassword)}
                                            id="togglePassword"
                                            className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 transition" 
                                            aria-label="Toggle password visibility"
                                        >
                                            {/* Using inline SVG component */}
                                            {showPassword ? <EyeIcon className="w-5 h-5" /> : <EyeSlashIcon className="w-5 h-5" />}
                                        </button>
                                    </div>
                                    <Link to="#" className="float-right text-sm text-primary-blue hover:underline mt-1">Forgot password?</Link>
                                </div>

                                {/* Terms Checkbox */}
                                <div className="flex items-start mb-6 pt-2 clear-both">
                                    <input 
                                        id="terms" 
                                        type="checkbox" 
                                        checked={termsAccepted}
                                        onChange={(e) => setTermsAccepted(e.target.checked)}
                                        className="h-4 w-4 text-primary-blue border-gray-300 rounded mt-1 focus:ring-primary-blue" 
                                        required 
                                        disabled={isSubmitting}
                                    />
                                    <label htmlFor="terms" className="ml-2 text-sm text-gray-500">
                                        I agree to the <Link to="#" className="text-primary-blue hover:underline">Terms & Privacy</Link>
                                    </label>
                                </div>

                                {/* Login Button */}
                                <button 
                                    type="submit" 
                                    // Use hover:bg-blue-600 class defined in index.html/index.js logic
                                    className={`w-full text-white py-3 rounded-xl font-semibold text-lg transition duration-150 shadow-lg shadow-primary-blue/30 ${buttonClass}`}
                                    disabled={isSubmitting}
                                >
                                    {buttonText}
                                </button>
                                
                                
                            </form>

                        </div>
                    </div>

                    <footer className="text-center text-xs text-gray-400 mt-4 pt-4 border-t border-gray-100">
                        2025 SARTHI National Portal, all rights reserved
                    </footer>
                </div>

                {/* Promo Section (Right Side) */}
                <div className="lg:w-1/2 w-full promo-gradient text-white p-8 md:p-12 lg:p-16 flex flex-col justify-center items-center">
                    <div className="max-w-xl w-full">
                        <h2 className="text-4xl sm:text-5xl font-extrabold leading-tight mb-4">
                            Institutional Performance at a Glance
                        </h2>
                        <p className="text-indigo-200 text-lg mb-10">
                            Key metrics for quality assurance and continuous growth management.
                        </p>

                        <div className="bg-gray-900/40 backdrop-blur-md rounded-2xl p-6 shadow-2xl mb-16 border border-gray-700/30">
                            <div className="flex justify-between items-center mb-4">
                                <span className="text-sm font-semibold text-white/80">National Accreditation Score (NAS)</span>
                                <span className="text-xs px-2 py-1 bg-white/10 rounded-full text-green-300 font-medium">Target Met</span>
                            </div>
                            <div className="flex flex-wrap md:flex-nowrap gap-4 mb-6">
                                <div className="w-full md:w-1/3 p-3 bg-gray-800/50 rounded-xl">
                                    <p className="text-xl font-bold">8.5 / 10</p>
                                    <p className="text-xs text-green-400 mt-1 font-medium">+0.2 pts this quarter</p>
                                </div>
                                <div className="w-full md:w-2/3 p-3 bg-gray-800/50 rounded-xl flex items-center justify-center">
                                    <div className="w-20 h-20 border-4 border-green-500 rounded-full flex flex-col items-center justify-center font-extrabold text-2xl">
                                        85%
                                    </div>
                                </div>
                            </div>
                            
                            <div className="space-y-3">
                                <div className="flex justify-between text-sm text-white/90 border-b border-indigo-400/20 pb-2">
                                    <span>Student Retention Rate</span>
                                    <span className="font-bold text-green-300">92%</span>
                                </div>
                                <div className="flex justify-between text-sm text-white/90 border-b border-indigo-400/20 pb-2">
                                    <span>Research Output Index</span>
                                    <span className="font-bold text-green-300">85%</span>
                                </div>
                                <div className="flex justify-between text-sm text-white/90">
                                    <span>Faculty Development Score</span>
                                    <span className="font-bold text-green-300">95%</span>
                                </div>
                            </div>
                        </div>

                        <div className="mt-10 pt-10 border-t border-indigo-400/30">
                            <p className="text-sm uppercase tracking-wider text-indigo-200 mb-6 font-semibold">Empowering Over 500+ Top Indian Institutions:</p>
                            <div className="flex flex-wrap justify-around items-center gap-6">
                                <span className="text-lg md:text-xl font-semibold text-white/90 opacity-80 hover:opacity-100 transition">Central Universities</span>
                                <span className="text-lg md:text-xl font-semibold text-white/90 opacity-80 hover:opacity-100 transition">State Universities</span>
                                <span className="text-lg md:text-xl font-semibold text-white/90 opacity-80 hover:opacity-100 transition">Deemed-to-be Universities</span>
                                <span className="text-lg md:text-xl font-semibold text-white/90 opacity-80 hover:opacity-100 transition">Private Institutions</span>
                                <span className="text-lg md:text-xl font-semibold text-white/90 opacity-80 hover:opacity-100 transition">Open Universities</span>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </>
    );
}   

export default LoginPage;