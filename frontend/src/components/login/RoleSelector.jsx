import { ROLE_OPTIONS } from '../../constants/login.constants.js';

const RoleSelector = ({ selectedRole, onRoleChange, disabled = false }) => {
  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700">
        Select Login Type
      </label>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {ROLE_OPTIONS.map((option) => {
          const Icon = option.icon;
          const isSelected = selectedRole === option.id;
          
          return (
            <button
              key={option.id}
              type="button"
              onClick={() => onRoleChange(option.id)}
              className={`flex flex-col items-center justify-center p-4 rounded-xl border transition-all duration-200 ${
                isSelected
                  ? `${option.selectedColor} border-transparent bg-white shadow-lg`
                  : 'border-gray-200 bg-gray-50 hover:bg-white hover:shadow-md'
              } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              disabled={disabled}
              aria-pressed={isSelected}
              aria-label={`Login as ${option.label}`}
            >
              <div className={`p-3 rounded-full ${option.color} text-white mb-3`}>
                <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <span className="font-semibold text-gray-900 text-sm sm:text-base">
                {option.label}
              </span>
              <span className="text-xs text-gray-500 mt-1 text-center">
                {option.description}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default RoleSelector;
