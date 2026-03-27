import { Router } from "express";
import {
  getApplications,
  getApplication,
  createApplication,
  updateApplication,
  deleteApplication,
  toggleApplicationStatus,
} from "../controllers/applicationController.js";
import auth from "../middleware/auth.js";
import roleCheck from "../middleware/roleCheck.js";

const router = Router();

router.get("/", auth, getApplications);
router.get("/:id", auth, getApplication);
router.post("/", auth, roleCheck("admin"), createApplication);
router.put("/:id", auth, roleCheck("admin"), updateApplication);
router.delete("/:id", auth, roleCheck("admin"), deleteApplication);
router.patch("/:id/toggle-status", auth, roleCheck("admin"), toggleApplicationStatus);

export default router;
