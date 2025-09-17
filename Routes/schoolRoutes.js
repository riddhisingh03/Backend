import express from "express";
import { createActivity, listActivities } from "../controllers/schoolController.js";
import { authMiddleware, roleMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/activities", authMiddleware, roleMiddleware(["school"]), createActivity);
router.get("/activities", authMiddleware, roleMiddleware(["school"]), listActivities);

export default router;