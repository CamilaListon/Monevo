import type { AuthenticatedRequest } from "../types/express.js";

export function getUserId(req: AuthenticatedRequest): string {
  if (!req.userId) throw new Error("Authenticated user missing");
  return req.userId;
}
