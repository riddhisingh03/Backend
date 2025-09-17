import express from "express";
import { register, login, profile } from "../controllers/authController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/profile", authMiddleware, profile);
router.get("/test",(req,res)=>{
    res.json({msg:"working"});
});
export default router;