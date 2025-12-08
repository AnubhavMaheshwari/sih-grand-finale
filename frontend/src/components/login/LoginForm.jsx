import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext.jsx';
import { ROLE_OPTIONS, VALIDATION_PATTERNS } from '../../constants/login.constants.js';
import RoleSelector from './RoleSelector.jsx';
import TextInput from '../common/TextInput.jsx';
import PasswordInput from './PasswordInput.jsx';

const LoginForm = ({ onToast }) => {
  const navigate = useNavigate();
  const { login, loading } = useAuth();

  const [role, setRole] = useState('institute');
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedRoleConfig = ROLE_OPTIONS.find(r => r.id === role)?.idConfig;

  // Reset form when role changes
  useEffect(() => {
    setUserId('');
    setPassword('');
  }, [role]);

  const validateForm = () => {
    if (!userId.trim()) {
      onToast('Please enter user ID', 'error');
      return false;
    }

    const pattern = VALIDATION_PATTERNS[role];
    if (pattern && !pattern.test(userId.toUpperCase())) {
      onToast('Invalid ID format!', 'error');
      return false;
    }

    if (!password.trim()) {
      onToast('Please enter password', 'error');
      return false;
    }

    if (password.length < 6) {
      onToast('Password must be at least 6 characters', 'error');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await login(userId, password);

      if (result.success) {
        onToast('Login successful! Redirecting...', 'success');

        // Redirect based on user role
        setTimeout(() => {
          switch (result.user.role) {
            case 'admin':
              navigate('/admin/users');
              break;
            case 'institute':
              navigate('/upload');
              break;

            default:
              navigate('/');
          }
        }, 1500);
      } else {
        console.log(result);
        onToast(result.error || 'Login failed!', 'error');
        setIsSubmitting(false);
      }
    } catch (err) {
      onToast('Login failed. Please try again.', 'error');
      setIsSubmitting(false);
    }
  };

  const handleForgotPassword = () => {
    navigate('/forgot-password');
  };


  const isFormDisabled = isSubmitting || loading;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <RoleSelector
        selectedRole={role}
        onRoleChange={setRole}
        disabled={isFormDisabled}
      />

      <TextInput
        id="userId"
        label={selectedRoleConfig?.label || 'User ID'}
        value={userId}
        onChange={setUserId}
        placeholder={selectedRoleConfig?.placeholder || 'Enter your user ID'}
        disabled={isFormDisabled}
        required={true}
        maxLength={selectedRoleConfig?.maxLength}
        uppercase={role !== 'admin'}
      />

      <PasswordInput
        value={password}
        onChange={setPassword}
        disabled={isFormDisabled}
        onForgotPasswordClick={handleForgotPassword}
      />

      <button
        type="submit"
        disabled={isFormDisabled}
        className={`w-full text-white py-3.5 rounded-lg font-semibold text-base sm:text-lg transition duration-200 shadow-lg ${isFormDisabled
          ? 'bg-gray-400 cursor-not-allowed'
          : 'bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98]'
          }`}
      >
        {isSubmitting ? (
          <span className="flex items-center justify-center">
            <svg className="w-5 h-5 mr-3 -ml-1 text-white animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Logging in...
          </span>
        ) : 'Login'}
      </button>
    </form>
  );
};

export default LoginForm;
