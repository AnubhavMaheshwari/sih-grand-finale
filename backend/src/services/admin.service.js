import User from "../models/User.model.js";
import Institute from "../models/Institute.model.js";
import { generateUniqueUserId, generatePassword } from "../utils/userGenerator.js";
import { sendWelcomeEmail } from "../utils/emailService.js";

// User Management Functions
export const createUser = async (userData) => {
  const {
    instituteName,
    instituteType,
    fullName,
    email
  } = userData;

  // Validate required fields for institute user creation
  if (!instituteName || !fullName || !email) {
    throw new Error("Institute name, full name, and email are required");
  }

  if (!instituteType) {
    throw new Error("Institute type is required");
  }

  // Generate institute ID based on type
  const prefix = getInstitutePrefix(instituteType);
  const instituteId = `${prefix}${Math.floor(100000 + Math.random() * 900000)}`;

  // Generate User ID (same as instituteId for institute users)
  const finalUserId = instituteId;
  const generatedPassword = generatePassword();
  const finalPassword = generatedPassword;

  // Check if institute exists in Institute collection, create if it doesn't
  let institute = await Institute.findOne({ instituteId });
  if (!institute) {
    // Create new institute with basic information
    institute = await Institute.create({
      instituteId,
      name: instituteName,
      type: "Institute", // Default type from enum
      category: getInstituteCategory(instituteType),
      location: {
        city: "Unknown",
        state: "Unknown"
      },
      contact: {
        email: email
      },
      isActive: true
    });
  }

  // Create new user (always institute role for this endpoint)
  const newUser = await User.create({
    userId: finalUserId,
    password: finalPassword,
    role: "institute",
    instituteId: instituteId,
    instituteName: instituteName,
    instituteType: instituteType,
    fullName,
    email: email,
    generatedPassword: generatedPassword,
  });

  // Prepare response
  const userResponse = {
    id: newUser._id,
    userId: newUser.userId,
    role: newUser.role,
    fullName: newUser.fullName,
    email: newUser.email,
    generatedPassword: generatedPassword,
    instituteId: newUser.instituteId,
    instituteName: newUser.instituteName,
    instituteType: newUser.instituteType,
  };

  return {
    message: "Institute user created successfully",
    user: userResponse,
  };
};

// Helper functions
function getInstitutePrefix(instituteType) {
  switch (instituteType) {
    case 'engineering': return 'ENGG';
    case 'management': return 'MGMT';
    case 'medical': return 'MED';
    default: return 'INST';
  }
}

function getInstituteCategory(instituteType) {
  switch (instituteType) {
    case 'engineering': return 'Engineering';
    case 'management': return 'Management';
    case 'medical': return 'Medical';
    default: return 'Others';
  }
}

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

// Registration Approval Functions
export const getPendingRegistrations = async () => {
  const pendingRegistrations = await User.find({
    role: "institute",
    registrationStatus: "pending"
  }).select("-password -otpCode -passwordResetToken")
    .sort({ createdAt: -1 });

  return pendingRegistrations;
};

export const approveRegistration = async (userId) => {
  const user = await User.findOne({ userId });

  if (!user) {
    throw new Error("User not found");
  }

  // Check if user is an institute with pending registration
  if (user.role !== "institute") {
    throw new Error("Only institute registrations can be approved");
  }

  if (user.registrationStatus !== "pending") {
    throw new Error(`Registration is already ${user.registrationStatus}`);
  }

  // Update registration status
  user.registrationStatus = "approved";
  await user.save();

  // Create Institute record if it doesn't exist
  let institute = await Institute.findOne({ instituteId: user.instituteId });
  if (!institute) {
    institute = await Institute.create({
      instituteId: user.instituteId,
      name: user.instituteName,
      type: "Institute", // Default type from enum
      category: getInstituteCategory(user.instituteType),
      location: {
        city: "Unknown",
        state: "Unknown"
      },
      contact: {
        email: user.email
      },
      isActive: true
    });
  }

  // Send approval notification email (to be implemented)
  // await sendRegistrationApprovedEmail(user.email, user.instituteName, user.userId);

  // Prepare response
  const userResponse = user.toObject();
  delete userResponse.password;
  delete userResponse.otpCode;
  delete userResponse.passwordResetToken;

  return {
    message: "Registration approved successfully",
    user: userResponse,
    institute: institute,
  };
};

export const rejectRegistration = async (userId, reason) => {
  const user = await User.findOne({ userId });

  if (!user) {
    throw new Error("User not found");
  }

  // Check if user is an institute with pending registration
  if (user.role !== "institute") {
    throw new Error("Only institute registrations can be rejected");
  }

  if (user.registrationStatus !== "pending") {
    throw new Error(`Registration is already ${user.registrationStatus}`);
  }

  // Update registration status
  user.registrationStatus = "rejected";
  await user.save();

  // Send rejection notification email (to be implemented)
  // await sendRegistrationRejectedEmail(user.email, user.instituteName, reason);

  // Prepare response
  const userResponse = user.toObject();
  delete userResponse.password;
  delete userResponse.otpCode;
  delete userResponse.passwordResetToken;

  return {
    message: "Registration rejected successfully",
    user: userResponse,
    reason: reason || "No reason provided",
  };
};
