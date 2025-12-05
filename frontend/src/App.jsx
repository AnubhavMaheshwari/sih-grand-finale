import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";
import { Link } from "react-router-dom";
import LoginPage from "./pages/LoginPage.jsx";
import UploadDocumentPage from "./pages/UploadDocumentPage.jsx";
import FAQPage from "./pages/FAQPage.jsx";
import ContactUsPage from "./pages/ContactUsPage.jsx";
import EduRankPage from "./pages/EduRankPage.jsx"; // 1. Import the EduRankPage component
import { Navigate } from "react-router-dom";




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
        {/* 2. Add the /edu route to render EduRankPage */}
        <Route path="/edu" element={<EduRankPage />} /> 
        
        {/* Redirecting from old HTML paths to new React paths */}
        <Route path="/uploaddoc.html" element={<Navigate to="/upload" replace />} />
        <Route path="/faq.html" element={<Navigate to="/faq" replace />} />
        <Route path="/contactUs.html" element={<Navigate to="/contact" replace />} />
        <Route path="/index.html" element={<Navigate to="/" replace />} />
        <Route path="/edu.html" element={<Navigate to="/edu" replace />} /> {/* Add redirect for edu.html */}
        
        {/* Optional: 404 Not Found Page */}
        <Route path="*" element={
          <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
            <h1 className="text-6xl font-extrabold text-deep-indigo">404</h1>
            <p className="text-xl text-gray-700 mt-4">Page Not Found</p>
            <Link to="/" className="mt-8 text-primary-blue hover:underline">Go to Login Page</Link>
          </div>
        } />
      </Routes>
    </Router>
  );
}

export default App;
