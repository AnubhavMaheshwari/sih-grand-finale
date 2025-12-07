import AdminAnalytics from "../components/admin/AdminAnalytics.jsx";

const AdminDashboardPage = () => {
  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600 mt-2">System analytics and overview</p>
      </div>
      <AdminAnalytics />
    </div>
  );
};

export default AdminDashboardPage;
