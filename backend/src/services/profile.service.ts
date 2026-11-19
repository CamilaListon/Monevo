import { readFile, unlink } from "node:fs/promises";
import { basename, join, resolve } from "node:path";
import bcrypt from "bcryptjs";
import { fileTypeFromBuffer } from "file-type";
import { z } from "zod";
import { prisma } from "../config/database.js";

const avatarDirectory = resolve(process.cwd(), "uploads", "avatars");
const passwordSchema = z
  .string()
  .min(8)
  .max(72)
  .refine((password) => Buffer.byteLength(password, "utf8") <= 72);

export const nameSchema = z.object({ name: z.string().trim().min(2).max(80) });
export const passwordChangeSchema = z.object({
  currentPassword: passwordSchema,
  newPassword: passwordSchema,
});

export function getProfile(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, email: true, avatarMimeType: true },
  });
}

export function updateProfileName(userId: string, name: string) {
  return prisma.user.update({
    where: { id: userId },
    data: { name },
    select: { id: true, name: true, email: true, avatarMimeType: true },
  });
}

export async function changePassword(userId: string, currentPassword: string, newPassword: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { passwordHash: true },
  });
  if (!user || !(await bcrypt.compare(currentPassword, user.passwordHash))) return false;
  const passwordHash = await bcrypt.hash(newPassword, 12);
  await prisma.user.update({ where: { id: userId }, data: { passwordHash } });
  return true;
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

export async function storeAvatar(userId: string, image: Buffer) {
  const fileType = await fileTypeFromBuffer(image);
  if (
    !fileType ||
    (fileType.mime !== "image/jpeg" &&
      fileType.mime !== "image/png" &&
      fileType.mime !== "image/webp")
  ) {
    return { kind: "invalid" as const };
  }
  const currentUser = await prisma.user.findUnique({
    where: { id: userId },
    select: { avatarPath: true },
  });
  if (!currentUser) return { kind: "missing" as const };
  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      avatarPath: null,
      avatarMimeType: fileType.mime,
      avatarData: image.toString("base64"),
    },
    select: { id: true, name: true, email: true, avatarMimeType: true },
  });
  await removeStoredAvatar(currentUser.avatarPath);
  return { kind: "stored" as const, user };
}

export async function getAvatar(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { avatarData: true, avatarPath: true, avatarMimeType: true },
  });
  if (!user?.avatarMimeType || (!user.avatarData && !user.avatarPath)) {
    return { kind: "missing" as const };
  }
  try {
    let image: Buffer;
    if (user.avatarData) image = Buffer.from(user.avatarData, "base64");
    else if (user.avatarPath)
      image = await readFile(join(avatarDirectory, basename(user.avatarPath)));
    else return { kind: "missing" as const };
    return { kind: "found" as const, image, mimeType: user.avatarMimeType };
  } catch (error) {
    if (typeof error === "object" && error !== null && "code" in error && error.code === "ENOENT") {
      return { kind: "not-found" as const };
    }
    throw error;
  }
}

export async function deleteAvatar(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { avatarPath: true },
  });
  if (!user) return false;
  await prisma.user.update({
    where: { id: userId },
    data: { avatarPath: null, avatarMimeType: null, avatarData: null },
  });
  await removeStoredAvatar(user.avatarPath);
  return true;
}
