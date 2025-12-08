const AdminInstitutesPage = () => {
  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Institute Management</h1>
        <p className="text-gray-600 mt-2">Manage educational institutions</p>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-96 flex flex-col items-center justify-center text-gray-400">
        <svg className="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
        <p className="text-lg">Ready for new features</p>
      </div>
    </div>
  );
};

export default AdminInstitutesPage;
