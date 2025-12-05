import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaEye, FaEyeSlash } from "react-icons/fa";
import ForgotPasswordPage from './ForgotPasswordPage';
// --- Icon Components (Inline SVGs) ---

const EyeIcon = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const EyeSlashIcon = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M17.94 17.94A10 10 0 0 1 12 20c-7 0-10-7-10-7a1.14 1.14 0 0 1 .15-.22m1.9-1.93a10 10 0 0 1 10 10m-3.9-3.9a3 3 0 1 0-4.24-4.24M1 1l22 22" />
    <line x1="1" x2="23" y1="1" y2="23" />
  </svg>
);

// --- Hardcoded User Database ---
const userDatabase = {
  institute: {
    AI987654: 'collegepass1',
    RT543210: 'collegepass2',
    GH112233: 'collegepass3',
    LP808080: 'collegepass4',
    QK001122: 'collegepass5',
  },
  ugc_member: {
    UGCM123456: 'employeepass1',
    AITC987654: 'employeepass2',
    SARTHI0001: 'employeepass3',
    GESCOS7777: 'employeepass4',
    FEDC909090: 'employeepass5',
  },
};

// --- Validation helpers ---
function validateIdFormat(role, id) {
  const upperId = id.toUpperCase();
  if (role === 'institute') {
    return /^[A-Z]{2}[0-9]{6}$/.test(upperId);
  } else if (role === 'ugc_member') {
    return /^[A-Z]{4}[0-9]{6}$/.test(upperId);
  }
  return false;
}

function authenticateUser(role, id, password) {
  const upperId = id.toUpperCase();
  if (userDatabase[role]) {
    const userCredentials = userDatabase[role];
    return userCredentials[upperId] === password;
  }
  return false;
}

// --- Simulated navigation (matches your HTML files) ---
const navigateSimulated = (path) => {
  if (path === '/upload') {
    window.location.href = 'uploadDoc.html';
  } else if (path === '/edu') {
    window.location.href = 'edu.html';
  } else if (path === '/') {
    window.location.href = 'index.html';
  }
  console.log('Simulating navigation to:', path);
};

