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
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="text-center text-xs text-gray-400 mt-8 pt-6 border-t border-gray-100">
          <p>© 2025 SARTHI National Portal. All rights reserved.</p>
          <p className="mt-1">Ministry of Education, Government of India</p>
          <p className="mt-1 text-[10px]">
            Version 2.0.0 • Last updated: December 2025
          </p>
        </footer>
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
