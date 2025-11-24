// auth.Controller.js
import bcrypt from "bcrypt";
import {
  createStudentUser,
  createEmployeeUser,
  findUserByEmail,
  getAllUsers,
  updateStudentUser,
  updateEmployeeUser,
  deleteUser,
} from "../../model/userModel.js";
import { generateToken } from "../../helpers/jwt.js";

// Fetch all users
export const fetchAllUsers = async (req, res) => {
  try {
    const users = await getAllUsers();
    res.status(200).json({ users });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ message: "Failed to fetch users", error: err.message });
  }
};

// Register student
export const registerStudent = async (req, res) => {
  try {
    const {
      email,
      password,
      firstName,
      middleName,
      lastName,
      suffix,
      dateOfBirth,
      gender,
      phone,
      permanentAddress,
      profilePictureUrl,
      studentNumber,
      course,
      major,
      yearLevel,
      previousSchool,
      yearGraduated,
      mailingAddress,
      fatherName,
      motherName,
      parentPhone,
    } = req.body;

    const existingUser = await findUserByEmail(email);
    if (existingUser)
      return res.status(400).json({ message: "Email already registered" });

    const passwordHash = await bcrypt.hash(password, 10);

    const userId = await createStudentUser({
      email,
      passwordHash,
      firstName,
      middleName,
      lastName,
      suffix,
      dateOfBirth,
      gender,
      phone,
      permanentAddress,
      profilePictureUrl,
      studentNumber,
      course,
      major,
      yearLevel,
      previousSchool,
      yearGraduated,
      mailingAddress,
      fatherName,
      motherName,
      parentPhone,
    });

    const token = generateToken({ userId, role: "Student" });

    res
      .status(201)
      .json({ message: "Student registered successfully", userId, token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
// Register employee
export const registerEmployee = async (req, res) => {
  try {
    const {
      email,
      password,
      firstName,
      middleName,
      lastName,
      suffix,
      dateOfBirth,
      gender,
      phone,
      permanentAddress,
      profilePictureUrl,
      employeeId,
      department,
      positionTitle,
      dateHired,
      specialization,
      educationalAttainment,
      licenseNumber,
      accessLevel,
      role, // optional, default Employee
    } = req.body;

    // Validate required fields
    if (!email || !password || !firstName || !lastName || !employeeId) {
      return res.status(400).json({
        message: "Email, password, first name, last name, and employeeId are required",
      });
    }

    // Check if email exists
    const existingUser = await findUserByEmail(email);
    if (existingUser)
      return res.status(400).json({ message: "Email already registered" });

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create employee
    const userId = await createEmployeeUser({
      email,
      passwordHash,
      firstName,
      middleName,
      lastName,
      suffix,
      dateOfBirth,
      gender,
      phone,
      permanentAddress,
      profilePictureUrl,
      employeeId,
      department,
      positionTitle,
      dateHired,
      specialization,
      educationalAttainment,
      licenseNumber,
      accessLevel,
      role,
    });

    // Generate JWT token
    const token = generateToken({ userId, role: role || "Employee" });

    res
      .status(201)
      .json({ message: "Employee registered successfully", userId, token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};


// Login
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await findUserByEmail(email);
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials" });

    const token = generateToken({ userId: user.user_id, role: user.role });

    res.json({
      message: "Login successful",
      token,
      role: user.role,
      userId: user.user_id,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Update student
export const updateStudent = async (req, res) => {
  try {
    const { userId } = req.params;
    const userData = req.body;

    if (userData.password) {
      userData.passwordHash = await bcrypt.hash(userData.password, 10);
      delete userData.password;
    }

    await updateStudentUser(userId, userData);

    res.status(200).json({ message: "Student updated successfully" });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ message: "Failed to update student", error: err.message });
  }
};

// Update employee
export const updateEmployee = async (req, res) => {
  try {
    const { userId } = req.params;
    const userData = req.body;

    if (userData.password) {
      userData.passwordHash = await bcrypt.hash(userData.password, 10);
      delete userData.password;
    }

    await updateEmployeeUser(userId, userData);

    res.status(200).json({ message: "Employee updated successfully" });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ message: "Failed to update employee", error: err.message });
  }
};

// Delete user
export const removeUser = async (req, res) => {
  try {
    const { userId } = req.params;
    await deleteUser(userId);
    res.status(200).json({ message: "User deleted successfully" });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ message: "Failed to delete user", error: err.message });
  }
};
