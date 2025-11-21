import express from "express";
import controller from "../controllers/analysis.controller.js";
const router = express.Router();

router.get("/analyze/:userId", controller.analyzeConsumption);
router.get("/trends/:userId", controller.getWeeklyTrends);
router.get("/waste-prediction/:userId", controller.predictWaste);
router.get("/heatmap/:userId", controller.getHeatmapData);
router.get("/insights/:userId", controller.getComprehensiveInsights);

export default router;
