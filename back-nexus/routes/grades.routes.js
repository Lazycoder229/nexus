import express from "express";
import GradesController from "../controllers/grades.controller.js";

const router = express.Router();

// GET all grades with optional filters
router.get("/", GradesController.getAllGrades);

// GET grade by ID
router.get("/:id", GradesController.getGradeById);

// POST create new grade
router.post("/", GradesController.createGrade);

// POST create bulk grades
router.post("/bulk/create", GradesController.createBulkGrades);

// PUT update grade
router.put("/:id", GradesController.updateGrade);

// DELETE grade
router.delete("/:id", GradesController.deleteGrade);

// POST approve grade
router.post("/:id/approve", GradesController.approveGrade);

export default router;
