import User from "../models/User.model.js";
import Institute from "../models/Institute.model.js";
import jwt from "jsonwebtoken";
import { JWT_CONFIG } from "../config/constants.js";

export const loginUser = async (userId, password) => {
  const user = await User.findOne({ userId });
  
  if (!user) {
    throw new Error("Invalid credentials");
  }

  const isMatch = await user.comparePassword(password);
  
  if (!isMatch) {
    throw new Error("Invalid credentials");
  }

  // Create token payload with user data
  const tokenPayload = {
    id: user._id,
    userId: user.userId,
    role: user.role,
    fullName: user.fullName,
  };

  // Add instituteId for institute users
  if (user.role === "institute") {
    tokenPayload.instituteId = user.instituteId;
    tokenPayload.instituteName = user.instituteName;
  }

  const token = jwt.sign(
    tokenPayload,
    process.env.JWT_SECRET,
    { expiresIn: JWT_CONFIG.EXPIRES_IN }
  );

  // Prepare user response data
  const userResponse = {
    id: user._id,
    userId: user.userId,
    role: user.role,
    fullName: user.fullName,
    email: user.email,
  };

  // Add institute data for institute users
  if (user.role === "institute") {
    userResponse.instituteId = user.instituteId;
    userResponse.instituteName = user.instituteName;
  }

  return {
    message: "Login successful",
    token,
    user: userResponse,
  };
};

export const createUser = async (userData) => {
  const { userId, password, role, instituteId, instituteName, fullName, email } = userData;
  
  // Check if user already exists
  const exists = await User.findOne({ userId });
  if (exists) {
    throw new Error("UserId already exists");
  }

  // Validate institute exists for institute users
  if (role === "institute") {
    if (!instituteId || !instituteName) {
      throw new Error("Institute ID and name are required for institute users");
    }
    
    // Check if institute exists in Institute collection
    const institute = await Institute.findOne({ instituteId });
    if (!institute) {
      throw new Error("Institute not found. Please create institute first.");
    }
  }

  // Create new user
  const newUser = await User.create({
    userId,
    password,
    role: role || "institute",
    instituteId: role === "institute" ? instituteId : undefined,
    instituteName: role === "institute" ? instituteName : undefined,
    fullName,
    email: email || "",
  });

  // Prepare response
  const userResponse = {
    id: newUser._id,
    userId: newUser.userId,
    role: newUser.role,
    fullName: newUser.fullName,
    email: newUser.email,
  };

  if (newUser.role === "institute") {
    userResponse.instituteId = newUser.instituteId;
    userResponse.instituteName = newUser.instituteName;
  }

  return {
    message: "User created successfully",
    user: userResponse,
  };
};

export const getUsers = async (currentUserRole) => {
  let query = {};
  
  // Admin can see all users
  // Institute users can only see themselves (handled at controller level)
  // UGC employees can see all non-admin users
  if (currentUserRole === "ugc_employee") {
    query = { role: { $ne: "admin" } };
  }
  
  const users = await User.find(query).select("-password");
  return users;
};

export const getUserById = async (userId, currentUserRole, currentUserId) => {
  const user = await User.findOne({ userId }).select("-password");
  
  if (!user) {
    throw new Error("User not found");
  }

  // Permission checks
  if (currentUserRole === "institute" && user.userId !== currentUserId) {
    throw new Error("Access denied");
  }

  return user;
};

export const updateUser = async (userId, updateData, currentUserRole, currentUserId) => {
  const user = await User.findOne({ userId });
  
  if (!user) {
    throw new Error("User not found");
  }

  // Permission checks
  if (currentUserRole === "institute" && user.userId !== currentUserId) {
    throw new Error("Access denied");
  }

  // Update allowed fields
  const allowedUpdates = ["fullName", "email"];
  if (currentUserRole === "admin") {
    allowedUpdates.push("role", "instituteId", "instituteName");
  }

  Object.keys(updateData).forEach((key) => {
    if (allowedUpdates.includes(key)) {
      user[key] = updateData[key];
    }
  });

  await user.save();
  
  const userResponse = user.toObject();
  delete userResponse.password;
  
  return userResponse;
};

export const deleteUser = async (userId, currentUserRole) => {
  if (currentUserRole !== "admin") {
    throw new Error("Only admin can delete users");
  }

  const user = await User.findOneAndDelete({ userId });
  
  if (!user) {
    throw new Error("User not found");
  }

  return { message: "User deleted successfully" };
};
