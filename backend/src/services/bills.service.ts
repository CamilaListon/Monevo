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
  recurring: z.boolean().default(false),
});

export const billQuerySchema = z.object({
  category: z.string().optional(),
  status: z.enum(["all", "paid", "pending", "overdue"]).default("all"),
  month: z.iso.date().optional(),
  recurring: z.enum(["true", "false"]).optional(),
});

export function getBillId(req: AuthenticatedRequest): string {
  const { id } = req.params;
  if (typeof id !== "string") throw new Error("Bill id is missing");
  return id;
}

function dateInMonth(anchorDate: Date, year: number, month: number): Date {
  const day = anchorDate.getUTCDate();
  const lastDay = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  return new Date(Date.UTC(year, month, Math.min(day, lastDay)));
}

export async function listBills(
  req: AuthenticatedRequest,
  filters: z.infer<typeof billQuerySchema>,
) {
  const { category, month } = filters;
  const monthDate = month ? new Date(`${month.slice(0, 7)}-01T00:00:00.000Z`) : undefined;
  const userId = getUserId(req);
  if (monthDate) await ensureMonthlyOccurrences(userId, monthDate);
  return prisma.bill.findMany({
    where: {
      userId,
      recurrenceSkipped: false,
      ...(filters.recurring === "true" ? { recurring: true, recurrenceSourceId: null } : {}),
      ...(category && category !== "all" ? { category } : {}),
      ...(monthDate
        ? {
            dueDate: {
              gte: monthDate,
              lt: new Date(Date.UTC(monthDate.getUTCFullYear(), monthDate.getUTCMonth() + 1, 1)),
            },
          }
        : {}),
    },
    orderBy: [{ dueDate: "asc" }, { createdAt: "desc" }],
  });
}

export async function createBill(req: AuthenticatedRequest, data: z.infer<typeof billSchema>) {
  return prisma.bill.create({
    data: {
      ...data,
      dueDate: new Date(`${data.dueDate}T00:00:00.000Z`),
      userId: getUserId(req),
    },
  });
}

export async function ensureMonthlyOccurrences(userId: string, monthDate: Date) {
  const recurringBills = await prisma.bill.findMany({
    where: {
      userId,
      recurring: true,
      recurrenceSourceId: null,
      dueDate: { lt: monthDate },
    },
  });
  if (!recurringBills.length) return;

  const year = monthDate.getUTCFullYear();
  const month = monthDate.getUTCMonth();
  await prisma.bill.createMany({
    data: recurringBills.map((bill) => ({
      title: bill.title,
      category: bill.category,
      amount: bill.amount,
      dueDate: dateInMonth(bill.dueDate, year, month),
      notes: bill.notes,
      userId: bill.userId,
      recurrenceSourceId: bill.id,
    })),
    skipDuplicates: true,
  });
}

export async function findBill(req: AuthenticatedRequest) {
  return prisma.bill.findFirst({
    where: {
      id: getBillId(req),
      userId: getUserId(req),
      recurrenceSkipped: false,
    },
  });
}

export async function updateBill(id: string, data: z.infer<ReturnType<typeof billSchema.partial>>) {
  return prisma.$transaction(async (tx) => {
    const bill = await tx.bill.update({
      where: { id },
      data: {
        ...data,
        ...(data.dueDate ? { dueDate: new Date(`${data.dueDate}T00:00:00.000Z`) } : {}),
      },
    });
    if (!bill.recurring || bill.recurrenceSourceId) return bill;

    const today = new Date();
    const startOfToday = new Date(
      Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()),
    );
    const firstOccurrence = new Date(
      Date.UTC(bill.dueDate.getUTCFullYear(), bill.dueDate.getUTCMonth() + 1, 1),
    );
    const firstFutureOccurrence = firstOccurrence > startOfToday ? firstOccurrence : startOfToday;
    await tx.bill.deleteMany({
      where: {
        recurrenceSourceId: id,
        userId: bill.userId,
        recurrenceSkipped: false,
        paidAt: null,
        dueDate: { gt: startOfToday, lt: firstOccurrence },
      },
    });
    const futureOccurrences = await tx.bill.findMany({
      where: {
        recurrenceSourceId: id,
        userId: bill.userId,
        recurrenceSkipped: false,
        paidAt: null,
        dueDate: { gte: firstFutureOccurrence },
      },
      select: { id: true, dueDate: true },
    });
    await Promise.all(
      futureOccurrences.map((occurrence) =>
        tx.bill.update({
          where: { id: occurrence.id },
          data: {
            title: bill.title,
            category: bill.category,
            amount: bill.amount,
            notes: bill.notes,
            dueDate: dateInMonth(
              bill.dueDate,
              occurrence.dueDate.getUTCFullYear(),
              occurrence.dueDate.getUTCMonth(),
            ),
          },
        }),
      ),
    );
    return bill;
  });
}

export async function deleteBill(req: AuthenticatedRequest) {
  const id = getBillId(req);
  const userId = getUserId(req);
  const bill = await prisma.bill.findFirst({
    where: { id, userId, recurrenceSkipped: false },
    select: { recurrenceSourceId: true },
  });
  if (!bill) return { count: 0 };
  if (bill.recurrenceSourceId) {
    return prisma.bill.updateMany({
      where: { id, userId },
      data: { recurrenceSkipped: true },
    });
  }
  return prisma.bill.deleteMany({ where: { id, userId } });
}

export async function setBillPayment(req: AuthenticatedRequest, paid: boolean) {
  const where = {
    id: getBillId(req),
    userId: getUserId(req),
    recurrenceSkipped: false,
  };
  const result = await prisma.bill.updateMany({
    where,
    data: { paidAt: paid ? new Date() : null },
  });
  if (!result.count) return null;
  return prisma.bill.findFirstOrThrow({ where });
}

export async function setBillRecurrence(req: AuthenticatedRequest, recurring: boolean) {
  const id = getBillId(req);
  const userId = getUserId(req);
  const bill = await prisma.bill.findFirst({
    where: { id, userId, recurrenceSkipped: false },
  });
  if (!bill) return null;

  if (recurring) {
    if (bill.recurring || bill.recurrenceSourceId) return bill;
    return prisma.bill.update({ where: { id }, data: { recurring: true } });
  }

  const today = new Date();
  const startOfToday = new Date(
    Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()),
  );
  return prisma.$transaction(async (tx) => {
    if (bill.recurrenceSourceId) {
      await tx.bill.updateMany({
        where: { id: bill.recurrenceSourceId, userId },
        data: { recurring: false },
      });
      await tx.bill.deleteMany({
        where: {
          recurrenceSourceId: bill.recurrenceSourceId,
          userId,
          dueDate: { gt: startOfToday },
          recurrenceSkipped: false,
          paidAt: null,
          id: { not: id },
        },
      });
      return tx.bill.update({
        where: { id },
        data: { recurrenceSourceId: null, recurring: false },
      });
    }

    await tx.bill.deleteMany({
      where: {
        recurrenceSourceId: id,
        userId,
        dueDate: { gt: startOfToday },
        recurrenceSkipped: false,
        paidAt: null,
      },
    });
    return tx.bill.update({ where: { id }, data: { recurring: false } });
  });
}
