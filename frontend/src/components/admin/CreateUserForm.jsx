import { useState, useEffect } from "react";

const CreateUserForm = ({ 
  show, 
  onClose, 
  onSubmit, 
  newUser, 
  setNewUser 
}) => {
  const [localNewUser, setLocalNewUser] = useState(newUser);

  // Update local state when prop changes
  useEffect(() => {
    setLocalNewUser(newUser);
  }, [newUser]);

  // Auto-generate Institute ID when component mounts or role changes to institute
  useEffect(() => {
    if (localNewUser.role === 'institute' && !localNewUser.instituteId) {
      const prefix = getInstitutePrefix(localNewUser.instituteType);
      const randomNum = Math.floor(100000 + Math.random() * 900000); // 6-digit random number
      setLocalNewUser(prev => ({
        ...prev,
        instituteId: `${prefix}${randomNum}`
      }));
    }
  }, [localNewUser.role, localNewUser.instituteType]);

  const handleChange = (field, value) => {
    const updatedUser = { ...localNewUser, [field]: value };
    
    // Auto-generate Institute ID based on type when institute type changes
    if (field === 'instituteType' && updatedUser.role === 'institute') {
      const prefix = getInstitutePrefix(updatedUser.instituteType);
      const randomNum = Math.floor(100000 + Math.random() * 900000); // 6-digit random number
      updatedUser.instituteId = `${prefix}${randomNum}`;
    }
    
    // Clear institute fields when role changes from institute to ugc_employee
    if (field === 'role' && value === 'ugc_employee') {
      updatedUser.instituteId = '';
      updatedUser.instituteName = '';
      updatedUser.instituteType = 'others';
    }
    
    // Auto-generate Institute ID when role changes to institute
    if (field === 'role' && value === 'institute' && !updatedUser.instituteId) {
      const prefix = getInstitutePrefix(updatedUser.instituteType);
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
              <h3 className="text-xl font-bold text-gray-900">Create New User</h3>
              <p className="text-sm text-gray-500 mt-1">Add a new user to the system</p>
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
                    Role
                  </label>
                  <select
                    value={localNewUser.role}
                    onChange={(e) => handleChange('role', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition appearance-none bg-white"
                  >
                    <option value="institute">Institute User</option>
                    <option value="ugc_employee">UGC Employee</option>
                  </select>
                </div>
                
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
                    placeholder="Enter full name"
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
                    placeholder="user@example.com"
                  />
                </div>
              </div>

              {/* Right Column - Institute specific fields */}
              <div className="space-y-5">
                {localNewUser.role === "institute" && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Institute Type
                      </label>
                      <select
                        value={localNewUser.instituteType}
                        onChange={(e) => handleChange('instituteType', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition appearance-none bg-white"
                      >
                        <option value="engineering">Engineering</option>
                        <option value="management">Management</option>
                        <option value="medical">Medical</option>
                        <option value="others">Others</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Institute ID
                      </label>
                      <input
                        type="text"
                        required
                        value={localNewUser.instituteId}
                        onChange={(e) => handleChange('instituteId', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition bg-gray-50"
                        placeholder="Auto-generated based on type"
                        readOnly
                      />
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
                  </>
                )}
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
                className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white font-medium rounded-xl hover:from-indigo-700 hover:to-indigo-800 transition-all shadow-md hover:shadow-lg"
              >
                Create User
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateUserForm;
