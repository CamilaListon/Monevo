import { Router } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "./db.js";
import {
  clearSessionCookie,
  requireAuth,
  setSessionCookie,
  type AuthenticatedRequest,
} from "./auth.js";

const router = Router();

const credentialsSchema = z.object({
  email: z.string().trim().email().max(254).transform((email) => email.toLowerCase()),
  password: z.string().min(8).max(72).refine((password) => Buffer.byteLength(password, "utf8") <= 72),
});

function presentUser(user: { id: string; name: string; email: string; avatarMimeType: string | null }) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    avatarUrl: user.avatarMimeType
      ? `/profile/avatar?v=${encodeURIComponent(user.avatarMimeType)}`
      : null,
  };
}

router.post("/register", async (req, res) => {
  const parsed = credentialsSchema.extend({
    name: z.string().trim().min(2).max(80),
  }).safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Confira seu nome, e-mail e senha (mínimo de 8 caracteres)." });
    return;
  }

  const { name, email, password } = parsed.data;
  const passwordHash = await bcrypt.hash(password, 12);
  try {
    const user = await prisma.user.create({
      data: { name, email, passwordHash },
      select: { id: true, name: true, email: true, avatarMimeType: true },
    });
    setSessionCookie(res, user.id);
    res.status(201).json({ user: presentUser(user) });
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "P2002"
    ) {
      res.status(409).json({ error: "Este e-mail já está cadastrado." });
      return;
    }
    throw error;
  }
});

router.post("/login", async (req, res) => {
  const parsed = credentialsSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Informe um e-mail válido e uma senha." });
    return;
  }

  const user = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  const isValid = user
    ? await bcrypt.compare(parsed.data.password, user.passwordHash)
    : false;
  if (!user || !isValid) {
    res.status(401).json({ error: "E-mail ou senha incorretos." });
    return;
  }
  setSessionCookie(res, user.id);
  res.json({ user: presentUser(user) });
});

router.post("/logout", (_req, res) => {
  clearSessionCookie(res);
  res.status(204).end();
});

router.get("/me", requireAuth, async (req: AuthenticatedRequest, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.userId },
    select: { id: true, name: true, email: true, avatarMimeType: true },
  });
  if (!user) {
    clearSessionCookie(res);
    res.status(401).json({ error: "Sessão inválida." });
    return;
  }
  res.json({ user: presentUser(user) });
});

export default router;
