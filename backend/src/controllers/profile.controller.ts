import type { Response } from "express";
import type { AuthenticatedRequest } from "../types/express.js";
import { getUserId } from "../utils/auth.js";
import { presentUser } from "../utils/presenters.js";
import {
  changePassword,
  deleteAvatar,
  getAvatar,
  getProfile,
  nameSchema,
  passwordChangeSchema,
  storeAvatar,
  updateProfileName,
} from "../services/profile.service.js";

export async function profile(req: AuthenticatedRequest, res: Response): Promise<void> {
  const user = await getProfile(getUserId(req));
  if (!user) {
    res.status(404).json({ error: "Usuário não encontrado." });
    return;
  }
  res.json({ user: presentUser(user) });
}

export async function updateName(req: AuthenticatedRequest, res: Response): Promise<void> {
  const parsed = nameSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "O nome deve ter entre 2 e 80 caracteres." });
    return;
  }
  res.json({ user: presentUser(await updateProfileName(getUserId(req), parsed.data.name)) });
}

export async function updatePassword(req: AuthenticatedRequest, res: Response): Promise<void> {
  const parsed = passwordChangeSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "A nova senha deve ter entre 8 e 72 bytes." });
    return;
  }
  if (parsed.data.currentPassword === parsed.data.newPassword) {
    res.status(400).json({ error: "A nova senha deve ser diferente da senha atual." });
    return;
  }
  const updated = await changePassword(
    getUserId(req),
    parsed.data.currentPassword,
    parsed.data.newPassword,
  );
  if (!updated) {
    res.status(401).json({ error: "A senha atual está incorreta." });
    return;
  }
  res.status(204).end();
}

export async function uploadAvatar(req: AuthenticatedRequest, res: Response): Promise<void> {
  if (!req.file) {
    res.status(400).json({ error: "Selecione uma imagem para enviar." });
    return;
  }
  const result = await storeAvatar(getUserId(req), req.file.buffer);
  if (result.kind === "invalid") {
    res.status(400).json({ error: "Formato inválido. Use uma imagem JPEG, PNG ou WebP." });
    return;
  }
  if (result.kind === "missing") {
    res.status(404).json({ error: "Usuário não encontrado." });
    return;
  }
  res.status(201).json({ user: presentUser(result.user) });
}

export async function avatar(req: AuthenticatedRequest, res: Response): Promise<void> {
  const result = await getAvatar(getUserId(req));
  if (result.kind === "missing") {
    res.status(404).json({ error: "Nenhuma foto de perfil cadastrada." });
    return;
  }
  if (result.kind === "not-found") {
    res.status(404).json({ error: "A foto de perfil não foi encontrada." });
    return;
  }
  res
    .set("Cache-Control", "private, no-store")
    .set("X-Content-Type-Options", "nosniff")
    .type(result.mimeType)
    .send(result.image);
}

export async function removeAvatar(req: AuthenticatedRequest, res: Response): Promise<void> {
  if (!(await deleteAvatar(getUserId(req)))) {
    res.status(404).json({ error: "Usuário não encontrado." });
    return;
  }
  res.status(204).end();
}
