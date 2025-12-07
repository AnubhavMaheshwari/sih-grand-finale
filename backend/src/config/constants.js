export const ROLES = {
  ADMIN: "admin",
  INSTITUTE: "institute",
  UGC_EMPLOYEE: "ugc_employee",
};

export const JWT_CONFIG = {
  EXPIRES_IN: "1d",
  ALGORITHM: "HS256",
};

export const DEFAULT_ADMIN = {
  USER_ID: process.env.ADMIN_USER_ID || "admin",
  PASSWORD: process.env.ADMIN_PASSWORD || "Admin@123",
};

export const PASSWORD_CONFIG = {
  MIN_LENGTH: 8,
  REQUIRE_UPPERCASE: true,
  REQUIRE_LOWERCASE: true,
  REQUIRE_NUMBERS: true,
  REQUIRE_SPECIAL_CHARS: false,
};

export const SECURITY_CONFIG = {
  MAX_LOGIN_ATTEMPTS: 5,
  LOCKOUT_TIME_MINUTES: 15,
  PASSWORD_HISTORY_COUNT: 3,
};
