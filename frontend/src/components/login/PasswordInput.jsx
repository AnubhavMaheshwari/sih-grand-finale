import React, { useState } from 'react';
import { FaEye, FaEyeSlash } from "react-icons/fa";

const PasswordInput = ({
  value,
  onChange,
  placeholder = "Enter your password",
  disabled = false,
  showForgotPassword = true,
  onForgotPasswordClick
}) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <label
          htmlFor="password"
          className="block text-sm font-medium text-gray-700"
        >
          Password
        </label>
        {showForgotPassword && (
          <button
            type="button"
            onClick={onForgotPasswordClick}
            className="text-xs sm:text-sm text-indigo-600 hover:text-indigo-800 hover:underline transition-colors"
            disabled={disabled}
          >
            Forgot password?
          </button>
        )}
      </div>
      <div className="relative">
        <input
          type={showPassword ? 'text' : 'password'}
          id="password"
          name="password"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 text-sm sm:text-base disabled:bg-gray-50 disabled:cursor-not-allowed"
          required
          disabled={disabled}
          aria-describedby="password-hint"
        />
        <button 
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-400 hover:text-gray-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label={showPassword ? "Hide password" : "Show password"}
          disabled={disabled}
        >
          {!showPassword ? (
            <FaEyeSlash className="w-5 h-5" />
          ) : (
            <FaEye className="w-5 h-5" />
          )}
        </button>
      </div>
    </div>
  );
};

export default PasswordInput;
