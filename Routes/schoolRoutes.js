import express from "express";
import { 
  createActivity, 
  listActivities, 
  getRegisteredSchools, 
  getSchoolDashboard,
  createChallenge,
  createQuiz,
  getSchoolChallenges,
  getSchoolQuizzes,
  getChallengeStats,
  getQuizStats,
  generateSchoolReport
} from "../controllers/schoolController.js";
import { authMiddleware, roleMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public route - no auth required for students to see school list
router.get("/list", getRegisteredSchools);

// School-only routes
router.get("/dashboard", authMiddleware, roleMiddleware(["school"]), getSchoolDashboard);

// Activity management (legacy)
router.post("/activities", authMiddleware, roleMiddleware(["school"]), createActivity);
router.get("/activities", authMiddleware, roleMiddleware(["school"]), listActivities);

// Challenge management
router.post("/challenges", authMiddleware, roleMiddleware(["school"]), createChallenge);
router.get("/challenges", authMiddleware, roleMiddleware(["school"]), getSchoolChallenges);
router.get("/challenges/:challengeId/stats", authMiddleware, roleMiddleware(["school"]), getChallengeStats);

// Quiz management
router.post("/quizzes", authMiddleware, roleMiddleware(["school"]), createQuiz);
router.get("/quizzes", authMiddleware, roleMiddleware(["school"]), getSchoolQuizzes);
router.get("/quizzes/:quizId/stats", authMiddleware, roleMiddleware(["school"]), getQuizStats);

// Reports
router.get("/report", authMiddleware, roleMiddleware(["school"]), generateSchoolReport);

export default router;