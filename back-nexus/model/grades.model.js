import pool from "../config/db.js";

const GradesModel = {
  // Get all grades with student and course details
  getAllGrades: async (filters = {}) => {
    try {
      let query = `
        SELECT 
          g.*,
          CONCAT(u.first_name, ' ', u.last_name) AS student_name,
          u.first_name,
          u.last_name,
          sd.student_number AS student_id,
          c.code AS course_code,
          c.title AS course_title,
          c.units,
          ap.school_year AS period_name,
          ap.semester AS year,
          ROUND(
            (COALESCE(g.prelim_grade, 0) * CASE WHEN g.prelim_grade IS NOT NULL THEN 1 ELSE 0 END +
             COALESCE(g.midterm_grade, 0) * CASE WHEN g.midterm_grade IS NOT NULL THEN 1 ELSE 0 END +
             COALESCE(g.finals_grade, 0) * CASE WHEN g.finals_grade IS NOT NULL THEN 1 ELSE 0 END) /
            NULLIF(
              (CASE WHEN g.prelim_grade IS NOT NULL THEN 1 ELSE 0 END +
               CASE WHEN g.midterm_grade IS NOT NULL THEN 1 ELSE 0 END +
               CASE WHEN g.finals_grade IS NOT NULL THEN 1 ELSE 0 END), 0
            ), 2) AS raw_grade
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
          CONCAT(u.first_name, ' ', u.last_name) AS student_name,
          u.first_name,
          u.last_name,
          sd.student_number AS student_id,
          c.code AS course_code,
          c.title AS course_title,
          c.units,
          ap.school_year AS period_name,
          ap.semester AS year,
          ROUND(
            (COALESCE(g.prelim_grade, 0) * CASE WHEN g.prelim_grade IS NOT NULL THEN 1 ELSE 0 END +
             COALESCE(g.midterm_grade, 0) * CASE WHEN g.midterm_grade IS NOT NULL THEN 1 ELSE 0 END +
             COALESCE(g.finals_grade, 0) * CASE WHEN g.finals_grade IS NOT NULL THEN 1 ELSE 0 END) /
            NULLIF(
              (CASE WHEN g.prelim_grade IS NOT NULL THEN 1 ELSE 0 END +
               CASE WHEN g.midterm_grade IS NOT NULL THEN 1 ELSE 0 END +
               CASE WHEN g.finals_grade IS NOT NULL THEN 1 ELSE 0 END), 0
            ), 2) AS raw_grade
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

  upsertBulkGrades: async (gradesData) => {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      const created = [];
      const updated = [];
      const grouped = new Map();

      for (const grade of gradesData) {
        const groupKey = `${grade.course_id}:${grade.period_id}`;
        if (!grouped.has(groupKey)) {
          grouped.set(groupKey, []);
        }
        grouped.get(groupKey).push(grade);
      }

      for (const [groupKey, groupRows] of grouped.entries()) {
        const [courseId, periodId] = groupKey.split(":");
        const studentIds = groupRows.map((row) => row.student_user_id);
        const placeholders = studentIds.map(() => "?").join(", ");

        const [existingRows] = await connection.query(
          `SELECT grade_id, student_user_id
           FROM grades
           WHERE course_id = ? AND period_id = ? AND student_user_id IN (${placeholders})
           ORDER BY grade_id DESC`,
          [courseId, periodId, ...studentIds],
        );

        const existingMap = new Map();
        existingRows.forEach((row) => {
          if (!existingMap.has(String(row.student_user_id))) {
            existingMap.set(String(row.student_user_id), row.grade_id);
          }
        });

        for (const gradeData of groupRows) {
          const existingId = existingMap.get(String(gradeData.student_user_id));
          const values = [
            gradeData.prelim_grade,
            gradeData.midterm_grade,
            gradeData.finals_grade,
            gradeData.final_grade,
            gradeData.remarks,
            gradeData.status,
          ];

          if (existingId) {
            await connection.query(
              `UPDATE grades
               SET prelim_grade = ?, midterm_grade = ?, finals_grade = ?,
                   final_grade = ?, remarks = ?, status = ?
               WHERE grade_id = ?`,
              [...values, existingId],
            );
            updated.push(existingId);
          } else {
            const [result] = await connection.query(
              `INSERT INTO grades
               (student_user_id, course_id, period_id, prelim_grade, midterm_grade,
                finals_grade, final_grade, remarks, status)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
              [
                gradeData.student_user_id,
                gradeData.course_id,
                gradeData.period_id,
                gradeData.prelim_grade,
                gradeData.midterm_grade,
                gradeData.finals_grade,
                gradeData.final_grade,
                gradeData.remarks,
                gradeData.status,
              ],
            );
            created.push(result.insertId);
          }
        }
      }

      await connection.commit();

      return {
        success: true,
        created: created.length,
        updated: updated.length,
        total: created.length + updated.length,
        message: `Saved ${created.length + updated.length} grade record${created.length + updated.length === 1 ? "" : "s"}`,
      };
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
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
