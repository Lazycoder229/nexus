import pool from "../config/db.js";

const GradesModel = {
  /**
   * Retrieves all grades combining:
   * 1) Official recorded grades from the `grades` table.
   * 2) Computed grades from faculty LMS `grade_entries` if not yet stored in `grades`.
   */
  getAllGrades: async (filters = {}) => {
    try {
      // 1. Query official records from `grades` table
      let gradesQuery = `
        SELECT
          g.grade_id,
          g.student_user_id,
          g.course_id,
          g.period_id,
          CONCAT(u.first_name, ' ', u.last_name) AS student_name,
          u.first_name,
          u.last_name,
          sd.student_number AS student_id,
          c.code AS course_code,
          c.title AS course_title,
          c.units,
          ap.school_year AS period_name,
          ap.semester AS year,
          g.prelim_grade,
          g.midterm_grade,
          g.finals_grade,
          g.final_grade,
          g.remarks,
          g.status,
          g.approved_by,
          g.approved_date,
          g.created_at,
          g.updated_at
        FROM grades g
        LEFT JOIN users u ON g.student_user_id = u.user_id
        LEFT JOIN student_details sd ON u.user_id = sd.user_id
        LEFT JOIN courses c ON g.course_id = c.course_id
        LEFT JOIN academic_periods ap ON g.period_id = ap.period_id
        WHERE 1=1
      `;
      const gradesParams = [];

      if (filters.grade_id) {
        gradesQuery += " AND g.grade_id = ?";
        gradesParams.push(filters.grade_id);
      }
      if (filters.student_user_id) {
        gradesQuery += " AND g.student_user_id = ?";
        gradesParams.push(filters.student_user_id);
      }
      if (filters.course_id) {
        gradesQuery += " AND g.course_id = ?";
        gradesParams.push(filters.course_id);
      }
      if (filters.period_id) {
        gradesQuery += " AND g.period_id = ?";
        gradesParams.push(filters.period_id);
      }

      gradesQuery += " ORDER BY g.updated_at DESC";

      const [storedGrades] = await pool.query(gradesQuery, gradesParams);

      const formattedStoredGrades = storedGrades.map((row) => {
        const prelim = row.prelim_grade !== null ? Number(row.prelim_grade) : null;
        const midterm = row.midterm_grade !== null ? Number(row.midterm_grade) : null;
        const finals = row.finals_grade !== null ? Number(row.finals_grade) : null;
        let final_grade = row.final_grade !== null ? Number(row.final_grade) : null;

        if (final_grade === null && (prelim !== null || midterm !== null || finals !== null)) {
          final_grade = Number(((prelim || 0) * 0.3 + (midterm || 0) * 0.3 + (finals || 0) * 0.4).toFixed(2));
        }

        const remarks =
          row.remarks || (final_grade !== null ? (final_grade >= 75 ? "PASSED" : "FAILED") : null);

        return {
          ...row,
          prelim_grade: prelim,
          midterm_grade: midterm,
          finals_grade: finals,
          final_grade,
          remarks,
          status: row.status || "draft",
        };
      });

      // If filtering by a specific numeric grade_id, no need to check grade_entries
      if (filters.grade_id) {
        return formattedStoredGrades;
      }

      // 2. Query computed grades from `grade_entries` where not yet in `grades`
      let entriesQuery = `
        SELECT
          CONCAT(ge.student_id, '-', ge.course_id, '-', ge.period_id) AS grade_id,
          ge.student_id AS student_user_id,
          ge.course_id,
          ge.period_id,
          CONCAT(u.first_name, ' ', u.last_name) AS student_name,
          u.first_name,
          u.last_name,
          sd.student_number AS student_id,
          c.code AS course_code,
          c.title AS course_title,
          c.units,
          ap.school_year AS period_name,
          ap.semester AS year,
          ROUND(SUM(CASE WHEN LOWER(ge.component_name) LIKE '%prelim%'  AND ge.approval_status = 'approved' THEN ge.weighted_score ELSE 0 END), 2) AS prelim_grade,
          ROUND(SUM(CASE WHEN LOWER(ge.component_name) LIKE '%midterm%' AND ge.approval_status = 'approved' THEN ge.weighted_score ELSE 0 END), 2) AS midterm_grade,
          ROUND(SUM(CASE WHEN LOWER(ge.component_name) LIKE '%final%'   AND ge.approval_status = 'approved' THEN ge.weighted_score ELSE 0 END), 2) AS finals_grade,
          COUNT(*) AS total_entries,
          SUM(CASE WHEN ge.approval_status = 'approved' THEN 1 ELSE 0 END) AS approved_entries
        FROM grade_entries ge
        LEFT JOIN users u ON ge.student_id = u.user_id
        LEFT JOIN student_details sd ON u.user_id = sd.user_id
        LEFT JOIN courses c ON ge.course_id = c.course_id
        LEFT JOIN academic_periods ap ON ge.period_id = ap.period_id
        WHERE NOT EXISTS (
          SELECT 1 FROM grades g
          WHERE g.student_user_id = ge.student_id
            AND g.course_id = ge.course_id
            AND g.period_id = ge.period_id
        )
      `;
      const entriesParams = [];

      if (filters.student_user_id) {
        entriesQuery += " AND ge.student_id = ?";
        entriesParams.push(filters.student_user_id);
      }
      if (filters.course_id) {
        entriesQuery += " AND ge.course_id = ?";
        entriesParams.push(filters.course_id);
      }
      if (filters.period_id) {
        entriesQuery += " AND ge.period_id = ?";
        entriesParams.push(filters.period_id);
      }

      entriesQuery += " GROUP BY ge.student_id, ge.course_id, ge.period_id ORDER BY MAX(ge.submitted_at) DESC";

      const [entryRows] = await pool.query(entriesQuery, entriesParams);

      const formattedEntryRows = entryRows.map((row) => {
        const prelim = Number(row.prelim_grade) || 0;
        const midterm = Number(row.midterm_grade) || 0;
        const finals = Number(row.finals_grade) || 0;
        const hasAnyScore = prelim || midterm || finals;
        const final_grade = hasAnyScore
          ? Number((prelim * 0.3 + midterm * 0.3 + finals * 0.4).toFixed(2))
          : null;
        const remarks = final_grade === null ? null : final_grade >= 75 ? "PASSED" : "FAILED";
        const status =
          row.total_entries > 0 && row.approved_entries === row.total_entries
            ? "approved"
            : "submitted";

        return {
          ...row,
          prelim_grade: prelim || null,
          midterm_grade: midterm || null,
          finals_grade: finals || null,
          final_grade,
          remarks,
          status,
        };
      });

      return [...formattedStoredGrades, ...formattedEntryRows];
    } catch (error) {
      throw error;
    }
  },

  // Single row by composite or numeric ID
  getGradeByComposite: async (studentId, courseId, periodId) => {
    try {
      const rows = await GradesModel.getAllGrades({
        student_user_id: studentId,
        course_id: courseId,
        period_id: periodId,
      });
      return rows[0] || null;
    } catch (error) {
      throw error;
    }
  },

  getGradeById: async (id) => {
    try {
      if (String(id).includes("-")) {
        const [studentId, courseId, periodId] = String(id).split("-");
        return await GradesModel.getGradeByComposite(studentId, courseId, periodId);
      }

      const rows = await GradesModel.getAllGrades({ grade_id: Number(id) });
      return rows[0] || null;
    } catch (error) {
      throw error;
    }
  },

  create: async (gradeData) => {
    try {
      const prelim =
        gradeData.prelim_grade !== undefined && gradeData.prelim_grade !== ""
          ? Number(gradeData.prelim_grade)
          : null;
      const midterm =
        gradeData.midterm_grade !== undefined && gradeData.midterm_grade !== ""
          ? Number(gradeData.midterm_grade)
          : null;
      const finals =
        gradeData.finals_grade !== undefined && gradeData.finals_grade !== ""
          ? Number(gradeData.finals_grade)
          : null;

      let finalGrade =
        gradeData.final_grade !== undefined && gradeData.final_grade !== ""
          ? Number(gradeData.final_grade)
          : null;

      if (finalGrade === null && (prelim !== null || midterm !== null || finals !== null)) {
        finalGrade = Number(((prelim || 0) * 0.3 + (midterm || 0) * 0.3 + (finals || 0) * 0.4).toFixed(2));
      }

      const remarks =
        gradeData.remarks ||
        (finalGrade !== null ? (finalGrade >= 75 ? "PASSED" : "FAILED") : null);

      const status = gradeData.status || "draft";

      const query = `
        INSERT INTO grades (
          student_user_id, course_id, period_id,
          prelim_grade, midterm_grade, finals_grade, final_grade,
          remarks, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
          prelim_grade = VALUES(prelim_grade),
          midterm_grade = VALUES(midterm_grade),
          finals_grade = VALUES(finals_grade),
          final_grade = VALUES(final_grade),
          remarks = VALUES(remarks),
          status = VALUES(status),
          updated_at = NOW()
      `;

      const params = [
        gradeData.student_user_id,
        gradeData.course_id,
        gradeData.period_id,
        prelim,
        midterm,
        finals,
        finalGrade,
        remarks,
        status,
      ];

      await pool.query(query, params);

      return await GradesModel.getGradeByComposite(
        gradeData.student_user_id,
        gradeData.course_id,
        gradeData.period_id
      );
    } catch (error) {
      throw error;
    }
  },

  update: async (id, gradeData) => {
    try {
      let studentId = gradeData.student_user_id;
      let courseId = gradeData.course_id;
      let periodId = gradeData.period_id;

      if (String(id).includes("-")) {
        const parts = String(id).split("-");
        studentId = studentId || parts[0];
        courseId = courseId || parts[1];
        periodId = periodId || parts[2];
      }

      const prelim =
        gradeData.prelim_grade !== undefined && gradeData.prelim_grade !== ""
          ? Number(gradeData.prelim_grade)
          : null;
      const midterm =
        gradeData.midterm_grade !== undefined && gradeData.midterm_grade !== ""
          ? Number(gradeData.midterm_grade)
          : null;
      const finals =
        gradeData.finals_grade !== undefined && gradeData.finals_grade !== ""
          ? Number(gradeData.finals_grade)
          : null;

      let finalGrade =
        gradeData.final_grade !== undefined && gradeData.final_grade !== ""
          ? Number(gradeData.final_grade)
          : null;

      if (finalGrade === null && (prelim !== null || midterm !== null || finals !== null)) {
        finalGrade = Number(((prelim || 0) * 0.3 + (midterm || 0) * 0.3 + (finals || 0) * 0.4).toFixed(2));
      }

      const remarks =
        gradeData.remarks ||
        (finalGrade !== null ? (finalGrade >= 75 ? "PASSED" : "FAILED") : null);

      const status = gradeData.status || "draft";

      // If id is numeric grade_id
      if (!String(id).includes("-") && !isNaN(Number(id))) {
        await pool.query(
          `UPDATE grades SET
            prelim_grade = ?,
            midterm_grade = ?,
            finals_grade = ?,
            final_grade = ?,
            remarks = ?,
            status = ?,
            updated_at = NOW()
          WHERE grade_id = ?`,
          [prelim, midterm, finals, finalGrade, remarks, status, Number(id)]
        );

        const rows = await GradesModel.getAllGrades({ grade_id: Number(id) });
        if (rows.length > 0) return rows[0];
      }

      // Upsert by composite key
      if (studentId && courseId && periodId) {
        await pool.query(
          `INSERT INTO grades (
            student_user_id, course_id, period_id,
            prelim_grade, midterm_grade, finals_grade, final_grade,
            remarks, status
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
          ON DUPLICATE KEY UPDATE
            prelim_grade = VALUES(prelim_grade),
            midterm_grade = VALUES(midterm_grade),
            finals_grade = VALUES(finals_grade),
            final_grade = VALUES(final_grade),
            remarks = VALUES(remarks),
            status = VALUES(status),
            updated_at = NOW()`,
          [studentId, courseId, periodId, prelim, midterm, finals, finalGrade, remarks, status]
        );

        return await GradesModel.getGradeByComposite(studentId, courseId, periodId);
      }

      throw new Error("Grade record not found to update");
    } catch (error) {
      throw error;
    }
  },

  delete: async (id) => {
    try {
      if (!String(id).includes("-") && !isNaN(Number(id))) {
        const [res] = await pool.query("DELETE FROM grades WHERE grade_id = ?", [Number(id)]);
        return res.affectedRows > 0;
      }

      if (String(id).includes("-")) {
        const [studentId, courseId, periodId] = String(id).split("-");
        const [res] = await pool.query(
          "DELETE FROM grades WHERE student_user_id = ? AND course_id = ? AND period_id = ?",
          [studentId, courseId, periodId]
        );
        return res.affectedRows > 0;
      }

      return false;
    } catch (error) {
      throw error;
    }
  },

  approveAllEntriesFor: async (studentId, courseId, periodId, approvedBy) => {
    try {
      // 1. Update grades table
      await pool.query(
        `UPDATE grades
         SET status = 'approved', approved_by = ?, approved_date = NOW()
         WHERE student_user_id = ? AND course_id = ? AND period_id = ?`,
        [approvedBy, studentId, courseId, periodId]
      );

      // 2. Update grade_entries if any
      await pool.query(
        `UPDATE grade_entries
         SET approval_status = 'approved', approved_by = ?, approved_at = NOW()
         WHERE student_id = ? AND course_id = ? AND period_id = ?
           AND approval_status != 'approved'`,
        [approvedBy, studentId, courseId, periodId]
      );

      return true;
    } catch (error) {
      throw error;
    }
  },

  bulkUpsertGrades: async (gradesList) => {
    try {
      if (!Array.isArray(gradesList) || gradesList.length === 0) return 0;
      let count = 0;
      for (const grade of gradesList) {
        if (grade.student_user_id && grade.course_id && grade.period_id) {
          await GradesModel.create(grade);
          count++;
        }
      }
      return count;
    } catch (error) {
      throw error;
    }
  },
};

export default GradesModel;