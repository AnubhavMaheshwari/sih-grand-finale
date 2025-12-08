import React, { createContext, useContext, useReducer, useEffect, useState } from "react";
import { authAPI } from "../api/auth.api";

// Initial state
const initialState = {
  user: null,
  token: sessionStorage.getItem("token") || null,
  loading: true,
  error: null,
};

// Reducer function
const authReducer = (state, action) => {
  switch (action.type) {
    case "LOGIN_REQUEST":
      return {
        ...state,
        loading: true,
        error: null,
      };
    case "LOGIN_SUCCESS":
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        loading: false,
        error: null,
      };
    case "LOGIN_FAILURE":
      return {
        ...state,
        loading: false,
        error: action.payload,
      };
    case "LOGOUT":
      return {
        ...state,
        user: null,
        token: null,
        loading: false,
        error: null,
      };
    case "SET_USER":
      return {
        ...state,
        user: action.payload,
        loading: false,
      };
    case "SET_LOADING":
      return {
        ...state,
        loading: action.payload,
      };
    default:
      return state;
  }
};

// Create context
const AuthContext = createContext();

// Auth provider component
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const [logoutCallback, setLogoutCallback] = useState(null);

  // Check if user is already logged in on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = sessionStorage.getItem("token");
      if (token) {
        try {
          // Verify token with backend
          // This would typically be an API call to validate token
          // For now, we'll parse the token to get user info
          const userData = JSON.parse(sessionStorage.getItem("user") || "null");
          if (userData) {
            dispatch({ type: "SET_USER", payload: userData });
          }
        } catch (error) {
          console.error("Auth check failed:", error);
          logout();
        }
      }
      dispatch({ type: "SET_LOADING", payload: false });
    };

    checkAuth();
  }, []);

  // Login function
  const login = async (userId, password) => {
    dispatch({ type: "LOGIN_REQUEST" });
    try {
      const response = await authAPI.login(userId, password);

      const { token, user } = response.data;

      // Store token and user data
      sessionStorage.setItem("token", token);
      sessionStorage.setItem("user", JSON.stringify(user));

      dispatch({
        type: "LOGIN_SUCCESS",
        payload: { user, token },
      });

      return { success: true, user };
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Login failed";
      dispatch({
        type: "LOGIN_FAILURE",
        payload: errorMessage,
      });
      return { success: false, error: errorMessage };
    }
  };

  // Logout function
  const logout = (showToast = true) => {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
    sessionStorage.removeItem("institutionLoggedIn");

    dispatch({ type: "LOGOUT" });

    // Call logout callback if provided
    if (showToast && logoutCallback) {
      logoutCallback();
    }
  };

  // Set logout callback for toast notifications
  const setLogoutCallbackHandler = (callback) => {
    setLogoutCallback(() => callback);
  };

  // Clear logout callback
  const clearLogoutCallback = () => {
    setLogoutCallback(null);
  };

  // Check if user has specific role
  const hasRole = (role) => {
    return state.user?.role === role;
  };

  // Check if user is authenticated
  const isAuthenticated = () => {
    return !!state.token && !!state.user;
  };

  // Get user's institute ID (for institute users)
  const getInstituteId = () => {
    return state.user?.instituteId || null;
  };

  const value = {
    ...state,
    login,
    logout,
    hasRole,
    isAuthenticated,
    getInstituteId,
    setLogoutCallback: setLogoutCallbackHandler,
    clearLogoutCallback,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
