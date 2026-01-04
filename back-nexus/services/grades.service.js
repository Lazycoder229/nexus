import GradesModel from "../model/grades.model.js";

const GradesService = {
  getAllGrades: async (filters) => {
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

  createGrade: async (gradeData) => {
    try {
      if (
        !gradeData.student_user_id ||
        !gradeData.course_id ||
        !gradeData.period_id
      ) {
        throw new Error("Missing required fields");
      }

      const gradeId = await GradesModel.createGrade(gradeData);
      return await GradesModel.getGradeById(gradeId);
    } catch (error) {
      throw new Error(`Error creating grade: ${error.message}`);
    }
  },

  updateGrade: async (id, gradeData) => {
    try {
      const updated = await GradesModel.updateGrade(id, gradeData);
      if (!updated) {
        throw new Error("Grade not found or not updated");
      }
      return await GradesModel.getGradeById(id);
    } catch (error) {
      throw new Error(`Error updating grade: ${error.message}`);
    }
  },

  deleteGrade: async (id) => {
    try {
      const deleted = await GradesModel.deleteGrade(id);
      if (!deleted) {
        throw new Error("Grade not found");
      }
      return { message: "Grade deleted successfully" };
    } catch (error) {
      throw new Error(`Error deleting grade: ${error.message}`);
    }
  },

  approveGrade: async (id, approvedBy) => {
    try {
      const approved = await GradesModel.approveGrade(id, approvedBy);
      if (!approved) {
        throw new Error("Grade not found or already approved");
      }
      return await GradesModel.getGradeById(id);
    } catch (error) {
      throw new Error(`Error approving grade: ${error.message}`);
    }
  },
};

export default GradesService;
