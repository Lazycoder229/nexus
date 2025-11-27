// routes/enrollments.routes.js
import express from "express";
import {
  getAllEnrollments,
  getEnrollmentsByStudent,
  getEnrollmentById,
  createEnrollment,
  updateEnrollment,
  deleteEnrollment,
} from "../controllers/enrollments.controller.js";

const router = express.Router();

router.get("/enrollments", getAllEnrollments);
router.get("/enrollments/student/:studentId", getEnrollmentsByStudent);
router.get("/enrollments/:id", getEnrollmentById);
router.post("/enrollments", createEnrollment);
router.put("/enrollments/:id", updateEnrollment);
router.delete("/enrollments/:id", deleteEnrollment);

export default router;
