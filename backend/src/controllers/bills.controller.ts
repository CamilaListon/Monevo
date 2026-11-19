import type { Response } from "express";
import { z } from "zod";
import type { AuthenticatedRequest } from "../types/express.js";
import {
  billQuerySchema,
  billSchema,
  createBill,
  deleteBill,
  findBill,
  listBills,
  setBillPayment,
  updateBill,
} from "../services/bills.service.js";
import { presentBill } from "../utils/presenters.js";

export async function list(req: AuthenticatedRequest, res: Response): Promise<void> {
  const parsed = billQuerySchema.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: "Filtros inválidos.", details: parsed.error.flatten() });
    return;
  }
  const records = (await listBills(req, parsed.data)).map(presentBill);
  res.json(
    parsed.data.status === "all"
      ? records
      : records.filter((bill) => bill.status === parsed.data.status),
  );
}

export async function create(req: AuthenticatedRequest, res: Response): Promise<void> {
  const parsed = billSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Dados inválidos.", details: parsed.error.flatten() });
    return;
  }
  res.status(201).json(presentBill(await createBill(req, parsed.data)));
}

export async function update(req: AuthenticatedRequest, res: Response): Promise<void> {
  const existing = await findBill(req);
  if (!existing) {
    res.status(404).json({ error: "Conta não encontrada." });
    return;
  }
  const parsed = billSchema.partial().safeParse(req.body);
  if (!parsed.success || Object.keys(parsed.data ?? {}).length === 0) {
    res.status(400).json({
      error: "Dados inválidos.",
      details: parsed.success ? undefined : parsed.error.flatten(),
    });
    return;
  }
  const bill = await updateBill(existing.id, parsed.data);
  res.json(presentBill(bill));
}

export async function remove(req: AuthenticatedRequest, res: Response): Promise<void> {
  const result = await deleteBill(req);
  if (!result.count) {
    res.status(404).json({ error: "Conta não encontrada." });
    return;
  }
  res.status(204).end();
}

export async function payment(req: AuthenticatedRequest, res: Response): Promise<void> {
  const parsed = z.object({ paid: z.boolean() }).safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Informe se a conta está paga." });
    return;
  }
  const bill = await setBillPayment(req, parsed.data.paid);
  if (!bill) {
    res.status(404).json({ error: "Conta não encontrada." });
    return;
  }
  res.json(presentBill(bill));
}
