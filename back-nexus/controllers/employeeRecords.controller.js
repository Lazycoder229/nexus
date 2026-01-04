import EmployeeRecords from "../model/employeeRecords.model.js";

// Get all employee records
export const getAllEmployees = (req, res) => {
  const filters = {
    department: req.query.department,
    employment_status: req.query.employment_status,
    employment_type: req.query.employment_type,
    search: req.query.search,
  };

  EmployeeRecords.getAll(filters, (err, results) => {
    if (err) {
      return res
        .status(500)
        .json({ message: "Error fetching employees", error: err });
    }
    res.json({ success: true, data: results });
  });
};

// Get employee by ID
export const getEmployeeById = (req, res) => {
  EmployeeRecords.getById(req.params.id, (err, results) => {
    if (err) {
      return res
        .status(500)
        .json({ message: "Error fetching employee", error: err });
    }
    if (results.length === 0) {
      return res.status(404).json({ message: "Employee not found" });
    }
    res.json({ success: true, data: results[0] });
  });
};

// Create employee record
export const createEmployee = (req, res) => {
  // Generate employee number
  const employeeNumber = `EMP-${Date.now().toString().slice(-8)}`;
  const employeeData = { ...req.body, employee_number: employeeNumber };

  EmployeeRecords.create(employeeData, (err, result) => {
    if (err) {
      return res
        .status(500)
        .json({ message: "Error creating employee", error: err });
    }
    res.status(201).json({
      success: true,
      message: "Employee created successfully",
      employee_id: result.insertId,
    });
  });
};

// Update employee record
export const updateEmployee = (req, res) => {
  EmployeeRecords.update(req.params.id, req.body, (err, result) => {
    if (err) {
      return res
        .status(500)
        .json({ message: "Error updating employee", error: err });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Employee not found" });
    }
    res.json({ success: true, message: "Employee updated successfully" });
  });
};

// Delete employee record
export const deleteEmployee = (req, res) => {
  EmployeeRecords.delete(req.params.id, (err, result) => {
    if (err) {
      return res
        .status(500)
        .json({ message: "Error deleting employee", error: err });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Employee not found" });
    }
    res.json({ success: true, message: "Employee deleted successfully" });
  });
};

// Get summary statistics
export const getEmployeeSummary = (req, res) => {
  EmployeeRecords.getSummary((err, results) => {
    if (err) {
      return res
        .status(500)
        .json({ message: "Error fetching summary", error: err });
    }
    res.json({ success: true, data: results[0] });
  });
};

export default {
  getAllEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  getEmployeeSummary,
};
