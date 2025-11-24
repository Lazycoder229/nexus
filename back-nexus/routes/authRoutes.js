import express from "express";
import {
  fetchAllUsers,
  registerStudent,
  registerEmployee, // <-- added
  updateStudent,
  updateEmployee,
  removeUser,
  loginUser,
} from "../controllers/authController/auth.Controller.js";

const router = express.Router();

// Fetch users
router.get("/all", fetchAllUsers);

// Register student
router.post("/register", registerStudent);

// Register employee
router.post("/employee", registerEmployee); // <-- new route

// Update student
router.put("/student/:userId", updateStudent);

// Update employee
router.put("/employee/:userId", updateEmployee);

// Delete user
router.delete("/:userId", removeUser);

// Login
router.post("/login", loginUser);

export default router;
