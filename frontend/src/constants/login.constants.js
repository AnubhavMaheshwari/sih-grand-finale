import { FaBuilding, FaUserTie, FaUserShield } from "react-icons/fa";

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
      placeholder: 'e.g., AI987654',
      hint: 'Format: Exactly 8 characters (2 letters A-Z, 6 numbers)',
      maxLength: 8,
    }
  },
  {
    id: 'ugc_employee',
    label: 'UGC/AICTE Employee',
    icon: FaUserTie,
    description: 'Government Officials',
    color: 'bg-blue-500',
    hoverColor: 'hover:bg-blue-600',
    selectedColor: 'ring-2 ring-blue-500 ring-offset-2',
    idConfig: {
      label: 'Employee ID',
      placeholder: 'e.g., UGCM123456',
      hint: 'Format: Exactly 10 characters (4 letters A-Z, 6 numbers)',
      maxLength: 10,
    }
  },
  {
    id: 'admin',
    label: 'Admin',
    icon: FaUserShield,
    description: 'System Administrator',
    color: 'bg-purple-500',
    hoverColor: 'hover:bg-purple-600',
    selectedColor: 'ring-2 ring-purple-500 ring-offset-2',
    idConfig: {
      label: 'Admin User ID',
      placeholder: 'Enter admin credentials',
      hint: 'Admin credentials are configured in the system',
      maxLength: 50,
    }
  }
];

export const VALIDATION_PATTERNS = {
  institute: /^[A-Z]{2}[0-9]{6}$/,
  ugc_employee: /^[A-Z]{4}[0-6]{6}$/,
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
  }
};
