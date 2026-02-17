import Payroll from "../model/payroll.model.js";

// Payroll Setup Controllers
export const getAllPayrollSetups = async (req, res) => {
  const filters = {
    status: req.query.status,
    start_date: req.query.start_date,
    end_date: req.query.end_date,
  };

  try {
    const results = await Payroll.getAllSetups(filters);
    res.json({ success: true, data: results });
  } catch (err) {
    console.error("Error fetching payroll setups:", err);
    res
      .status(500)
      .json({ message: "Error fetching payroll setups", error: err.message });
  }
};

export const getPayrollSetupById = async (req, res) => {
  try {
    const results = await Payroll.getSetupById(req.params.id);
    if (results.length === 0) {
      return res.status(404).json({ message: "Payroll setup not found" });
    }
    res.json({ success: true, data: results[0] });
  } catch (err) {
    console.error("Error fetching payroll setup:", err);
    res
      .status(500)
      .json({ message: "Error fetching payroll setup", error: err.message });
  }
};

export const createPayrollSetup = async (req, res) => {
  try {
    // Map frontend fields to database columns
    const payrollData = {
      payroll_period_start: req.body.start_date,
      payroll_period_end: req.body.end_date,
      pay_date: req.body.pay_date,
      payroll_type: req.body.period_type,
      status: req.body.status || "Draft",
      notes: req.body.notes,
      created_by: req.body.created_by || req.user?.user_id,
    };

    const result = await Payroll.createSetup(payrollData);
    res.status(201).json({
      success: true,
      message: "Payroll setup created successfully",
      payroll_setup_id: result.insertId,
    });
  } catch (err) {
    console.error("Error creating payroll setup:", err);
    res
      .status(500)
      .json({ message: "Error creating payroll setup", error: err.message });
  }
};

export const updatePayrollSetup = async (req, res) => {
  try {
    // Map frontend fields to database columns
    const payrollData = {
      payroll_period_start: req.body.start_date,
      payroll_period_end: req.body.end_date,
      pay_date: req.body.pay_date,
      payroll_type: req.body.period_type,
      status: req.body.status,
      notes: req.body.notes,
    };

    const result = await Payroll.updateSetup(req.params.id, payrollData);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Payroll setup not found" });
    }
    res.json({ success: true, message: "Payroll setup updated successfully" });
  } catch (err) {
    console.error("Error updating payroll setup:", err);
    res
      .status(500)
      .json({ message: "Error updating payroll setup", error: err.message });
  }
};

export const deletePayrollSetup = async (req, res) => {
  try {
    const result = await Payroll.deleteSetup(req.params.id);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Payroll setup not found" });
    }
    res.json({ success: true, message: "Payroll setup deleted successfully" });
  } catch (err) {
    console.error("Error deleting payroll setup:", err);
    res
      .status(500)
      .json({ message: "Error deleting payroll setup", error: err.message });
  }
};

// Payslip Controllers
export const getPayslipsBySetup = async (req, res) => {
  try {
    const results = await Payroll.getPayslipsBySetup(req.params.setupId);
    res.json({ success: true, data: results });
  } catch (err) {
    console.error("Error fetching payslips:", err);
    res
      .status(500)
      .json({ message: "Error fetching payslips", error: err.message });
  }
};

export const getPayslipById = async (req, res) => {
  try {
    const results = await Payroll.getPayslipById(req.params.id);
    if (results.length === 0) {
      return res.status(404).json({ message: "Payslip not found" });
    }
    res.json({ success: true, data: results[0] });
  } catch (err) {
    console.error("Error fetching payslip:", err);
    res
      .status(500)
      .json({ message: "Error fetching payslip", error: err.message });
  }
};

export const createPayslip = async (req, res) => {
  try {
    // Get next payslip number
    const results = await Payroll.getNextPayslipNumber();
    const payslipNumber = results[0]?.next_number || "PAY-000001";
    const payslipData = { ...req.body, payslip_number: payslipNumber };

    const result = await Payroll.createPayslip(payslipData);
    res.status(201).json({
      success: true,
      message: "Payslip created successfully",
      payslip_id: result.insertId,
      payslip_number: payslipNumber,
    });
  } catch (err) {
    console.error("Error creating payslip:", err);
    res
      .status(500)
      .json({ message: "Error creating payslip", error: err.message });
  }
};

export const updatePayslip = async (req, res) => {
  try {
    const result = await Payroll.updatePayslip(req.params.id, req.body);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Payslip not found" });
    }
    res.json({ success: true, message: "Payslip updated successfully" });
  } catch (err) {
    console.error("Error updating payslip:", err);
    res
      .status(500)
      .json({ message: "Error updating payslip", error: err.message });
  }
};

export const deletePayslip = async (req, res) => {
  try {
    const result = await Payroll.deletePayslip(req.params.id);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Payslip not found" });
    }
    res.json({ success: true, message: "Payslip deleted successfully" });
  } catch (err) {
    console.error("Error deleting payslip:", err);
    res
      .status(500)
      .json({ message: "Error deleting payslip", error: err.message });
  }
};

export const getPayrollSummary = async (req, res) => {
  try {
    const { report_type } = req.query;
    const setupId = req.params.setupId;

    const summaryResults = await Payroll.getPayrollSummary(setupId);
    let responseData = summaryResults[0];

    // If report type requires detailed data, fetch payslips
    if (report_type && report_type !== "Summary") {
      const payslips = await Payroll.getPayslipsBySetup(setupId);
      responseData = { ...responseData, payslips };
    }

    res.json({ success: true, data: responseData });
  } catch (err) {
    console.error("Error fetching payroll summary:", err);
    res
      .status(500)
      .json({ message: "Error fetching payroll summary", error: err.message });
  }
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
