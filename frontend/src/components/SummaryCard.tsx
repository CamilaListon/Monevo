import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import type { ReactNode } from "react";
import { formatCurrency } from "../utils/format";

export default function SummaryCard({
  title,
  value,
  icon,
  tone,
  footer,
}: {
  title: string;
  value: number;
  icon: ReactNode;
  tone: string;
  footer: string;
}) {
  return (
    <div className={`summary-card summary-${tone}`}>
      <div className="summary-card-top">
        <span>{title}</span>
        <span className="summary-icon">{icon}</span>
      </div>
      <b className="summary-value">{formatCurrency(value)}</b>
      <div className="summary-footer">
        {tone === "teal" ? (
          <ArrowDownRight size={14} />
        ) : tone === "red" ? (
          <ArrowUpRight size={14} />
        ) : (
          <span className="summary-footer-dot" />
        )}
        {footer}
      </div>
    </div>
  );
}
