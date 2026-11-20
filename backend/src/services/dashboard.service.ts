import { z } from "zod";
import { prisma } from "../config/database.js";
import { statusOf } from "../utils/presenters.js";
import { ensureMonthlyOccurrences } from "./bills.service.js";

export const dashboardQuerySchema = z.object({ month: z.iso.date().optional() });

export async function getDashboard(userId: string, month?: string) {
  const monthDate = month
    ? new Date(`${month.slice(0, 7)}-01T00:00:00.000Z`)
    : new Date(Date.UTC(new Date().getUTCFullYear(), new Date().getUTCMonth(), 1));
  const nextMonth = new Date(Date.UTC(monthDate.getUTCFullYear(), monthDate.getUTCMonth() + 1, 1));
  await ensureMonthlyOccurrences(userId, monthDate);
  const records = await prisma.bill.findMany({
    where: {
      userId,
      recurrenceSkipped: false,
      dueDate: { gte: monthDate, lt: nextMonth },
    },
    orderBy: { dueDate: "asc" },
  });
  const bills = records.map((bill) => ({
    ...bill,
    amount: Number(bill.amount),
    status: statusOf(bill),
  }));
  const summary = bills.reduce(
    (totals, bill) => {
      totals.total += bill.amount;
      if (bill.status === "paid") totals.paid += bill.amount;
      else if (bill.status === "overdue") totals.overdue += bill.amount;
      else totals.pending += bill.amount;
      return totals;
    },
    { total: 0, paid: 0, pending: 0, overdue: 0 },
  );
  const byCategory = Object.values(
    bills.reduce<Record<string, { category: string; total: number }>>((groups, bill) => {
      groups[bill.category] ??= { category: bill.category, total: 0 };
      groups[bill.category].total += bill.amount;
      return groups;
    }, {}),
  ).sort((a, b) => b.total - a.total);
  const recentPayments = await prisma.bill.findMany({
    where: {
      userId,
      recurrenceSkipped: false,
      paidAt: { gte: monthDate, lt: nextMonth },
    },
    orderBy: { paidAt: "desc" },
    take: 5,
  });
  return {
    month: monthDate.toISOString().slice(0, 7),
    summary,
    byCategory,
    bills,
    recentPayments: recentPayments.map((bill) => ({
      ...bill,
      amount: Number(bill.amount),
      status: "paid" as const,
    })),
  };
}
