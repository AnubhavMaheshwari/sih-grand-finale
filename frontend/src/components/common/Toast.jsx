import React, { useEffect, useState } from 'react';
import { TOAST_CONFIG } from '../../constants/login.constants.js';

const Toast = ({ message, type = 'info', duration = TOAST_CONFIG.duration, onClose }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      if (onClose) {
        setTimeout(onClose, 300); // Wait for fade out animation
      }
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  if (!isVisible) return null;

  const config = TOAST_CONFIG[type] || TOAST_CONFIG.info;
  const safeConfig = config || TOAST_CONFIG.info; // Double safety check

  return (
    <div
      className={`fixed bottom-6 left-1/2 transform -translate-x-1/2 max-w-[90%] sm:max-w-md flex items-center text-white text-sm font-medium px-4 py-3 rounded-lg shadow-2xl z-50 animate-fade-in-up ${safeConfig.bgColor || 'bg-blue-600'}`}
      role="alert"
    >
      <span className="mr-3 text-lg">{safeConfig.icon || 'ℹ️'}</span>
      <span className="flex-1">{message}</span>
      <button
        onClick={() => {
          setIsVisible(false);
          if (onClose) onClose();
        }}
        className="ml-4 text-white/80 hover:text-white transition-colors"
        aria-label="Close notification"
      >
        ✕
      </button>
    </div>
  );
};

export default Toast;
