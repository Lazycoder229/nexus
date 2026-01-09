import LMSAssignments from "../model/lmsAssignments.model.js";

const lmsAssignmentsController = {
  // Create new assignment
  create: async (req, res) => {
    try {
      const assignmentData = req.body;
      const assignmentId = await LMSAssignments.create(assignmentData);

      res.status(201).json({
        success: true,
        message: "Assignment created successfully",
        assignmentId,
      });
    } catch (error) {
      console.error("Error creating assignment:", error);
      res.status(500).json({
        success: false,
        message: "Failed to create assignment",
        error: error.message,
      });
    }
  },

  // Get assignments by faculty
  getByFaculty: async (req, res) => {
    try {
      const { faculty_id, academic_period_id } = req.query;

      if (!faculty_id || !academic_period_id) {
        return res.status(400).json({
          success: false,
          message: "Faculty ID and Academic Period ID are required",
        });
      }

      const assignments = await LMSAssignments.getByFaculty(
        faculty_id,
        academic_period_id
      );

      res.status(200).json({
        success: true,
        assignments,
      });
    } catch (error) {
      console.error("Error fetching assignments:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch assignments",
        error: error.message,
      });
    }
  },

  // Get assignments by section
  getBySection: async (req, res) => {
    try {
      const { section_id, academic_period_id } = req.query;

      if (!section_id || !academic_period_id) {
        return res.status(400).json({
          success: false,
          message: "Section ID and Academic Period ID are required",
        });
      }

      const assignments = await LMSAssignments.getBySection(
        section_id,
        academic_period_id
      );

      res.status(200).json({
        success: true,
        assignments,
      });
    } catch (error) {
      console.error("Error fetching assignments:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch assignments",
        error: error.message,
      });
    }
  },

  // Get assignment by ID
  getById: async (req, res) => {
    try {
      const { id } = req.params;

      const assignment = await LMSAssignments.getById(id);

      if (!assignment) {
        return res.status(404).json({
          success: false,
          message: "Assignment not found",
        });
      }

      res.status(200).json({
        success: true,
        assignment,
      });
    } catch (error) {
      console.error("Error fetching assignment:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch assignment",
        error: error.message,
      });
    }
  },

  // Update assignment
  update: async (req, res) => {
    try {
      const { id } = req.params;
      const updateData = req.body;

      const updated = await LMSAssignments.update(id, updateData);

      if (!updated) {
        return res.status(404).json({
          success: false,
          message: "Assignment not found",
        });
      }

      res.status(200).json({
        success: true,
        message: "Assignment updated successfully",
      });
    } catch (error) {
      console.error("Error updating assignment:", error);
      res.status(500).json({
        success: false,
        message: "Failed to update assignment",
        error: error.message,
      });
    }
  },

  // Delete assignment
  delete: async (req, res) => {
    try {
      const { id } = req.params;

      const deleted = await LMSAssignments.delete(id);

      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: "Assignment not found",
        });
      }

      res.status(200).json({
        success: true,
        message: "Assignment deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting assignment:", error);
      res.status(500).json({
        success: false,
        message: "Failed to delete assignment",
        error: error.message,
      });
    }
  },

  // Submit assignment
  submitAssignment: async (req, res) => {
    try {
      const submissionData = req.body;

      const submissionId = await LMSAssignments.submitAssignment(submissionData);

      res.status(201).json({
        success: true,
        message: "Assignment submitted successfully",
        submissionId,
      });
    } catch (error) {
      console.error("Error submitting assignment:", error);
      res.status(500).json({
        success: false,
        message: "Failed to submit assignment",
        error: error.message,
      });
    }
  },

  // Get submissions
  getSubmissions: async (req, res) => {
    try {
      const { assignment_id } = req.params;

      const submissions = await LMSAssignments.getSubmissions(assignment_id);

      res.status(200).json({
        success: true,
        submissions,
      });
    } catch (error) {
      console.error("Error fetching submissions:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch submissions",
        error: error.message,
      });
    }
  },

  // Grade submission
  gradeSubmission: async (req, res) => {
    try {
      const { submission_id } = req.params;
      const gradeData = req.body;

      const graded = await LMSAssignments.gradeSubmission(submission_id, gradeData);

      if (!graded) {
        return res.status(404).json({
          success: false,
          message: "Submission not found",
        });
      }

      res.status(200).json({
        success: true,
        message: "Submission graded successfully",
      });
    } catch (error) {
      console.error("Error grading submission:", error);
      res.status(500).json({
        success: false,
        message: "Failed to grade submission",
        error: error.message,
      });
    }
  },

  // Get student submission
  getStudentSubmission: async (req, res) => {
    try {
      const { assignment_id, student_id } = req.query;

      if (!assignment_id || !student_id) {
        return res.status(400).json({
          success: false,
          message: "Assignment ID and Student ID are required",
        });
      }

      const submission = await LMSAssignments.getStudentSubmission(
        assignment_id,
        student_id
      );

      res.status(200).json({
        success: true,
        submission,
      });
    } catch (error) {
      console.error("Error fetching submission:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch submission",
        error: error.message,
      });
    }
  },

  // Create quiz question
  createQuizQuestion: async (req, res) => {
    try {
      const questionData = req.body;

      const questionId = await LMSAssignments.createQuizQuestion(questionData);

      res.status(201).json({
        success: true,
        message: "Quiz question created successfully",
        questionId,
      });
    } catch (error) {
      console.error("Error creating quiz question:", error);
      res.status(500).json({
        success: false,
        message: "Failed to create quiz question",
        error: error.message,
      });
    }
  },

  // Get quiz questions
  getQuizQuestions: async (req, res) => {
    try {
      const { assignment_id } = req.params;

      const questions = await LMSAssignments.getQuizQuestions(assignment_id);

      res.status(200).json({
        success: true,
        questions,
      });
    } catch (error) {
      console.error("Error fetching quiz questions:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch quiz questions",
        error: error.message,
      });
    }
  },
};

export default lmsAssignmentsController;
