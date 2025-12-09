import { FaBuilding, FaUserShield } from "react-icons/fa";

export const PRIMARY_BLUE = "#4F46E5";
export const DEEP_INDIGO = "#3730A3";

export const ROLE_OPTIONS = [
  {
    id: 'institute',
    label: 'Institute',
    icon: FaBuilding,
    description: 'Educational Institutions',
    color: 'bg-green-500',
    hoverColor: 'hover:bg-green-600',
    selectedColor: 'ring-2 ring-green-500 ring-offset-2',
    idConfig: {
      label: 'Institute ID',
      placeholder: 'Enter your institute ID',
      hint: 'Enter your institute ID',
      maxLength: 100,
    }
  },
  {
    id: 'admin',
    label: 'UGC/AICTE',
    icon: FaUserShield,
    description: 'Regulatory Authority',
    color: 'bg-purple-500',
    hoverColor: 'hover:bg-purple-600',
    selectedColor: 'ring-2 ring-purple-500 ring-offset-2',
    idConfig: {
      label: 'UGC/AICTE User ID',
      placeholder: 'Enter UGC/AICTE credentials',
      hint: 'Enter your UGC/AICTE user ID',
      maxLength: 100,
    }
  }
];

export const VALIDATION_PATTERNS = {
  // Removed strict validation patterns to allow more flexible input
  institute: null,
  admin: null,
};

export const TOAST_CONFIG = {
  duration: 3000,
  success: {
    bgColor: 'bg-green-600',
    icon: '✅'
  },
  error: {
    bgColor: 'bg-red-600',
    icon: '⚠️'
  },
  info: {
    bgColor: 'bg-blue-600',
    icon: 'ℹ️'
  },
  warning: {
    bgColor: 'bg-yellow-600',
    icon: '⚠️'
  }
};
