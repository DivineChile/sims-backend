import express from "express";
import { createUser } from "../controllers/authController.js";

const router = express.Router();

// Admin creates users
router.post("/create-user", createUser);

export default router;