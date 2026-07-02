import express from "express";

import {
  createFeeCategory,
  getFeeCategories,
  updateFeeCategory,
  deleteFeeCategory,
} from "../controllers/feeCategoryController.js";

const router = express.Router();

router.post("/", createFeeCategory);

router.get("/", getFeeCategories);

router.put("/:id", updateFeeCategory);

router.delete("/:id", deleteFeeCategory);

export default router;
