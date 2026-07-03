import express from "express";

import {
  createOrGetSession,
  getSessionByCourse,
  getSessionRecords,
  updateResultRecord,
  createBulkResults,
  getStudentResults,
} from "../controllers/resultsController.js";

const router = express.Router();

router.post("/session", createOrGetSession);
router.get("/session/course/:courseId", getSessionByCourse);
router.get("/session/:sessionId/records", getSessionRecords);

router.post("/submit", createBulkResults);
router.put("/record/:id", updateResultRecord);

router.get("/student/:studentId", getStudentResults);

export default router;
