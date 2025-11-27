import db from "../config/db.js";

const FacultyCourseAssignment = {
  // Get all course assignments
  getAll: () => {
    return db.query(`
      SELECT fca.*, 
             u.first_name, u.last_name, ed.employee_id,
             c.code as course_code, c.title as course_title, c.units,
             ap.school_year, ap.semester, ap.status as period_status
      FROM faculty_course_assignments fca
      INNER JOIN users u ON fca.faculty_user_id = u.user_id
      INNER JOIN employee_details ed ON u.user_id = ed.user_id
      INNER JOIN courses c ON fca.course_id = c.course_id
      INNER JOIN academic_periods ap ON fca.academic_period_id = ap.period_id
      ORDER BY fca.created_at DESC
    `);
  },

  // Get assignments by faculty ID
  getByFacultyId: (facultyUserId) => {
    return db.query(
      `
      SELECT fca.*, 
             c.code as course_code, c.title as course_title, c.units,
             ap.school_year, ap.semester
      FROM faculty_course_assignments fca
      INNER JOIN courses c ON fca.course_id = c.course_id
      INNER JOIN academic_periods ap ON fca.academic_period_id = ap.period_id
      WHERE fca.faculty_user_id = ?
      ORDER BY ap.school_year DESC, ap.semester DESC
    `,
      [facultyUserId]
    );
  },

  // Get assignments by academic period
  getByAcademicPeriod: (periodId) => {
    return db.query(
      `
      SELECT fca.*, 
             u.first_name, u.last_name, ed.employee_id,
             c.code as course_code, c.title as course_title, c.units
      FROM faculty_course_assignments fca
      INNER JOIN users u ON fca.faculty_user_id = u.user_id
      INNER JOIN employee_details ed ON u.user_id = ed.user_id
      INNER JOIN courses c ON fca.course_id = c.course_id
      WHERE fca.academic_period_id = ?
      ORDER BY c.code, fca.section
    `,
      [periodId]
    );
  },

  // Get assignment by ID
  getById: (assignmentId) => {
    return db.query(
      `
      SELECT fca.*, 
             u.first_name, u.last_name, u.email, ed.employee_id,
             c.code as course_code, c.title as course_title, c.units,
             ap.school_year, ap.semester
      FROM faculty_course_assignments fca
      INNER JOIN users u ON fca.faculty_user_id = u.user_id
      INNER JOIN employee_details ed ON u.user_id = ed.user_id
      INNER JOIN courses c ON fca.course_id = c.course_id
      INNER JOIN academic_periods ap ON fca.academic_period_id = ap.period_id
      WHERE fca.assignment_id = ?
    `,
      [assignmentId]
    );
  },

  // Create new assignment
  create: (assignmentData) => {
    return db.query(
      `INSERT INTO faculty_course_assignments 
       (faculty_user_id, course_id, academic_period_id, section, schedule_day, 
        schedule_time_start, schedule_time_end, room, max_students, 
        current_enrolled, assignment_status, assigned_date)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        assignmentData.faculty_user_id,
        assignmentData.course_id,
        assignmentData.academic_period_id,
        assignmentData.section,
        assignmentData.schedule_day,
        assignmentData.schedule_time_start,
        assignmentData.schedule_time_end,
        assignmentData.room,
        assignmentData.max_students,
        assignmentData.current_enrolled || 0,
        assignmentData.assignment_status || "active",
        assignmentData.assigned_date || new Date(),
      ]
    );
  },

  // Update assignment
  update: (assignmentId, assignmentData) => {
    return db.query(
      `UPDATE faculty_course_assignments SET
       faculty_user_id = ?, course_id = ?, academic_period_id = ?, section = ?,
       schedule_day = ?, schedule_time_start = ?, schedule_time_end = ?,
       room = ?, max_students = ?, current_enrolled = ?, assignment_status = ?
       WHERE assignment_id = ?`,
      [
        assignmentData.faculty_user_id,
        assignmentData.course_id,
        assignmentData.academic_period_id,
        assignmentData.section,
        assignmentData.schedule_day,
        assignmentData.schedule_time_start,
        assignmentData.schedule_time_end,
        assignmentData.room,
        assignmentData.max_students,
        assignmentData.current_enrolled,
        assignmentData.assignment_status,
        assignmentId,
      ]
    );
  },

  // Delete assignment
  delete: (assignmentId) => {
    return db.query(
      "DELETE FROM faculty_course_assignments WHERE assignment_id = ?",
      [assignmentId]
    );
  },

  // Check for schedule conflicts
  checkConflict: (
    facultyUserId,
    academicPeriodId,
    scheduleDay,
    timeStart,
    timeEnd,
    excludeAssignmentId = null
  ) => {
    let query = `
      SELECT * FROM faculty_course_assignments
      WHERE faculty_user_id = ? AND academic_period_id = ? AND schedule_day = ?
      AND assignment_status = 'active'
      AND (
        (schedule_time_start < ? AND schedule_time_end > ?)
        OR (schedule_time_start < ? AND schedule_time_end > ?)
        OR (schedule_time_start >= ? AND schedule_time_end <= ?)
      )
    `;

    const params = [
      facultyUserId,
      academicPeriodId,
      scheduleDay,
      timeEnd,
      timeStart,
      timeEnd,
      timeStart,
      timeStart,
      timeEnd,
    ];

    if (excludeAssignmentId) {
      query += " AND assignment_id != ?";
      params.push(excludeAssignmentId);
    }

    return db.query(query, params);
  },
};

export default FacultyCourseAssignment;
