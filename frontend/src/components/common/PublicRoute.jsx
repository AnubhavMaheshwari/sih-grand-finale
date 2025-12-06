import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext.jsx";

const PublicRoute = ({ children, redirectAuthenticated = true }) => {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  // If user is authenticated and we should redirect them away from public pages
  if (redirectAuthenticated && isAuthenticated()) {
    // Redirect based on user role
    let redirectPath = "/";
    
    if (user?.role) {
      switch (user.role) {
        case "admin":
          redirectPath = "/admin/dashboard";
          break;
        case "institute":
          redirectPath = "/upload";
          break;
        case "ugc_employee":
          redirectPath = "/edu";
          break;
        default:
          redirectPath = "/";
      }
    }
    
    return <Navigate to={redirectPath} replace />;
  }

  return children;
};

export default PublicRoute;
