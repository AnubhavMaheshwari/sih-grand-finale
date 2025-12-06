const StatsCards = ({ users }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <div className="bg-white rounded-xl shadow p-6">
        <h3 className="text-lg font-semibold text-gray-700">Total Users</h3>
        <p className="text-3xl font-bold text-indigo-600 mt-2">{users.length}</p>
      </div>
      <div className="bg-white rounded-xl shadow p-6">
        <h3 className="text-lg font-semibold text-gray-700">Institute Users</h3>
        <p className="text-3xl font-bold text-green-600 mt-2">
          {users.filter(u => u.role === "institute").length}
        </p>
      </div>
      <div className="bg-white rounded-xl shadow p-6">
        <h3 className="text-lg font-semibold text-gray-700">UGC Employees</h3>
        <p className="text-3xl font-bold text-blue-600 mt-2">
          {users.filter(u => u.role === "ugc_employee").length}
        </p>
      </div>
    </div>
  );
};

export default StatsCards;
