import type { Response } from "express";
import type { AuthenticatedRequest } from "../types/express.js";
import { dashboardQuerySchema, getDashboard } from "../services/dashboard.service.js";
import { getUserId } from "../utils/auth.js";

export async function dashboard(req: AuthenticatedRequest, res: Response): Promise<void> {
  const parsed = dashboardQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: "Período inválido." });
    return;
  }
  res.json(await getDashboard(getUserId(req), parsed.data.month));
}