function LoginPage() {
  const navigate = navigateSimulated;

  // --- State Management ---
  const [role, setRole] = useState('');
  const [id, setId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [buttonText, setButtonText] = useState('Login');
  const [buttonClass, setButtonClass] = useState('bg-primary-blue hover:bg-blue-600');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Toast state
  const [toast, setToast] = useState({ message: '', type: '' });

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

  // Reset ID + button when role changes
  useEffect(() => {
    setId('');
    setButtonText('Login');
    setButtonClass('bg-primary-blue hover:bg-blue-600');
  }, [role]);

  useEffect(() => {
    console.log('--- Available Test Credentials ---');
    console.log('Institute IDs (Password: collegepass1-5):', Object.keys(userDatabase.institute));
    console.log('UGC/AICTE IDs (Password: employeepass1-5):', Object.keys(userDatabase.ugc_member));
  }, []);

  // --- Error helper (also shows toast) ---
  const setErrorState = (message) => {
  setButtonText(message);
  setButtonClass("bg-red-500 hover:bg-red-600");
  setIsSubmitting(false);

  // ❌ Clear ID + Password fields completely
  setId("");
  setPassword("");

  // ❌ Reset any checked or UI state too
  setToast({ message, type: "error" });

  setTimeout(() => {
    setButtonText("Login");
    setButtonClass("bg-primary-blue hover:bg-blue-600");
    setToast({ message: "", type: "" });
  }, 3000);
};


  // --- Success handler: sets login + toast + redirect ---
  const finalLoginSuccess = (currentRole) => {
  setButtonText("Login Successful!");
  setButtonClass("bg-green-500 hover:bg-green-600");
  setIsSubmitting(false);

  if (currentRole === "institute") {
    localStorage.setItem("institutionLoggedIn", "true");
    localStorage.removeItem("ugcMemberLoggedIn");
  } else if (currentRole === "ugc_member") {
    localStorage.setItem("ugcMemberLoggedIn", "true");
    localStorage.removeItem("institutionLoggedIn");
  }

  setToast({
    message:
      currentRole === "institute"
        ? "Login successful! Redirecting to your dashboard..."
        : "Login successful! Redirecting...",
    type: "success",
  });

  setTimeout(() => {
    if (currentRole === "institute") {
      navigate("/upload");
    } else if (currentRole === "ugc_member") {
      navigate("/edu");
    }
  }, 1500);
};


  // --- Submit handler ---
  const handleSubmit = (event) => {
    event.preventDefault();
    setIsSubmitting(true);

    if (role === '') {
      setErrorState('Please Select a Role!');
      return;
    }

    if (!validateIdFormat(role, id)) {
      setErrorState('Invalid ID Format!');
      return;
    }

    if (!authenticateUser(role, id, password)) {
      setErrorState('Wrong User ID or Password!');
      return;
    }

    // ✅ All good → success
    console.log('Credentials Verified. Simulating successful login...');
    finalLoginSuccess(role);
  };

  return (
    <>
      <style jsx="true">{`
        .promo-gradient {
          background: linear-gradient(135deg, #3730a3 0%, #4f46e5 100%);
        }
        .bg-primary-blue {
          background-color: #4f46e5;
        }
        .text-primary-blue {
          color: #4f46e5;
        }
        .text-deep-indigo {
          color: #3730a3;
        }
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>

      <div className="flex flex-col lg:flex-row min-h-screen bg-white lg:bg-transparent font-sans">
        {/* LEFT: Login form */}
        <div className="w-full lg:w-1/2 px-5 py-8 sm:px-8 sm:py-10 md:px-12 lg:p-16 flex flex-col justify-between no-scrollbar bg-white shadow-xl lg:shadow-none overflow-y-auto">
          <div className="flex flex-col">
            <div className="max-w-md w-full mx-auto">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black mb-4 text-deep-indigo leading-snug">
                Welcome to SARTHI National Portal
              </h1>
              <p className="text-gray-500 mb-8 text-sm sm:text-base">
                Enter your credentials to access your account
              </p>

              <form onSubmit={handleSubmit} id="loginForm" className="space-y-4">
                {/* Role Select */}
                <div>
                  <label
                    htmlFor="loginRole"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Login as
                  </label>
                  <select
                    id="loginRole"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full px-3 py-2 sm:px-4 sm:py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-blue transition duration-150 text-sm sm:text-base"
                    required
                    disabled={isSubmitting}
                  >
                    <option value="" disabled>
                      Select Role
                    </option>
                    <option value="institute">Institute</option>
                    <option value="ugc_member">UGC/AICTE Employee</option>
                  </select>
                </div>

                {/* ID Input */}
                <div>
                  <label
                    htmlFor="idInput"
                    id="idLabel"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    {idConfig.label}
                  </label>
                  <input
                    type="text"
                    id="idInput"
                    name="idInput"
                    placeholder={idConfig.placeholder}
                    value={id}
                    onChange={(e) => setId(e.target.value)}
                    className="w-full px-3 py-2 sm:px-4 sm:py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-blue transition duration-150 uppercase text-sm sm:text-base"
                    required
                    disabled={idConfig.isDisabled || isSubmitting}
                    maxLength={idConfig.maxLength}
                  />
                  <p
                    id="idFormatHint"
                    className="text-xs text-gray-500 mt-1"
                  >
                    {idConfig.hint}
                  </p>
                </div>

                {/* Password Input */}
                <div>
                <label
                    htmlFor="password"
                    className="block text-sm font-medium text-gray-700 mb-1"
                >
                    Password
                </label>
                <div className="relative">
                    <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    name="password"
                    placeholder="Password"   // ✅ neutral, no length hint
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pr-10 pl-3 py-2 sm:pl-4 sm:py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-blue transition duration-150 text-sm sm:text-base"
                    required                  // ✅ still required, but no length rule
                    disabled={isSubmitting}
                    />
                    <button type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 transition"
                    aria-label="Toggle password visibility"
                    >
                    {showPassword ? (
                        <FaEyeSlash className="w-5 h-5" />
                    ) : (
                        <FaEye className="w-5 h-5" />
                    )}
                    </button>

                </div>
                <Link to="/forgot-password"
                className="float-right text-xs sm:text-sm text-primary-blue hover:underline mt-1"
                >
                Forgot password?
                </Link>

                </div>


                {/* Login Button */}
                <button
                  type="submit"
                  className={`w-full text-white py-2.5 sm:py-3 rounded-xl font-semibold text-base sm:text-lg transition duration-150 shadow-lg shadow-primary-blue/30 ${buttonClass}`}
                  disabled={isSubmitting}
                >
                  {buttonText}
                </button>
              </form>
            </div>
          </div>

          <footer className="text-center text-[10px] sm:text-xs text-gray-400 mt-4 pt-4 border-t border-gray-100">
            2025 SARTHI National Portal, all rights reserved
          </footer>
        </div>

        {/* RIGHT: Promo Section (hidden on very small screens to keep it clean) */}
        <div className="hidden md:flex w-full lg:w-1/2 promo-gradient text-white p-8 md:p-10 lg:p-16 flex-col justify-center items-center">
          <div className="max-w-xl w-full">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold leading-tight mb-4">
              Institutional Performance at a Glance
            </h2>
            <p className="text-indigo-200 text-sm sm:text-base md:text-lg mb-8 md:mb-10">
              Key metrics for quality assurance and continuous growth management.
            </p>

            <div className="bg-gray-900/40 backdrop-blur-md rounded-2xl p-4 sm:p-5 md:p-6 shadow-2xl mb-10 md:mb-16 border border-gray-700/30">
              <div className="flex justify-between items-center mb-4">
                <span className="text-xs sm:text-sm font-semibold text-white/80">
                  National Accreditation Score (NAS)
                </span>
                <span className="text-[10px] sm:text-xs px-2 py-1 bg-white/10 rounded-full text-green-300 font-medium">
                  Target Met
                </span>
              </div>
              <div className="flex flex-wrap md:flex-nowrap gap-4 mb-6">
                <div className="w-full md:w-1/3 p-3 bg-gray-800/50 rounded-xl">
                  <p className="text-lg md:text-xl font-bold">8.5 / 10</p>
                  <p className="text-[11px] sm:text-xs text-green-400 mt-1 font-medium">
                    +0.2 pts this quarter
                  </p>
                </div>
                <div className="w-full md:w-2/3 p-3 bg-gray-800/50 rounded-xl flex items-center justify-center">
                  <div className="w-16 h-16 md:w-20 md:h-20 border-4 border-green-500 rounded-full flex flex-col items-center justify-center font-extrabold text-xl md:text-2xl">
                    85%
                  </div>
                </div>
              </div>

              <div className="space-y-3 text-xs sm:text-sm">
                <div className="flex justify-between text-white/90 border-b border-indigo-400/20 pb-2">
                  <span>Student Retention Rate</span>
                  <span className="font-bold text-green-300">92%</span>
                </div>
                <div className="flex justify-between text-white/90 border-b border-indigo-400/20 pb-2">
                  <span>Research Output Index</span>
                  <span className="font-bold text-green-300">85%</span>
                </div>
                <div className="flex justify-between text-white/90">
                  <span>Faculty Development Score</span>
                  <span className="font-bold text-green-300">95%</span>
                </div>
              </div>
            </div>

            <div className="mt-6 md:mt-10 pt-6 md:pt-10 border-t border-indigo-400/30">
              <p className="text-[11px] sm:text-xs md:text-sm uppercase tracking-wider text-indigo-200 mb-4 md:mb-6 font-semibold">
                Empowering Over 500+ Top Indian Institutions:
              </p>
              <div className="flex flex-wrap justify-around items-center gap-3 md:gap-6 text-xs sm:text-sm md:text-base">
                <span className="font-semibold text-white/90 opacity-80 hover:opacity-100 transition">
                  Central Universities
                </span>
                <span className="font-semibold text-white/90 opacity-80 hover:opacity-100 transition">
                  State Universities
                </span>
                <span className="font-semibold text-white/90 opacity-80 hover:opacity-100 transition">
                  Deemed-to-be Universities
                </span>
                <span className="font-semibold text-white/90 opacity-80 hover:opacity-100 transition">
                  Private Institutions
                </span>
                <span className="font-semibold text-white/90 opacity-80 hover:opacity-100 transition">
                  Open Universities
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 🔔 Toast */}
        {toast.message && (
          <div
            className="fixed bottom-4 left-1/2 -translate-x-1/2 max-w-[90%] sm:max-w-md flex items-center bg-gray-800 text-white text-xs sm:text-sm font-semibold px-3 py-2 sm:px-5 sm:py-3 rounded-lg shadow-2xl z-50"
            role="alert"
          >
            <span className="mr-2 sm:mr-3 text-base sm:text-lg">
              {toast.type === 'success' ? '✅' : '⚠️'}
            </span>
            <span className="truncate">{toast.message}</span>
          </div>
        )}
      </div>
    </>
  );
}

export default LoginPage;
