import User from "../models/User.model.js";
import Institute from "../models/Institute.model.js";
import jwt from "jsonwebtoken";
import { JWT_CONFIG } from "../config/constants.js";
import { generateUniqueUserId, generatePassword } from "../utils/userGenerator.js";

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
  const { 
    role, 
    instituteId, 
    instituteName, 
    instituteType = 'others',
    fullName, 
    email
  } = userData;
  
  // Always generate User ID and password
  const finalUserId = await generateUniqueUserId(User, { role, instituteType, instituteId });
  const generatedPassword = generatePassword();
  const finalPassword = generatedPassword;

  // Validate institute exists for institute users
  if (role === "institute") {
    if (!instituteId || !instituteName) {
      throw new Error("Institute ID and name are required for institute users");
    }
    
    // Check if institute exists in Institute collection, create if it doesn't
    let institute = await Institute.findOne({ instituteId });
    if (!institute) {
      // Create new institute with basic information
      institute = await Institute.create({
        instituteId,
        name: instituteName,
        type: "Institute", // Default type
        location: {
          city: "Unknown",
          state: "Unknown"
        },
        isActive: true
      });
    }
  }

  // Create new user
  const newUser = await User.create({
    userId: finalUserId,
    password: finalPassword,
    role: role || "institute",
    instituteId: role === "institute" ? instituteId : undefined,
    instituteName: role === "institute" ? instituteName : undefined,
    instituteType: role === "institute" ? instituteType : undefined,
    fullName,
    email: email || "",
    generatedPassword: generatedPassword || '', // Store generated password for admin reference
  });

  // Prepare response
  const userResponse = {
    id: newUser._id,
    userId: newUser.userId,
    role: newUser.role,
    fullName: newUser.fullName,
    email: newUser.email,
    generatedPassword: generatedPassword || undefined, // Include generated password in response for admin
  };

  if (newUser.role === "institute") {
    userResponse.instituteId = newUser.instituteId;
    userResponse.instituteName = newUser.instituteName;
    userResponse.instituteType = newUser.instituteType;
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

export const regeneratePassword = async (userId, currentUserRole) => {
  if (currentUserRole !== "admin") {
    throw new Error("Only admin can regenerate passwords");
  }

  const user = await User.findOne({ userId });
  
  if (!user) {
    throw new Error("User not found");
  }

  // Generate new password
  const newPassword = generatePassword();
  const generatedPassword = newPassword;
  
  // Update user password and store generated password
  user.password = newPassword;
  user.generatedPassword = generatedPassword;
  await user.save();
  
  return {
    message: "Password regenerated successfully",
    generatedPassword,
    userId: user.userId,
    fullName: user.fullName,
  };
};
