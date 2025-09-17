import express from "express";
import { createCampaign, listCampaigns, listResources } from "../controllers/ngoController.js";
import { authMiddleware, roleMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/campaigns", authMiddleware, roleMiddleware(["ngo"]), createCampaign);
router.get("/campaigns", authMiddleware, roleMiddleware(["ngo"]), listCampaigns);
router.get("/resources", authMiddleware, roleMiddleware(["ngo"]), listResources);

export default router;