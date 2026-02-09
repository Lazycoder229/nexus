import LMSAssignments from "../model/lmsAssignments.model.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

  // Get assignments for a student based on their enrolled courses
  getByStudent: async (req, res) => {
    try {
      const { student_id, academic_period_id } = req.query;

      if (!student_id || !academic_period_id) {
        return res.status(400).json({
          success: false,
          message: "Student ID and Academic Period ID are required",
        });
      }

      const assignments = await LMSAssignments.getByStudent(
        student_id,
        academic_period_id
      );

      console.log(`[DEBUG] getByStudent results for student ${student_id}:`, assignments);

      res.status(200).json({
        success: true,
        assignments,
      });
    } catch (error) {
      console.error("Error fetching student assignments:", error);
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

  // Submit assignment / quiz
  submitAssignment: async (req, res) => {
    try {
      const submissionData = req.body;
      const { assignment_id, submission_text } = submissionData;

      // Check if it's a quiz to grade it automatically
      const assignment = await LMSAssignments.getById(assignment_id);

      let score = null;
      let status = 'submitted';

      if (assignment && assignment.assignment_type === 'quiz') {
        const questions = await LMSAssignments.getQuizQuestionsWithAnswers(assignment_id);
        const studentAnswers = JSON.parse(submission_text || "{}");

        let calculatedScore = 0;
        // let totalPoints = 0; // If we want to validate total points

        questions.forEach(q => {
          // totalPoints += q.points;
          if (studentAnswers[q.id] === q.correct_answer) {
            calculatedScore += q.points;
          }
        });

        score = calculatedScore;
        status = 'completed'; // Quizzes are completed instantly

        // Add score and status to submission data
        // We'll update the submission with these values
      }

      const submissionId = await LMSAssignments.submitAssignment({
        ...submissionData,
        status: status
      });

      // If graded, update the score immediately
      if (score !== null) {
        await LMSAssignments.gradeSubmission(submissionId, {
          score,
          feedback: 'Auto-graded quiz',
          graded_by: submissionData.student_id // Or system user ID if available
        });
      }

      res.status(201).json({
        success: true,
        message: "Assignment submitted successfully",
        submissionId,
        score, // Return score to student
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

  // Get quiz review (questions with answers, ONLY if submitted)
  getQuizReview: async (req, res) => {
    try {
      const { assignment_id } = req.params;
      const { student_id } = req.query;

      if (!student_id) {
        return res.status(400).json({
          success: false,
          message: "Student ID is required",
        });
      }

      // 1. Check if student has submitted
      // Note: Model parameter order is (assignment_id, student_id) based on previous view
      const submission = await LMSAssignments.getStudentSubmission(assignment_id, student_id);

      // Check for valid status variants
      if (!submission || (submission.status !== 'submitted' && submission.status !== 'graded' && submission.status !== 'completed')) {
        return res.status(403).json({
          success: false,
          message: "You must submit the quiz before reviewing results.",
        });
      }

      // 2. Fetch questions WITH answers
      const questions = await LMSAssignments.getQuizQuestionsWithAnswers(assignment_id);

      res.status(200).json({
        success: true,
        questions,
      });
    } catch (error) {
      console.error("Error fetching quiz review:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch quiz review",
        error: error.message,
      });
    }
  },

  // Upload assignment file
  uploadFile: async (req, res) => {
    try {
      const { file_base64, file_name } = req.body;

      if (!file_base64 || !file_name) {
        return res.status(400).json({
          success: false,
          message: "File content and name are required",
        });
      }

      // Remove header if present (e.g., "data:application/pdf;base64,")
      const base64Data = file_base64.replace(/^data:.+;base64,/, "");
      const buffer = Buffer.from(base64Data, "base64");

      const uploadDir = path.join(__dirname, "../public/uploads/assignments");
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      // Create unique filename
      const uniqueFilename = `${Date.now()}-${file_name.replace(/\s+/g, "-")}`;
      const filepath = path.join(uploadDir, uniqueFilename);

      fs.writeFileSync(filepath, buffer);

      const fileUrl = `/uploads/assignments/${uniqueFilename}`;

      res.status(200).json({
        success: true,
        message: "File uploaded successfully",
        file_url: fileUrl,
      });
    } catch (error) {
      console.error("Error uploading file:", error);
      res.status(500).json({
        success: false,
        message: "Failed to upload file",
        error: error.message,
      });
    }
  },
};

export default lmsAssignmentsController;
