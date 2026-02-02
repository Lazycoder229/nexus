import pool from "../config/db.js";

const GradesModel = {
  // Get all grades with student and course details
  getAllGrades: async (filters = {}) => {
    try {
      let query = `
        SELECT 
          g.*,
          u.first_name,
          u.last_name,
          sd.student_number AS student_id,
          c.code AS course_code,
          c.title AS course_title,
          c.units,
          ap.school_year AS period_name,
          ap.semester AS year
        FROM grades g
        LEFT JOIN users u ON g.student_user_id = u.user_id
        LEFT JOIN student_details sd ON u.user_id = sd.user_id
        LEFT JOIN courses c ON g.course_id = c.course_id
        LEFT JOIN academic_periods ap ON g.period_id = ap.period_id
        WHERE 1=1
      `;
      const params = [];

      if (filters.student_user_id) {
        query += " AND g.student_user_id = ?";
        params.push(filters.student_user_id);
      }

      if (filters.course_id) {
        query += " AND g.course_id = ?";
        params.push(filters.course_id);
      }

      if (filters.period_id) {
        query += " AND g.period_id = ?";
        params.push(filters.period_id);
      }

      if (filters.status) {
        query += " AND g.status = ?";
        params.push(filters.status);
      }

      query += " ORDER BY g.created_at DESC";

      const [rows] = await pool.query(query, params);
      return rows;
    } catch (error) {
      throw error;
    }
  },

  // Get grade by ID
  getGradeById: async (id) => {
    try {
      const [rows] = await pool.query(
        `SELECT 
          g.*,
          u.first_name,
          u.last_name,
          sd.student_number AS student_id,
          c.code AS course_code,
          c.title AS course_title,
          c.units,
          ap.school_year AS period_name,
          ap.semester AS year
        FROM grades g
        LEFT JOIN users u ON g.student_user_id = u.user_id
        LEFT JOIN student_details sd ON u.user_id = sd.user_id
        LEFT JOIN courses c ON g.course_id = c.course_id
        LEFT JOIN academic_periods ap ON g.period_id = ap.period_id
        WHERE g.grade_id = ?`,
        [id],
      );
      return rows[0];
    } catch (error) {
      throw error;
    }
  },

  // Create new grade
  createGrade: async (gradeData) => {
    try {
      const {
        student_user_id,
        course_id,
        period_id,
        prelim_grade,
        midterm_grade,
        finals_grade,
        final_grade,
        remarks,
        status,
      } = gradeData;

      const [result] = await pool.query(
        `INSERT INTO grades 
        (student_user_id, course_id, period_id, prelim_grade, midterm_grade, 
         finals_grade, final_grade, remarks, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          student_user_id,
          course_id,
          period_id,
          prelim_grade || null,
          midterm_grade || null,
          finals_grade || null,
          final_grade || null,
          remarks || null,
          status || "draft",
        ],
      );

      return result.insertId;
    } catch (error) {
      throw error;
    }
  },

  // Update grade
  updateGrade: async (id, gradeData) => {
    try {
      const {
        prelim_grade,
        midterm_grade,
        finals_grade,
        final_grade,
        remarks,
        status,
      } = gradeData;

      const [result] = await pool.query(
        `UPDATE grades 
        SET prelim_grade = ?, midterm_grade = ?, finals_grade = ?, 
            final_grade = ?, remarks = ?, status = ?
        WHERE grade_id = ?`,
        [
          prelim_grade,
          midterm_grade,
          finals_grade,
          final_grade,
          remarks,
          status,
          id,
        ],
      );

      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  },

  // Delete grade
  deleteGrade: async (id) => {
    try {
      const [result] = await pool.query(
        "DELETE FROM grades WHERE grade_id = ?",
        [id],
      );
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  },

  // Approve grade
  approveGrade: async (id, approvedBy) => {
    try {
      const [result] = await pool.query(
        `UPDATE grades 
        SET status = 'approved', approved_by = ?, approved_date = NOW()
        WHERE grade_id = ?`,
        [approvedBy, id],
      );
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  },
};

export default GradesModel;
