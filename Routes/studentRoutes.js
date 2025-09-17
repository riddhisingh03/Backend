import express from "express";
import { completeChallenge, submitQuiz } from "../controllers/studentController.js";
import { authMiddleware, roleMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/challenges/:id/complete", authMiddleware, roleMiddleware(["student"]), completeChallenge);
router.post("/quizzes/:id/submit", authMiddleware, roleMiddleware(["student"]), submitQuiz);

export default router;