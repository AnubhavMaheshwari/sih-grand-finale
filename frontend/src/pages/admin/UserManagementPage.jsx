import { useState, useEffect } from "react";
import {
  Users,
  Building2,
  UserCog,
  UserPlus,
} from "lucide-react";
import CreateUserForm from "../components/admin/CreateUserForm";
import SuccessModal from "../components/admin/SuccessModal";
import UserTable from "../components/admin/UserTable";
import DeleteConfirmationModal from "../components/admin/DeleteConfirmationModal";
import Toast from "../components/common/Toast";
import adminApi from "../api/admin.api";
import { useAuth } from "../contexts/AuthContext";

const UserManagementPage = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [toast, setToast] = useState({ show: false, message: "", type: "" });
  const [newUser, setNewUser] = useState({
    instituteName: "",
    instituteType: "engineering",
    fullName: "",
    email: "",
    instituteId: "",
  });
  const [successData, setSuccessData] = useState({
    userId: "",
    password: "",
    fullName: "",
    role: "",
  });
  const [deleteTarget, setDeleteTarget] = useState({
    userId: "",
    userName: "",
  });

  // Fetch users on component mount
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await adminApi.getAllUsers();
      if (response.users) {
        setUsers(response.users);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      showToast("Failed to load users", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (userData) => {
    try {
      const apiData = {
        instituteName: userData.instituteName,
        instituteType: userData.instituteType,
        fullName: userData.fullName,
        email: userData.email,
      };

      const response = await adminApi.createUser(apiData);

      setSuccessData({
        userId: response.user.userId,
        password: response.user.generatedPassword,
        fullName: response.user.fullName,
        role: response.user.role,
      });
      setShowCreateForm(false);
      setShowSuccessModal(true);

      // Refresh user list
      fetchUsers();

      // Reset form
      setNewUser({
        instituteName: "",
        instituteType: "engineering",
        fullName: "",
        email: "",
        instituteId: "",
      });

      showToast("Institute user created successfully", "success");
    } catch (error) {
      console.error("Error creating user:", error);
      showToast(error.response?.data?.message || "Failed to create user", "error");
    }
  };

  const handleDeleteClick = (userId, userName) => {
    setDeleteTarget({ userId, userName });
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await adminApi.deleteUser(deleteTarget.userId);
      setShowDeleteModal(false);
      fetchUsers();
      showToast("User deleted successfully", "success");
    } catch (error) {
      console.error("Error deleting user:", error);
      showToast("Failed to delete user", "error");
    }
  };

  const handleCopyPassword = async (userId) => {
    try {
      // Regenerate password and copy it to clipboard
      const response = await adminApi.resetUserPassword(userId);

      if (response.generatedPassword) {
        try {
          // Copy to clipboard
          await navigator.clipboard.writeText(response.generatedPassword);
          showToast("Password regenerated and copied to clipboard", "success");
        } catch (clipboardError) {
          console.error("Clipboard error:", clipboardError);
          // Fallback: show password in toast or modal
          setSuccessData({
            userId,
            password: response.generatedPassword,
            fullName: response.fullName || "User",
            role: "institute",
          });
          setShowSuccessModal(true);
          showToast("Password regenerated. Please copy from the modal.", "info");
        }
      } else {
        showToast("Failed to regenerate password", "error");
      }
    } catch (error) {
      console.error("Error copying password:", error);
      showToast("Failed to copy password", "error");
    }
  };

  const handleRegeneratePassword = async (userId, userName) => {
    try {
      const response = await adminApi.resetUserPassword(userId);
      showToast(`Password regenerated for ${userName}`, 'success');
      // Show new password in a modal or alert
      if (response.generatedPassword) {
        setSuccessData({
          userId,
          password: response.generatedPassword,
          fullName: userName,
          role: "institute",
        });
        setShowSuccessModal(true);
      }
    } catch (error) {
      console.error("Error regenerating password:", error);
      showToast("Failed to regenerate password", "error");
    }
  };

  const handleApproveRegistration = async (userId) => {
    if (!window.confirm('Are you sure you want to approve this registration?')) {
      return;
    }

    try {
      await adminApi.approveRegistration(userId);
      showToast('Registration approved successfully', 'success');
      fetchUsers(); // Refresh the list
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to approve registration', 'error');
    }
  };

  const handleRejectRegistration = async (userId) => {
    const reason = prompt('Please provide a reason for rejecting this registration:');
    if (!reason || !reason.trim()) {
      showToast('Please provide a reason for rejection', 'error');
      return;
    }

    if (!window.confirm('Are you sure you want to reject this registration?')) {
      return;
    }

    try {
      await adminApi.rejectRegistration(userId, reason);
      showToast('Registration rejected successfully', 'success');
      fetchUsers(); // Refresh the list
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to reject registration', 'error');
    }
  };

  const showToast = (message, type) => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: "", type: "" });
    }, 3000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Toast Component */}
      {toast.show && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ show: false, message: "", type: "" })}
        />
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600 mt-2">Manage system users and create new institute accounts</p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="mt-4 md:mt-0 bg-linear-to-r from-indigo-600 to-indigo-700 text-white px-5 py-2.5 rounded-xl font-medium hover:from-indigo-700 hover:to-indigo-800 transition-all shadow-md hover:shadow-lg flex items-center"
        >
          <UserPlus className="w-5 h-5 mr-2" />
          Create Institute User
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 bg-indigo-100 rounded-lg">
              <Users className="w-6 h-6 text-indigo-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-2xl font-bold text-gray-900">{users.length}</h3>
              <p className="text-sm text-gray-600">Total Users</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <Building2 className="w-6 h-6 text-green-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-2xl font-bold text-gray-900">
                {users.filter(u => u.role === "institute").length}
              </h3>
              <p className="text-sm text-gray-600">Institute Users</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-lg">
              <UserCog className="w-6 h-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <h3 className="text-2xl font-bold text-gray-900">
                {users.filter(u => u.role === "admin").length}
              </h3>
              <p className="text-sm text-gray-600">Admin Users</p>
            </div>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {users.length === 0 ? (
          <div className="p-12 text-center">
            <Users className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
            <p className="text-gray-500 mb-6">Get started by creating your first institute user</p>
            <button
              onClick={() => setShowCreateForm(true)}
              className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-medium hover:bg-indigo-700 transition flex items-center justify-center mx-auto"
            >
              <UserPlus className="w-5 h-5 mr-2" />
              Create Institute User
            </button>
          </div>
        ) : (
          <UserTable
            users={users}
            currentUser={currentUser}
            onDeleteClick={handleDeleteClick}
            onCopyPassword={handleCopyPassword}
            onRegeneratePassword={handleRegeneratePassword}
            onApproveRegistration={handleApproveRegistration}
            onRejectRegistration={handleRejectRegistration}
          />
        )}
      </div>

      {/* Create User Form Modal */}
      <CreateUserForm
        show={showCreateForm}
        onClose={() => setShowCreateForm(false)}
        onSubmit={handleCreateUser}
        newUser={newUser}
        setNewUser={setNewUser}
      />

      {/* Success Modal */}
      <SuccessModal
        show={showSuccessModal}
        userId={successData.userId}
        password={successData.password}
        fullName={successData.fullName}
        role={successData.role}
        onClose={() => setShowSuccessModal(false)}
        onShowToast={showToast}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        show={showDeleteModal}
        userName={deleteTarget.userName}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
};

export default UserManagementPage;
