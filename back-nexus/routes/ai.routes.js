import express from "express";
import { chatWithNexusAI } from "../controllers/ai.controller.js";
import { getTrainingMetrics } from "../controllers/aiTrainingMetrics.controller.js";

const router = express.Router();

router.post("/ai/chat", chatWithNexusAI);
router.get("/ai/training-metrics", getTrainingMetrics);

export default router;
