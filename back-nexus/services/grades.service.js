import GradesModel from "../model/grades.model.js";

const GradesService = {
  getAllGrades: async (filters = {}) => {
    try {
      return await GradesModel.getAllGrades(filters);
    } catch (error) {
      throw new Error(`Error fetching grades: ${error.message}`);
    }
  },

  getGradeById: async (id) => {
    try {
      const grade = await GradesModel.getGradeById(id);
      if (!grade) {
        throw new Error("Grade not found");
      }
      return grade;
    } catch (error) {
      throw new Error(`Error fetching grade: ${error.message}`);
    }
  },

  createGrade: async (data) => {
    try {
      if (!data.student_user_id || !data.course_id || !data.period_id) {
        throw new Error("Student, Course, and Academic Period are required.");
      }
      return await GradesModel.create(data);
    } catch (error) {
      throw new Error(`Error creating grade: ${error.message}`);
    }
  },

  updateGrade: async (id, data) => {
    try {
      if (!id) {
        throw new Error("Grade ID is required for update.");
      }
      return await GradesModel.update(id, data);
    } catch (error) {
      throw new Error(`Error updating grade: ${error.message}`);
    }
  },

  deleteGrade: async (id) => {
    try {
      if (!id) {
        throw new Error("Grade ID is required for deletion.");
      }
      const deleted = await GradesModel.delete(id);
      if (!deleted) {
        throw new Error("Grade not found or already deleted.");
      }
      return { success: true };
    } catch (error) {
      throw new Error(`Error deleting grade: ${error.message}`);
    }
  },

  approveGrade: async (id, approvedBy) => {
    try {
      let studentId, courseId, periodId;

      if (String(id).includes("-")) {
        [studentId, courseId, periodId] = String(id).split("-");
      } else {
        const grade = await GradesModel.getGradeById(id);
        if (grade) {
          studentId = grade.student_user_id;
          courseId = grade.course_id;
          periodId = grade.period_id;
        }
      }

      if (studentId && courseId && periodId) {
        await GradesModel.approveAllEntriesFor(studentId, courseId, periodId, approvedBy);
        return await GradesModel.getGradeByComposite(studentId, courseId, periodId);
      }

      throw new Error("Invalid grade ID for approval");
    } catch (error) {
      throw new Error(`Error approving grade: ${error.message}`);
    }
  },

  bulkUpsertGrades: async (gradesList) => {
    try {
      return await GradesModel.bulkUpsertGrades(gradesList);
    } catch (error) {
      throw new Error(`Error saving report grades: ${error.message}`);
    }
  },
};

export default GradesService;