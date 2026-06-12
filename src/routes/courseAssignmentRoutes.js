import express from "express";

import {
  getAllAssignments,
  getLecturerAssignments,
  assignCourse,
  updateAssignment,
  deleteAssignment,
} from "../controllers/courseAssignmentController.js";

const router = express.Router();

router.get("/", getAllAssignments);
router.get("/lecturer/:userId", getLecturerAssignments);
router.post("/", assignCourse);
router.put("/:id", updateAssignment);
router.delete("/:id", deleteAssignment);

export default router;