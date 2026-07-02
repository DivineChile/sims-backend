import express from "express";

import {
  assignFeeStructure,
  getStudentFees,
  getStudentFeeSummary,
} from "../controllers/studentFeeController.js";

const router = express.Router();

router.post("/assign", assignFeeStructure);

router.get("/student/:studentId", getStudentFees);

router.get("/summary/:studentId", getStudentFeeSummary);

export default router;
