import express from "express";
import { runCode,submitSolution } from "../controllers/submissionController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/run",protect, runCode);
router.post("/submit", protect, submitSolution);
export default router;