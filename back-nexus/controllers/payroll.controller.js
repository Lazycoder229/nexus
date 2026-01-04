import Payroll from "../model/payroll.model.js";

// Payroll Setup Controllers
export const getAllPayrollSetups = (req, res) => {
  const filters = {
    status: req.query.status,
    start_date: req.query.start_date,
    end_date: req.query.end_date,
  };

  Payroll.getAllSetups(filters, (err, results) => {
    if (err) {
      return res
        .status(500)
        .json({ message: "Error fetching payroll setups", error: err });
    }
    res.json({ success: true, data: results });
  });
};

export const getPayrollSetupById = (req, res) => {
  Payroll.getSetupById(req.params.id, (err, results) => {
    if (err) {
      return res
        .status(500)
        .json({ message: "Error fetching payroll setup", error: err });
    }
    if (results.length === 0) {
      return res.status(404).json({ message: "Payroll setup not found" });
    }
    res.json({ success: true, data: results[0] });
  });
};

export const createPayrollSetup = (req, res) => {
  const payrollData = {
    ...req.body,
    created_by: req.body.created_by || req.user?.user_id,
  };

  Payroll.createSetup(payrollData, (err, result) => {
    if (err) {
      return res
        .status(500)
        .json({ message: "Error creating payroll setup", error: err });
    }
    res.status(201).json({
      success: true,
      message: "Payroll setup created successfully",
      payroll_setup_id: result.insertId,
    });
  });
};

export const updatePayrollSetup = (req, res) => {
  Payroll.updateSetup(req.params.id, req.body, (err, result) => {
    if (err) {
      return res
        .status(500)
        .json({ message: "Error updating payroll setup", error: err });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Payroll setup not found" });
    }
    res.json({ success: true, message: "Payroll setup updated successfully" });
  });
};

export const deletePayrollSetup = (req, res) => {
  Payroll.deleteSetup(req.params.id, (err, result) => {
    if (err) {
      return res
        .status(500)
        .json({ message: "Error deleting payroll setup", error: err });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Payroll setup not found" });
    }
    res.json({ success: true, message: "Payroll setup deleted successfully" });
  });
};

// Payslip Controllers
export const getPayslipsBySetup = (req, res) => {
  Payroll.getPayslipsBySetup(req.params.setupId, (err, results) => {
    if (err) {
      return res
        .status(500)
        .json({ message: "Error fetching payslips", error: err });
    }
    res.json({ success: true, data: results });
  });
};

export const getPayslipById = (req, res) => {
  Payroll.getPayslipById(req.params.id, (err, results) => {
    if (err) {
      return res
        .status(500)
        .json({ message: "Error fetching payslip", error: err });
    }
    if (results.length === 0) {
      return res.status(404).json({ message: "Payslip not found" });
    }
    res.json({ success: true, data: results[0] });
  });
};

export const createPayslip = (req, res) => {
  // Get next payslip number
  Payroll.getNextPayslipNumber((err, results) => {
    if (err) {
      return res
        .status(500)
        .json({ message: "Error generating payslip number", error: err });
    }

    const payslipNumber = results[0]?.next_number || "PAY-000001";
    const payslipData = { ...req.body, payslip_number: payslipNumber };

    Payroll.createPayslip(payslipData, (err, result) => {
      if (err) {
        return res
          .status(500)
          .json({ message: "Error creating payslip", error: err });
      }
      res.status(201).json({
        success: true,
        message: "Payslip created successfully",
        payslip_id: result.insertId,
        payslip_number: payslipNumber,
      });
    });
  });
};

export const updatePayslip = (req, res) => {
  Payroll.updatePayslip(req.params.id, req.body, (err, result) => {
    if (err) {
      return res
        .status(500)
        .json({ message: "Error updating payslip", error: err });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Payslip not found" });
    }
    res.json({ success: true, message: "Payslip updated successfully" });
  });
};

export const deletePayslip = (req, res) => {
  Payroll.deletePayslip(req.params.id, (err, result) => {
    if (err) {
      return res
        .status(500)
        .json({ message: "Error deleting payslip", error: err });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Payslip not found" });
    }
    res.json({ success: true, message: "Payslip deleted successfully" });
  });
};

export const getPayrollSummary = (req, res) => {
  Payroll.getPayrollSummary(req.params.setupId, (err, results) => {
    if (err) {
      return res
        .status(500)
        .json({ message: "Error fetching payroll summary", error: err });
    }
    res.json({ success: true, data: results[0] });
  });
};

export default {
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
};
