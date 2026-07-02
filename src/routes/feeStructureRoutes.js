import express from "express";

import {
  createFeeStructure,
  getFeeStructures,
  getFeeStructure,
  updateFeeStructure,
  deleteFeeStructure,
} from "../controllers/feeStructureController.js";

const router = express.Router();

router.post("/", createFeeStructure);

router.get("/", getFeeStructures);

router.get("/:id", getFeeStructure);

router.put("/:id", updateFeeStructure);

router.delete("/:id", deleteFeeStructure);

export default router;
