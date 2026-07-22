import express from "express";
import cors from "cors";

import userRoutes from "./routes/userRoutes.js";
import studentRoutes from "./routes/studentRoutes.js";
import lecturerRoutes from "./routes/lecturerRoutes.js";
import courseRoutes from "./routes/courseRoutes.js";
import departmentRoutes from "./routes/departmentRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import academicRoutes from "./routes/academicRoutes.js";
import semesterRoutes from "./routes/semesterRoutes.js";
import courseRegistrationRoutes from "./routes/courseRegistrationRoutes.js";
import courseAssignmentRoutes from "./routes/courseAssignmentRoutes.js";
import attendanceRoutes from "./routes/attendanceRoutes.js";
import feeCategoryRoutes from "./routes/feeCategoryRoutes.js";
import studentFeeRoutes from "./routes/studentFeeRoutes.js";
import resultsRoutes from "./routes/resultsRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";
import analyticsRoutes from "./routes/analyticsRoutes.js";

const app = express();

app.use(cors());
app.use(express.json());

// ROUTES
app.use("/api/users", userRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/lecturers", lecturerRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/course-registrations", courseRegistrationRoutes);
app.use("/api/departments", departmentRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/academic", academicRoutes);
app.use("/api/semesters", semesterRoutes);
app.use("/api/course-assignments", courseAssignmentRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/fee-categories", feeCategoryRoutes);
app.use("/api/student-fees", studentFeeRoutes);
app.use("/api/results", resultsRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/analytics", analyticsRoutes);

export default app;
