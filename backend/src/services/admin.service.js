import User from "../models/User.model.js";
import Institute from "../models/Institute.model.js";
import { generateUniqueUserId, generatePassword } from "../utils/userGenerator.js";
import { sendWelcomeEmail } from "../utils/emailService.js";

// User Management Functions
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

export const getUsers = async () => {
  const users = await User.find().select("-password -otpCode -passwordResetToken");
  return users;
};

export const getUserById = async (userId) => {
  const user = await User.findOne({ userId }).select("-password -otpCode -passwordResetToken");
  
  if (!user) {
    throw new Error("User not found");
  }

  return user;
};

export const updateUser = async (userId, updateData) => {
  const user = await User.findOne({ userId });
  
  if (!user) {
    throw new Error("User not found");
  }

  // Update allowed fields
  const allowedUpdates = ["fullName", "email", "role", "instituteId", "instituteName", "instituteType"];
  
  Object.keys(updateData).forEach((key) => {
    if (allowedUpdates.includes(key)) {
      user[key] = updateData[key];
    }
  });

  await user.save();
  
  const userResponse = user.toObject();
  delete userResponse.password;
  delete userResponse.otpCode;
  delete userResponse.passwordResetToken;
  
  return userResponse;
};

export const deleteUser = async (userId) => {
  const user = await User.findOneAndDelete({ userId });
  
  if (!user) {
    throw new Error("User not found");
  }

  return { message: "User deleted successfully" };
};

export const regeneratePassword = async (userId) => {
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

// Institute Management Functions
export const createInstitute = async (instituteData) => {
  const { 
    name, 
    type = "Institute", 
    category = "Others",
    location = { city: "Unknown", state: "Unknown" },
    establishedYear,
    accreditation,
    contact = {}
  } = instituteData;

  // Generate institute ID
  const instituteId = `INST${Math.floor(100000 + Math.random() * 900000)}`;

  // Create new institute
  const institute = await Institute.create({
    instituteId,
    name,
    type,
    category,
    location,
    establishedYear,
    accreditation,
    contact,
    isActive: true
  });

  return {
    message: "Institute created successfully",
    institute
  };
};

export const getInstitutes = async () => {
  const institutes = await Institute.find();
  return institutes;
};

export const getInstituteById = async (instituteId) => {
  const institute = await Institute.findOne({ instituteId });
  
  if (!institute) {
    throw new Error("Institute not found");
  }

  return institute;
};

export const updateInstitute = async (instituteId, updateData) => {
  const institute = await Institute.findOne({ instituteId });
  
  if (!institute) {
    throw new Error("Institute not found");
  }

  // Update allowed fields
  const allowedUpdates = ["name", "type", "category", "location", "establishedYear", "accreditation", "contact", "isActive"];
  
  Object.keys(updateData).forEach((key) => {
    if (allowedUpdates.includes(key)) {
      institute[key] = updateData[key];
    }
  });

  await institute.save();
  
  return institute;
};

export const deleteInstitute = async (instituteId) => {
  const institute = await Institute.findOneAndDelete({ instituteId });
  
  if (!institute) {
    throw new Error("Institute not found");
  }

  return { message: "Institute deleted successfully" };
};
