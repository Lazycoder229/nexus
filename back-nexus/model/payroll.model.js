import db from "../config/db.js";

const Payroll = {
  // Create payroll setup
  createSetup: (payrollData, callback) => {
    const query = `
      INSERT INTO payroll_setup (
        payroll_period_start, payroll_period_end, pay_date,
        payroll_type, status, notes, created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    db.query(
      query,
      [
        payrollData.payroll_period_start,
        payrollData.payroll_period_end,
        payrollData.pay_date,
        payrollData.payroll_type,
        payrollData.status || "Draft",
        payrollData.notes,
        payrollData.created_by,
      ],
      callback
    );
  },

  // Get all payroll setups
  getAllSetups: (filters, callback) => {
    let query = `
      SELECT ps.*, 
             creator.first_name as creator_first_name,
             creator.last_name as creator_last_name,
             processor.first_name as processor_first_name,
             processor.last_name as processor_last_name
      FROM payroll_setup ps
      LEFT JOIN users creator ON ps.created_by = creator.user_id
      LEFT JOIN users processor ON ps.processed_by = processor.user_id
      WHERE 1=1
    `;
    const params = [];

    if (filters.status) {
      query += " AND ps.status = ?";
      params.push(filters.status);
    }

    if (filters.start_date && filters.end_date) {
      query +=
        " AND ps.payroll_period_start >= ? AND ps.payroll_period_end <= ?";
      params.push(filters.start_date, filters.end_date);
    }

    query += " ORDER BY ps.created_at DESC";

    db.query(query, params, callback);
  },

  // Get payroll setup by ID
  getSetupById: (id, callback) => {
    const query = `
      SELECT ps.*,
             creator.first_name as creator_first_name,
             creator.last_name as creator_last_name
      FROM payroll_setup ps
      LEFT JOIN users creator ON ps.created_by = creator.user_id
      WHERE ps.payroll_setup_id = ?
    `;
    db.query(query, [id], callback);
  },

  // Update payroll setup
  updateSetup: (id, payrollData, callback) => {
    const query = `
      UPDATE payroll_setup SET
        payroll_period_start = ?, payroll_period_end = ?,
        pay_date = ?, payroll_type = ?, status = ?, notes = ?
      WHERE payroll_setup_id = ?
    `;

    db.query(
      query,
      [
        payrollData.payroll_period_start,
        payrollData.payroll_period_end,
        payrollData.pay_date,
        payrollData.payroll_type,
        payrollData.status,
        payrollData.notes,
        id,
      ],
      callback
    );
  },

  // Delete payroll setup
  deleteSetup: (id, callback) => {
    db.query(
      "DELETE FROM payroll_setup WHERE payroll_setup_id = ?",
      [id],
      callback
    );
  },

  // Create payslip
  createPayslip: (payslipData, callback) => {
    const query = `
      INSERT INTO payslips (
        payroll_setup_id, employee_id, payslip_number,
        basic_salary, allowances, overtime_pay, bonus, other_earnings,
        sss_deduction, philhealth_deduction, pagibig_deduction,
        withholding_tax, loan_deduction, other_deductions,
        days_worked, overtime_hours, late_hours, absences, remarks
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    db.query(
      query,
      [
        payslipData.payroll_setup_id,
        payslipData.employee_id,
        payslipData.payslip_number,
        payslipData.basic_salary,
        payslipData.allowances,
        payslipData.overtime_pay,
        payslipData.bonus,
        payslipData.other_earnings,
        payslipData.sss_deduction,
        payslipData.philhealth_deduction,
        payslipData.pagibig_deduction,
        payslipData.withholding_tax,
        payslipData.loan_deduction,
        payslipData.other_deductions,
        payslipData.days_worked,
        payslipData.overtime_hours,
        payslipData.late_hours,
        payslipData.absences,
        payslipData.remarks,
      ],
      callback
    );
  },

  // Get payslips by payroll setup
  getPayslipsBySetup: (payrollSetupId, callback) => {
    const query = `
      SELECT p.*, er.employee_number, er.department, er.position,
             u.first_name, u.middle_name, u.last_name
      FROM payslips p
      INNER JOIN employee_records er ON p.employee_id = er.employee_id
      INNER JOIN users u ON er.user_id = u.user_id
      WHERE p.payroll_setup_id = ?
      ORDER BY er.employee_number
    `;
    db.query(query, [payrollSetupId], callback);
  },

  // Get payslip by ID
  getPayslipById: (id, callback) => {
    const query = `
      SELECT p.*, er.employee_number, er.department, er.position,
             u.first_name, u.middle_name, u.last_name,
             ps.payroll_period_start, ps.payroll_period_end, ps.pay_date
      FROM payslips p
      INNER JOIN employee_records er ON p.employee_id = er.employee_id
      INNER JOIN users u ON er.user_id = u.user_id
      INNER JOIN payroll_setup ps ON p.payroll_setup_id = ps.payroll_setup_id
      WHERE p.payslip_id = ?
    `;
    db.query(query, [id], callback);
  },

  // Update payslip
  updatePayslip: (id, payslipData, callback) => {
    const query = `
      UPDATE payslips SET
        basic_salary = ?, allowances = ?, overtime_pay = ?,
        bonus = ?, other_earnings = ?,
        sss_deduction = ?, philhealth_deduction = ?, pagibig_deduction = ?,
        withholding_tax = ?, loan_deduction = ?, other_deductions = ?,
        days_worked = ?, overtime_hours = ?, late_hours = ?,
        absences = ?, remarks = ?
      WHERE payslip_id = ?
    `;

    db.query(
      query,
      [
        payslipData.basic_salary,
        payslipData.allowances,
        payslipData.overtime_pay,
        payslipData.bonus,
        payslipData.other_earnings,
        payslipData.sss_deduction,
        payslipData.philhealth_deduction,
        payslipData.pagibig_deduction,
        payslipData.withholding_tax,
        payslipData.loan_deduction,
        payslipData.other_deductions,
        payslipData.days_worked,
        payslipData.overtime_hours,
        payslipData.late_hours,
        payslipData.absences,
        payslipData.remarks,
        id,
      ],
      callback
    );
  },

  // Delete payslip
  deletePayslip: (id, callback) => {
    db.query("DELETE FROM payslips WHERE payslip_id = ?", [id], callback);
  },

  // Get payroll summary
  getPayrollSummary: (payrollSetupId, callback) => {
    const query = `
      SELECT 
        COUNT(*) as total_employees,
        SUM(gross_pay) as total_gross_pay,
        SUM(total_deductions) as total_deductions,
        SUM(net_pay) as total_net_pay,
        AVG(net_pay) as average_net_pay
      FROM payslips
      WHERE payroll_setup_id = ?
    `;
    db.query(query, [payrollSetupId], callback);
  },

  // Get next payslip number
  getNextPayslipNumber: (callback) => {
    const query = `
      SELECT CONCAT('PAY-', LPAD(COALESCE(MAX(CAST(SUBSTRING(payslip_number, 5) AS UNSIGNED)), 0) + 1, 6, '0')) as next_number
      FROM payslips
      WHERE payslip_number LIKE 'PAY-%'
    `;
    db.query(query, callback);
  },
};

export default Payroll;
