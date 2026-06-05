import express from "express";
import {
  createLecturer,
  getLecturers,
  updateLecturer,
  deleteLecturer,
} from "../controllers/lecturerController.js";

const router = express.Router();

router.post("/", createLecturer);
router.get("/", getLecturers);
router.put("/:id", updateLecturer);
router.delete("/:id", deleteLecturer);

export default router;