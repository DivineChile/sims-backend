import express from "express";

import {
  generateResultSummary,
  generateAdminSummary,
  askAssistant,
} from "../controllers/aiController.js";

const router = express.Router();

router.post("/result-summary", generateResultSummary);
router.post("/admin-summary", generateAdminSummary);
router.post("/ask", askAssistant);

export default router;
