import GradesService from "../services/grades.service.js";

const GradesController = {
  getAllGrades: async (req, res) => {
    try {
      const filters = {
        grade_id: req.query.grade_id,
        student_user_id: req.query.student_user_id,
        course_id: req.query.course_id,
        period_id: req.query.period_id,
      };

      const grades = await GradesService.getAllGrades(filters);
      res.status(200).json(grades);
    } catch (error) {
      res.status(500).json({ message: error.message, error: error.message });
    }
  },

  getGradeById: async (req, res) => {
    try {
      const grade = await GradesService.getGradeById(req.params.id);
      res.status(200).json(grade);
    } catch (error) {
      res.status(404).json({ message: error.message, error: error.message });
    }
  },

  createGrade: async (req, res) => {
    try {
      const newGrade = await GradesService.createGrade(req.body);
      res.status(201).json(newGrade);
    } catch (error) {
      res.status(400).json({ message: error.message, error: error.message });
    }
  },

  updateGrade: async (req, res) => {
    try {
      const updatedGrade = await GradesService.updateGrade(req.params.id, req.body);
      res.status(200).json(updatedGrade);
    } catch (error) {
      res.status(400).json({ message: error.message, error: error.message });
    }
  },

  deleteGrade: async (req, res) => {
    try {
      await GradesService.deleteGrade(req.params.id);
      res.status(200).json({ message: "Grade deleted successfully" });
    } catch (error) {
      res.status(404).json({ message: error.message, error: error.message });
    }
  },

  // Bulk-approves all grade_entries and updates grade status for this student/course/period
  approveGrade: async (req, res) => {
    try {
      const grade = await GradesService.approveGrade(
        req.params.id,
        req.body.approved_by
      );
      res.status(200).json(grade);
    } catch (error) {
      res.status(400).json({ message: error.message, error: error.message });
    }
  },

  bulkUpsertGrades: async (req, res) => {
    try {
      const count = await GradesService.bulkUpsertGrades(req.body.grades);
      res.status(200).json({ message: `Successfully saved ${count} grade(s)`, count });
    } catch (error) {
      res.status(400).json({ message: error.message, error: error.message });
    }
  },
};

export default GradesController;