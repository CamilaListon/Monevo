import { z } from "zod";
import { prisma } from "../config/database.js";
import { getUserId } from "../utils/auth.js";
import type { AuthenticatedRequest } from "../types/express.js";

export const billSchema = z.object({
  title: z.string().trim().min(1).max(100),
  category: z.string().trim().min(1).max(40),
  amount: z.coerce.number().positive().max(9999999999.99),
  dueDate: z.iso.date(),
  notes: z.string().trim().max(500).nullable().optional(),
});

export const billQuerySchema = z.object({
  category: z.string().optional(),
  status: z.enum(["all", "paid", "pending", "overdue"]).default("all"),
  month: z.iso.date().optional(),
});

export function getBillId(req: AuthenticatedRequest): string {
  const { id } = req.params;
  if (typeof id !== "string") throw new Error("Bill id is missing");
  return id;
}

export async function listBills(
  req: AuthenticatedRequest,
  filters: z.infer<typeof billQuerySchema>,
) {
  const { category, month } = filters;
  const monthDate = month ? new Date(`${month.slice(0, 7)}-01T00:00:00`) : undefined;
  return prisma.bill.findMany({
    where: {
      userId: getUserId(req),
      ...(category && category !== "all" ? { category } : {}),
      ...(monthDate
        ? {
            dueDate: {
              gte: monthDate,
              lt: new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 1),
            },
          }
        : {}),
    },
    orderBy: [{ dueDate: "asc" }, { createdAt: "desc" }],
  });
}

export function createBill(req: AuthenticatedRequest, data: z.infer<typeof billSchema>) {
  return prisma.bill.create({
    data: {
      ...data,
      dueDate: new Date(`${data.dueDate}T00:00:00.000Z`),
      userId: getUserId(req),
    },
  });
}

export async function findBill(req: AuthenticatedRequest) {
  return prisma.bill.findFirst({
    where: { id: getBillId(req), userId: getUserId(req) },
  });
}

export async function updateBill(id: string, data: z.infer<ReturnType<typeof billSchema.partial>>) {
  return prisma.bill.update({
    where: { id },
    data: {
      ...data,
      ...(data.dueDate ? { dueDate: new Date(`${data.dueDate}T00:00:00.000Z`) } : {}),
    },
  });
}

export function deleteBill(req: AuthenticatedRequest) {
  return prisma.bill.deleteMany({ where: { id: getBillId(req), userId: getUserId(req) } });
}

export async function setBillPayment(req: AuthenticatedRequest, paid: boolean) {
  const where = { id: getBillId(req), userId: getUserId(req) };
  const result = await prisma.bill.updateMany({
    where,
    data: { paidAt: paid ? new Date() : null },
  });
  if (!result.count) return null;
  return prisma.bill.findFirstOrThrow({ where });
}
