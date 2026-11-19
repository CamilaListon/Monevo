import { readFile, unlink } from "node:fs/promises";
import { basename, join, resolve } from "node:path";
import { fileTypeFromBuffer } from "file-type";
import { Router, type NextFunction, type Response } from "express";
import multer from "multer";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "./db.js";
import { requireAuth, type AuthenticatedRequest } from "./auth.js";

const router = Router();
const avatarDirectory = resolve(process.cwd(), "uploads", "avatars");
const maxAvatarBytes = 4 * 1024 * 1024;
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: maxAvatarBytes, files: 1 },
});

router.use(requireAuth);

function getUserId(req: AuthenticatedRequest): string {
  if (!req.userId) throw new Error("Authenticated user missing");
  return req.userId;
}

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

function receiveAvatar(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  upload.single("avatar")(req, res, (error: unknown) => {
    if (!error) {
      next();
      return;
    }
    if (error instanceof multer.MulterError) {
      const message = error.code === "LIMIT_FILE_SIZE"
        ? "A imagem deve ter no máximo 4 MB."
        : "Não foi possível receber a imagem.";
      res.status(400).json({ error: message });
      return;
    }
    next(error);
  });
}

async function removeStoredAvatar(avatarPath: string | null): Promise<void> {
  if (!avatarPath) return;
  if (basename(avatarPath) !== avatarPath) {
    throw new Error("Invalid stored avatar path");
  }
  try {
    await unlink(join(avatarDirectory, avatarPath));
  } catch (error) {
    if (typeof error === "object" && error !== null && "code" in error && error.code === "ENOENT") {
      return;
    }
    throw error;
  }
}

router.get("/", async (req: AuthenticatedRequest, res) => {
  const user = await prisma.user.findUnique({
    where: { id: getUserId(req) },
    select: { id: true, name: true, email: true, avatarMimeType: true },
  });
  if (!user) {
    res.status(404).json({ error: "Usuário não encontrado." });
    return;
  }
  res.json({ user: presentUser(user) });
});

router.patch("/", async (req: AuthenticatedRequest, res) => {
  const parsed = z.object({ name: z.string().trim().min(2).max(80) }).safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "O nome deve ter entre 2 e 80 caracteres." });
    return;
  }
  const user = await prisma.user.update({
    where: { id: getUserId(req) },
    data: { name: parsed.data.name },
    select: { id: true, name: true, email: true, avatarMimeType: true },
  });
  res.json({ user: presentUser(user) });
});

router.patch("/password", async (req: AuthenticatedRequest, res) => {
  const passwordSchema = z.string()
    .min(8)
    .max(72)
    .refine((password) => Buffer.byteLength(password, "utf8") <= 72);
  const parsed = z.object({
    currentPassword: passwordSchema,
    newPassword: passwordSchema,
  }).safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "A nova senha deve ter entre 8 e 72 bytes." });
    return;
  }
  if (parsed.data.currentPassword === parsed.data.newPassword) {
    res.status(400).json({ error: "A nova senha deve ser diferente da senha atual." });
    return;
  }
  const userId = getUserId(req);
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { passwordHash: true },
  });
  if (!user || !(await bcrypt.compare(parsed.data.currentPassword, user.passwordHash))) {
    res.status(401).json({ error: "A senha atual está incorreta." });
    return;
  }
  const passwordHash = await bcrypt.hash(parsed.data.newPassword, 12);
  await prisma.user.update({ where: { id: userId }, data: { passwordHash } });
  res.status(204).end();
});

router.post("/avatar", receiveAvatar, async (req: AuthenticatedRequest, res) => {
  if (!req.file) {
    res.status(400).json({ error: "Selecione uma imagem para enviar." });
    return;
  }
  const fileType = await fileTypeFromBuffer(req.file.buffer);
  if (
    !fileType ||
    (fileType.mime !== "image/jpeg" &&
      fileType.mime !== "image/png" &&
      fileType.mime !== "image/webp")
  ) {
    res.status(400).json({ error: "Formato inválido. Use uma imagem JPEG, PNG ou WebP." });
    return;
  }

  const userId = getUserId(req);
  const currentUser = await prisma.user.findUnique({
    where: { id: userId },
    select: { avatarPath: true },
  });
  if (!currentUser) {
    res.status(404).json({ error: "Usuário não encontrado." });
    return;
  }

  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      avatarPath: null,
      avatarMimeType: fileType.mime,
      avatarData: req.file.buffer.toString("base64"),
    },
    select: { id: true, name: true, email: true, avatarMimeType: true },
  });
  await removeStoredAvatar(currentUser.avatarPath);
  res.status(201).json({ user: presentUser(user) });
});

router.get("/avatar", async (req: AuthenticatedRequest, res) => {
  const user = await prisma.user.findUnique({
    where: { id: getUserId(req) },
    select: { avatarData: true, avatarPath: true, avatarMimeType: true },
  });
  if (!user?.avatarMimeType || (!user.avatarData && !user.avatarPath)) {
    res.status(404).json({ error: "Nenhuma foto de perfil cadastrada." });
    return;
  }
  try {
    let image: Buffer;
    if (user.avatarData) {
      image = Buffer.from(user.avatarData, "base64");
    } else if (user.avatarPath) {
      image = await readFile(join(avatarDirectory, basename(user.avatarPath)));
    } else {
      res.status(404).json({ error: "Nenhuma foto de perfil cadastrada." });
      return;
    }
    res
      .set("Cache-Control", "private, no-store")
      .set("X-Content-Type-Options", "nosniff")
      .type(user.avatarMimeType)
      .send(image);
  } catch (error) {
    if (typeof error === "object" && error !== null && "code" in error && error.code === "ENOENT") {
      res.status(404).json({ error: "A foto de perfil não foi encontrada." });
      return;
    }
    throw error;
  }
});

router.delete("/avatar", async (req: AuthenticatedRequest, res) => {
  const userId = getUserId(req);
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { avatarPath: true },
  });
  if (!user) {
    res.status(404).json({ error: "Usuário não encontrado." });
    return;
  }
  await prisma.user.update({
    where: { id: userId },
    data: { avatarPath: null, avatarMimeType: null, avatarData: null },
  });
  await removeStoredAvatar(user.avatarPath);
  res.status(204).end();
});

export default router;
