import { AlertTriangle, Trash2, X } from "lucide-react";
import { useEffect, useRef } from "react";
import {
  buttonBaseClasses,
  buttonDarkClasses,
  buttonQuietClasses,
  iconButtonClasses,
  modalBackdropClasses,
} from "../utils/tailwind";

interface ConfirmDialogProps {
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  busy?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export default function ConfirmDialog({
  title,
  description,
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  destructive = false,
  busy = false,
  onConfirm,
  onClose,
}: ConfirmDialogProps) {
  const confirmButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    confirmButtonRef.current?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !busy) onClose();
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [busy, onClose]);

  return (
    <div
      className={modalBackdropClasses}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !busy) onClose();
      }}
    >
      <section
        className="relative w-full max-w-[410px] animate-dialog-in rounded-[15px] border border-[#edf0ea] bg-white p-[26px] text-center shadow-[0_22px_70px_#10201d35] dark:border-dark-border dark:bg-dark-surface"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        aria-describedby="confirm-dialog-description"
      >
        <button
          className={`${iconButtonClasses} absolute right-[14px] top-[14px]`}
          type="button"
          onClick={onClose}
          disabled={busy}
          aria-label="Fechar"
        >
          <X size={18} />
        </button>
        <span
          className={`mx-auto mb-[14px] grid size-11 place-items-center rounded-xl ${destructive ? "bg-[#fff0e9] text-[#dc6847] dark:bg-[#3a2923] dark:text-[#ffb49a]" : "bg-[#fff5dc] text-[#c8912d] dark:bg-[#3a321f] dark:text-[#f2ce7e]"}`}
        >
          {destructive ? <Trash2 size={20} /> : <AlertTriangle size={20} />}
        </span>
        <h2
          id="confirm-dialog-title"
          className="mb-2 font-display text-[21px] font-semibold text-[#173d33] dark:text-[#e2ece5]"
        >
          {title}
        </h2>
        <p
          id="confirm-dialog-description"
          className="mx-auto max-w-[340px] text-[12px] leading-[1.65] text-[#87938c] dark:text-[#b4c3ba]"
        >
          {description}
        </p>
        <div className="mt-5 flex justify-center gap-2 border-t border-[#eff1ed] pt-4 dark:border-[#34483d]">
          <button
            type="button"
            className={`${buttonBaseClasses} min-h-10 rounded-lg px-[13px] text-[12px] ${buttonQuietClasses}`}
            onClick={onClose}
            disabled={busy}
          >
            {cancelLabel}
          </button>
          <button
            ref={confirmButtonRef}
            type="button"
            className={`${buttonBaseClasses} min-h-10 rounded-lg px-[13px] text-[12px] ${destructive ? "bg-[#dc6847] text-white hover:bg-[#c95638] hover:shadow-[0_5px_16px_#dc684725]" : buttonDarkClasses}`}
            onClick={onConfirm}
            disabled={busy}
          >
            {busy ? "Aguarde..." : confirmLabel}
          </button>
        </div>
      </section>
    </div>
  );
}
