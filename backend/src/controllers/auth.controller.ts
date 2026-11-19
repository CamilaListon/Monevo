import type { Request, Response } from "express";
import {
  authenticateUser,
  credentialsSchema,
  findSessionUser,
  registerUser,
  registrationSchema,
} from "../services/auth.service.js";
import { clearSessionCookie, setSessionCookie } from "../middleware/auth.middleware.js";
import { presentUser } from "../utils/presenters.js";
import { getUserId } from "../utils/auth.js";
import type { AuthenticatedRequest } from "../types/express.js";

export async function register(req: Request, res: Response): Promise<void> {
  const parsed = registrationSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Confira seu nome, e-mail e senha (mínimo de 8 caracteres)." });
    return;
  }
  try {
    const user = await registerUser(parsed.data);
    setSessionCookie(res, user.id);
    res.status(201).json({ user: presentUser(user) });
  } catch (error) {
    if (typeof error === "object" && error !== null && "code" in error && error.code === "P2002") {
      res.status(409).json({ error: "Este e-mail já está cadastrado." });
      return;
    }
    throw error;
  }
}

export async function login(req: Request, res: Response): Promise<void> {
  const parsed = credentialsSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Informe um e-mail válido e uma senha." });
    return;
  }
  const user = await authenticateUser(parsed.data);
  if (!user) {
    res.status(401).json({ error: "E-mail ou senha incorretos." });
    return;
  }
  setSessionCookie(res, user.id);
  res.json({ user: presentUser(user) });
}

export function logout(_req: Request, res: Response): void {
  clearSessionCookie(res);
  res.status(204).end();
}

export async function me(req: AuthenticatedRequest, res: Response): Promise<void> {
  const user = await findSessionUser(getUserId(req));
  if (!user) {
    clearSessionCookie(res);
    res.status(401).json({ error: "Sessão inválida." });
    return;
  }
  res.json({ user: presentUser(user) });
}
