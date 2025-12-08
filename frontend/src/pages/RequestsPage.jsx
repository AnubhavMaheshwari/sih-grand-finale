const RequestsPage = () => {
    return (
        <div className="space-y-6">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Requests</h1>
                <p className="text-gray-600 mt-2">Manage incoming requests</p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-96 flex flex-col items-center justify-center text-gray-400">
                <svg className="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="text-lg">No requests found</p>
            </div>
        </div>
    );
};

export default RequestsPage;
