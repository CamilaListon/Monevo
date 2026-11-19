import { CheckCircle2, CircleAlert, X } from "lucide-react";
import { useEffect, useRef } from "react";

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
      className="modal-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        className="confirm-dialog"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <button
          className="icon-button confirm-close"
          type="button"
          onClick={onClose}
          aria-label="Fechar"
        >
          <X size={18} />
        </button>
        <span
          className={`confirm-dialog-icon ${tone === "success" ? "alert-dialog-success" : "confirm-dialog-danger"}`}
        >
          {tone === "success" ? (
            <CheckCircle2 size={20} />
          ) : (
            <CircleAlert size={20} />
          )}
        </span>
        <h2 id="alert-dialog-title">{title}</h2>
        <p id="alert-dialog-description">{description}</p>
        <div className="confirm-dialog-actions">
          <button
            ref={buttonRef}
            type="button"
            className="button button-dark"
            onClick={onClose}
          >
            {buttonLabel}
          </button>
        </div>
      </section>
    </div>
  );
}
