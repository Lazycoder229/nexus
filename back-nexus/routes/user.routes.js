import express from "express";
import {
  getAllUsers,
  registerStudent,
  registerEmployee,
  loginUser,
  updateStudent,
  updateEmployee,
  deleteUser,
} from "../controllers/user.controller.js";

const router = express.Router();

// Get all users
router.get("/users", getAllUsers);

// Register student
router.post("/users/student", registerStudent);

// Register employee (Admin, Faculty, Staff)
router.post("/users/employee", registerEmployee);

// Login
router.post("/auth/login", loginUser);

// Register (unified endpoint for student registration from frontend)
router.post("/auth/register", registerStudent);

// Update student
router.put("/users/student/:userId", updateStudent);

// Update employee
router.put("/users/employee/:userId", updateEmployee);

// Delete user
router.delete("/users/:userId", deleteUser);

export default router;
