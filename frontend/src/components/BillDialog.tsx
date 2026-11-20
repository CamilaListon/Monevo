import { useState, type FormEvent } from "react";
import { ArrowRight, X } from "lucide-react";
import { api } from "../utils/api";
import type { Bill, BillInput } from "../types";
import AlertDialog from "./AlertDialog";

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
      className="modal-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        className="bill-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="dialog-title"
      >
        <div className="dialog-heading">
          <div>
            <span className="panel-kicker">
              {value ? "ATUALIZE OS DETALHES" : "NOVA DESPESA"}
            </span>
            <h2 id="dialog-title">
              {value ? "Editar conta" : "Adicionar conta"}
            </h2>
            <p>
              {value
                ? "Mantenha as informações sempre em dia."
                : "Organize um novo compromisso financeiro."}
            </p>
          </div>
          <button className="icon-button" onClick={onClose} aria-label="Fechar">
            <X size={19} />
          </button>
        </div>
        <form className="bill-form" onSubmit={submit}>
          <label>
            Nome da conta
            <input
              name="title"
              defaultValue={value?.title}
              placeholder="Ex.: Conta de energia"
              required
              maxLength={100}
            />
          </label>
          <div className="form-row">
            <label>
              Categoria
              <select
                value={isCustom ? "Outros" : category}
                onChange={(event) => setCategory(event.target.value)}
              >
                {categories.map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
            </label>
            <label>
              Valor
              <input
                name="amount"
                type="number"
                defaultValue={value?.amount}
                placeholder="0,00"
                min="0.01"
                step="0.01"
                required
              />
            </label>
          </div>
          {(isCustom || category === "Outros") && (
            <label>
              Nome da categoria
              <input
                value={customCategory}
                onChange={(event) => setCustomCategory(event.target.value)}
                placeholder="Ex.: Pets"
                maxLength={40}
              />
            </label>
          )}
          <label>
            Data de vencimento
            <input
              name="dueDate"
              type="date"
              defaultValue={value?.dueDate.slice(0, 10)}
              required
            />
          </label>
          {!value && (
            <div className="recurring-option">
              <input
                id="recurring-bill"
                className="recurring-option-checkbox"
                name="recurring"
                type="checkbox"
                checked={recurring}
                onChange={(event) => setRecurring(event.target.checked)}
              />
              <label
                className="recurring-option-label"
                htmlFor="recurring-bill"
              >
                <b>Repetir mensalmente</b>
                <small>
                  A conta será criada automaticamente nos meses seguintes.
                </small>
              </label>
            </div>
          )}
          <label>
            Observação <span className="optional-label">opcional</span>
            <textarea
              name="notes"
              defaultValue={value?.notes ?? ""}
              placeholder="Adicione um lembrete ou detalhe"
              rows={3}
              maxLength={500}
            />
          </label>
          <div className="dialog-actions">
            <button
              type="button"
              className="button button-quiet"
              onClick={onClose}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="button button-dark"
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
