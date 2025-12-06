import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext.jsx';
import Toast from '../components/common/Toast.jsx';
import LoginForm from '../components/login/LoginForm.jsx';
import PromoSection from '../components/login/PromoSection.jsx';
import { DEEP_INDIGO } from '../constants/login.constants.js';

const LoginPage = () => {
  const { error } = useAuth();
  const [toast, setToast] = useState({ message: '', type: '' });

  // Show error toast from auth context
  useEffect(() => {
    if (error) {
      showToast(error, 'error');
    }
  }, [error]);

  const showToast = (message, type) => {
    setToast({ message, type });
  };

  const handleToastClose = () => {
    setToast({ message: '', type: '' });
  };

  return (
<<<<<<< HEAD
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

      <div className="flex flex-col min-h-screen font-sans bg-white lg:flex-row lg:bg-transparent">
        {/* LEFT: Login form */}
        <div className="flex flex-col justify-between w-full px-5 py-8 overflow-y-auto bg-white shadow-xl lg:w-1/2 sm:px-8 sm:py-10 md:px-12 lg:p-16 no-scrollbar lg:shadow-none">
          <div className="flex flex-col">
            <div className="w-full max-w-md mx-auto">
              <h1 className="mb-4 text-3xl font-black leading-snug sm:text-4xl md:text-5xl text-deep-indigo">
                Welcome to SARTHI National Portal
              </h1>
              <p className="mb-8 text-sm text-gray-500 sm:text-base">
                Enter your credentials to access your account
              </p>

              <form onSubmit={handleSubmit} id="loginForm" className="space-y-4">
                {/* Role Select */}
                <div>
                  <label
                    htmlFor="loginRole"
                    className="block mb-1 text-sm font-medium text-gray-700"
                  >
                    Login as
                  </label>
                  <select
                    id="loginRole"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full px-3 py-2 text-sm transition duration-150 border border-gray-300 sm:px-4 sm:py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-blue sm:text-base"
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
                    className="block mb-1 text-sm font-medium text-gray-700"
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
                    className="w-full px-3 py-2 text-sm uppercase transition duration-150 border border-gray-300 sm:px-4 sm:py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-blue sm:text-base"
                    required
                    disabled={idConfig.isDisabled || isSubmitting}
                    maxLength={idConfig.maxLength}
                  />
                  <p
                    id="idFormatHint"
                    className="mt-1 text-xs text-gray-500"
                  >
                    {idConfig.hint}
                  </p>
                </div>

                {/* Password Input */}
                <div>
                <label
                    htmlFor="password"
                    className="block mb-1 text-sm font-medium text-gray-700"
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
                    className="w-full py-2 pl-3 pr-10 text-sm transition duration-150 border border-gray-300 sm:pl-4 sm:py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-blue sm:text-base"
                    required                  // ✅ still required, but no length rule
                    disabled={isSubmitting}
                    />
                    <button type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 transition hover:text-gray-600"
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
                className="float-right mt-2 mb-2 text-xs sm:text-sm text-primary-blue hover:underline"
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
        <div className="flex-col items-center justify-center hidden w-full p-8 text-white md:flex lg:w-1/2 promo-gradient md:p-10 lg:p-16">
          <div className="w-full max-w-xl">
            <h2 className="mb-4 text-2xl font-extrabold leading-tight sm:text-3xl md:text-4xl lg:text-5xl">
              Institutional Performance at a Glance
            </h2>
            <p className="mb-8 text-sm text-indigo-200 sm:text-base md:text-lg md:mb-10">
              Key metrics for quality assurance and continuous growth management.
            </p>

            <div className="p-4 mb-10 border shadow-2xl bg-gray-900/40 backdrop-blur-md rounded-2xl sm:p-5 md:p-6 md:mb-16 border-gray-700/30">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-semibold sm:text-sm text-white/80">
                  National Accreditation Score (NAS)
                </span>
                <span className="text-[10px] sm:text-xs px-2 py-1 bg-white/10 rounded-full text-green-300 font-medium">
                  Target Met
                </span>
              </div>
              <div className="flex flex-wrap gap-4 mb-6 md:flex-nowrap">
                <div className="w-full p-3 md:w-1/3 bg-gray-800/50 rounded-xl">
                  <p className="text-lg font-bold md:text-xl">8.5 / 10</p>
                  <p className="text-[11px] sm:text-xs text-green-400 mt-1 font-medium">
                    +0.2 pts this quarter
                  </p>
                </div>
                <div className="flex items-center justify-center w-full p-3 md:w-2/3 bg-gray-800/50 rounded-xl">
                  <div className="flex flex-col items-center justify-center w-16 h-16 text-xl font-extrabold border-4 border-green-500 rounded-full md:w-20 md:h-20 md:text-2xl">
                    85%
                  </div>
                </div>
              </div>

              <div className="space-y-3 text-xs sm:text-sm">
                <div className="flex justify-between pb-2 border-b text-white/90 border-indigo-400/20">
                  <span>Student Retention Rate</span>
                  <span className="font-bold text-green-300">92%</span>
                </div>
                <div className="flex justify-between pb-2 border-b text-white/90 border-indigo-400/20">
                  <span>Research Output Index</span>
                  <span className="font-bold text-green-300">85%</span>
                </div>
                <div className="flex justify-between text-white/90">
                  <span>Faculty Development Score</span>
                  <span className="font-bold text-green-300">95%</span>
                </div>
              </div>
            </div>

            <div className="pt-6 mt-6 border-t md:mt-10 md:pt-10 border-indigo-400/30">
              <p className="text-[11px] sm:text-xs md:text-sm uppercase tracking-wider text-indigo-200 mb-4 md:mb-6 font-semibold">
                Empowering Over 500+ Top Indian Institutions:
              </p>
              <div className="flex flex-wrap items-center justify-around gap-3 text-xs md:gap-6 sm:text-sm md:text-base">
                <span className="font-semibold transition text-white/90 opacity-80 hover:opacity-100">
                  Central Universities
                </span>
                <span className="font-semibold transition text-white/90 opacity-80 hover:opacity-100">
                  State Universities
                </span>
                <span className="font-semibold transition text-white/90 opacity-80 hover:opacity-100">
                  Deemed-to-be Universities
                </span>
                <span className="font-semibold transition text-white/90 opacity-80 hover:opacity-100">
                  Private Institutions
                </span>
                <span className="font-semibold transition text-white/90 opacity-80 hover:opacity-100">
                  Open Universities
                </span>
              </div>
=======
    <div className="flex flex-col lg:flex-row min-h-screen bg-white lg:bg-transparent font-sans">
      {/* Left: Login Form Section */}
      <div className="w-full lg:w-1/2 px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 py-8 sm:py-10 md:py-12 flex flex-col justify-between bg-white shadow-xl lg:shadow-none overflow-y-auto">
        <div className="flex flex-col flex-1">
          <div className="max-w-md w-full mx-auto">
            {/* Header */}
            <div className="mb-8 sm:mb-10">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-black mb-2 text-gray-900 leading-tight">
                Welcome to <span className="text-deep-indigo">SARTHI</span> Portal
              </h1>
              <p className="text-gray-600 text-sm sm:text-base">
                Secure login for educational institutions and officials
              </p>
            </div>

            {/* Login Form */}
            <LoginForm onToast={showToast} />

            {/* Additional Info */}
            <div className="mt-8 pt-6 border-t border-gray-100">
              <p className="text-xs text-gray-500 text-center">
                Need help? Contact support at{' '}
                <a href="mailto:support@sarthi.gov.in" className="text-indigo-600 hover:underline">
                  support@sarthi.gov.in
                </a>
              </p>
>>>>>>> sonu
            </div>
          </div>
        </div>

<<<<<<< HEAD
        {/* 🔔 Toast */}
        {toast.message && (
          <div
            className="fixed bottom-4 left-1/2 -translate-x-1/2 max-w-[90%] sm:max-w-md flex items-center bg-gray-800 text-white text-xs sm:text-sm font-semibold px-3 py-2 sm:px-5 sm:py-3 rounded-lg shadow-2xl z-50"
            role="alert"
          >
            <span className="mr-2 text-base sm:mr-3 sm:text-lg">
              {toast.type === 'success' ? '✅' : '⚠️'}
            </span>
            <span className="truncate">{toast.message}</span>
          </div>
        )}
=======
        {/* Footer */}
        <footer className="text-center text-xs text-gray-400 mt-8 pt-6 border-t border-gray-100">
          <p>© 2025 SARTHI National Portal. All rights reserved.</p>
          <p className="mt-1">Ministry of Education, Government of India</p>
          <p className="mt-1 text-[10px]">
            Version 2.0.0 • Last updated: December 2025
          </p>
        </footer>
>>>>>>> sonu
      </div>

      {/* Right: Promo Section */}
      <PromoSection />

      {/* Toast Notification */}
      {toast.message && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={handleToastClose}
        />
      )}
    </div>
  );
};

export default LoginPage;
