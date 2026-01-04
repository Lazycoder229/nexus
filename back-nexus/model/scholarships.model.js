import db from "../config/db.js";

const Scholarship = {
  // Create new scholarship program
  createProgram: (data, callback) => {
    const query = `
      INSERT INTO scholarship_programs 
      (scholarship_name, scholarship_code, scholarship_type, discount_type,
       discount_value, description, eligibility_criteria, required_gpa,
       required_income_level, total_budget, max_beneficiaries, is_active,
       academic_period_id, created_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    db.query(
      query,
      [
        data.scholarship_name,
        data.scholarship_code,
        data.scholarship_type,
        data.discount_type,
        data.discount_value,
        data.description,
        data.eligibility_criteria,
        data.required_gpa,
        data.required_income_level,
        data.total_budget,
        data.max_beneficiaries,
        data.is_active !== undefined ? data.is_active : true,
        data.academic_period_id,
        data.created_by,
      ],
      callback
    );
  },

  // Get all scholarship programs
  getAllPrograms: (filters, callback) => {
    let query = `
      SELECT 
        sp.*,
        ap.school_year,
        ap.semester,
        CONCAT(u.first_name, ' ', u.last_name) as created_by_name
      FROM scholarship_programs sp
      LEFT JOIN academic_periods ap ON sp.academic_period_id = ap.period_id
      LEFT JOIN users u ON sp.created_by = u.user_id
      WHERE 1=1
    `;
    const params = [];

    if (filters.scholarship_type) {
      query += " AND sp.scholarship_type = ?";
      params.push(filters.scholarship_type);
    }
    if (filters.academic_period_id) {
      query += " AND sp.academic_period_id = ?";
      params.push(filters.academic_period_id);
    }
    if (filters.is_active !== undefined) {
      query += " AND sp.is_active = ?";
      params.push(filters.is_active);
    }
    if (filters.search) {
      query += ` AND (sp.scholarship_name LIKE ? OR sp.scholarship_code LIKE ?)`;
      const searchTerm = `%${filters.search}%`;
      params.push(searchTerm, searchTerm);
    }

    query += " ORDER BY sp.created_at DESC";
    db.query(query, params, callback);
  },

  // Get scholarship program by ID
  getProgramById: (id, callback) => {
    const query = `
      SELECT 
        sp.*,
        ap.school_year,
        ap.semester,
        CONCAT(u.first_name, ' ', u.last_name) as created_by_name
      FROM scholarship_programs sp
      LEFT JOIN academic_periods ap ON sp.academic_period_id = ap.period_id
      LEFT JOIN users u ON sp.created_by = u.user_id
      WHERE sp.scholarship_id = ?
    `;
    db.query(query, [id], callback);
  },

  // Update scholarship program
  updateProgram: (id, data, callback) => {
    const query = `
      UPDATE scholarship_programs 
      SET scholarship_name = ?, scholarship_type = ?, discount_type = ?,
          discount_value = ?, description = ?, eligibility_criteria = ?,
          required_gpa = ?, required_income_level = ?, total_budget = ?,
          max_beneficiaries = ?, is_active = ?, academic_period_id = ?
      WHERE scholarship_id = ?
    `;
    db.query(
      query,
      [
        data.scholarship_name,
        data.scholarship_type,
        data.discount_type,
        data.discount_value,
        data.description,
        data.eligibility_criteria,
        data.required_gpa,
        data.required_income_level,
        data.total_budget,
        data.max_beneficiaries,
        data.is_active,
        data.academic_period_id,
        id,
      ],
      callback
    );
  },

  // Delete scholarship program
  deleteProgram: (id, callback) => {
    const query = "DELETE FROM scholarship_programs WHERE scholarship_id = ?";
    db.query(query, [id], callback);
  },

  // Create scholarship allocation
  createAllocation: (data, callback) => {
    const query = `
      INSERT INTO scholarship_allocations 
      (scholarship_id, student_id, academic_period_id, allocated_amount,
       allocation_date, start_date, end_date, status, application_notes, created_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    db.query(
      query,
      [
        data.scholarship_id,
        data.student_id,
        data.academic_period_id,
        data.allocated_amount,
        data.allocation_date,
        data.start_date,
        data.end_date,
        data.status || "Pending",
        data.application_notes,
        data.created_by,
      ],
      callback
    );
  },

  // Get all allocations
  getAllAllocations: (filters, callback) => {
    let query = `
      SELECT 
        sa.*,
        CONCAT(s.first_name, ' ', s.last_name) as student_name,
        sd.student_number,
        sp.scholarship_name,
        sp.scholarship_code,
        ap.school_year,
        ap.semester,
        CONCAT(approver.first_name, ' ', approver.last_name) as approved_by_name
      FROM scholarship_allocations sa
      INNER JOIN users s ON sa.student_id = s.user_id
      LEFT JOIN student_details sd ON s.user_id = sd.user_id
      INNER JOIN scholarship_programs sp ON sa.scholarship_id = sp.scholarship_id
      LEFT JOIN academic_periods ap ON sa.academic_period_id = ap.period_id
      LEFT JOIN users approver ON sa.approved_by = approver.user_id
      WHERE 1=1
    `;
    const params = [];

    if (filters.scholarship_id) {
      query += " AND sa.scholarship_id = ?";
      params.push(filters.scholarship_id);
    }
    if (filters.student_id) {
      query += " AND sa.student_id = ?";
      params.push(filters.student_id);
    }
    if (filters.academic_period_id) {
      query += " AND sa.academic_period_id = ?";
      params.push(filters.academic_period_id);
    }
    if (filters.status) {
      query += " AND sa.status = ?";
      params.push(filters.status);
    }
    if (filters.search) {
      query += ` AND (CONCAT(s.first_name, ' ', s.last_name) LIKE ? OR 
                      sd.student_number LIKE ? OR 
                      sp.scholarship_name LIKE ?)`;
      const searchTerm = `%${filters.search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    query += " ORDER BY sa.created_at DESC";

    if (filters.limit) {
      query += " LIMIT ? OFFSET ?";
      params.push(parseInt(filters.limit), parseInt(filters.offset || 0));
    }

    db.query(query, params, callback);
  },

  // Get allocation by ID
  getAllocationById: (id, callback) => {
    const query = `
      SELECT 
        sa.*,
        CONCAT(s.first_name, ' ', s.last_name) as student_name,
        s.email as student_email,
        sd.student_number,
        sd.year_level,
        sp.scholarship_name,
        sp.scholarship_code,
        sp.scholarship_type,
        sp.discount_type,
        sp.discount_value,
        ap.school_year,
        ap.semester,
        CONCAT(approver.first_name, ' ', approver.last_name) as approved_by_name,
        CONCAT(creator.first_name, ' ', creator.last_name) as created_by_name
      FROM scholarship_allocations sa
      INNER JOIN users s ON sa.student_id = s.user_id
      LEFT JOIN student_details sd ON s.user_id = sd.user_id
      INNER JOIN scholarship_programs sp ON sa.scholarship_id = sp.scholarship_id
      LEFT JOIN academic_periods ap ON sa.academic_period_id = ap.period_id
      LEFT JOIN users approver ON sa.approved_by = approver.user_id
      LEFT JOIN users creator ON sa.created_by = creator.user_id
      WHERE sa.allocation_id = ?
    `;
    db.query(query, [id], callback);
  },

  // Update allocation
  updateAllocation: (id, data, callback) => {
    const query = `
      UPDATE scholarship_allocations 
      SET scholarship_id = ?, student_id = ?, academic_period_id = ?,
          allocated_amount = ?, start_date = ?, end_date = ?,
          status = ?, application_notes = ?
      WHERE allocation_id = ?
    `;
    db.query(
      query,
      [
        data.scholarship_id,
        data.student_id,
        data.academic_period_id,
        data.allocated_amount,
        data.start_date,
        data.end_date,
        data.status,
        data.application_notes,
        id,
      ],
      callback
    );
  },

  // Approve allocation
  approveAllocation: (id, approved_by, approval_notes, callback) => {
    const query = `
      UPDATE scholarship_allocations 
      SET status = 'Approved', approved_by = ?, approval_date = CURDATE(),
          approval_notes = ?
      WHERE allocation_id = ?
    `;
    db.query(query, [approved_by, approval_notes, id], callback);
  },

  // Update allocation status
  updateAllocationStatus: (id, status, callback) => {
    const query =
      "UPDATE scholarship_allocations SET status = ? WHERE allocation_id = ?";
    db.query(query, [status, id], callback);
  },

  // Update disbursed amount
  updateDisbursement: (id, amount, callback) => {
    const query = `
      UPDATE scholarship_allocations 
      SET disbursed_amount = disbursed_amount + ?
      WHERE allocation_id = ?
    `;
    db.query(query, [amount, id], callback);
  },

  // Delete allocation
  deleteAllocation: (id, callback) => {
    const query = "DELETE FROM scholarship_allocations WHERE allocation_id = ?";
    db.query(query, [id], callback);
  },

  // Get scholarship summary
  getScholarshipSummary: (filters, callback) => {
    let query = `
      SELECT 
        COUNT(DISTINCT sp.scholarship_id) as total_programs,
        COUNT(DISTINCT sa.allocation_id) as total_allocations,
        SUM(sp.total_budget) as total_budget,
        SUM(sp.allocated_amount) as total_allocated,
        SUM(sa.disbursed_amount) as total_disbursed,
        COUNT(DISTINCT CASE WHEN sa.status = 'Active' THEN sa.student_id END) as active_beneficiaries
      FROM scholarship_programs sp
      LEFT JOIN scholarship_allocations sa ON sp.scholarship_id = sa.scholarship_id
      WHERE 1=1
    `;
    const params = [];

    if (filters.academic_period_id) {
      query += " AND sp.academic_period_id = ?";
      params.push(filters.academic_period_id);
    }

    db.query(query, params, callback);
  },

  // Get student scholarships
  getStudentScholarships: (student_id, callback) => {
    const query = `
      SELECT 
        sa.*,
        sp.scholarship_name,
        sp.scholarship_code,
        sp.scholarship_type,
        ap.school_year,
        ap.semester
      FROM scholarship_allocations sa
      INNER JOIN scholarship_programs sp ON sa.scholarship_id = sp.scholarship_id
      LEFT JOIN academic_periods ap ON sa.academic_period_id = ap.period_id
      WHERE sa.student_id = ? AND sa.status IN ('Approved', 'Active')
      ORDER BY sa.allocation_date DESC
    `;
    db.query(query, [student_id], callback);
  },
};

export default Scholarship;
