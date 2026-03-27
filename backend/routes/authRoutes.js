import { Router } from "express";
import { manualLogin, adminLogin, microsoftLogin, getMe } from "../controllers/authController.js";
import auth from "../middleware/auth.js";

const router = Router();

router.post("/login", manualLogin);
router.post("/admin-login", adminLogin);
router.post("/microsoft", microsoftLogin);
router.get("/me", auth, getMe);

export default router;
