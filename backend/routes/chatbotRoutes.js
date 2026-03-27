import { Router } from "express";
import { searchApplications } from "../controllers/chatbotController.js";
import auth from "../middleware/auth.js";

const router = Router();

router.post("/search", auth, searchApplications);

export default router;
