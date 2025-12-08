import { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from "react-router-dom";
import SplashScreen from "./components/common/SplashScreen.jsx";

import LoginPage from "./pages/LoginPage.jsx";
import UploadDocumentPage from "./pages/UploadDocumentPage.jsx";
import FAQPage from "./pages/FAQPage.jsx";
import ContactUsPage from "./pages/ContactUsPage.jsx";
import RequestsPage from "./pages/RequestsPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage.jsx";
import UserManagementPage from "./pages/UserManagementPage.jsx";
import AdminInstitutesPage from "./pages/AdminInstitutesPage.jsx";
import AdminLayout from "./components/layout/AdminLayout.jsx";
import ProtectedRoute from "./components/common/ProtectedRoute.jsx";
import PublicRoute from "./components/common/PublicRoute.jsx";

function App() {
  const [showSplash, setShowSplash] = useState(true);

  return (
    <div className="app-container">
      {showSplash && <SplashScreen onFinish={() => setShowSplash(false)} />}
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
            path="/admin/requests"
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminLayout>
                  <RequestsPage />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/dashboard"
            element={
              <Navigate to="/admin/users" replace />
            }
          />


          {/* Redirect old admin dashboard to new default */}
          <Route path="/admin" element={<Navigate to="/admin/users" replace />} />

          {/* Institution upload dashboard - Institute users only */}
          <Route
            path="/upload"
            element={
              <ProtectedRoute requiredRole="institute">
                <UploadDocumentPage />
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
    </div>
  );
}

export default App;
