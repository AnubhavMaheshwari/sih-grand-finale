import { useState, useEffect } from "react";

const CreateUserForm = ({ 
  show, 
  onClose, 
  onSubmit, 
  newUser, 
  setNewUser 
}) => {
  const [localNewUser, setLocalNewUser] = useState({
    instituteName: "",
    instituteType: "engineering",
    fullName: "",
    email: "",
    instituteId: "",
    ...newUser
  });

  // Update local state when prop changes
  useEffect(() => {
    setLocalNewUser(prev => ({
      ...prev,
      ...newUser
    }));
  }, [newUser]);

  // Auto-generate Institute ID when component mounts or institute type changes
  useEffect(() => {
    const prefix = getInstitutePrefix(localNewUser.instituteType);
    const randomNum = Math.floor(100000 + Math.random() * 900000); // 6-digit random number
    setLocalNewUser(prev => ({
      ...prev,
      instituteId: `${prefix}${randomNum}`
    }));
  }, [localNewUser.instituteType]);

  const handleChange = (field, value) => {
    const updatedUser = { ...localNewUser, [field]: value };
    
    // Auto-generate Institute ID based on type when institute type changes
    if (field === 'instituteType') {
      const prefix = getInstitutePrefix(value);
      const randomNum = Math.floor(100000 + Math.random() * 900000);
      updatedUser.instituteId = `${prefix}${randomNum}`;
    }
    
    setLocalNewUser(updatedUser);
  };

  const getInstitutePrefix = (type) => {
    switch(type) {
      case 'engineering': return 'ENGG';
      case 'management': return 'MGMT';
      case 'medical': return 'MED';
      default: return 'INST';
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Update parent state
    setNewUser(localNewUser);
    // Call onSubmit with the user data
    onSubmit(localNewUser);
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 text-start">
      {/* Blurry backdrop */}
      <div 
        className="fixed inset-0 bg-black/30 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto transform transition-all">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-xl font-bold text-gray-900">Create Institute User</h3>
              <p className="text-sm text-gray-500 mt-1">Add a new institute user to the system</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="Close"
            >
              <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Institute Type *
                  </label>
                  <select
                    value={localNewUser.instituteType}
                    onChange={(e) => handleChange('instituteType', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition appearance-none bg-white"
                    required
                  >
                    <option value="engineering">Engineering</option>
                    <option value="management">Management</option>
                    <option value="medical">Medical</option>
                    <option value="others">Others</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Institute Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={localNewUser.instituteName}
                    onChange={(e) => handleChange('instituteName', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                    placeholder="Enter institute name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Institute ID
                  </label>
                  <input
                    type="text"
                    value={localNewUser.instituteId}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition bg-gray-50"
                    placeholder="Auto-generated based on type"
                    readOnly
                  />
                  <p className="text-xs text-gray-500 mt-1">Auto-generated institute ID for login</p>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={localNewUser.fullName}
                    onChange={(e) => handleChange('fullName', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                    placeholder="Enter full name of the user"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={localNewUser.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                    placeholder="user@institute.edu"
                  />
                </div>

                <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
                  <h4 className="text-sm font-medium text-blue-800 mb-2">Note:</h4>
                  <ul className="text-xs text-blue-700 space-y-1">
                    <li>• Institute ID and password will be auto-generated</li>
                    <li>• Welcome email with credentials will be sent to the provided email</li>
                    <li>• User will need to change password on first login</li>
                  </ul>
                </div>
              </div>
            </div>
            
            <div className="mt-8 pt-6 border-gray-200 flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 bg-linear-to-r from-indigo-600 to-indigo-700 text-white font-medium rounded-xl hover:from-indigo-700 hover:to-indigo-800 transition-all shadow-md hover:shadow-lg"
              >
                Create Institute User
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateUserForm;
