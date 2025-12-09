import { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from "react-router-dom";
import SplashScreen from "./components/common/SplashScreen.jsx";

import LandingPage from "./pages/LandingPage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import RegisterPage from "./pages/RegisterPage.jsx";
import VerifyRegistrationPage from "./pages/VerifyRegistrationPage.jsx";
import AnalyticsInsightsPage from "./pages/AnalyticsInsightsPage.jsx";
import ForgotPasswordPage from "./pages/ForgotPasswordPage.jsx";

// Admin pages
import UserManagementPage from "./pages/admin/UserManagementPage.jsx";
import AdminInstitutesPage from "./pages/admin/AdminInstitutesPage.jsx";
import PendingRegistrationsPage from "./pages/admin/PendingRegistrationsPage.jsx";
import InstituteParametersPage from "./pages/admin/InstituteParametersPage.jsx";
import InstituteAnalyticsPage from "./pages/admin/InstituteAnalyticsPage.jsx";
import InstituteComparisonPage from "./pages/admin/InstituteComparisonPage.jsx";
import ReportsManagementPage from "./pages/institute/ReportsManagementPage.jsx";
import AdminRequestsPage from "./pages/admin/AdminRequestsPage.jsx";

// Institute pages
import UploadDocumentPage from "./pages/institute/UploadDocumentPage.jsx";
import RequestCenterPage from "./pages/institute/RequestCenterPage.jsx";
import ParameterSubmissionPage from "./pages/institute/ParameterSubmissionPage.jsx";
import AdminLayout from "./components/layout/AdminLayout.jsx";
import InstituteLayout from "./components/layout/InstituteLayout.jsx";
import ProtectedRoute from "./components/common/ProtectedRoute.jsx";
import PublicRoute from "./components/common/PublicRoute.jsx";

function App() {
  const [showSplash, setShowSplash] = useState(true);

  return (
    <div className="app-container">
      {showSplash && <SplashScreen onFinish={() => setShowSplash(false)} />}
      <Router>
        <Routes>
          {/* Landing Page - Root Route */}
          <Route
            path="/"
            element={
              <PublicRoute>
                <LandingPage />
              </PublicRoute>
            }
          />

          {/* Login Page */}
          <Route
            path="/login"
            element={
              <PublicRoute>
                <LoginPage />
              </PublicRoute>
            }
          />

          {/* Registration Pages */}
          <Route
            path="/register"
            element={
              <PublicRoute>
                <RegisterPage />
              </PublicRoute>
            }
          />
          <Route
            path="/verify-registration"
            element={
              <PublicRoute>
                <VerifyRegistrationPage />
              </PublicRoute>
            }
          />

          {/* Admin Routes */}
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
            path="/admin/pending-registrations"
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminLayout>
                  <PendingRegistrationsPage />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/requests"
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminLayout>
                  <AdminRequestsPage />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/parameters"
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminLayout>
                  <InstituteParametersPage />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/institutes/:instituteId/analytics"
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminLayout>
                  <InstituteAnalyticsPage />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/compare"
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminLayout>
                  <InstituteComparisonPage />
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

          {/* New Institute Routes with InstituteLayout */}
          <Route
            path="/reports"
            element={
              <ProtectedRoute requiredRole="institute">
                <InstituteLayout>
                  <ReportsManagementPage />
                </InstituteLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/parameters"
            element={
              <ProtectedRoute requiredRole="institute">
                <InstituteLayout>
                  <ParameterSubmissionPage />
                </InstituteLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/request"
            element={
              <ProtectedRoute requiredRole="institute">
                <InstituteLayout>
                  <RequestCenterPage />
                </InstituteLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/analytics"
            element={
              <ProtectedRoute requiredRole="institute">
                <InstituteLayout>
                  <AnalyticsInsightsPage />
                </InstituteLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/forgot-password"
            element={
              <PublicRoute>
                <ForgotPasswordPage />
              </PublicRoute>
            }
          />

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
