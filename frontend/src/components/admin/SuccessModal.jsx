const SuccessModal = ({ 
  show, 
  userId, 
  password, 
  fullName, 
  role, 
  onClose, 
  onShowToast 
}) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Blurry backdrop */}
      <div 
        className="fixed inset-0 bg-black/30 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full transform transition-all">
        <div className="p-6">
          <div className="flex items-center justify-center mb-6">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          
          <div className="text-center mb-6">
            <h3 className="text-xl font-bold text-gray-900 mb-2">User Created Successfully!</h3>
            <p className="text-gray-600">
              User <span className="font-semibold">{fullName}</span> has been created.
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Please save these credentials to share with the user:
            </p>
          </div>
          
          <div className="bg-gray-50 rounded-xl p-4 mb-6">
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  User ID
                </label>
                <div className="flex items-center justify-between bg-white px-3 py-2 rounded-lg border border-gray-200">
                  <code className="text-sm font-mono text-gray-800">{userId}</code>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(userId);
                      onShowToast("User ID copied to clipboard", "success");
                    }}
                    className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                  >
                    Copy
                  </button>
                </div>
              </div>
              
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Password
                </label>
                <div className="flex items-center justify-between bg-white px-3 py-2 rounded-lg border border-gray-200">
                  <code className="text-sm font-mono text-gray-800">{password}</code>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(password);
                      onShowToast("Password copied to clipboard", "success");
                    }}
                    className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                  >
                    Copy
                  </button>
                </div>
              </div>
              
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  Role
                </label>
                <div className="bg-white px-3 py-2 rounded-lg border border-gray-200">
                  <span className="text-sm font-medium text-gray-800 capitalize">{role}</span>
                </div>
              </div>
            </div>
            
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-start">
                <svg className="w-4 h-4 text-yellow-600 mt-0.5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <p className="text-xs text-yellow-700">
                  <span className="font-semibold">Important:</span> Save these credentials securely. The password cannot be retrieved later.
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex justify-center">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white font-medium rounded-xl hover:from-indigo-700 hover:to-indigo-800 transition-all shadow-md hover:shadow-lg"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuccessModal;
