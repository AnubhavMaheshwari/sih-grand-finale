import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import Toast from '../components/common/Toast.jsx';
import PromoSection from '../components/login/PromoSection.jsx';
import sarthiLogo from '../assets/images/sarthiLogo.png';
import Footer from '../components/layout/Footer.jsx';
import { verifyRegistrationOTP } from '../api/auth.api.js';

const VerifyRegistrationPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [toast, setToast] = useState({ message: '', type: '' });
  const [loading, setLoading] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (location.state?.email) {
      setEmail(location.state.email);
      setMessage(location.state.message || 'Please enter the OTP sent to your email to complete registration.');
    } else {
      // If no email in state, redirect to registration page
      navigate('/register');
    }
  }, [location, navigate]);

  const showToast = (message, type) => {
    setToast({ message, type });
  };

  const handleToastClose = () => {
    setToast({ message: '', type: '' });
  };

  const handleOtpChange = (index, value) => {
    if (value.length <= 1 && /^\d*$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);

      // Auto-focus next input
      if (value && index < 5) {
        const nextInput = document.getElementById(`otp-${index + 1}`);
        if (nextInput) nextInput.focus();
      }
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const otpCode = otp.join('');
    if (otpCode.length !== 6) {
      showToast('Please enter a valid 6-digit OTP', 'error');
      return;
    }

    setLoading(true);
    try {
      const response = await verifyRegistrationOTP(email, otpCode);

      showToast(response.message || 'OTP verified successfully! Your account is pending admin approval.', 'success');

      // Redirect to institute details page after successful verification
      setTimeout(() => {
        navigate('/login', {
          state: {
            message: 'Registration completed successfully! Your account is pending admin approval. You will be notified once approved.'
          }
        });
      }, 3000);

    } catch (error) {
      showToast(error.response?.data?.message || error.message || 'OTP verification failed. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = () => {
    // TODO: Implement resend OTP functionality
    showToast('Resend OTP functionality will be implemented soon.', 'info');
  };

  return (
    <div className="flex flex-col min-h-screen font-sans bg-white lg:flex-row lg:bg-transparent">
      {/* Left: OTP Verification Section */}
      <div className="flex flex-col justify-between w-full px-4 py-4 overflow-y-auto bg-white shadow-xl lg:w-1/2 sm:px-6 md:px-8 lg:px-12 xl:px-16 sm:py-10 md:py-12 lg:shadow-none">
        <div className="flex flex-col flex-1">
          <div className="w-full max-w-md mx-auto px-2 sm:px-0">
            {/* Header */}
            <div className="mb-8 sm:mb-10">
              <div className='flex flex-col items-center'>
                <img src={sarthiLogo} alt="SARTHI Logo" className='w-40 h-40' />
              </div>
              <p className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800 text-center mt-4">
                Verify Your Email
              </p>
              <p className="text-sm text-gray-600 text-center mt-2">
                {message}
              </p>
              {email && (
                <p className="text-sm font-medium text-indigo-600 text-center mt-1">
                  OTP sent to: {email}
                </p>
              )}
            </div>

            {/* OTP Verification Form */}
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* OTP Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-4 text-center">
                  Enter 6-digit OTP
                </label>
                <div className="flex justify-center space-x-3">
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      id={`otp-${index}`}
                      type="text"
                      inputMode="numeric"
                      maxLength="1"
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      className="w-14 h-14 text-center text-2xl font-bold border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                      autoFocus={index === 0}
                    />
                  ))}
                </div>
                <p className="text-xs text-gray-500 text-center mt-3">
                  Enter the 6-digit code sent to your email
                </p>
              </div>

              {/* Resend OTP */}
              <div className="text-center">
                <button
                  type="button"
                  onClick={handleResendOTP}
                  className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
                >
                  Didn't receive OTP? Resend
                </button>
                <p className="text-xs text-gray-500 mt-1">
                  OTP expires in 10 minutes
                </p>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-linear-to-r from-indigo-600 to-indigo-700 text-white font-medium rounded-xl hover:from-indigo-700 hover:to-indigo-800 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Verifying...
                  </span>
                ) : (
                  'Verify OTP'
                )}
              </button>

              {/* Back to Registration Link */}
              <div className="text-center pt-4">
                <p className="text-sm text-gray-600">
                  Need to change email?{' '}
                  <Link to="/register" className="text-indigo-600 font-medium hover:underline">
                    Go back to registration
                  </Link>
                </p>
              </div>
            </form>

            {/* Additional Info */}
            <div className="pt-6 mt-8 border-t border-gray-100">
              <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
                <h4 className="text-sm font-medium text-blue-800 mb-2">What happens next?</h4>
                <ul className="text-xs text-blue-700 space-y-1">
                  <li>• After OTP verification, your account will be marked as "Pending Approval"</li>
                  <li>• Admin will review your registration and approve/reject it</li>
                  <li>• You'll receive an email notification once your account is approved</li>
                  <li>• Only after approval, you can login to the system</li>
                </ul>
              </div>
              <p className="text-xs text-center text-gray-500 mt-4">
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

export default VerifyRegistrationPage;
