import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Toast from '../../components/common/Toast.jsx';
import adminApi from '../../api/admin.api.js';

const PendingRegistrationsPage = () => {
  const navigate = useNavigate();
  const [toast, setToast] = useState({ message: '', type: '' });
  const [loading, setLoading] = useState(true);
  const [pendingRegistrations, setPendingRegistrations] = useState([]);
  const [approving, setApproving] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [selectedUserId, setSelectedUserId] = useState(null);

  const showToast = (message, type) => {
    setToast({ message, type });
  };

  const handleToastClose = () => {
    setToast({ message: '', type: '' });
  };

  const fetchPendingRegistrations = async () => {
    try {
      setLoading(true);
      const response = await adminApi.getPendingRegistrations();
      setPendingRegistrations(response.data.pendingRegistrations || []);
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to fetch pending registrations', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingRegistrations();
  }, []);

  const handleApprove = async (userId) => {
    if (!window.confirm('Are you sure you want to approve this registration?')) {
      return;
    }

    try {
      setApproving(true);
      await adminApi.approveRegistration(userId);
      showToast('Registration approved successfully', 'success');
      fetchPendingRegistrations(); // Refresh the list
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to approve registration', 'error');
    } finally {
      setApproving(false);
    }
  };

  const handleReject = async (userId, reason) => {
    if (!reason.trim()) {
      showToast('Please provide a reason for rejection', 'error');
      return;
    }

    if (!window.confirm('Are you sure you want to reject this registration?')) {
      return;
    }

    try {
      setRejecting(true);
      await adminApi.rejectRegistration(userId, reason);
      showToast('Registration rejected successfully', 'success');
      setSelectedUserId(null);
      setRejectReason('');
      fetchPendingRegistrations(); // Refresh the list
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to reject registration', 'error');
    } finally {
      setRejecting(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getInstituteTypeLabel = (type) => {
    const labels = {
      engineering: 'Engineering',
      management: 'Management',
      medical: 'Medical',
      others: 'Others'
    };
    return labels[type] || type;
  };

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Pending Registrations</h1>
        <p className="text-gray-600 mt-2">
          Review and approve/reject institute registration requests
        </p>
      </div>

      {/* Stats Card */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="flex items-center">
            <div className="p-3 bg-blue-50 rounded-lg">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500">Pending Registrations</p>
              <p className="text-2xl font-bold text-gray-900">{pendingRegistrations.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900">Registration Requests</h2>
            <button
              onClick={fetchPendingRegistrations}
              className="px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition"
            >
              Refresh
            </button>
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            <p className="mt-4 text-gray-500">Loading pending registrations...</p>
          </div>
        ) : pendingRegistrations.length === 0 ? (
          <div className="p-12 text-center">
            <svg className="w-16 h-16 mx-auto text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="mt-4 text-gray-500">No pending registrations found</p>
            <p className="text-sm text-gray-400 mt-1">All registration requests have been processed</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Institute
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact Person
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Registered On
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {pendingRegistrations.map((registration) => (
                  <tr key={registration._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900">{registration.instituteName}</p>
                        <p className="text-sm text-gray-500">{registration.email}</p>
                        <p className="text-xs text-gray-400 mt-1">ID: {registration.userId}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-gray-900">{registration.fullName}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {getInstituteTypeLabel(registration.instituteType)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {formatDate(registration.createdAt)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleApprove(registration.userId)}
                          disabled={approving}
                          className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {approving ? 'Approve' : 'Approve'}
                        </button>
                        <button
                          onClick={() => setSelectedUserId(registration.userId)}
                          className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition"
                        >
                          Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Reject Modal */}
      {
        selectedUserId && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-lg max-w-md w-full">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Reject Registration</h3>
                <p className="text-gray-600 mb-4">
                  Please provide a reason for rejecting this registration. The institute will be notified.
                </p>
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Enter reason for rejection..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition"
                  rows="4"
                />
                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    onClick={() => {
                      setSelectedUserId(null);
                      setRejectReason('');
                    }}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleReject(selectedUserId, rejectReason)}
                    disabled={rejecting || !rejectReason.trim()}
                    className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {rejecting ? 'Rejecting...' : 'Confirm Reject'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )
      }

      {/* Toast Notification */}
      {
        toast.message && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={handleToastClose}
          />
        )
      }
    </div >
  );
};

export default PendingRegistrationsPage;
