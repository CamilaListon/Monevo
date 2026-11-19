export function presentUser(user: {
  id: string;
  name: string;
  email: string;
  avatarMimeType: string | null;
}) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    avatarUrl: user.avatarMimeType
      ? `/profile/avatar?v=${encodeURIComponent(user.avatarMimeType)}`
      : null,
  };
}

export function statusOf(bill: {
  paidAt: Date | null;
  dueDate: Date;
}): "paid" | "pending" | "overdue" {
  if (bill.paidAt) return "paid";
  const today = new Date().toISOString().slice(0, 10);
  return bill.dueDate.toISOString().slice(0, 10) < today ? "overdue" : "pending";
}

export function presentBill<T extends { amount: unknown; paidAt: Date | null; dueDate: Date }>(
  bill: T,
) {
  return { ...bill, amount: Number(bill.amount), status: statusOf(bill) };
}
