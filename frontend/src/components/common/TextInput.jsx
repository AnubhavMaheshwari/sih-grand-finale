const TextInput = ({
  id,
  label,
  value,
  onChange,
  placeholder = "",
  type = "text",
  disabled = false,
  required = true,
  maxLength,
  uppercase = false,
  className = ""
}) => {
  return (
    <div className="space-y-2">
      {label && (
        <label
          htmlFor={id}
          className="text-left block text-sm font-medium text-gray-700"
        >
          {label}
        </label>
      )}
      <input
        type={type}
        id={id}
        name={id}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 text-sm sm:text-base disabled:bg-gray-50 disabled:cursor-not-allowed ${uppercase ? 'uppercase' : ''} ${className}`}
        required={required}
        disabled={disabled}
        maxLength={maxLength}
      />
    </div>
  );
};

export default TextInput;
