export const ROLES = {
  ADMIN: "admin",
  USER: "user",
};

export const JWT_CONFIG = {
  EXPIRES_IN: "1d",
};

export const DEFAULT_ADMIN = {
  USER_ID: process.env.ADMIN_USER_ID || "admin",
  PASSWORD: process.env.ADMIN_PASSWORD || "Admin@123",
};
