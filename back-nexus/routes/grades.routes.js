import express from "express";
import GradesController from "../controllers/grades.controller.js";

const router = express.Router();

// GET all grades (combines grades table and live-computed grade_entries)
router.get("/", GradesController.getAllGrades);

// POST create/add a new grade
router.post("/", GradesController.createGrade);

// POST bulk-upsert grades (from faculty report sheet)
router.post("/bulk/upsert", GradesController.bulkUpsertGrades);

// GET one grade by id or composite key "{student_id}-{course_id}-{period_id}"
router.get("/:id", GradesController.getGradeById);

// PUT update a grade by id
router.put("/:id", GradesController.updateGrade);

// DELETE a grade by id
router.delete("/:id", GradesController.deleteGrade);

// POST approve grade for this student/course/period
router.post("/:id/approve", GradesController.approveGrade);

export default router;