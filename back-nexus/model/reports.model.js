import pool from "../config/db.js";

const ReportsModel = {
  // Get student reports with filters
  async getStudentReports(filters = {}) {
    let query = `
      SELECT 
        u.user_id as student_id,
        sd.student_number,
        CONCAT(u.first_name, ' ', IFNULL(u.middle_name, ''), ' ', u.last_name) AS student_name,
        u.email,
        u.phone as phone_number,
        u.gender,
        u.date_of_birth as birth_date,
        sd.year_level,
        u.status,
        p.program_name,
        p.program_code,
        e.enrollment_id,
        e.enrollment_date,
        e.enrollment_status,
        ap.academic_year,
        ap.semester,
        COUNT(DISTINCT g.grade_id) as total_grades,
        AVG(CASE 
          WHEN g.numerical_grade IS NOT NULL THEN g.numerical_grade
          ELSE NULL
        END) as gpa
      FROM users u
      INNER JOIN student_details sd ON u.user_id = sd.user_id
      LEFT JOIN programs p ON sd.course = p.program_name
      LEFT JOIN enrollments e ON u.user_id = e.student_id
      LEFT JOIN academic_periods ap ON e.academic_period_id = ap.academic_period_id
      LEFT JOIN grades g ON u.user_id = g.student_id
      WHERE u.role = 'Student'
    `;

    const params = [];

    if (filters.program_id) {
      query += ` AND p.program_id = ?`;
      params.push(filters.program_id);
    }

    if (filters.year_level) {
      query += ` AND sd.year_level = ?`;
      params.push(filters.year_level);
    }

    if (filters.status) {
      query += ` AND u.status = ?`;
      params.push(filters.status);
    }

    if (filters.search) {
      query += ` AND (sd.student_number LIKE ? OR u.first_name LIKE ? OR u.last_name LIKE ? OR u.email LIKE ?)`;
      const searchTerm = `%${filters.search}%`;
      params.push(searchTerm, searchTerm, searchTerm, searchTerm);
    }

    if (filters.date_from) {
      query += ` AND e.enrollment_date >= ?`;
      params.push(filters.date_from);
    }

    if (filters.date_to) {
      query += ` AND e.enrollment_date <= ?`;
      params.push(filters.date_to);
    }

    query += ` GROUP BY u.user_id, e.enrollment_id, ap.academic_period_id ORDER BY sd.student_number ASC`;

    const [rows] = await pool.query(query, params);
    return rows;
  },

  // Get enrollment reports with filters
  async getEnrollmentReports(filters = {}) {
    let query = `
      SELECT 
        e.enrollment_id,
        e.enrollment_date,
        e.enrollment_status,
        e.year_level,
        CONCAT(u.first_name, ' ', u.last_name) AS student_name,
        sd.student_number,
        u.email,
        p.program_name,
        p.program_code,
        ap.academic_year,
        ap.semester,
        ap.start_date,
        ap.end_date,
        COUNT(DISTINCT ec.course_id) as enrolled_courses,
        SUM(c.units) as total_units
      FROM enrollments e
      INNER JOIN users u ON e.student_id = u.user_id
      INNER JOIN student_details sd ON u.user_id = sd.user_id
      LEFT JOIN programs p ON e.program_id = p.program_id
      LEFT JOIN academic_periods ap ON e.academic_period_id = ap.academic_period_id
      LEFT JOIN enrollment_courses ec ON e.enrollment_id = ec.enrollment_id
      LEFT JOIN courses c ON ec.course_id = c.course_id
      WHERE 1=1
    `;

    const params = [];

    if (filters.academic_period_id) {
      query += ` AND e.academic_period_id = ?`;
      params.push(filters.academic_period_id);
    }

    if (filters.program_id) {
      query += ` AND e.program_id = ?`;
      params.push(filters.program_id);
    }

    if (filters.status) {
      query += ` AND e.enrollment_status = ?`;
      params.push(filters.status);
    }

    if (filters.date_from) {
      query += ` AND e.enrollment_date >= ?`;
      params.push(filters.date_from);
    }

    if (filters.date_to) {
      query += ` AND e.enrollment_date <= ?`;
      params.push(filters.date_to);
    }

    query += ` GROUP BY e.enrollment_id ORDER BY e.enrollment_date DESC`;

    const [rows] = await pool.query(query, params);
    return rows;
  },

  // Get attendance reports (student or staff)
  async getAttendanceReports(filters = {}) {
    if (filters.type === "student") {
      let query = `
        SELECT 
          sa.attendance_id,
          sa.attendance_date,
          sa.time_in,
          sa.status,
          sa.notes,
          CONCAT(u.first_name, ' ', u.last_name) AS student_name,
          sd.student_number,
          c.course_code,
          c.course_name,
          sec.section_name,
          CONCAT(f.first_name, ' ', f.last_name) AS marked_by_name
        FROM student_attendance sa
        INNER JOIN users u ON sa.student_id = u.user_id
        INNER JOIN student_details sd ON u.user_id = sd.user_id
        LEFT JOIN courses c ON sa.course_id = c.course_id
        LEFT JOIN sections sec ON sa.section_id = sec.section_id
        LEFT JOIN users f ON sa.marked_by = f.user_id
        WHERE 1=1
      `;

      const params = [];

      if (filters.date_from) {
        query += ` AND sa.attendance_date >= ?`;
        params.push(filters.date_from);
      }

      if (filters.date_to) {
        query += ` AND sa.attendance_date <= ?`;
        params.push(filters.date_to);
      }

      if (filters.status) {
        query += ` AND sa.status = ?`;
        params.push(filters.status);
      }

      if (filters.section_id) {
        query += ` AND sa.section_id = ?`;
        params.push(filters.section_id);
      }

      query += ` ORDER BY sa.attendance_date DESC, sd.student_number ASC`;

      const [rows] = await pool.query(query, params);
      return rows;
    } else if (filters.type === "staff") {
      let query = `
        SELECT 
          sa.attendance_id,
          sa.attendance_date,
          sa.time_in,
          sa.time_out,
          sa.status,
          sa.notes,
          sa.attendance_method,
          CONCAT(u.first_name, ' ', u.last_name) AS staff_name,
          ed.employee_id,
          ed.department,
          TIMESTAMPDIFF(HOUR, sa.time_in, sa.time_out) as hours_worked
        FROM staff_attendance sa
        INNER JOIN users u ON sa.user_id = u.user_id
        INNER JOIN employee_details ed ON u.user_id = ed.user_id
        WHERE 1=1
      `;

      const params = [];

      if (filters.date_from) {
        query += ` AND sa.attendance_date >= ?`;
        params.push(filters.date_from);
      }

      if (filters.date_to) {
        query += ` AND sa.attendance_date <= ?`;
        params.push(filters.date_to);
      }

      if (filters.status) {
        query += ` AND sa.status = ?`;
        params.push(filters.status);
      }

      if (filters.department) {
        query += ` AND ed.department = ?`;
        params.push(filters.department);
      }

      query += ` ORDER BY sa.attendance_date DESC, ed.employee_id ASC`;

      const [rows] = await pool.query(query, params);
      return rows;
    }

    return [];
  },

  // Get payroll reports
  async getPayrollReports(filters = {}) {
    let query = `
      SELECT 
        ps.payroll_setup_id as payroll_id,
        ps.payroll_period_start as pay_period_start,
        ps.payroll_period_end as pay_period_end,
        ps.payment_date,
        p.gross_pay as gross_salary,
        p.total_deductions,
        p.net_pay as net_salary,
        ps.status,
        ps.payment_method,
        CONCAT(u.first_name, ' ', u.last_name) AS employee_name,
        ed.employee_id,
        ed.department,
        ed.position_title as position,
        GROUP_CONCAT(DISTINCT d.deduction_type) as deductions_list
      FROM payroll_setup ps
      INNER JOIN payslips p ON ps.payroll_setup_id = p.payroll_setup_id
      INNER JOIN users u ON p.employee_id = u.user_id
      INNER JOIN employee_details ed ON u.user_id = ed.user_id
      LEFT JOIN deductions d ON p.employee_id = d.employee_id
      WHERE 1=1
    `;

    const params = [];

    if (filters.date_from) {
      query += ` AND ps.payroll_period_start >= ?`;
      params.push(filters.date_from);
    }

    if (filters.date_to) {
      query += ` AND ps.payroll_period_end <= ?`;
      params.push(filters.date_to);
    }

    if (filters.department) {
      query += ` AND ed.department = ?`;
      params.push(filters.department);
    }

    if (filters.status) {
      query += ` AND ps.status = ?`;
      params.push(filters.status);
    }

    query += ` GROUP BY ps.payroll_setup_id, p.payslip_id ORDER BY ps.payroll_period_start DESC`;

    const [rows] = await pool.query(query, params);
    return rows;
  },

  // Get summary statistics
  async getSummaryStatistics() {
    const [studentStats] = await pool.query(`
      SELECT 
        COUNT(*) as total_students,
        SUM(CASE WHEN u.status = 'Active' THEN 1 ELSE 0 END) as active_students,
        SUM(CASE WHEN u.status = 'Inactive' THEN 1 ELSE 0 END) as inactive_students,
        SUM(CASE WHEN u.gender = 'Male' THEN 1 ELSE 0 END) as male_students,
        SUM(CASE WHEN u.gender = 'Female' THEN 1 ELSE 0 END) as female_students
      FROM users u
      WHERE u.role = 'Student'
    `);

    const [enrollmentStats] = await pool.query(`
      SELECT 
        COUNT(*) as total_enrollments,
        SUM(CASE WHEN enrollment_status = 'enrolled' THEN 1 ELSE 0 END) as enrolled,
        SUM(CASE WHEN enrollment_status = 'pending' THEN 1 ELSE 0 END) as pending,
        SUM(CASE WHEN enrollment_status = 'dropped' THEN 1 ELSE 0 END) as dropped
      FROM enrollments
    `);

    const [attendanceStats] = await pool.query(`
      SELECT 
        COUNT(*) as total_attendance_records,
        SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) as present,
        SUM(CASE WHEN status = 'absent' THEN 1 ELSE 0 END) as absent,
        SUM(CASE WHEN status = 'late' THEN 1 ELSE 0 END) as late
      FROM student_attendance
      WHERE DATE(attendance_date) = CURDATE()
    `);

    const [payrollStats] = await pool.query(`
      SELECT 
        COUNT(DISTINCT ps.payroll_setup_id) as total_payroll_records,
        SUM(p.gross_pay) as total_gross,
        SUM(p.total_deductions) as total_deductions,
        SUM(p.net_pay) as total_net
      FROM payroll_setup ps
      INNER JOIN payslips p ON ps.payroll_setup_id = p.payroll_setup_id
      WHERE YEAR(ps.payroll_period_start) = YEAR(CURDATE())
        AND MONTH(ps.payroll_period_start) = MONTH(CURDATE())
    `);

    return {
      students: studentStats[0],
      enrollments: enrollmentStats[0],
      attendance: attendanceStats[0],
      payroll: payrollStats[0],
    };
  },

  // Get report templates
  async getReportTemplates() {
    const [rows] = await pool.query(
      "SELECT * FROM report_templates WHERE is_active = 1 ORDER BY template_name"
    );
    return rows;
  },

  // Create saved report
  async createSavedReport(data) {
    const [result] = await pool.query(
      `INSERT INTO saved_reports (
        report_name, report_type, template_id, generated_by,
        parameters, filters_applied, file_path, file_format,
        file_size, data_snapshot, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        data.report_name,
        data.report_type,
        data.template_id,
        data.generated_by,
        JSON.stringify(data.parameters || {}),
        JSON.stringify(data.filters_applied || {}),
        data.file_path,
        data.file_format,
        data.file_size,
        JSON.stringify(data.data_snapshot || {}),
        data.status || "completed",
      ]
    );
    return result.insertId;
  },

  // Get saved reports
  async getSavedReports(filters = {}) {
    let query = `
      SELECT 
        sr.*,
        CONCAT(u.first_name, ' ', u.last_name) AS generated_by_name
      FROM saved_reports sr
      LEFT JOIN users u ON sr.generated_by = u.user_id
      WHERE 1=1
    `;

    const params = [];

    if (filters.report_type) {
      query += " AND sr.report_type = ?";
      params.push(filters.report_type);
    }

    if (filters.generated_by) {
      query += " AND sr.generated_by = ?";
      params.push(filters.generated_by);
    }

    query += " ORDER BY sr.generated_date DESC";

    const [rows] = await pool.query(query, params);
    return rows;
  },

  // Create export log
  async createExportLog(data) {
    const [result] = await pool.query(
      `INSERT INTO report_exports (
        report_id, export_type, export_format, exported_by,
        record_count, file_size, file_path, filters_applied
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        data.report_id,
        data.export_type,
        data.export_format,
        data.exported_by,
        data.record_count,
        data.file_size,
        data.file_path,
        JSON.stringify(data.filters_applied || {}),
      ]
    );
    return result.insertId;
  },
};

export default ReportsModel;
