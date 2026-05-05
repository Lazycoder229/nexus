// model/enrollments.model.js
import db from "../config/db.js";

// Get all enrollments with student, course, and period details
export const getAllEnrollments = async (filters = {}) => {
  const { course_id, period_id, section_id, student_id } = filters;

  let query = `SELECT 
        e.enrollment_id,
        e.student_id,
        CONCAT(u.first_name, ' ', u.last_name) AS student_name,
        u.first_name,
        u.last_name,
        sd.student_number,
        COALESCE(e.year_level, sd.year_level) AS year_level,
        sd.course AS student_course,
        
        e.course_id,
        e.section_id,
      s.section_name,
        c.code AS course_code,
        c.title AS course_title,
        c.units,
        
        e.period_id,
        ap.school_year,
        ap.semester,
        
        e.enrollment_date,
        e.status,
        e.midterm_grade,
        e.final_grade,
        e.remarks,
        e.created_at,
        e.updated_at
     FROM enrollments e
     JOIN users u ON e.student_id = u.user_id
     LEFT JOIN student_details sd ON e.student_id = sd.user_id
     JOIN courses c ON e.course_id = c.course_id
        LEFT JOIN sections s ON e.section_id = s.section_id
     JOIN academic_periods ap ON e.period_id = ap.period_id`;

  const params = [];
  const constraints = [];

  if (course_id) {
    constraints.push("e.course_id = ?");
    params.push(course_id);
  }
  if (period_id) {
    constraints.push("e.period_id = ?");
    params.push(period_id);
  }
  if (section_id) {
    constraints.push("e.section_id = ?");
    params.push(section_id);
  }
  if (student_id) {
    constraints.push("e.student_id = ?");
    params.push(student_id);
  }

  if (constraints.length > 0) {
    query += " WHERE " + constraints.join(" AND ");
  }

  query += ` ORDER BY e.created_at DESC`;

  const [rows] = await db.query(query, params);
  return rows;
};

// Get enrollments by student
export const getEnrollmentsByStudent = async (studentId) => {
  const [rows] = await db.query(
    `SELECT 
        e.enrollment_id,
        e.course_id,
        e.section_id,
        c.code AS course_code,
        c.title AS course_title,
        c.units,
        
        e.period_id,
        ap.school_year,
        ap.semester,
        
        e.enrollment_date,
        e.status,
        e.midterm_grade,
        e.final_grade,
        e.remarks,
        e.created_at,
        e.updated_at,
        
        s.section_name,
        s.room,
        s.schedule_day,
        s.schedule_time_start,
        s.schedule_time_end,
        
        CONCAT(fu.first_name, ' ', fu.last_name) AS instructor_name,
        
        JSON_ARRAYAGG(
          JSON_OBJECT(
            'schedule_day', COALESCE(fas.schedule_day, s.schedule_day, ''),
            'schedule_time_start', COALESCE(fas.schedule_time_start, s.schedule_time_start, ''),
            'schedule_time_end', COALESCE(fas.schedule_time_end, s.schedule_time_end, '')
          )
        ) AS schedules
     FROM enrollments e
     JOIN courses c ON e.course_id = c.course_id
     JOIN academic_periods ap ON e.period_id = ap.period_id
     LEFT JOIN sections s ON e.section_id = s.section_id
     LEFT JOIN faculty_course_assignments fca 
       ON e.course_id = fca.course_id AND e.period_id = fca.academic_period_id
     LEFT JOIN faculty_assignment_schedules fas ON fca.assignment_id = fas.assignment_id
     LEFT JOIN users fu ON fca.faculty_user_id = fu.user_id
     WHERE e.student_id = ?
     GROUP BY 
        e.enrollment_id,
        e.course_id,
        e.section_id,
        c.code,
        c.title,
        c.units,
        e.period_id,
        ap.school_year,
        ap.semester,
        e.enrollment_date,
        e.status,
        e.midterm_grade,
        e.final_grade,
        e.remarks,
        e.created_at,
        e.updated_at,
        s.section_name,
        s.room,
        s.schedule_day,
        s.schedule_time_start,
        s.schedule_time_end,
        fu.first_name,
        fu.last_name
     ORDER BY e.created_at DESC`,
    [studentId],
  );
  return rows;
};

// Get single enrollment by ID
export const getEnrollmentById = async (id) => {
  const [rows] = await db.query(
    `SELECT 
        e.*,
        CONCAT(u.first_name, ' ', u.last_name) AS student_name,
        c.code AS course_code,
        c.title AS course_title,
        ap.school_year,
        ap.semester
     FROM enrollments e
     JOIN users u ON e.student_id = u.user_id
     JOIN courses c ON e.course_id = c.course_id
     JOIN academic_periods ap ON e.period_id = ap.period_id
     WHERE e.enrollment_id = ?`,
    [id],
  );
  return rows[0];
};

// Create new enrollment
export const createEnrollment = async ({
  student_id,
  course_id,
  period_id,
  section_id = null,
  year_level = null,
  enrollment_date,
  status = "Enrolled",
  midterm_grade = null,
  final_grade = null,
  remarks = null,
}) => {
  const [result] = await db.query(
    `INSERT INTO enrollments 
     (student_id, course_id, period_id, section_id, year_level, enrollment_date, status, midterm_grade, final_grade, remarks)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      student_id,
      course_id,
      period_id,
      section_id,
      year_level,
      enrollment_date,
      status,
      midterm_grade,
      final_grade,
      remarks,
    ],
  );

  return getEnrollmentById(result.insertId);
};

// Update enrollment
export const updateEnrollment = async (
  id,
  {
    course_id,
    period_id,
    year_level,
    enrollment_date,
    status,
    midterm_grade,
    final_grade,
    remarks,
  },
) => {
  await db.query(
    `UPDATE enrollments 
     SET course_id = ?, period_id = ?, year_level = ?, enrollment_date = ?, status = ?, 
         midterm_grade = ?, final_grade = ?, remarks = ?
     WHERE enrollment_id = ?`,
    [
      course_id,
      period_id,
      year_level,
      enrollment_date,
      status,
      midterm_grade,
      final_grade,
      remarks,
      id,
    ],
  );

  return getEnrollmentById(id);
};

// Delete enrollment
export const deleteEnrollment = async (id) => {
  await db.query(`DELETE FROM enrollments WHERE enrollment_id = ?`, [id]);
  return true;
};

// Check if enrollment exists (prevent duplicates)
export const checkEnrollmentExists = async (
  student_id,
  course_id,
  period_id,
) => {
  const [rows] = await db.query(
    `SELECT enrollment_id FROM enrollments 
     WHERE student_id = ? AND course_id = ? AND period_id = ?`,
    [student_id, course_id, period_id],
  );
  return rows.length > 0;
};

// Get enrolled students by faculty assignment ID
export const getStudentsByAssignment = async (assignmentId) => {
  const [rows] = await db.query(
    `SELECT 
        e.enrollment_id,
        e.student_id,
        sd.student_number AS student_id,
        CONCAT(u.first_name, ' ', u.last_name) AS name,
        u.email,
        u.phone AS phone,
        e.status
     FROM enrollments e
     JOIN faculty_course_assignments fca ON e.course_id = fca.course_id 
         AND e.period_id = fca.academic_period_id
     JOIN sections s ON e.section_id = s.section_id AND s.section_name = fca.section
     JOIN users u ON e.student_id = u.user_id
     LEFT JOIN student_details sd ON e.student_id = sd.user_id
     WHERE fca.assignment_id = ?
     ORDER BY sd.student_number ASC`,
    [assignmentId],
  );
  return rows;
};
