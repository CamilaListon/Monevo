import type { Bill } from "../types";

export default function StatusBadge({ status }: { status: Bill["status"] }) {
  const labels = { paid: "Paga", pending: "Pendente", overdue: "Atrasada" };
  return (
    <span className={`status-badge badge-${status}`}>
      <span />
      {labels[status]}
    </span>
  );
}
