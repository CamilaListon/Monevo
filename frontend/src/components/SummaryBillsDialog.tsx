import { Pencil, X } from "lucide-react";
import { useEffect, useRef } from "react";
import type { Bill } from "../types";
import StatusBadge from "./StatusBadge";
import { formatCurrency, formatDate } from "../utils/format";
import { iconButtonClasses, modalBackdropClasses } from "../utils/tailwind";

export default function SummaryBillsDialog({
  title,
  bills,
  onClose,
  onEdit,
}: {
  title: string;
  bills: Bill[];
  onClose: () => void;
  onEdit: (bill: Bill) => void;
}) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    closeButtonRef.current?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <div
      className={`${modalBackdropClasses} max-[600px]:!items-center`}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        className="flex max-h-[calc(100dvh-48px)] w-full max-w-[540px] flex-col overflow-hidden rounded-[15px] border border-[#edf0ea] bg-white p-5 shadow-[0_22px_70px_#10201d35] dark:border-dark-border dark:bg-dark-surface max-[600px]:max-h-[calc(100dvh-20px)] max-[600px]:p-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby="summary-bills-title"
      >
        <header className="mb-3 flex shrink-0 items-start justify-between gap-3">
          <div>
            <h2
              id="summary-bills-title"
              className="font-display text-[20px] font-semibold text-[#173d33] dark:text-[#e2ece5]"
            >
              {title}
            </h2>
            <p className="mt-1 text-[12px] text-[#87938c] dark:text-[#a5b5ac]">
              {bills.length}{" "}
              {bills.length === 1 ? "conta encontrada" : "contas encontradas"}
            </p>
          </div>
          <button
            ref={closeButtonRef}
            className={iconButtonClasses}
            type="button"
            onClick={onClose}
            aria-label="Fechar"
          >
            <X size={18} />
          </button>
        </header>
        <div className="min-h-0 overflow-y-auto">
          {bills.length > 0 ? (
            bills.map((bill) => (
              <article
                key={bill.id}
                className="flex items-center gap-3 border-b border-[#f0f2ee] py-3 last:border-0 dark:border-dark-border"
              >
                <div className="min-w-0 flex-1">
                  <b className="block truncate text-[12px] font-semibold text-[#294239] dark:text-[#e2ece5]">
                    {bill.title}
                  </b>
                  <div className="mt-1 flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
                    <span className="truncate text-[11px] text-[#87938c] dark:text-[#a5b5ac]">
                      {bill.category} · Vence em {formatDate(bill.dueDate)}
                    </span>
                    <StatusBadge status={bill.status} />
                  </div>
                </div>
                <b className="shrink-0 text-[12px] font-semibold text-[#31483e] dark:text-[#e2ece5]">
                  {formatCurrency(bill.amount)}
                </b>
                <button
                  type="button"
                  title="Editar conta"
                  aria-label={`Editar ${bill.title}`}
                  className={iconButtonClasses}
                  onClick={() => onEdit(bill)}
                >
                  <Pencil size={15} />
                </button>
              </article>
            ))
          ) : (
            <p className="py-8 text-center text-[12px] text-[#87938c] dark:text-[#a5b5ac]">
              Não há contas nesta situação no mês selecionado.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
