import jwt from "jsonwebtoken";

export const auth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer "))
    return res.status(401).json({ message: "No token provided" });

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, role, instituteId (for institute users) }
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
};

export const isAdmin = (req, res, next) => {
  if (req.user?.role !== "admin") {
    return res.status(403).json({ message: "Admin access required" });
  }
  next();
};

export const isInstitute = (req, res, next) => {
  if (req.user?.role !== "institute") {
    return res.status(403).json({ message: "Institute access required" });
  }
  next();
};

export const isUgcEmployee = (req, res, next) => {
  if (req.user?.role !== "ugc_employee") {
    return res.status(403).json({ message: "UGC employee access required" });
  }
  next();
};

export const isAdminOrUgc = (req, res, next) => {
  if (req.user?.role !== "admin" && req.user?.role !== "ugc_employee") {
    return res.status(403).json({ message: "Admin or UGC employee access required" });
  }
  next();
};

export const isAdminOrInstitute = (req, res, next) => {
  if (req.user?.role !== "admin" && req.user?.role !== "institute") {
    return res.status(403).json({ message: "Admin or institute access required" });
  }
  next();
};

// Middleware to check if institute user is accessing their own data
export const checkInstituteAccess = (req, res, next) => {
  if (req.user?.role === "institute") {
    const requestedInstituteId = req.params.instituteId || req.body.instituteId;
    if (requestedInstituteId && requestedInstituteId !== req.user.instituteId) {
      return res.status(403).json({ message: "Access denied to other institute data" });
    }
  }
  next();
};
