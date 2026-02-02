import pool from "../config/db.js";

const ExamsModel = {
  // Get all exams with filters
  getAll: async (filters = {}) => {
    let query = `
      SELECT 
        e.*,
        c.code AS course_code,
        c.title AS course_name,
        s.section_name,
        ap.school_year,
        ap.semester,
        u.first_name AS creator_first_name,
        u.last_name AS creator_last_name
      FROM exams e
      LEFT JOIN courses c ON e.course_id = c.course_id
      LEFT JOIN sections s ON e.section_id = s.section_id
      LEFT JOIN academic_periods ap ON e.period_id = ap.period_id
      LEFT JOIN users u ON e.created_by = u.user_id
      WHERE 1=1
    `;

    const params = [];

    if (filters.course_id) {
      query += " AND e.course_id = ?";
      params.push(filters.course_id);
    }

    if (filters.section_id) {
      query += " AND e.section_id = ?";
      params.push(filters.section_id);
    }

    if (filters.period_id) {
      query += " AND e.period_id = ?";
      params.push(filters.period_id);
    }

    if (filters.exam_type) {
      query += " AND e.exam_type = ?";
      params.push(filters.exam_type);
    }

    if (filters.status) {
      query += " AND e.status = ?";
      params.push(filters.status);
    }

    query += " ORDER BY e.created_at DESC";

    const [rows] = await pool.query(query, params);
    return rows;
  },

  // Get exam by ID
  getById: async (examId) => {
    const query = `
      SELECT 
        e.*,
        c.code AS course_code,
        c.title AS course_name,
        s.section_name,
        ap.school_year,
        ap.semester
      FROM exams e
      LEFT JOIN courses c ON e.course_id = c.course_id
      LEFT JOIN sections s ON e.section_id = s.section_id
      LEFT JOIN academic_periods ap ON e.period_id = ap.period_id
      WHERE e.exam_id = ?
    `;
    const [rows] = await pool.query(query, [examId]);
    return rows[0];
  },

  // Create new exam
  create: async (examData) => {
    const query = `
      INSERT INTO exams (
        exam_name, exam_type, course_id, section_id, period_id,
        total_points, passing_score, exam_duration, description,
        instructions, status, created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const params = [
      examData.exam_name,
      examData.exam_type,
      examData.course_id,
      examData.section_id || null,
      examData.period_id || null,
      examData.total_points,
      examData.passing_score || null,
      examData.exam_duration || null,
      examData.description || null,
      examData.instructions || null,
      examData.status || "draft",
      examData.created_by || null,
    ];

    const [result] = await pool.query(query, params);
    return result.insertId;
  },

  // Update exam
  update: async (examId, examData) => {
    const query = `
      UPDATE exams SET
        exam_name = ?,
        exam_type = ?,
        course_id = ?,
        section_id = ?,
        period_id = ?,
        total_points = ?,
        passing_score = ?,
        exam_duration = ?,
        description = ?,
        instructions = ?,
        status = ?
      WHERE exam_id = ?
    `;

    const params = [
      examData.exam_name,
      examData.exam_type,
      examData.course_id,
      examData.section_id || null,
      examData.period_id || null,
      examData.total_points,
      examData.passing_score || null,
      examData.exam_duration || null,
      examData.description || null,
      examData.instructions || null,
      examData.status,
      examId,
    ];

    const [result] = await pool.query(query, params);
    return result.affectedRows;
  },

  // Delete exam
  delete: async (examId) => {
    const query = "DELETE FROM exams WHERE exam_id = ?";
    const [result] = await pool.query(query, [examId]);
    return result.affectedRows;
  },

  // Get exams by faculty
  getByFaculty: async (facultyId) => {
    const query = `
      SELECT 
        e.*,
        c.course_code,
        c.course_name,
        s.section_name
      FROM exams e
      INNER JOIN courses c ON e.course_id = c.course_id
      LEFT JOIN sections s ON e.section_id = s.section_id
      WHERE e.created_by = ?
      ORDER BY e.created_at DESC
    `;
    const [rows] = await pool.query(query, [facultyId]);
    return rows;
  },
};

export default ExamsModel;
