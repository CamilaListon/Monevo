import { Router } from "express";
import {
  avatar,
  profile,
  removeAvatar,
  updateName,
  updatePassword,
  uploadAvatar,
} from "../controllers/profile.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import { receiveAvatar } from "../middleware/upload.middleware.js";

const router = Router();
router.use(requireAuth);
router.get("/", profile);
router.patch("/", updateName);
router.patch("/password", updatePassword);
router.post("/avatar", receiveAvatar, uploadAvatar);
router.get("/avatar", avatar);
router.delete("/avatar", removeAvatar);

export default router;
