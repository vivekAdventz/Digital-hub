import { Router } from "express";
import { getDashboardStats } from "../controllers/dashboardController.js";
import auth from "../middleware/auth.js";
import roleCheck from "../middleware/roleCheck.js";

const router = Router();

router.get("/stats", auth, roleCheck("admin"), getDashboardStats);

export default router;
