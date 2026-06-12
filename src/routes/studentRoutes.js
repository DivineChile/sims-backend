import express from "express";
import {
  createStudent,
  getStudents,
  getCurrentStudent,
  updateStudent,
  deleteStudent,
} from "../controllers/studentController.js";

const router = express.Router();

router.get("/", getStudents);
router.get("/me/:userId", getCurrentStudent);
router.post("/", createStudent);
router.put("/:id", updateStudent);
router.delete("/:id", deleteStudent);

export default router;