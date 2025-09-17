import express from "express";
import { listUsers, updateRole, deleteUser } from "../controllers/adminController.js";
import { authMiddleware, roleMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/users", authMiddleware, roleMiddleware(["admin"]), listUsers);
router.put("/users/:id", authMiddleware, roleMiddleware(["admin"]), updateRole);
router.delete("/users/:id", authMiddleware, roleMiddleware(["admin"]), deleteUser);

export default router;