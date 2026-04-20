// services/enrollments.service.js
import * as enrollmentModel from "../model/enrollments.model.js";

// Validate and clean enrollment data
const validateEnrollmentData = (data) => {
  const errors = [];

  // Check required fields
  if (!data.student_id) errors.push("Student ID is required");
  if (!data.course_id) errors.push("Course ID is required");
  if (!data.period_id) errors.push("Academic Period ID is required");
  if (!data.section_id) errors.push("Section ID is required");
  if (!data.year_level) errors.push("Year Level is required");
  if (!data.enrollment_date) errors.push("Enrollment Date is required");

  if (errors.length > 0) {
    throw new Error(errors.join(", "));
  }

  // Clean numeric fields - convert empty strings/invalid values to null
  const cleanData = {
    ...data,
    midterm_grade: data.midterm_grade === "" || data.midterm_grade === null ? null : parseFloat(data.midterm_grade),
    final_grade: data.final_grade === "" || data.final_grade === null ? null : parseFloat(data.final_grade),
  };

  // Validate grades are valid numbers if provided
  if (cleanData.midterm_grade !== null && (isNaN(cleanData.midterm_grade) || cleanData.midterm_grade < 0 || cleanData.midterm_grade > 100)) {
    throw new Error("Midterm Grade must be a valid number between 0 and 100");
  }
  if (cleanData.final_grade !== null && (isNaN(cleanData.final_grade) || cleanData.final_grade < 0 || cleanData.final_grade > 100)) {
    throw new Error("Final Grade must be a valid number between 0 and 100");
  }

  return cleanData;
};

// Get all enrollments
export const listEnrollments = async (filters = {}) => {
  return await enrollmentModel.getAllEnrollments(filters);
};

// Get enrollments by student
export const listEnrollmentsByStudent = async (studentId) => {
  return await enrollmentModel.getEnrollmentsByStudent(studentId);
};

// Get single enrollment
export const getEnrollment = async (id) => {
  const enrollment = await enrollmentModel.getEnrollmentById(id);
  if (!enrollment) throw new Error("Enrollment not found");
  return enrollment;
};

// Create new enrollment
import db from "../config/db.js";

export const addEnrollment = async (data) => {
  // Validate and clean data
  const cleanData = validateEnrollmentData(data);

  // Check if enrollment already exists
  const exists = await enrollmentModel.checkEnrollmentExists(
    cleanData.student_id,
    cleanData.course_id,
    cleanData.period_id,
    cleanData.section_id,
  );

  if (exists) {
    throw new Error(
      "Student is already enrolled in this course for this academic period and section",
    );
  }

  const enrollment = await enrollmentModel.createEnrollment(cleanData);

  // Increment current_enrolled in sections table
  if (cleanData.section_id) {
    await import("../model/sections.model.js").then(
      ({ default: SectionsModel }) =>
        SectionsModel.updateEnrollmentCount(cleanData.section_id, true),
    );
  }

  // Update admission status to "Enrolled" when student is first enrolled
  try {
    // Get the student's email first
    const [userResult] = await db.query(
      `SELECT email FROM users WHERE user_id = ?`,
      [cleanData.student_id],
    );

    if (userResult && userResult.length > 0) {
      const studentEmail = userResult[0].email;
      
      // Update admission status to "Enrolled" for this student
      await db.query(
        `UPDATE admissions SET status = 'Enrolled' WHERE email = ? AND status = 'Accepted'`,
        [studentEmail],
      );
    }
  } catch (err) {
    console.error("Error updating admission status:", err);
    // Don't throw error - enrollment was already created successfully
  }

  return enrollment;
};

// Update enrollment
export const editEnrollment = async (id, data) => {
  // Validate and clean data
  const cleanData = validateEnrollmentData(data);

  // Verify enrollment exists
  await getEnrollment(id);

  return await enrollmentModel.updateEnrollment(id, cleanData);
};

// Delete enrollment
export const removeEnrollment = async (id) => {
  // Verify enrollment exists
  await getEnrollment(id);

  return await enrollmentModel.deleteEnrollment(id);
};

// Get enrolled students by faculty assignment ID
export const listStudentsByAssignment = async (assignmentId) => {
  return await enrollmentModel.getStudentsByAssignment(assignmentId);
};
