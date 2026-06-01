import {
  getAllUsersService,
  getUserByIdService,
  registerStudentService,
  registerEmployeeService,
  getNextStudentNumberService,
  loginUserService,
  updateStudentService,
  updateEmployeeService,
  changePasswordService,
  deleteUserService,
} from "../services/user.service.js";
import { generateToken } from "../helpers/jwt.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Get all users
export const getAllUsers = async (req, res) => {
  try {
    const { role } = req.query;
    const users = await getAllUsersService(role);
    res.status(200).json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Failed to fetch users" });
  }
};

// Get user by ID
export const getUserById = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await getUserByIdService(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ message: "Failed to fetch user" });
  }
};

// Register student — req.body already validated & sanitized by middleware
export const registerStudent = async (req, res) => {
  try {
    const mappedData = {
      ...req.body,
      dateOfBirth: req.body.dob || req.body.dateOfBirth,
      dob: undefined,
    };

    const { userId, studentNumber } = await registerStudentService(mappedData);
    const token = generateToken({ userId, role: "Student" });

    res.status(201).json({
      message: "Student registered successfully",
      userId,
      studentNumber,
      token,
    });
  } catch (error) {
    console.error("Error registering student:", error);
    const statusCode = error.message.includes("already registered") ? 400 : 500;
    res.status(statusCode).json({ message: error.message || "Failed to register student" });
  }
};

// Preview next student number
export const previewStudentNumber = async (_req, res) => {
  try {
    const studentNumber = await getNextStudentNumberService();
    res.status(200).json({ studentNumber });
  } catch (error) {
    console.error("Error previewing student number:", error);
    res.status(500).json({ message: "Failed to preview student number" });
  }
};

// Register employee — req.body already validated & sanitized by middleware
export const registerEmployee = async (req, res) => {
  try {
    const { userId, role } = await registerEmployeeService(req.body);
    const token = generateToken({ userId, role });

    res.status(201).json({
      message: "Employee registered successfully",
      userId,
      token,
    });
  } catch (error) {
    console.error("Error registering employee:", error);
    const statusCode = error.message.includes("already registered") ? 400 : 500;
    res.status(statusCode).json({ message: error.message || "Failed to register employee" });
  }
};

// Login — req.body already validated & sanitized by middleware
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await loginUserService(email, password);
    const token = generateToken({ userId: user.userId, role: user.role });

    res.status(200).json({
      message: "Login successful",
      token,
      role: user.role,
      userId: user.userId,
      firstName: user.firstName,
      lastName: user.lastName,
    });
  } catch (error) {
    console.error("Error logging in:", error);
    // Don't leak specific error details for auth failures
    const statusCode = error.message === "Invalid credentials" ? 401 : 500;
    res.status(statusCode).json({
      message: statusCode === 401 ? "Invalid credentials" : "Login failed",
    });
  }
};

// Update student — req.body already validated & sanitized by middleware
export const updateStudent = async (req, res) => {
  try {
    const { userId } = req.params;
    await updateStudentService(userId, req.body);
    res.status(200).json({ message: "Student updated successfully" });
  } catch (error) {
    console.error("Error updating student:", error);
    res.status(500).json({ message: "Failed to update student" });
  }
};

// Update employee — req.body already validated & sanitized by middleware
export const updateEmployee = async (req, res) => {
  try {
    const { userId } = req.params;

    // Handle profile picture upload (Base64)
    if (req.body.profilePictureBase64) {
      try {
        const base64Data = req.body.profilePictureBase64.replace(
          /^data:image\/\w+;base64,/,
          "",
        );
        const buffer = Buffer.from(base64Data, "base64");

        const uploadDir = path.join(__dirname, "../public/uploads/profile_pics");
        if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir, { recursive: true });
        }

        const filename = `user-${userId}-${Date.now()}.png`;
        const filepath = path.join(uploadDir, filename);
        fs.writeFileSync(filepath, buffer);

        req.body.profilePictureUrl = `/uploads/profile_pics/${filename}`;
        delete req.body.profilePictureBase64;
      } catch (err) {
        console.error("Error saving profile picture:", err);
      }
    }

    await updateEmployeeService(userId, req.body);
    res.status(200).json({ message: "Employee updated successfully" });
  } catch (error) {
    console.error("Error updating employee:", error);
    res.status(500).json({ message: "Failed to update employee" });
  }
};

// Change password — req.body already validated & sanitized by middleware
export const changePassword = async (req, res) => {
  try {
    const { userId } = req.params;
    const { currentPassword, newPassword } = req.body;
    // confirmPassword match already checked by Zod schema — no need to recheck here

    await changePasswordService(userId, currentPassword, newPassword);
    res.status(200).json({ message: "Password changed successfully" });
  } catch (error) {
    console.error("Error changing password:", error);
    const statusCode = error.message.includes("incorrect")
      ? 401
      : error.message.includes("not found")
        ? 404
        : 500;
    res.status(statusCode).json({ message: error.message || "Failed to change password" });
  }
};

// Delete user
export const deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;
    await deleteUserService(userId);
    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ message: "Failed to delete user" });
  }
};