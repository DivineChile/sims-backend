import express from "express";
import { getAdminStats } from "../controllers/dashboardController.js";

const router = express.Router();

router.get("/admin-stats", getAdminStats);

export default router;