import express from "express";
import {
    createProblem, getAllProblems,
    getProblemBySlug,
} from "../controllers/problemContoller.js";

const router = express.Router();

router.post("/", createProblem);
router.get("/", getAllProblems);
router.get("/:slug", getProblemBySlug);

export default router;