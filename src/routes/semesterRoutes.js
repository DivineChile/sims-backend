import express from "express";

import {
  getSemesters,
  createSemester,
  updateSemester,
  deleteSemester,
} from "../controllers/semesterController.js";

const router = express.Router();

router.get("/", getSemesters);
router.post("/", createSemester);
router.put("/:id", updateSemester);
router.delete("/:id", deleteSemester);

export default router;