import express from "express";
import {
  createCourse,
  getCourses,
  updateCourse,
  deleteCourse,
  getAvailableCourses,
} from "../controllers/courseController.js";

const router = express.Router();

router.post("/", createCourse);
router.get("/", getCourses);
router.get("/available/:studentId", getAvailableCourses);
router.put("/:id", updateCourse);
router.delete("/:id", deleteCourse);

export default router;