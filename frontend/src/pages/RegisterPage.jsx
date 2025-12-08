import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import Toast from '../components/common/Toast.jsx';
import PromoSection from '../components/login/PromoSection.jsx';
import sarthiLogo from '../assets/images/sarthiLogo.png';
import Footer from '../components/layout/Footer.jsx';
import { registerInstitute } from '../api/auth.api.js';

const RegisterPage = () => {
  const navigate = useNavigate();
  const [toast, setToast] = useState({ message: '', type: '' });
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    instituteName: '',
    instituteType: 'engineering',
    fullName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const showToast = (message, type) => {
    setToast({ message, type });
  };

  const handleToastClose = () => {
    setToast({ message: '', type: '' });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (formData.password !== formData.confirmPassword) {
      showToast('Passwords do not match', 'error');
      return;
    }

    if (formData.password.length < 8) {
      showToast('Password must be at least 8 characters long', 'error');
      return;
    }

    setLoading(true);
    try {
      const response = await registerInstitute({
        instituteName: formData.instituteName,
        instituteType: formData.instituteType,
        fullName: formData.fullName,
        email: formData.email,
        password: formData.password
      });

      showToast(response.message || 'Registration successful! Please check your email for OTP verification.', 'success');

      // Redirect to OTP verification page
      setTimeout(() => {
        navigate('/verify-registration', {
          state: {
            email: formData.email,
            message: 'Please enter the OTP sent to your email to complete registration.'
          }
        });
      }, 2000);

    } catch (error) {
      showToast(error.response?.data?.message || error.message || 'Registration failed. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen font-sans bg-white lg:flex-row lg:bg-transparent">
      {/* Left: Registration Form Section */}
      <div className="flex flex-col justify-between w-full px-4 py-4 overflow-y-auto bg-white shadow-xl lg:w-1/2 sm:px-6 md:px-8 lg:px-12 xl:px-16 sm:py-10 md:py-12 lg:shadow-none">
        <div className="flex flex-col flex-1">
          <div className="w-full max-w-md mx-auto px-2 sm:px-0">
            {/* Header */}
            <div className="mb-8 sm:mb-10">
              <div className='flex flex-col items-center'>
                <img src={sarthiLogo} alt="SARTHI Logo" className='w-40 h-40' />
              </div>
              <p className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800 text-center mt-4">
                Register Your Educational Institution
              </p>
              <p className="text-sm text-gray-600 text-center mt-2">
                Create an account to access SARTHI platform features
              </p>
            </div>

            {/* Registration Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Institute Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Institute Name *
                </label>
                <input
                  type="text"
                  name="instituteName"
                  value={formData.instituteName}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                  placeholder="Enter your institute name"
                />
              </div>

              {/* Institute Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Institute Type *
                </label>
                <select
                  name="instituteType"
                  value={formData.instituteType}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition appearance-none bg-white"
                >
                  <option value="engineering">Engineering</option>
                  <option value="management">Management</option>
                  <option value="medical">Medical</option>
                  <option value="others">Others</option>
                </select>
              </div>

              {/* Full Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Your Full Name *
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                  placeholder="Enter your full name"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                  placeholder="you@institute.edu"
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password *
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition pr-10"
                    placeholder="At least 8 characters"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Password must be at least 8 characters long
                </p>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm Password *
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition pr-10"
                    placeholder="Confirm your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Terms and Conditions */}
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    type="checkbox"
                    required
                    className="w-4 h-4 border border-gray-300 rounded bg-gray-50 focus:ring-3 focus:ring-indigo-300"
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label className="text-gray-700">
                    I agree to the{' '}
                    <a href="#" className="text-indigo-600 hover:underline">
                      Terms of Service
                    </a>{' '}
                    and{' '}
                    <a href="#" className="text-indigo-600 hover:underline">
                      Privacy Policy
                    </a>
                  </label>
                </div>
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
                    Registering...
                  </span>
                ) : (
                  'Register Institute'
                )}
              </button>

              {/* Login Link */}
              <div className="text-center pt-4">
                <p className="text-sm text-gray-600">
                  Already have an account?{' '}
                  <Link to="/login" className="text-indigo-600 font-medium hover:underline">
                    Sign in here
                  </Link>
                </p>
              </div>
            </form>

            {/* Additional Info */}
            <div className="pt-6 mt-8 border-t border-gray-100">
              <p className="text-xs text-center text-gray-500">
                Need help? Contact support at{' '}
                <a href="mailto:support@sarthi.gov.in" className="text-indigo-600 hover:underline">
                  support@sarthi.gov.in
                </a>
              </p>
              <p className="text-xs text-center text-gray-500 mt-2">
                Note: After registration, you'll receive an OTP for email verification.
                Your account will be pending admin approval before you can login.
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

export default RegisterPage;
