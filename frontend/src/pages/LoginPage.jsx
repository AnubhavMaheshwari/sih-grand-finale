import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext.jsx';
import Toast from '../components/common/Toast.jsx';
import LoginForm from '../components/login/LoginForm.jsx';
import PromoSection from '../components/login/PromoSection.jsx';
import sarthiLogo from '../assets/images/sarthiLogo.png';
import Footer from '../components/layout/Footer.jsx';

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

    <div className="flex flex-col min-h-screen font-sans bg-white lg:flex-row lg:bg-transparent">
      {/* Left: Login Form Section */}

      <div className="flex flex-col justify-between w-full px-4 py-4 overflow-y-auto bg-white shadow-xl lg:w-1/2 sm:px-6 md:px-8 lg:px-12 xl:px-16 sm:py-10 md:py-12 lg:shadow-none">
        <div className="flex flex-col flex-1">
          <div className="w-full max-w-md mx-auto px-2 sm:px-0">
            {/* Header */}
            <div className="mb-8 sm:mb-10">
              <div className='flex flex-col items-center'>
                <img src={sarthiLogo} alt="SARTHI Logo" className='w-40 h-40' />
                <h1 className="mb-2 text-2xl font-black leading-tight text-gray-900 sm:text-3xl md:text-4xl">
                  Welcome to <span className="text-deep-indigo">SARTHI</span> Portal
                </h1>

              </div>
              <p className="text-sm text-gray-600 sm:text-base">
                Secure login for educational institutions and officials
              </p>
            </div>

            {/* Login Form */}
            <LoginForm onToast={showToast} />

            {/* Additional Info */}
            <div className="pt-6 mt-8 border-t border-gray-100">
              <p className="text-xs text-center text-gray-500">
                Need help? Contact support at{' '}
                <a href="mailto:support@sarthi.gov.in" className="text-indigo-600 hover:underline">
                  support@sarthi.gov.in
                </a>
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <Footer />
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
