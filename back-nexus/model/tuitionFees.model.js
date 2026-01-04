import db from "../config/db.js";

const TuitionFee = {
  // Create new tuition fee setup
  create: (data, callback) => {
    const query = `
      INSERT INTO tuition_fee_setup 
      (program_id, year_level, academic_period_id, tuition_fee, laboratory_fee, 
       library_fee, athletic_fee, registration_fee, id_fee, miscellaneous_fee, 
       other_fees, is_active, created_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    db.query(
      query,
      [
        data.program_id,
        data.year_level,
        data.academic_period_id,
        data.tuition_fee,
        data.laboratory_fee || 0,
        data.library_fee || 0,
        data.athletic_fee || 0,
        data.registration_fee || 0,
        data.id_fee || 0,
        data.miscellaneous_fee || 0,
        data.other_fees || 0,
        data.is_active !== undefined ? data.is_active : true,
        data.created_by,
      ],
      callback
    );
  },

  // Get all tuition fee setups with filters
  getAll: (filters, callback) => {
    let query = `
      SELECT 
        tfs.*,
        p.program_name,
        p.program_code,
        ap.school_year,
        ap.semester,
        CONCAT(u.first_name, ' ', u.last_name) as created_by_name
      FROM tuition_fee_setup tfs
      LEFT JOIN programs p ON tfs.program_id = p.program_id
      LEFT JOIN academic_periods ap ON tfs.academic_period_id = ap.period_id
      LEFT JOIN users u ON tfs.created_by = u.user_id
      WHERE 1=1
    `;
    const params = [];

    if (filters.program_id) {
      query += " AND tfs.program_id = ?";
      params.push(filters.program_id);
    }
    if (filters.academic_period_id) {
      query += " AND tfs.academic_period_id = ?";
      params.push(filters.academic_period_id);
    }
    if (filters.year_level) {
      query += " AND tfs.year_level = ?";
      params.push(filters.year_level);
    }
    if (filters.is_active !== undefined) {
      query += " AND tfs.is_active = ?";
      params.push(filters.is_active);
    }

    query += " ORDER BY tfs.created_at DESC";
    db.query(query, params, callback);
  },

  // Get tuition fee by ID
  getById: (id, callback) => {
    const query = `
      SELECT 
        tfs.*,
        p.program_name,
        p.program_code,
        ap.school_year,
        ap.semester,
        CONCAT(u.first_name, ' ', u.last_name) as created_by_name
      FROM tuition_fee_setup tfs
      LEFT JOIN programs p ON tfs.program_id = p.program_id
      LEFT JOIN academic_periods ap ON tfs.academic_period_id = ap.period_id
      LEFT JOIN users u ON tfs.created_by = u.user_id
      WHERE tfs.fee_setup_id = ?
    `;
    db.query(query, [id], callback);
  },

  // Update tuition fee setup
  update: (id, data, callback) => {
    const query = `
      UPDATE tuition_fee_setup 
      SET program_id = ?, year_level = ?, academic_period_id = ?, 
          tuition_fee = ?, laboratory_fee = ?, library_fee = ?, 
          athletic_fee = ?, registration_fee = ?, id_fee = ?, 
          miscellaneous_fee = ?, other_fees = ?, is_active = ?
      WHERE fee_setup_id = ?
    `;
    db.query(
      query,
      [
        data.program_id,
        data.year_level,
        data.academic_period_id,
        data.tuition_fee,
        data.laboratory_fee || 0,
        data.library_fee || 0,
        data.athletic_fee || 0,
        data.registration_fee || 0,
        data.id_fee || 0,
        data.miscellaneous_fee || 0,
        data.other_fees || 0,
        data.is_active,
        id,
      ],
      callback
    );
  },

  // Delete tuition fee setup
  delete: (id, callback) => {
    const query = "DELETE FROM tuition_fee_setup WHERE fee_setup_id = ?";
    db.query(query, [id], callback);
  },

  // Get fee for specific program, year level, and period
  getFeeByDetails: (program_id, year_level, academic_period_id, callback) => {
    const query = `
      SELECT * FROM tuition_fee_setup 
      WHERE program_id = ? AND year_level = ? AND academic_period_id = ? AND is_active = TRUE
      LIMIT 1
    `;
    db.query(query, [program_id, year_level, academic_period_id], callback);
  },
};

export default TuitionFee;
