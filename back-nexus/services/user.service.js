import bcrypt from "bcrypt";
import {
  createStudentUser,
  createEmployeeUser,
  findUserByEmail,
  findUserById,
  getAllUsers,
  updateStudentUser,
  updateEmployeeUser,
  deleteUser,
} from "../model/userModel.js";

// Get all users
export const getAllUsersService = async (role = null) => {
  return await getAllUsers(role);
};

// Get user by ID
export const getUserByIdService = async (userId) => {
  return await findUserById(userId);
};

// Register student
export const registerStudentService = async (studentData) => {
  const { email, password } = studentData;

  // Validate required fields
  if (
    !email ||
    !password ||
    !studentData.firstName ||
    !studentData.lastName ||
    !studentData.studentNumber
  ) {
    throw new Error(
      "Email, password, first name, last name, and student number are required",
    );
  }

  // Check if email exists
  const existingUser = await findUserByEmail(email);
  if (existingUser) {
    throw new Error("Email already registered");
  }

  // Hash password
  const passwordHash = await bcrypt.hash(password, 10);

  // Create student user
  const userId = await createStudentUser({
    ...studentData,
    passwordHash,
  });

  return userId;
};

// Register employee
export const registerEmployeeService = async (employeeData) => {
  const { email, password, firstName, lastName, employeeId, role } =
    employeeData;

  // Validate required fields
  if (!email || !password || !firstName || !lastName || !employeeId) {
    throw new Error(
      "Email, password, first name, last name, and employee ID are required",
    );
  }

  // Check if email exists
  const existingUser = await findUserByEmail(email);
  if (existingUser) {
    throw new Error("Email already registered");
  }

  // Hash password
  const passwordHash = await bcrypt.hash(password, 10);

  // Create employee user
  const userId = await createEmployeeUser({
    ...employeeData,
    passwordHash,
    role: role || "Staff",
  });

  return { userId, role: role || "Staff" };
};

// Login user
export const loginUserService = async (email, password) => {
  // Validate required fields
  if (!email || !password) {
    throw new Error("Email and password are required");
  }

  // Find user by email
  const user = await findUserByEmail(email);
  if (!user) {
    throw new Error("Invalid credentials");
  }

  // Compare password
  const isMatch = await bcrypt.compare(password, user.password_hash);
  if (!isMatch) {
    throw new Error("Invalid credentials");
  }

  return {
    userId: user.user_id,
    role: user.role,
    email: user.email,
    firstName: user.first_name,
    lastName: user.last_name,
  };
};

// Update student
export const updateStudentService = async (userId, studentData) => {
  const { password } = studentData;

  // Hash password if provided
  if (password) {
    studentData.passwordHash = await bcrypt.hash(password, 10);
    delete studentData.password;
  }

  await updateStudentUser(userId, studentData);
  return true;
};

// Update employee
export const updateEmployeeService = async (userId, employeeData) => {
  const { password } = employeeData;

  // Hash password if provided
  if (password) {
    employeeData.passwordHash = await bcrypt.hash(password, 10);
    delete employeeData.password;
  }

  await updateEmployeeUser(userId, employeeData);
  return true;
};

// Delete user
export const deleteUserService = async (userId) => {
  if (!userId) {
    throw new Error("User ID is required");
  }

  await deleteUser(userId);
  return true;
};
