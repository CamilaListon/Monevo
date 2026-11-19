import { Router } from "express";
import { z } from "zod";
import { requireAuth, type AuthenticatedRequest } from "./auth.js";
import { prisma } from "./db.js";
import { statusOf } from "./bills.js";

const router = Router();
router.use(requireAuth);

router.get("/", async (req: AuthenticatedRequest, res) => {
  const parsed = z.object({ month: z.iso.date().optional() }).safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: "Período inválido." });
    return;
  }
  const monthDate = parsed.data.month
    ? new Date(`${parsed.data.month.slice(0, 7)}-01T00:00:00.000Z`)
    : new Date(Date.UTC(new Date().getUTCFullYear(), new Date().getUTCMonth(), 1));
  const nextMonth = new Date(Date.UTC(monthDate.getUTCFullYear(), monthDate.getUTCMonth() + 1, 1));
  const records = await prisma.bill.findMany({
    where: {
      userId: req.userId,
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
      userId: req.userId,
      paidAt: { gte: monthDate, lt: nextMonth },
    },
    orderBy: { paidAt: "desc" },
    take: 5,
  });

  res.json({
    month: monthDate.toISOString().slice(0, 7),
    summary,
    byCategory,
    bills,
    recentPayments: recentPayments.map((bill) => ({
      ...bill,
      amount: Number(bill.amount),
      status: "paid" as const,
    })),
  });
});

export default router;
