import { BrowserRouter as Router, Routes, Route, Navigate, Link } from "react-router-dom";

import LoginPage from "./pages/LoginPage.jsx";
import UploadDocumentPage from "./pages/UploadDocumentPage.jsx";
import FAQPage from "./pages/FAQPage.jsx";
import ContactUsPage from "./pages/ContactUsPage.jsx";
import EduRankPage from "./pages/EduRankPage.jsx";
import ForgotPasswordPage from "./pages/ForgotPasswordPage.jsx";
import UploadedDataPage from "./pages/UploadedDataPage.jsx";
import AdminDashboardPage from "./pages/AdminDashboardPage.jsx";
import UserManagementPage from "./pages/UserManagementPage.jsx";
import AdminInstitutesPage from "./pages/AdminInstitutesPage.jsx";
import AdminContentPage from "./pages/AdminContentPage.jsx";
import AdminLayout from "./components/layout/AdminLayout.jsx";
import ProtectedRoute from "./components/common/ProtectedRoute.jsx";
import PublicRoute from "./components/common/PublicRoute.jsx";

function App() {
  return (
    <Router>
      <Routes>
        <Route 
          path="/" 
          element={
            <PublicRoute>
              <LoginPage />
            </PublicRoute>
          } 
        />

        <Route 
          path="/admin/dashboard" 
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminLayout>
                <AdminDashboardPage />
              </AdminLayout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/users" 
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminLayout>
                <UserManagementPage />
              </AdminLayout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/institutes" 
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminLayout>
                <AdminInstitutesPage />
              </AdminLayout>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/content" 
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminLayout>
                <AdminContentPage />
              </AdminLayout>
            </ProtectedRoute>
          } 
        />
        {/* Redirect old admin dashboard to new dashboard */}
        <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />

        {/* Institution upload dashboard - Institute users only */}
        <Route 
          path="/upload" 
          element={
            <ProtectedRoute requiredRole="institute">
              <UploadDocumentPage />
            </ProtectedRoute>
          } 
        />

        {/* UGC uploaded-data explorer - UGC employees only */}
        <Route 
          path="/uploaded-data" 
          element={
            <ProtectedRoute requiredRole="ugc_employee">
              <UploadedDataPage />
            </ProtectedRoute>
          } 
        />

        {/* EduRank page - UGC employees only */}
        <Route 
          path="/edu" 
          element={
            <ProtectedRoute requiredRole="ugc_employee">
              <EduRankPage />
            </ProtectedRoute>
          } 
        />

        {/* Public pages */}
        <Route path="/faq" element={<FAQPage />} />
        <Route path="/contact" element={<ContactUsPage />} />

        {/* Forgot password page - Public only */}
        <Route 
          path="/forgot-password" 
          element={
            <PublicRoute>
              <ForgotPasswordPage />
            </PublicRoute>
          } 
        />

        {/* Redirecting from old HTML paths to new React paths */}
        <Route path="/uploaddoc.html" element={<Navigate to="/upload" replace />} />
        <Route path="/faq.html" element={<Navigate to="/faq" replace />} />
        <Route path="/contactUs.html" element={<Navigate to="/contact" replace />} />
        <Route path="/index.html" element={<Navigate to="/" replace />} />
        <Route path="/edu.html" element={<Navigate to="/edu" replace />} />

        {/* 404 Not Found Page */}
        <Route
          path="*"
          element={
            <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
              <h1 className="text-6xl font-extrabold text-deep-indigo">404</h1>
              <p className="text-xl text-gray-700 mt-4">Page Not Found</p>
              <Link to="/" className="mt-8 text-primary-blue hover:underline">
                Go to Login Page
              </Link>
            </div>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
