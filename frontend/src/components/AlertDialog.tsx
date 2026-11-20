import { CheckCircle2, CircleAlert, X } from "lucide-react";
import { useEffect, useRef } from "react";
import {
  buttonBaseClasses,
  buttonDarkClasses,
  iconButtonClasses,
  modalBackdropClasses,
} from "../utils/tailwind";

interface AlertDialogProps {
  title: string;
  description: string;
  tone?: "error" | "success";
  buttonLabel?: string;
  onClose: () => void;
}

export default function AlertDialog({
  title,
  description,
  tone = "error",
  buttonLabel = "Entendi",
  onClose,
}: AlertDialogProps) {
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    buttonRef.current?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <div
      className={modalBackdropClasses}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        className="relative w-full max-w-[410px] animate-dialog-in rounded-[15px] border border-[#edf0ea] bg-white p-[26px] text-center shadow-[0_22px_70px_#10201d35] dark:border-dark-border dark:bg-dark-surface"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <button
          className={`${iconButtonClasses} absolute right-[14px] top-[14px]`}
          type="button"
          onClick={onClose}
          aria-label="Fechar"
        >
          <X size={18} />
        </button>
        <span
          className={`mx-auto mb-[14px] grid size-11 place-items-center rounded-xl ${tone === "success" ? "bg-[#e4f2ee] text-teal dark:bg-[#20372d] dark:text-[#9cdec6]" : "bg-[#fff0e9] text-[#dc6847] dark:bg-[#3a2923] dark:text-[#ffb49a]"}`}
        >
          {tone === "success" ? (
            <CheckCircle2 size={20} />
          ) : (
            <CircleAlert size={20} />
          )}
        </span>
        <h2
          id="alert-dialog-title"
          className="mb-2 font-display text-[21px] font-semibold text-[#173d33] dark:text-[#e2ece5]"
        >
          {title}
        </h2>
        <p
          id="alert-dialog-description"
          className="mx-auto max-w-[340px] text-[12px] leading-[1.65] text-[#87938c] dark:text-[#b4c3ba]"
        >
          {description}
        </p>
        <div className="mt-5 flex justify-center gap-2 border-t border-[#eff1ed] pt-4 dark:border-[#34483d]">
          <button
            ref={buttonRef}
            type="button"
            className={`${buttonBaseClasses} min-h-10 rounded-lg px-[13px] text-[12px] ${buttonDarkClasses}`}
            onClick={onClose}
          >
            {buttonLabel}
          </button>
        </div>
      </section>
    </div>
  );
}
