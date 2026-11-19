import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "../config/database.js";

export const credentialsSchema = z.object({
  email: z
    .string()
    .trim()
    .email()
    .max(254)
    .transform((email) => email.toLowerCase()),
  password: z
    .string()
    .min(8)
    .max(72)
    .refine((password) => Buffer.byteLength(password, "utf8") <= 72),
});

export const registrationSchema = credentialsSchema.extend({
  name: z.string().trim().min(2).max(80),
});

export async function registerUser(data: z.infer<typeof registrationSchema>) {
  const passwordHash = await bcrypt.hash(data.password, 12);
  return prisma.user.create({
    data: { name: data.name, email: data.email, passwordHash },
    select: { id: true, name: true, email: true, avatarMimeType: true },
  });
}

export async function authenticateUser(data: z.infer<typeof credentialsSchema>) {
  const user = await prisma.user.findUnique({ where: { email: data.email } });
  const valid = user ? await bcrypt.compare(data.password, user.passwordHash) : false;
  return user && valid ? user : null;
}

export function findSessionUser(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, email: true, avatarMimeType: true },
  });
}
