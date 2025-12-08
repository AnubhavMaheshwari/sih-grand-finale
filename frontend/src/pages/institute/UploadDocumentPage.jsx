import { useState, useCallback } from "react";
import InstituteLayout from "../../components/layout/InstituteLayout";
import {
  FileText,
  CheckCircle2,
  AlertCircle,
  BarChart3,
} from "lucide-react";

const UploadDocumentPage = () => {
  const [toast, setToast] = useState(null);

  const showToast = useCallback((type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  }, []);

  return (
    <InstituteLayout>
      <div className="h-full overflow-hidden bg-white">
        <main className="h-full overflow-y-auto p-6 scroll-smooth bg-gray-50/50">
          <div className="max-w-4xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900">Parameter Data Entry</h1>
              <p className="text-base text-gray-500 mt-1">
                File uploads are no longer supported. Please use the parameter form to enter your institute data.
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-8 mb-8">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <FileText className="w-8 h-8 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-blue-900 mb-2">Why the change?</h3>
                  <p className="text-blue-700 mb-4">
                    We've simplified the data entry process. Instead of uploading CSV/Excel/PDF files, 
                    you can now directly enter your institute's parameter data through an intuitive form.
                  </p>
                  <ul className="space-y-2 text-blue-700">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-green-500" />
                      <span>No more file format issues</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-green-500" />
                      <span>Real-time validation and error checking</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-green-500" />
                      <span>Immediate feedback on data completeness</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-green-500" />
                      <span>Save progress and edit anytime</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <div className="w-12 h-12 bg-indigo-50 rounded-lg flex items-center justify-center mb-4">
                  <FileText className="w-6 h-6 text-indigo-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Parameter Form</h3>
                <p className="text-sm text-gray-500 mb-4">
                  Enter all 27 parameters for your institute through our user-friendly form.
                </p>
                <button
                  onClick={() => window.location.href = "/institute/parameters"}
                  className="w-full py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Go to Parameter Form
                </button>
              </div>

              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center mb-4">
                  <BarChart3 className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Data Dashboard</h3>
                <p className="text-sm text-gray-500 mb-4">
                  View your submission history, completeness stats, and verification status.
                </p>
                <button
                  onClick={() => window.location.href = "/institute/parameters?tab=dashboard"}
                  className="w-full py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors"
                >
                  View Dashboard
                </button>
              </div>
            </div>
          </div>
        </main>

        {/* Toast */}
        {toast && (
          <div
            className={`fixed bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-3 px-4 py-3 rounded-lg shadow-xl text-white text-sm font-medium z-50 animate-in fade-in slide-in-from-bottom-4`}
            style={{
              backgroundColor:
                toast.type === "success" ? "#059669" : "#DC2626",
            }}
          >
            {toast.type === "success" ? (
              <CheckCircle2 className="w-5 h-5" />
            ) : (
              <AlertCircle className="w-5 h-5" />
            )}
            <span className="text-base">{toast.message}</span>
          </div>
        )}
      </div>
    </InstituteLayout>
  );
};

export default UploadDocumentPage;
