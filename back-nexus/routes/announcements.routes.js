import express from "express";
import AnnouncementsController from "../controllers/announcements.controller.js";

const router = express.Router();

router.get("/", AnnouncementsController.getAll);
router.get("/statistics", AnnouncementsController.getStatistics);
router.get("/:id", AnnouncementsController.getById);
router.post("/", AnnouncementsController.create);
router.put("/:id", AnnouncementsController.update);
router.delete("/:id", AnnouncementsController.delete);

export default router;
