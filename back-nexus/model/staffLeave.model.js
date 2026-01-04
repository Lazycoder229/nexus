import db from "../config/db.js";

const StaffLeave = {
  // Create leave request
  create: (leaveData, callback) => {
    const query = `
      INSERT INTO staff_leave (
        employee_id, leave_type, start_date, end_date, reason,
        status, supporting_document_url
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    db.query(
      query,
      [
        leaveData.employee_id,
        leaveData.leave_type,
        leaveData.start_date,
        leaveData.end_date,
        leaveData.reason,
        leaveData.status || "Pending",
        leaveData.supporting_document_url,
      ],
      callback
    );
  },

  // Get all leave requests with employee details
  getAll: (filters, callback) => {
    let query = `
      SELECT sl.*, er.employee_number, er.department, er.position,
             u.first_name, u.middle_name, u.last_name,
             approver.first_name as approver_first_name,
             approver.last_name as approver_last_name
      FROM staff_leave sl
      INNER JOIN employee_records er ON sl.employee_id = er.employee_id
      INNER JOIN users u ON er.user_id = u.user_id
      LEFT JOIN users approver ON sl.approved_by = approver.user_id
      WHERE 1=1
    `;
    const params = [];

    if (filters.employee_id) {
      query += " AND sl.employee_id = ?";
      params.push(filters.employee_id);
    }

    if (filters.status) {
      query += " AND sl.status = ?";
      params.push(filters.status);
    }

    if (filters.leave_type) {
      query += " AND sl.leave_type = ?";
      params.push(filters.leave_type);
    }

    if (filters.start_date && filters.end_date) {
      query += " AND sl.start_date >= ? AND sl.end_date <= ?";
      params.push(filters.start_date, filters.end_date);
    }

    query += " ORDER BY sl.created_at DESC";

    db.query(query, params, callback);
  },

  // Get leave by ID
  getById: (id, callback) => {
    const query = `
      SELECT sl.*, er.employee_number, er.department, er.position,
             u.first_name, u.middle_name, u.last_name
      FROM staff_leave sl
      INNER JOIN employee_records er ON sl.employee_id = er.employee_id
      INNER JOIN users u ON er.user_id = u.user_id
      WHERE sl.leave_id = ?
    `;
    db.query(query, [id], callback);
  },

  // Update leave request
  update: (id, leaveData, callback) => {
    const query = `
      UPDATE staff_leave SET
        leave_type = ?, start_date = ?, end_date = ?,
        reason = ?, status = ?, supporting_document_url = ?
      WHERE leave_id = ?
    `;

    db.query(
      query,
      [
        leaveData.leave_type,
        leaveData.start_date,
        leaveData.end_date,
        leaveData.reason,
        leaveData.status,
        leaveData.supporting_document_url,
        id,
      ],
      callback
    );
  },

  // Approve leave
  approve: (id, approvedBy, callback) => {
    const query = `
      UPDATE staff_leave SET
        status = 'Approved',
        approved_by = ?,
        approved_date = CURRENT_TIMESTAMP
      WHERE leave_id = ?
    `;
    db.query(query, [approvedBy, id], callback);
  },

  // Reject leave
  reject: (id, approvedBy, rejectionReason, callback) => {
    const query = `
      UPDATE staff_leave SET
        status = 'Rejected',
        approved_by = ?,
        approved_date = CURRENT_TIMESTAMP,
        rejection_reason = ?
      WHERE leave_id = ?
    `;
    db.query(query, [approvedBy, rejectionReason, id], callback);
  },

  // Delete leave request
  delete: (id, callback) => {
    db.query("DELETE FROM staff_leave WHERE leave_id = ?", [id], callback);
  },

  // Get leave summary
  getSummary: (filters, callback) => {
    let query = `
      SELECT 
        COUNT(*) as total_requests,
        SUM(CASE WHEN status = 'Pending' THEN 1 ELSE 0 END) as pending,
        SUM(CASE WHEN status = 'Approved' THEN 1 ELSE 0 END) as approved,
        SUM(CASE WHEN status = 'Rejected' THEN 1 ELSE 0 END) as rejected,
        SUM(CASE WHEN status = 'Approved' THEN total_days ELSE 0 END) as total_days_approved
      FROM staff_leave
      WHERE 1=1
    `;
    const params = [];

    if (filters.start_date && filters.end_date) {
      query += " AND start_date >= ? AND end_date <= ?";
      params.push(filters.start_date, filters.end_date);
    }

    db.query(query, params, callback);
  },
};

export default StaffLeave;
