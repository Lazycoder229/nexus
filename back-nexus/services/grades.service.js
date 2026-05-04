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

      // Check if grade already exists for this student, course, and period
      const existingGrades = await GradesModel.getAllGrades({
        student_user_id: gradeData.student_user_id,
        course_id: gradeData.course_id,
        period_id: gradeData.period_id,
      });

      if (existingGrades.length > 0) {
        throw new Error(
          "A grade already exists for this student, course, and academic period. Please edit the existing grade instead.",
        );
      }

      const gradeId = await GradesModel.createGrade(gradeData);
      return await GradesModel.getGradeById(gradeId);
    } catch (error) {
      throw new Error(`Error creating grade: ${error.message}`);
    }
  },

  createBulkGrades: async (gradesData) => {
    try {
      if (!Array.isArray(gradesData) || gradesData.length === 0) {
        throw new Error("No grades provided");
      }

      const createdGrades = [];
      const errors = [];

      for (const gradeData of gradesData) {
        try {
          const validWrittenOutput = Array.isArray(gradeData.writtenOutput)
            ? gradeData.writtenOutput.filter((score) => score !== null && score !== "")
            : [];
          const validPerformanceTasks = Array.isArray(gradeData.performanceTasks)
            ? gradeData.performanceTasks.filter((score) => score !== null && score !== "")
            : [];

          const writtenOutputAverage = validWrittenOutput.length
            ? validWrittenOutput.reduce((sum, score) => sum + Number(score), 0) / validWrittenOutput.length
            : 0;
          const performanceTasksAverage = validPerformanceTasks.length
            ? validPerformanceTasks.reduce((sum, score) => sum + Number(score), 0) / validPerformanceTasks.length
            : 0;

          const processedData = {
            student_user_id: gradeData.studentId,
            course_id: gradeData.courseId,
            final_score: gradeData.finalGrade,
            letter_grade: gradeData.letterGrade,
            weighted_output_score: writtenOutputAverage * 0.3,
            weighted_performance_score: performanceTasksAverage * 0.3,
            midterm_exam_score: gradeData.midtermExam,
            components_json: JSON.stringify({
              writtenOutput: gradeData.writtenOutput,
              performanceTasks: gradeData.performanceTasks,
              midtermExam: gradeData.midtermExam,
            }),
            status: "submitted",
          };

          const gradeId = await GradesModel.createGrade(processedData);
          createdGrades.push(gradeId);
        } catch (error) {
          errors.push({
            studentId: gradeData.studentId,
            error: error.message,
          });
        }
      }

      return {
        success: true,
        created: createdGrades.length,
        failed: errors.length,
        errors: errors.length > 0 ? errors : undefined,
        message: `Successfully created ${createdGrades.length} grades${errors.length > 0 ? ` with ${errors.length} errors` : ""}`,
      };
    } catch (error) {
      throw new Error(`Error creating bulk grades: ${error.message}`);
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
