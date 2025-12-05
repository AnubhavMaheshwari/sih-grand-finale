import { BrowserRouter as Router, Routes, Route, Navigate, Link } from "react-router-dom";
import "./App.css";

import LoginPage from "./pages/LoginPage.jsx";
import UploadDocumentPage from "./pages/UploadDocumentPage.jsx";
import FAQPage from "./pages/FAQPage.jsx";
import ContactUsPage from "./pages/ContactUsPage.jsx";
import EduRankPage from "./pages/EduRankPage.jsx";
import ForgotPasswordPage from "./pages/ForgotPasswordPage.jsx"; // ✅ NEW

function App() {
  return (
    <Router>
      <Routes>
        {/* The main login page */}
        <Route path="/" element={<LoginPage />} />

        {/* Application pages */}
        <Route path="/upload" element={<UploadDocumentPage />} />
        <Route path="/faq" element={<FAQPage />} />
        <Route path="/contact" element={<ContactUsPage />} />
        <Route path="/edu" element={<EduRankPage />} />

        {/* ✅ Forgot password page */}
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />

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
