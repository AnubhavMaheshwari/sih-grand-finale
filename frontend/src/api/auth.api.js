import axiosInstance from "./axios.config.js";

export const authAPI = {
  login: async (userId, password) => {
    const response = await axiosInstance.post("/auth/login", {
      userId,
      password,
    });
    return response;
  },

  createUser: async (userData) => {
    const response = await axiosInstance.post("/auth/create-user", userData);
    return response;
  },

  getUsers: async () => {
    const response = await axiosInstance.get("/auth/users");
    return response;
  },

  getUser: async (userId) => {
    const response = await axiosInstance.get(`/auth/users/${userId}`);
    return response;
  },

  updateUser: async (userId, userData) => {
    const response = await axiosInstance.put(`/auth/users/${userId}`, userData);
    return response;
  },

  deleteUser: async (userId) => {
    const response = await axiosInstance.delete(`/auth/users/${userId}`);
    return response;
  },

  getProfile: async () => {
    const response = await axiosInstance.get("/auth/profile");
    return response;
  },

  updateProfile: async (profileData) => {
    const response = await axiosInstance.put("/auth/profile", profileData);
    return response;
  },
};
