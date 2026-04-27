import LMSAssignments from "../model/lmsAssignments.model.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenAI } from "@google/genai";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const AI_MODELS = [
  "gemini-2.0-flash-lite",
  "gemini-2.0-flash",
  "gemini-1.5-flash",
];

class AiCheckError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

const fetchSubmissionForAi = async ({ submissionId, assignmentId, studentId }) => {
  const db = (await import("../config/db.js")).default;
  let submission = null;

  if (submissionId) {
    const [rows] = await db.query(
      `SELECT las.*, la.total_points, la.title, la.model_answer
       FROM lms_assignment_submissions las
       JOIN lms_assignments la ON las.assignment_id = la.id
       WHERE las.id = ?`,
      [submissionId]
    );
    submission = rows[0] || null;
  }

  if (!submission && assignmentId && studentId) {
    const [rows] = await db.query(
      `SELECT las.*, la.total_points, la.title, la.model_answer
       FROM lms_assignment_submissions las
       JOIN lms_assignments la ON las.assignment_id = la.id
       WHERE las.assignment_id = ? AND las.student_id = ?`,
      [assignmentId, studentId]
    );
    submission = rows[0] || null;
  }

  return submission;
};

const extractSubmissionText = async (submission) => {
  let studentText = submission.submission_text || "";

  if (submission.file_url) {
    const filePath = path.join(__dirname, "../public", submission.file_url);
    if (fs.existsSync(filePath)) {
      const ext = path.extname(submission.file_name || submission.file_url).toLowerCase();
      try {
        if (ext === ".pdf") {
          const pdfParse = (await import("pdf-parse/lib/pdf-parse.js")).default;
          const buffer = fs.readFileSync(filePath);
          const pdfData = await pdfParse(buffer);
          studentText = pdfData.text || studentText;
        } else if (ext === ".docx" || ext === ".doc") {
          const mammoth = (await import("mammoth")).default;
          const result = await mammoth.extractRawText({ path: filePath });
          studentText = result.value || studentText;
        }
      } catch (parseErr) {
        console.warn("[AI Check] Could not parse file, using text fallback:", parseErr.message);
      }
    }
  }

  return studentText;
};

const runAiCheck = async ({ submission, modelAnswer }) => {
  if (!modelAnswer || !modelAnswer.trim()) {
    throw new AiCheckError(400, "Model answer is required for AI checking");
  }

  const studentText = await extractSubmissionText(submission);

  if (!studentText.trim()) {
    throw new AiCheckError(400, "No readable content found in the submission");
  }

  if (!process.env.GEMINI_API_KEY) {
    throw new AiCheckError(503, "AI checker requires GEMINI_API_KEY to be configured");
  }

  const totalPoints = submission.total_points || 100;
  const assignmentTitle = submission.title || "Assignment";

  const prompt = `You are a fair academic grader. Given the model answer and a student's submitted answer below, evaluate the student's work.

Assignment: "${assignmentTitle}"
Total Points: ${totalPoints}

Model Answer:
${modelAnswer}

Student's Answer:
${studentText}

Score the student's answer on a scale of 0 to ${totalPoints}. Consider correctness, completeness, and clarity.
Respond ONLY with valid JSON in this exact format (no markdown, no extra text):
{"score": <number>, "feedback": "<brief constructive feedback in 2-3 sentences>"}`;

  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  let aiResult = null;

  for (const modelName of AI_MODELS) {
    try {
      const response = await ai.models.generateContent({
        model: modelName,
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        config: { maxOutputTokens: 256, temperature: 0.2 },
      });

      const rawText = (response.text || "").trim();
      const jsonText = rawText.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim();
      aiResult = JSON.parse(jsonText);
      console.log(`[AI Check] Used model: ${modelName}`);
      break;
    } catch (err) {
      const shouldSkip =
        err.status === 429 ||
        err.status === 404 ||
        err.message?.includes("429") ||
        err.message?.includes("quota") ||
        err.message?.includes("not found");
      if (shouldSkip) {
        console.warn(`[AI Check] Skipping ${modelName}:`, err.message);
        continue;
      }
      if (err instanceof SyntaxError) {
        console.warn(`[AI Check] JSON parse error for ${modelName}, trying next model`);
        continue;
      }
      throw err;
    }
  }

  if (!aiResult || typeof aiResult.score === "undefined") {
    throw new AiCheckError(
      500,
      "AI could not generate a valid score. Please try again or grade manually."
    );
  }

  const clampedScore = Math.min(
    Math.max(Math.round(Number(aiResult.score) * 100) / 100, 0),
    totalPoints
  );

  return {
    score: clampedScore,
    feedback: aiResult.feedback || "",
  };
};

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
      let feedback = null;
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
      } else if (assignment?.model_answer?.trim()) {
        try {
          const submission = await fetchSubmissionForAi({ submissionId });
          if (submission) {
            const aiResult = await runAiCheck({
              submission,
              modelAnswer: assignment.model_answer,
            });

            await LMSAssignments.gradeSubmission(submissionId, {
              score: aiResult.score,
              feedback: aiResult.feedback,
              graded_by: null,
            });

            score = aiResult.score;
            feedback = aiResult.feedback;
          }
        } catch (error) {
          const message = error instanceof AiCheckError ? error.message : error.message || error;
          console.warn("[AI Check] Auto-grading skipped:", message);
        }
      }

      res.status(201).json({
        success: true,
        message: "Assignment submitted successfully",
        submissionId,
        score, // Return score to student
        feedback,
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
  // AI-assisted check of a student submission against a model answer
  aiCheckSubmission: async (req, res) => {
    try {
      const { submission_id } = req.params;
      const { model_answer, assignment_id, student_id } = req.body;

      const submission = await fetchSubmissionForAi({
        submissionId: submission_id,
        assignmentId: assignment_id,
        studentId: student_id,
      });

      if (!submission) {
        return res.status(404).json({ success: false, message: "Submission not found" });
      }

      const modelAnswer = model_answer?.trim() || submission.model_answer;
      const aiResult = await runAiCheck({ submission, modelAnswer });

      return res.json({
        success: true,
        score: aiResult.score,
        feedback: aiResult.feedback,
      });
    } catch (error) {
      console.error("Error in AI check submission:", error);
      const status = error instanceof AiCheckError ? error.status : 500;
      res.status(status).json({
        success: false,
        message:
          error instanceof AiCheckError
            ? error.message
            : "Failed to perform AI check",
        error: error.message,
      });
    }
  },
};
