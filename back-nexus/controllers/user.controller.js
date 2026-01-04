import {
  getAllUsersService,
  registerStudentService,
  registerEmployeeService,
  loginUserService,
  updateStudentService,
  updateEmployeeService,
  deleteUserService,
} from "../services/user.service.js";
import { generateToken } from "../helpers/jwt.js";

// Get all users
export const getAllUsers = async (req, res) => {
  try {
    const users = await getAllUsersService();
    res.status(200).json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: error.message || "Failed to fetch users" });
  }
};

// Register student
export const registerStudent = async (req, res) => {
  try {
    // Map frontend field names to backend field names
    const mappedData = {
      ...req.body,
      dateOfBirth: req.body.dob || req.body.dateOfBirth,
      // Remove the frontend-only field
      dob: undefined,
    };

    const userId = await registerStudentService(mappedData);
    const token = generateToken({ userId, role: "Student" });

    res.status(201).json({
      message: "Student registered successfully",
      userId,
      token,
    });
  } catch (error) {
    console.error("Error registering student:", error);
    const statusCode = error.message.includes("already registered") ? 400 : 500;
    res
      .status(statusCode)
      .json({ message: error.message || "Failed to register student" });
  }
};

// Register employee
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
    res
      .status(statusCode)
      .json({ message: error.message || "Failed to register employee" });
  }
};

// Login
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
    });
  } catch (error) {
    console.error("Error logging in:", error);
    const statusCode = error.message === "Invalid credentials" ? 400 : 500;
    res.status(statusCode).json({ message: error.message || "Login failed" });
  }
};

// Update student
export const updateStudent = async (req, res) => {
  try {
    const { userId } = req.params;
    await updateStudentService(userId, req.body);

    res.status(200).json({ message: "Student updated successfully" });
  } catch (error) {
    console.error("Error updating student:", error);
    res
      .status(500)
      .json({ message: error.message || "Failed to update student" });
  }
};

// Update employee
export const updateEmployee = async (req, res) => {
  try {
    const { userId } = req.params;
    await updateEmployeeService(userId, req.body);

    res.status(200).json({ message: "Employee updated successfully" });
  } catch (error) {
    console.error("Error updating employee:", error);
    res
      .status(500)
      .json({ message: error.message || "Failed to update employee" });
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
    res.status(500).json({ message: error.message || "Failed to delete user" });
  }
};
