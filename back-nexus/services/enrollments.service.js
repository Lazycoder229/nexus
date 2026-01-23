// services/enrollments.service.js
import * as enrollmentModel from "../model/enrollments.model.js";

// Get all enrollments
export const listEnrollments = async () => {
  return await enrollmentModel.getAllEnrollments();
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
  // Check if enrollment already exists
  const exists = await enrollmentModel.checkEnrollmentExists(
    data.student_id,
    data.course_id,
    data.period_id,
    data.section_id, // add section_id to uniqueness check if you update the unique index
  );

  if (exists) {
    throw new Error(
      "Student is already enrolled in this course for this academic period and section",
    );
  }

  const enrollment = await enrollmentModel.createEnrollment(data);

  // Increment current_enrolled in sections table
  if (data.section_id) {
    await import("../model/sections.model.js").then(
      ({ default: SectionsModel }) =>
        SectionsModel.updateEnrollmentCount(data.section_id, true),
    );
  }

  return enrollment;
};

// Update enrollment
export const editEnrollment = async (id, data) => {
  // Verify enrollment exists
  await getEnrollment(id);

  return await enrollmentModel.updateEnrollment(id, data);
};

// Delete enrollment
export const removeEnrollment = async (id) => {
  // Verify enrollment exists
  await getEnrollment(id);

  return await enrollmentModel.deleteEnrollment(id);
};
