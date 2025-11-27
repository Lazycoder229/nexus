// routes/academicHistory.routes.js
import express from "express";
import {
  getAllAcademicHistory,
  getHistoryByStudent,
  getHistoryById,
  createHistory,
  updateHistory,
  deleteHistory,
} from "../controllers/academicHistory.controller.js";

const router = express.Router();

router.get("/academic-history", getAllAcademicHistory);
router.get("/academic-history/student/:studentId", getHistoryByStudent);
router.get("/academic-history/:id", getHistoryById);
router.post("/academic-history", createHistory);
router.put("/academic-history/:id", updateHistory);
router.delete("/academic-history/:id", deleteHistory);

export default router;
