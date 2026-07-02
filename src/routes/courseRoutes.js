import express from "express";
import {
  createCourse,
  getCourses,
  getCourseById,
  updateCourse,
  deleteCourse,
  getAvailableCourses,
} from "../controllers/courseController.js";

const router = express.Router();

router.post("/", createCourse);
router.get("/", getCourses);
router.get("/:id", getCourseById);
router.get("/available/:studentId", getAvailableCourses);
router.put("/:id", updateCourse);
router.delete("/:id", deleteCourse);

export default router;