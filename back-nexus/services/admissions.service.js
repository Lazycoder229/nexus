// services/admissions.service.js
import * as admissionModel from "../model/admissions.model.js";

export const listAdmissions = async () => {
  return await admissionModel.getAllAdmissions();
};

export const getAdmission = async (id) => {
  const admission = await admissionModel.getAdmissionById(id);
  if (!admission) throw new Error("Admission not found");
  return admission;
};

export const addAdmission = async (data) => {
  return await admissionModel.createAdmission(data);
};

export const editAdmission = async (id, data) => {
  await getAdmission(id);
  const admission = await admissionModel.updateAdmission(id, data);

  // If status is 'Enrolled', enroll student in default subjects
  if (data.status === "Enrolled") {
    // Find student_id and program from admission
    const student_id =
      admission.student_id || admission.user_id || admission.id;
    const program =
      admission.program_applied ||
      admission.program_to_enroll ||
      admission.program_name;

    // Fetch all courses
    const coursesModel = await import("../model/courses.model.js");
    const allCourses = await coursesModel.getAllCourses();

    // Filter for first-year, first-semester courses for the program
    const defaultCourses = allCourses.filter(
      (course) =>
        (course.department_name === program ||
          course.program_name === program ||
          course.name === program) &&
        (course.year_level === 1 || course.year_level === "1st Year") &&
        (course.semester === "1st Semester" || course.semester === 1),
    );

    // You may need to adjust the filter depending on your schema

    // Get current academic period (you may need to adjust this logic)
    let period_id = null;
    try {
      const academicPeriodsModel =
        await import("../model/academic_periods.model.js");
      const periods = await academicPeriodsModel.getAllAcademicPeriods();
      const currentPeriod = periods.find(
        (p) => p.is_active || p.status === "Active",
      );
      if (currentPeriod) period_id = currentPeriod.period_id;
    } catch (e) {
      // fallback or log error
    }

    // Enroll student in each course
    const enrollmentsService = await import("./enrollments.service.js");
    for (const course of defaultCourses) {
      await enrollmentsService.addEnrollment({
        student_id,
        course_id: course.id || course.course_id,
        period_id,
        year_level: 1,
        enrollment_date: new Date(),
        status: "Enrolled",
      });
    }
  }

  return admission;
};

export const removeAdmission = async (id) => {
  await getAdmission(id);
  return await admissionModel.deleteAdmission(id);
};
