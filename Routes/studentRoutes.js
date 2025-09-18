import express from "express";
import { 
  completeChallenge, 
  submitQuiz, 
  getLeaderboard, 
  getStudentRank, 
  getStudentProfile,
  getStudentActivity,
  getStudentChallenges,
  getStudentQuizzes
} from "../controllers/studentController.js";
import { authMiddleware, roleMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

// Challenge and Quiz routes
router.get("/challenges", authMiddleware, roleMiddleware(["student"]), getStudentChallenges);
router.get("/quizzes", authMiddleware, roleMiddleware(["student"]), getStudentQuizzes);
router.post("/challenges/:id/complete", authMiddleware, roleMiddleware(["student"]), completeChallenge);
router.post("/quizzes/:id/submit", authMiddleware, roleMiddleware(["student"]), submitQuiz);

// Leaderboard and Profile routes
router.get("/leaderboard", authMiddleware, roleMiddleware(["student"]), getLeaderboard);
router.get("/rank", authMiddleware, roleMiddleware(["student"]), getStudentRank);
router.get("/profile", authMiddleware, roleMiddleware(["student"]), getStudentProfile);
router.get("/activity", authMiddleware, roleMiddleware(["student"]), getStudentActivity);

export default router;