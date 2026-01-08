import express from "express";
import {
  getStudentReports,
  getEnrollmentReports,
  getAttendanceReports,
  getPayrollReports,
  getSummaryStatistics,
  exportReport,
} from "../controllers/reports.controller.js";

const router = express.Router();

// Get summary statistics
router.get("/statistics", getSummaryStatistics);

// Student reports
router.get("/students", getStudentReports);

// Enrollment reports
router.get("/enrollments", getEnrollmentReports);

// Attendance reports
router.get("/attendance", getAttendanceReports);

// Payroll reports
router.get("/payroll", getPayrollReports);

// Export reports
router.get("/export/:type", exportReport);

export default router;
