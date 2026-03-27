import { Router } from "express";
import {
  getEntities,
  getEntity,
  createEntity,
  updateEntity,
  deleteEntity,
  toggleEntityStatus,
} from "../controllers/entityController.js";
import auth from "../middleware/auth.js";
import roleCheck from "../middleware/roleCheck.js";

const router = Router();

router.get("/", auth, getEntities);
router.get("/:id", auth, getEntity);
router.post("/", auth, roleCheck("admin"), createEntity);
router.put("/:id", auth, roleCheck("admin"), updateEntity);
router.delete("/:id", auth, roleCheck("admin"), deleteEntity);
router.patch("/:id/toggle-status", auth, roleCheck("admin"), toggleEntityStatus);

export default router;
