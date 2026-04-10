import express from "express";
import {
  getAllPayrollSetups,
  getPayrollSetupById,
  createPayrollSetup,
  updatePayrollSetup,
  deletePayrollSetup,
  getPayslipsBySetup,
  getPayslipById,
  createPayslip,
  updatePayslip,
  deletePayslip,
  getPayrollSummary,
  autoCreatePayslips,
  getMyPayslips,
} from "../controllers/payroll.controller.js";
import { authenticateToken } from "../helpers/jwt.js";

const router = express.Router();

// Apply authentication middleware
router.use(authenticateToken);

// Payroll Setup routes
router.get("/setups", getAllPayrollSetups);
router.get("/setups/:id", getPayrollSetupById);
router.post("/setups", createPayrollSetup);
router.put("/setups/:id", updatePayrollSetup);
router.delete("/setups/:id", deletePayrollSetup);

// User's personal payslips
router.get("/my-payslips", getMyPayslips);

// Payslip routes (admin)
router.get("/payslips/setup/:setupId", getPayslipsBySetup);
router.get("/payslips/:id", getPayslipById);
router.post("/payslips", createPayslip);
router.put("/payslips/:id", updatePayslip);
router.delete("/payslips/:id", deletePayslip);
router.post("/payslips/auto-create/:setupId", autoCreatePayslips);

// Summary
router.get("/summary/:setupId", getPayrollSummary);

export default router;
