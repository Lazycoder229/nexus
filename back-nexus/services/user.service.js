import bcrypt from "bcrypt";
import {
  createStudentUser,
  createEmployeeUser,
  findUserByEmail,
  findUserById,
  getAllUsers,
  previewNextStudentNumber,
  previewNextEmployeeId,
  updateStudentUser,
  updateEmployeeUser,
  deleteUser,
} from "../model/userModel.js";

export const getAllUsersService = async (role = null) => {
  return await getAllUsers(role);
};

export const getUserByIdService = async (userId) => {
  return await findUserById(userId);
};

export const registerStudentService = async (studentData) => {
  const { email, password } = studentData;
  if (!email || !password || !studentData.firstName || !studentData.lastName) {
    throw new Error("Email, password, first name, and last name are required");
  }
  const existingUser = await findUserByEmail(email);
  if (existingUser) throw new Error("Email already registered");
  const passwordHash = await bcrypt.hash(password, 10);
  const { userId, studentNumber } = await createStudentUser({ ...studentData, passwordHash });
  return { userId, studentNumber };
};

export const getNextStudentNumberService = async () => {
  return await previewNextStudentNumber();
};

export const getNextEmployeeIdService = async () => {
  return await previewNextEmployeeId();
};

export const registerEmployeeService = async (employeeData) => {
  const { email, password, firstName, lastName, role } = employeeData;
  if (!email || !password || !firstName || !lastName) {
    throw new Error("Email, password, first name, and last name are required");
  }
  const existingUser = await findUserByEmail(email);
  if (existingUser) throw new Error("Email already registered");
  const passwordHash = await bcrypt.hash(password, 10);
  const result = await createEmployeeUser({ ...employeeData, passwordHash, role: role || "Staff" });
  return { userId: result.userId, employeeId: result.employeeId, role: role || "Staff" };
};

export const loginUserService = async (email, password) => {
  if (!email || !password) throw new Error("Email and password are required");
  const user = await findUserByEmail(email);
  if (!user) throw new Error("Invalid credentials");
  const isMatch = await bcrypt.compare(password, user.password_hash);
  if (!isMatch) throw new Error("Invalid credentials");
  return {
    userId: user.user_id,
    role: user.role,
    email: user.email,
    firstName: user.first_name,
    lastName: user.last_name,
  };
};

export const updateStudentService = async (userId, studentData) => {
  const { password } = studentData;
  if (password) {
    studentData.passwordHash = await bcrypt.hash(password, 10);
    delete studentData.password;
  }
  await updateStudentUser(userId, studentData);
  return true;
};

export const updateEmployeeService = async (userId, employeeData) => {
  const { password } = employeeData;
  if (password) {
    employeeData.passwordHash = await bcrypt.hash(password, 10);
    delete employeeData.password;
  }
  await updateEmployeeUser(userId, employeeData);
  return true;
};

export const changePasswordService = async (userId, currentPassword, newPassword) => {
  if (!currentPassword || !newPassword) throw new Error("Current password and new password are required");
  if (currentPassword === newPassword) throw new Error("New password must be different from current password");
  const user = await findUserById(userId);
  if (!user) throw new Error("User not found");
  const isMatch = await bcrypt.compare(currentPassword, user.password_hash);
  if (!isMatch) throw new Error("Current password is incorrect");
  const passwordHash = await bcrypt.hash(newPassword, 10);
  await updateEmployeeUser(userId, { passwordHash });
  return true;
};

export const deleteUserService = async (userId) => {
  if (!userId) throw new Error("User ID is required");
  await deleteUser(userId);
  return true;
};