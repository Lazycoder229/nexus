import express from "express";
import AbsenteeAlertsController from "../controllers/absenteeAlerts.controller.js";

const router = express.Router();

// GET all absentee alerts
router.get("/", AbsenteeAlertsController.getAllAbsenteeAlerts);

// GET alert statistics
router.get("/statistics", AbsenteeAlertsController.getAlertStatistics);

// GET absentee alert by ID
router.get("/:id", AbsenteeAlertsController.getAbsenteeAlertById);

// POST create new absentee alert
router.post("/", AbsenteeAlertsController.createAbsenteeAlert);

// PUT update absentee alert
router.put("/:id", AbsenteeAlertsController.updateAbsenteeAlert);

// PATCH acknowledge alert
router.patch("/:id/acknowledge", AbsenteeAlertsController.acknowledgeAlert);

// PATCH resolve alert
router.patch("/:id/resolve", AbsenteeAlertsController.resolveAlert);

// DELETE absentee alert
router.delete("/:id", AbsenteeAlertsController.deleteAbsenteeAlert);

export default router;
