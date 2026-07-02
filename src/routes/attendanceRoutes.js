import express from "express";

import {
  createAttendanceSession,
  getSessionStudents,
  markAttendance,
  getCourseAttendanceHistory,
  getLecturerCourses,
  getCourseStudents,
  getStudentAttendance,
  bulkMarkAttendance,
  getLecturerAttendance,
  getAttendanceSessionDetails,
  updateAttendanceRecord,
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

router.post(
  "/records/bulk",
  bulkMarkAttendance
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

// lecturer history
router.get(
"/lecturer/user/:userId",
getLecturerAttendance
);

// session details
router.get(
"/session/:sessionId",
getAttendanceSessionDetails
);


// edit attendance
router.put(
"/record/:id",
updateAttendanceRecord
);



export default router;