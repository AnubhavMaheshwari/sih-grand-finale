import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext.jsx";

const ProtectedRoute = ({ children, requiredRole = null, redirectTo = "/login" }) => {
  const { isAuthenticated, loading, hasRole } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!isAuthenticated()) {
    return <Navigate to={redirectTo} replace />;
  }

  if (requiredRole && !hasRole(requiredRole)) {
    // Redirect based on user role
    const userRole = localStorage.getItem("user")
      ? JSON.parse(localStorage.getItem("user")).role
      : null;

    let roleRedirect = "/";
    switch (userRole) {
      case "admin":
        roleRedirect = "/admin/dashboard";
        break;
      case "institute":
        roleRedirect = "/upload";
        break;
      case "ugc_employee":
        roleRedirect = "/edu";
        break;
      default:
        roleRedirect = "/login";
    }

    return <Navigate to={roleRedirect} replace />;
  }

  return children;
};

export default ProtectedRoute;
