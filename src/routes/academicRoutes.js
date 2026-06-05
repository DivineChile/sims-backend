import express from "express";

import {
  getActiveSession,
  getActiveSemester,

  getSessions,
  createSession,
  setActiveSession,

  getSemesters,
  setActiveSemester,
} from "../controllers/academicController.js";

const router = express.Router();


// =============================
// ACTIVE CONTEXT (EXISTING)
// =============================
router.get("/active-session", getActiveSession);
router.get("/active-semester", getActiveSemester);


// =============================
// SESSIONS
// =============================
router.get("/sessions", getSessions);
router.post("/sessions", createSession);
router.put("/sessions/:id/activate", setActiveSession);


// =============================
// SEMESTERS
// =============================
router.get("/semesters", getSemesters);
router.put("/semesters/:id/activate", setActiveSemester);


export default router;