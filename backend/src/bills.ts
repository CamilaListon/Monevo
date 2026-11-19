import { Router } from "express";
import { z } from "zod";
import { prisma } from "./db.js";
import { requireAuth, type AuthenticatedRequest } from "./auth.js";

const router = Router();
router.use(requireAuth);

const billSchema = z.object({
  title: z.string().trim().min(1).max(100),
  category: z.string().trim().min(1).max(40),
  amount: z.coerce.number().positive().max(9999999999.99),
  dueDate: z.iso.date(),
  notes: z.string().trim().max(500).nullable().optional(),
});

function statusOf(bill: { paidAt: Date | null; dueDate: Date }): "paid" | "pending" | "overdue" {
  if (bill.paidAt) return "paid";
  const today = new Date().toISOString().slice(0, 10);
  return bill.dueDate.toISOString().slice(0, 10) < today ? "overdue" : "pending";
}

function presentBill<T extends { amount: unknown; paidAt: Date | null; dueDate: Date }>(bill: T) {
  return { ...bill, amount: Number(bill.amount), status: statusOf(bill) };
}

function getUserId(req: AuthenticatedRequest): string {
  if (!req.userId) throw new Error("Authenticated user missing");
  return req.userId;
}

function getBillId(req: AuthenticatedRequest): string {
  const { id } = req.params;
  if (typeof id !== "string") throw new Error("Bill id is missing");
  return id;
}

router.get("/", async (req: AuthenticatedRequest, res) => {
  const querySchema = z.object({
    category: z.string().optional(),
    status: z.enum(["all", "paid", "pending", "overdue"]).default("all"),
    month: z.iso.date().optional(),
  });
  const parsed = querySchema.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: "Filtros inválidos.", details: parsed.error.flatten() });
    return;
  }

  const { category, status, month } = parsed.data;
  const monthDate = month ? new Date(`${month.slice(0, 7)}-01T00:00:00`) : undefined;
  const where = {
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
  };
  const records = (await prisma.bill.findMany({
    where,
    orderBy: [{ dueDate: "asc" }, { createdAt: "desc" }],
  })).map(presentBill);
  res.json(status === "all" ? records : records.filter((bill) => bill.status === status));
});

router.post("/", async (req: AuthenticatedRequest, res) => {
  const parsed = billSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Dados inválidos.", details: parsed.error.flatten() });
    return;
  }
  const bill = await prisma.bill.create({
    data: {
      ...parsed.data,
      dueDate: new Date(`${parsed.data.dueDate}T00:00:00.000Z`),
      userId: getUserId(req),
    },
  });
  res.status(201).json(presentBill(bill));
});

router.patch("/:id", async (req: AuthenticatedRequest, res) => {
  const userId = getUserId(req);
  const existing = await prisma.bill.findFirst({ where: { id: getBillId(req), userId } });
  if (!existing) {
    res.status(404).json({ error: "Conta não encontrada." });
    return;
  }

  const parsed = billSchema.partial().safeParse(req.body);
  if (!parsed.success || Object.keys(parsed.data ?? {}).length === 0) {
    res.status(400).json({ error: "Dados inválidos.", details: parsed.success ? undefined : parsed.error.flatten() });
    return;
  }
  const updateData = {
    ...parsed.data,
    ...(parsed.data.dueDate
      ? { dueDate: new Date(`${parsed.data.dueDate}T00:00:00.000Z`) }
      : {}),
  };
  const bill = await prisma.bill.update({ where: { id: existing.id }, data: updateData });
  res.json(presentBill(bill));
});

router.delete("/:id", async (req: AuthenticatedRequest, res) => {
  const result = await prisma.bill.deleteMany({
    where: { id: getBillId(req), userId: getUserId(req) },
  });
  if (!result.count) {
    res.status(404).json({ error: "Conta não encontrada." });
    return;
  }
  res.status(204).end();
});

router.patch("/:id/payment", async (req: AuthenticatedRequest, res) => {
  const parsed = z.object({ paid: z.boolean() }).safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Informe se a conta está paga." });
    return;
  }
  const result = await prisma.bill.updateMany({
    where: { id: getBillId(req), userId: getUserId(req) },
    data: { paidAt: parsed.data.paid ? new Date() : null },
  });
  if (!result.count) {
    res.status(404).json({ error: "Conta não encontrada." });
    return;
  }
  const bill = await prisma.bill.findFirstOrThrow({
    where: { id: getBillId(req), userId: getUserId(req) },
  });
  res.json(presentBill(bill));
});

export { statusOf };
export default router;
