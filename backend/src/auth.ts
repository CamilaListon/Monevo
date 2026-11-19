import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { config } from "./config.js";

export const COOKIE_NAME = "monevo_session";
const tokenLifetimeSeconds = 60 * 60 * 24 * 7;

export function setSessionCookie(res: Response, userId: string): void {
  const token = jwt.sign({ sub: userId }, config.JWT_SECRET, {
    algorithm: "HS256",
    expiresIn: tokenLifetimeSeconds,
  });
  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    secure: config.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: tokenLifetimeSeconds * 1000,
    path: "/",
  });
}

export function clearSessionCookie(res: Response): void {
  res.clearCookie(COOKIE_NAME, { httpOnly: true, sameSite: "lax", path: "/" });
}

export interface AuthenticatedRequest extends Request {
  userId?: string;
}

export function requireAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): void {
  const token = req.cookies?.[COOKIE_NAME] as string | undefined;
  if (!token) {
    res.status(401).json({ error: "Autenticação necessária." });
    return;
  }

  try {
    const payload = jwt.verify(token, config.JWT_SECRET, {
      algorithms: ["HS256"],
    });
    if (typeof payload === "string" || typeof payload.sub !== "string") {
      res.status(401).json({ error: "Sessão inválida." });
      return;
    }
    req.userId = payload.sub;
    next();
  } catch {
    res.status(401).json({ error: "Sessão inválida ou expirada." });
  }
}
