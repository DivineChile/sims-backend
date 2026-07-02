import express from "express";
import {
  createLecturer,
  getLecturers,
  updateLecturer,
  deleteLecturer,
  getLecturerDashboard,
  getLecturerByUser,
  getLecturerProfile
} from "../controllers/lecturerController.js";

const router = express.Router();

router.post("/", createLecturer);
router.get("/", getLecturers);
router.put("/:id", updateLecturer);
router.delete("/:id", deleteLecturer);
router.get("/dashboard/:lecturerId", getLecturerDashboard);
router.get("/by-user/:userId", getLecturerByUser);
router.get("/profile/:userId", getLecturerProfile);

export default router;