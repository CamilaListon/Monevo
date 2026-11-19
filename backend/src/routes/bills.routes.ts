import { Router } from "express";
import { create, list, payment, remove, update } from "../controllers/bills.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";

const router = Router();
router.use(requireAuth);
router.get("/", list);
router.post("/", create);
router.patch("/:id", update);
router.delete("/:id", remove);
router.patch("/:id/payment", payment);

export default router;
