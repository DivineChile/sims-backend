import express from "express";

import {
  createAttendanceSession,
  getSessionStudents,
  markAttendance,
  getCourseAttendanceHistory,
  getLecturerCourses,
  getCourseStudents,
  getStudentAttendance,
} from "../controllers/attendanceController.js";

const router = express.Router();

router.post(
  "/session",
  createAttendanceSession
);

router.get(
  "/session/:attendanceId/students",
  getSessionStudents
);

router.post(
  "/mark",
  markAttendance
);

router.get(
  "/course/:courseId/sessions",
  getCourseAttendanceHistory
);

router.get(
  "/course/:courseId/students",
  getCourseStudents
);

router.get(
  "/lecturer/:lecturerId/courses",
  getLecturerCourses
);

router.get("/student/:studentId", getStudentAttendance);

export default router;