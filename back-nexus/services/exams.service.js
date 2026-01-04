import ExamsModel from "../model/exams.model.js";

const ExamsService = {
  getAllExams: async (filters) => {
    try {
      const exams = await ExamsModel.getAll(filters);
      return { success: true, data: exams };
    } catch (error) {
      console.error("Error in getAllExams service:", error);
      throw error;
    }
  },

  getExamById: async (examId) => {
    try {
      const exam = await ExamsModel.getById(examId);
      if (!exam) {
        return { success: false, message: "Exam not found" };
      }
      return { success: true, data: exam };
    } catch (error) {
      console.error("Error in getExamById service:", error);
      throw error;
    }
  },

  createExam: async (examData) => {
    try {
      const examId = await ExamsModel.create(examData);
      return { success: true, examId, message: "Exam created successfully" };
    } catch (error) {
      console.error("Error in createExam service:", error);
      throw error;
    }
  },

  updateExam: async (examId, examData) => {
    try {
      const affectedRows = await ExamsModel.update(examId, examData);
      if (affectedRows === 0) {
        return { success: false, message: "Exam not found or no changes made" };
      }
      return { success: true, message: "Exam updated successfully" };
    } catch (error) {
      console.error("Error in updateExam service:", error);
      throw error;
    }
  },

  deleteExam: async (examId) => {
    try {
      const affectedRows = await ExamsModel.delete(examId);
      if (affectedRows === 0) {
        return { success: false, message: "Exam not found" };
      }
      return { success: true, message: "Exam deleted successfully" };
    } catch (error) {
      console.error("Error in deleteExam service:", error);
      throw error;
    }
  },

  getExamsByFaculty: async (facultyId) => {
    try {
      const exams = await ExamsModel.getByFaculty(facultyId);
      return { success: true, data: exams };
    } catch (error) {
      console.error("Error in getExamsByFaculty service:", error);
      throw error;
    }
  },
};

export default ExamsService;
