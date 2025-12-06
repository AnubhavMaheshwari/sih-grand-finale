import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext.jsx";
import { authAPI } from "../api/auth.api.js";
import Navigation from "../components/layout/Navigation.jsx";
import Toast from "../components/common/Toast.jsx";
import StatsCards from "../components/admin/StatsCards.jsx";
import UserTable from "../components/admin/UserTable.jsx";
import CreateUserForm from "../components/admin/CreateUserForm.jsx";
import DeleteConfirmationModal from "../components/admin/DeleteConfirmationModal.jsx";
import SuccessModal from "../components/admin/SuccessModal.jsx";

const AdminDashboardPage = () => {
  const navigate = useNavigate();
  const { user, hasRole, setLogoutCallback, clearLogoutCallback } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [toast, setToast] = useState({ message: "", type: "" });

  const [newUser, setNewUser] = useState({
    userId: "",
    password: "",
    role: "institute",
    fullName: "",
    email: "",
    instituteId: "",
    instituteName: "",
    instituteType: "others",
    autoGeneratePassword: true,
  });
  const [deleteConfirmation, setDeleteConfirmation] = useState({
    show: false,
    userId: null,
    userName: "",
  });
  const [successModal, setSuccessModal] = useState({
    show: false,
    userId: "",
    password: "",
    fullName: "",
    role: "",
  });

  useEffect(() => {
    // Redirect non-admin users
    if (user && user.role !== "admin") {
      navigate("/");
      return;
    }
    
    // Fetch users for admin
    if (user && user.role === "admin") {
      fetchUsers();
    }
  }, [user, navigate]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await authAPI.getUsers();
      setUsers(response.data.users || []);
    } catch (error) {
      console.error("Error fetching users:", error);
      showToast("Failed to fetch users", "error");
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message, type) => {
    setToast({ message, type });
    setTimeout(() => setToast({ message: "", type: "" }), 3000);
  };

  const handleCreateUser = async (userData) => {
    try {
      const response = await authAPI.createUser(userData);
      const { user: createdUser } = response.data;
      
      // Show success modal with generated credentials
      setSuccessModal({
        show: true,
        userId: createdUser.userId,
        password: createdUser.generatedPassword || "Generated password not available",
        fullName: createdUser.fullName,
        role: createdUser.role,
      });
      
      setShowCreateForm(false);
      setNewUser({
        userId: "",
        password: "",
        role: "institute",
        fullName: "",
        email: "",
        instituteId: "",
        instituteName: "",
        instituteType: "others",
        autoGeneratePassword: true,
      });
      fetchUsers();
    } catch (error) {
      console.error("Error creating user:", error);
      showToast(error.response?.data?.message || "Failed to create user", "error");
    }
  };

  const handleDeleteClick = (userId, userName) => {
    setDeleteConfirmation({
      show: true,
      userId,
      userName,
    });
  };

  const handleDeleteConfirm = async () => {
    const { userId } = deleteConfirmation;
    
    try {
      await authAPI.deleteUser(userId);
      showToast("User deleted successfully", "success");
      fetchUsers();
    } catch (error) {
      console.error("Error deleting user:", error);
      showToast(error.response?.data?.message || "Failed to delete user", "error");
    } finally {
      setDeleteConfirmation({ show: false, userId: null, userName: "" });
    }
  };

  const handleDeleteCancel = () => {
    setDeleteConfirmation({ show: false, userId: null, userName: "" });
  };

  const handleCopyPassword = async (userId) => {
    try {
      // In a real implementation, we would fetch the generated password from the backend
      // For now, we'll show a message that password copying is not available
      showToast("Password copy functionality requires backend integration", "info");
    } catch (error) {
      console.error("Error copying password:", error);
      showToast("Failed to copy password", "error");
    }
  };

  const handleRegeneratePassword = async (userId, userName) => {
    if (!window.confirm(`Are you sure you want to regenerate password for ${userName}?`)) {
      return;
    }

    try {
      const response = await authAPI.regeneratePassword(userId);
      showToast(`Password regenerated for ${userName}. New password: ${response.data.generatedPassword}`, "success");
      fetchUsers();
    } catch (error) {
      console.error("Error regenerating password:", error);
      showToast(error.response?.data?.message || "Failed to regenerate password", "error");
    }
  };

  const handleLogoutToast = () => {
    showToast("Logged out successfully", "success");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <Navigation currentPage="Admin Dashboard" onLogout={handleLogoutToast} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">Manage users and system configuration</p>
        </div>

        <StatsCards users={users} />

        <div className="mb-6 text-end">
          <button
            onClick={() => setShowCreateForm(true)}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700 transition"
          >
            + Create New User
          </button>
        </div>
        
        <UserTable
          users={users}
          currentUser={user}
          onDeleteClick={handleDeleteClick}
          onCopyPassword={handleCopyPassword}
          onRegeneratePassword={handleRegeneratePassword}
        />
      </main>

      {/* Create User Modal */}
      <CreateUserForm
        show={showCreateForm}
        onClose={() => setShowCreateForm(false)}
        onSubmit={handleCreateUser}
        newUser={newUser}
        setNewUser={setNewUser}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        show={deleteConfirmation.show}
        userName={deleteConfirmation.userName}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
      />

      {/* Success Modal with Generated Credentials */}
      <SuccessModal
        show={successModal.show}
        userId={successModal.userId}
        password={successModal.password}
        fullName={successModal.fullName}
        role={successModal.role}
        onClose={() => setSuccessModal({ ...successModal, show: false })}
        onShowToast={showToast}
      />

      {/* Toast Notification */}
      {toast.message && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ message: "", type: "" })}
        />
      )}
    </div>
  );
};

export default AdminDashboardPage;
