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

// Payslip routes
router.get("/payslips/setup/:setupId", getPayslipsBySetup);
router.get("/payslips/:id", getPayslipById);
router.post("/payslips", createPayslip);
router.put("/payslips/:id", updatePayslip);
router.delete("/payslips/:id", deletePayslip);

// Summary
router.get("/summary/:setupId", getPayrollSummary);

export default router;
