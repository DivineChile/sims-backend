import express from "express";

import {
  registerCourse,
  getStudentCourses,
  deleteRegistration,
  getAllRegistrations,
} from "../controllers/courseRegistrationController.js";

const router = express.Router();

// student actions
router.post("/", registerCourse);
router.get("/student/:student_id", getStudentCourses);
router.delete("/:id", deleteRegistration);

// admin view
router.get("/", getAllRegistrations);

export default router;