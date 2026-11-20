import { useState, type FormEvent } from "react";
import { ArrowRight, X } from "lucide-react";
import { api } from "../utils/api";
import type { Bill, BillInput } from "../types";
import AlertDialog from "./AlertDialog";
import {
  buttonBaseClasses,
  buttonDarkClasses,
  buttonQuietClasses,
  dialogPanelClasses,
  formFieldClasses,
  formLabelClasses,
  iconButtonClasses,
  modalBackdropClasses,
  textAreaClasses,
} from "../utils/tailwind";

export default function BillDialog({
  value,
  onClose,
  onSaved,
}: {
  value: Bill | null;
  onClose: () => void;
  onSaved: (dueDate: string) => Promise<void>;
}) {
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [recurring, setRecurring] = useState(false);
  const categories = [
    "Moradia",
    "Alimentação",
    "Transporte",
    "Saúde",
    "Educação",
    "Assinaturas",
    "Lazer",
    "Outros",
  ];
  const [category, setCategory] = useState(value?.category ?? "Moradia");
  const [customCategory, setCustomCategory] = useState(
    value && !categories.includes(value.category) ? value.category : "",
  );
  const isCustom = !categories.includes(category);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    const formData = new FormData(event.currentTarget);
    const bill: BillInput = {
      title: String(formData.get("title") ?? "").trim(),
      category:
        isCustom || category === "Outros"
          ? customCategory.trim() || (isCustom ? category : "Outros")
          : category,
      amount: Number(String(formData.get("amount") ?? "").replace(",", ".")),
      dueDate: String(formData.get("dueDate") ?? ""),
      notes: String(formData.get("notes") ?? "").trim(),
      ...(!value ? { recurring } : {}),
    };
    try {
      await api(`/bills${value ? `/${value.id}` : ""}`, {
        method: value ? "PATCH" : "POST",
        body: JSON.stringify(bill),
      });
      await onSaved(bill.dueDate);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Não foi possível salvar a conta.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      className={`${modalBackdropClasses} max-[600px]:!items-center`}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        className={dialogPanelClasses}
        role="dialog"
        aria-modal="true"
        aria-labelledby="dialog-title"
      >
        <div className="mb-5 flex items-start justify-between">
          <div>
            <span className="text-[10px] font-bold tracking-[1.1px] text-[#9aa59e] dark:text-[#9eafa5]">
              {value ? "ATUALIZE OS DETALHES" : "NOVA DESPESA"}
            </span>
            <h2
              id="dialog-title"
              className="my-[5px] font-display text-[21px] font-semibold text-[#173d33] dark:text-[#e2ece5]"
            >
              {value ? "Editar conta" : "Adicionar conta"}
            </h2>
            <p className="m-0 text-[10px] text-[#87938c] dark:text-[#a5b5ac]">
              {value
                ? "Mantenha as informações sempre em dia."
                : "Organize um novo compromisso financeiro."}
            </p>
          </div>
          <button
            className={iconButtonClasses}
            onClick={onClose}
            aria-label="Fechar"
          >
            <X size={19} />
          </button>
        </div>
        <form className="flex flex-col gap-[13px]" onSubmit={submit}>
          <label className={formLabelClasses}>
            Nome da conta
            <input
              name="title"
              className={formFieldClasses}
              defaultValue={value?.title}
              placeholder="Ex.: Conta de energia"
              required
              maxLength={100}
            />
          </label>
          <div className="grid grid-cols-2 gap-[11px]">
            <label className={formLabelClasses}>
              Categoria
              <select
                value={isCustom ? "Outros" : category}
                onChange={(event) => setCategory(event.target.value)}
                className={formFieldClasses}
              >
                {categories.map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
            </label>
            <label className={formLabelClasses}>
              Valor
              <input
                name="amount"
                type="number"
                className={formFieldClasses}
                defaultValue={value?.amount}
                placeholder="0,00"
                min="0.01"
                step="0.01"
                required
              />
            </label>
          </div>
          {(isCustom || category === "Outros") && (
            <label className={formLabelClasses}>
              Nome da categoria
              <input
                value={customCategory}
                onChange={(event) => setCustomCategory(event.target.value)}
                className={formFieldClasses}
                placeholder="Ex.: Pets"
                maxLength={40}
              />
            </label>
          )}
          <label className={formLabelClasses}>
            Data de vencimento
            <input
              name="dueDate"
              type="date"
              className={formFieldClasses}
              defaultValue={value?.dueDate.slice(0, 10)}
              required
            />
          </label>
          {!value && (
            <div className="flex flex-row items-start gap-2.5 rounded-[9px] border border-[#e6ebe4] bg-[#f7faf7] px-3 py-[11px] dark:border-[#34483d] dark:bg-[#111c16]">
              <input
                id="recurring-bill"
                className="mt-0 grid size-4 flex-none cursor-pointer place-content-center appearance-none rounded border border-[#9aa8a0] bg-white text-white checked:border-teal checked:bg-teal before:h-[7px] before:w-1 before:scale-0 before:rotate-45 before:border-b-2 before:border-r-2 before:border-current before:content-[''] checked:before:scale-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#69c5b0] dark:border-[#a5b5ac] dark:bg-dark-surface dark:text-dark-surface dark:checked:border-white dark:checked:bg-white"
                name="recurring"
                type="checkbox"
                checked={recurring}
                onChange={(event) => setRecurring(event.target.checked)}
              />
              <label
                className="flex cursor-pointer flex-col gap-[3px] text-[12px] font-semibold text-[#334940] dark:text-[#e2ece5]"
                htmlFor="recurring-bill"
              >
                <b className="text-[12px] leading-4">Repetir mensalmente</b>
                <small className="text-[10px] font-normal text-[#87938c] dark:text-[#a5b5ac]">
                  A conta será criada automaticamente nos meses seguintes.
                </small>
              </label>
            </div>
          )}
          <label className={formLabelClasses}>
            Observação{" "}
            <span className="text-[10px] font-normal text-[#a2aca6] dark:text-[#9eafa5]">
              opcional
            </span>
            <textarea
              name="notes"
              className={textAreaClasses}
              defaultValue={value?.notes ?? ""}
              placeholder="Adicione um lembrete ou detalhe"
              rows={3}
              maxLength={500}
            />
          </label>
          <div className="mt-1 flex justify-end gap-2 border-t border-[#eff1ed] pt-[15px] dark:border-dark-border">
            <button
              type="button"
              className={`${buttonBaseClasses} min-h-[39px] rounded-lg px-[13px] text-[10px] ${buttonQuietClasses}`}
              onClick={onClose}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className={`${buttonBaseClasses} min-h-[39px] rounded-lg px-[13px] text-[10px] ${buttonDarkClasses}`}
              disabled={busy}
            >
              {busy
                ? "Salvando..."
                : value
                  ? "Salvar alterações"
                  : "Adicionar conta"}{" "}
              <ArrowRight size={16} />
            </button>
          </div>
        </form>
      </section>
      {error && (
        <AlertDialog
          title="Não foi possível salvar"
          description={error}
          onClose={() => setError("")}
        />
      )}
    </div>
  );
}
