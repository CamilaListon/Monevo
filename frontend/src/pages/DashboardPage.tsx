import { lazy, Suspense, useEffect, useState } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  Check,
  CheckCircle2,
  FileText,
  Menu,
  Pencil,
  Plus,
  Repeat,
  Search,
  ShieldCheck,
  Trash2,
  Wallet,
} from "lucide-react";
import { Link } from "react-router-dom";
import BillDialog from "../components/BillDialog";
import AlertDialog from "../components/AlertDialog";
import ConfirmDialog from "../components/ConfirmDialog";
import StatusBadge from "../components/StatusBadge";
import SummaryCard from "../components/SummaryCard";
import ThemeToggle from "../components/ThemeToggle";
import Sidebar from "../components/Sidebar";
import { api, apiUrl } from "../utils/api";
import {
  formatCurrency,
  formatDate,
  monthLabel,
  currentMonth,
} from "../utils/format";
import type {
  Bill,
  DashboardData,
  StatusFilter,
  ThemeMode,
  User,
} from "../types";

const DashboardCharts = lazy(() => import("../components/DashboardCharts"));

export default function DashboardPage({
  user,
  theme,
  onToggleTheme,
  onLogout,
}: {
  user: User;
  theme: ThemeMode;
  onToggleTheme: () => void;
  onLogout: () => void;
}) {
  const [month, setMonth] = useState(currentMonth());
  const [status, setStatus] = useState<StatusFilter>("all");
  const [category, setCategory] = useState("all");
  const [data, setData] = useState<DashboardData | null>(null);
  const [recurringBills, setRecurringBills] = useState<Bill[]>([]);
  const [recurringLoading, setRecurringLoading] = useState(true);
  const [recurringSearch, setRecurringSearch] = useState("");
  const [recurringCategory, setRecurringCategory] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [dialog, setDialog] = useState<Bill | "new" | null>(null);
  const [search, setSearch] = useState("");
  const [mobileMenu, setMobileMenu] = useState(false);
  const [activeNav, setActiveNav] = useState("Visão geral");
  const [billToDelete, setBillToDelete] = useState<Bill | null>(null);
  const [deleteBusy, setDeleteBusy] = useState(false);

  async function loadDashboard() {
    setLoading(true);
    setError("");
    try {
      const result = await api<DashboardData>(`/dashboard?month=${month}-01`);
      setData(result);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Não foi possível carregar o painel.",
      );
    } finally {
      setLoading(false);
    }
  }

  async function loadRecurringBills() {
    setRecurringLoading(true);
    try {
      setRecurringBills(await api<Bill[]>("/bills?recurring=true"));
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Não foi possível carregar as contas recorrentes.",
      );
    } finally {
      setRecurringLoading(false);
    }
  }

  useEffect(() => {
    void loadDashboard();
  }, [month]);

  useEffect(() => {
    void loadRecurringBills();
  }, []);

  async function logout() {
    try {
      await api<void>("/auth/logout", { method: "POST" });
      onLogout();
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Não foi possível encerrar a sessão.",
      );
    }
  }

  async function togglePayment(bill: Bill) {
    try {
      await api<Bill>(`/bills/${bill.id}/payment`, {
        method: "PATCH",
        body: JSON.stringify({ paid: bill.status !== "paid" }),
      });
      await loadDashboard();
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Não foi possível atualizar o pagamento.",
      );
    }
  }

  async function toggleRecurrence(bill: Bill) {
    const isRecurring = bill.recurring || Boolean(bill.recurrenceSourceId);
    try {
      await api<Bill>(`/bills/${bill.id}/recurrence`, {
        method: "PATCH",
        body: JSON.stringify({ recurring: !isRecurring }),
      });
      await Promise.all([loadDashboard(), loadRecurringBills()]);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Não foi possível atualizar a recorrência.",
      );
    }
  }

  async function deleteBill(bill: Bill) {
    setDeleteBusy(true);
    try {
      await api<void>(`/bills/${bill.id}`, { method: "DELETE" });
      await Promise.all([loadDashboard(), loadRecurringBills()]);
      setBillToDelete(null);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Não foi possível excluir a conta.",
      );
    } finally {
      setDeleteBusy(false);
    }
  }

  const bills = (data?.bills ?? []).filter((bill) => {
    const matchesStatus = status === "all" || bill.status === status;
    const matchesCategory = category === "all" || bill.category === category;
    const matchesSearch = `${bill.title} ${bill.category}`
      .toLowerCase()
      .includes(search.toLowerCase());
    return matchesStatus && matchesCategory && matchesSearch;
  });
  const categories = [
    ...new Set((data?.bills ?? []).map((bill) => bill.category)),
  ];
  const recurringCategories = [
    ...new Set(recurringBills.map((bill) => bill.category)),
  ];
  const filteredRecurringBills = recurringBills.filter((bill) => {
    const matchesCategory =
      recurringCategory === "all" || bill.category === recurringCategory;
    const matchesSearch = `${bill.title} ${bill.category}`
      .toLowerCase()
      .includes(recurringSearch.toLowerCase());
    return matchesCategory && matchesSearch;
  });
  const paidCount =
    data?.bills.filter((bill) => bill.status === "paid").length ?? 0;
  const paidPercentage = data?.bills.length
    ? Math.round((paidCount / data.bills.length) * 100)
    : 0;

  return (
    <div className="dashboard-shell">
      <Sidebar
        page="dashboard"
        activeSection={activeNav}
        mobileMenu={mobileMenu}
        onClose={() => setMobileMenu(false)}
        onLogout={() => void logout()}
        onSectionChange={(section, target) => {
          setActiveNav(section);
          setMobileMenu(false);
          const targetId = target.split("#")[1];
          if (targetId) {
            document
              .getElementById(targetId)
              ?.scrollIntoView({ behavior: "smooth" });
          }
        }}
      />
      {mobileMenu && (
        <button
          className="mobile-backdrop"
          aria-label="Fechar menu"
          onClick={() => setMobileMenu(false)}
        />
      )}
      <main className="dashboard-main">
        <header className="dash-topbar">
          <button
            className="mobile-menu-button"
            onClick={() => setMobileMenu(!mobileMenu)}
            aria-label="Abrir menu"
          >
            <Menu size={21} />
          </button>
          <div className="breadcrumb">
            Seu espaço <span>/</span> <b>Visão geral</b>
          </div>
          <div className="topbar-right">
            <ThemeToggle theme={theme} onToggle={onToggleTheme} compact />
            <div className="topbar-divider" />
            <Link
              className="user-profile-link"
              to="/account"
              aria-label="Abrir minha conta"
            >
              <div className="user-avatar">
                {user.avatarUrl ? (
                  <img
                    src={apiUrl(user.avatarUrl)}
                    crossOrigin="use-credentials"
                    alt=""
                  />
                ) : (
                  user.name.charAt(0).toUpperCase()
                )}
              </div>
              <div className="user-meta">
                <b>{user.name.split(" ")[0]}</b>
                <span>Minha conta</span>
              </div>
            </Link>
          </div>
        </header>
        <div className="dashboard-content">
          <div className="welcome-row">
            <div>
              <div className="welcome-date">
                {new Intl.DateTimeFormat("pt-BR", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                }).format(new Date())}
              </div>
              <h1>
                Bom dia, {user.name.split(" ")[0]}{" "}
                <span className="wave">✳</span>
              </h1>
              <p>Aqui está o resumo das suas contas.</p>
            </div>
            <button
              className="button button-dark add-button"
              onClick={() => setDialog("new")}
            >
              <Plus size={18} /> Novo lançamento
            </button>
          </div>
          <section className="summary-grid" aria-label="Resumo mensal">
            <SummaryCard
              title="Total de contas"
              value={data?.summary.total ?? 0}
              icon={<Wallet size={18} />}
              tone="green"
              footer={`${data?.bills.length ?? 0} contas neste mês`}
            />
            <SummaryCard
              title="Já pagas"
              value={data?.summary.paid ?? 0}
              icon={<CheckCircle2 size={18} />}
              tone="teal"
              footer={`${paidPercentage}% das contas do mês`}
            />
            <SummaryCard
              title="A vencer"
              value={data?.summary.pending ?? 0}
              icon={<CalendarDays size={18} />}
              tone="orange"
              footer="Contas ainda não pagas"
            />
            <SummaryCard
              title="Atrasadas"
              value={data?.summary.overdue ?? 0}
              icon={<ArrowUpRight size={18} />}
              tone="red"
              footer="Precisam da sua atenção"
            />
          </section>
          <Suspense
            fallback={
              <div className="insights-grid">
                <div className="panel chart-loading">
                  Carregando gráficos...
                </div>
                <div className="panel chart-loading">
                  Carregando gráficos...
                </div>
              </div>
            }
          >
            <DashboardCharts
              data={data}
              month={monthLabel(month)}
              monthValue={month}
              loading={loading}
              onMonthChange={setMonth}
            />
          </Suspense>
          <section className="panel bills-panel" id="bills-section">
            <div className="panel-heading bills-heading">
              <div>
                <span className="panel-kicker">ACOMPANHE DE PERTO</span>
                <h2>
                  Suas contas{" "}
                  <span className="count-badge">{data?.bills.length ?? 0}</span>
                </h2>
              </div>
              <div className="table-actions">
                <label className="search-field">
                  <Search size={16} />
                  <input
                    placeholder="Buscar conta..."
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                  />
                </label>
                <select
                  className="filter-select"
                  value={category}
                  onChange={(event) => setCategory(event.target.value)}
                  aria-label="Filtrar por categoria"
                >
                  <option value="all">Todas categorias</option>
                  {categories.map((item) => (
                    <option key={item}>{item}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="quick-filters">
              <span>Mostrar:</span>
              {(
                [
                  ["all", "Todas"],
                  ["pending", "Pendentes"],
                  ["overdue", "Atrasadas"],
                  ["paid", "Pagas"],
                ] as [StatusFilter, string][]
              ).map(([value, label]) => (
                <button
                  key={value}
                  onClick={() => setStatus(value)}
                  className={`filter-chip ${status === value ? "filter-chip-active" : ""}`}
                >
                  {label}
                  {value === "overdue" &&
                    (data?.bills.filter((bill) => bill.status === "overdue")
                      .length ?? 0) > 0 && (
                      <span className="filter-count">
                        {
                          data?.bills.filter(
                            (bill) => bill.status === "overdue",
                          ).length
                        }
                      </span>
                    )}
                </button>
              ))}
            </div>
            {loading ? (
              <div className="empty-state">
                <span className="loader" />
                <p>Carregando suas contas...</p>
              </div>
            ) : bills.length === 0 ? (
              <div className="empty-state">
                <span className="empty-icon">
                  <FileText size={22} />
                </span>
                <b>
                  {data?.bills.length
                    ? "Nenhuma conta com esses filtros"
                    : "Tudo começa com uma conta"}
                </b>
                <p>
                  {data?.bills.length
                    ? "Tente mudar os filtros ou o período."
                    : "Cadastre sua primeira conta e acompanhe tudo por aqui."}
                </p>
                {!data?.bills.length && (
                  <button
                    className="button button-dark button-small"
                    onClick={() => setDialog("new")}
                  >
                    <Plus size={16} /> Adicionar conta
                  </button>
                )}
              </div>
            ) : (
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>CONTA</th>
                      <th>CATEGORIA</th>
                      <th>VENCIMENTO</th>
                      <th>VALOR</th>
                      <th>SITUAÇÃO</th>
                      <th>RECORRENTE</th>
                      <th>
                        <span className="sr-only">Ações</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {bills.map((bill) => (
                      <tr key={bill.id}>
                        <td>
                          <div className="bill-title-cell">
                            <span
                              className={`bill-category-icon ${bill.status}`}
                            >
                              <FileText size={16} />
                            </span>
                            <div>
                              <b>{bill.title}</b>
                              <small>{bill.notes || bill.category}</small>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className="category-label">
                            {bill.category}
                          </span>
                        </td>
                        <td>
                          <span
                            className={
                              bill.status === "overdue" ? "due-overdue" : ""
                            }
                          >
                            {formatDate(bill.dueDate)}
                          </span>
                        </td>
                        <td className="amount-cell">
                          {formatCurrency(bill.amount)}
                        </td>
                        <td>
                          <StatusBadge status={bill.status} />
                        </td>
                        <td>
                          {bill.recurring || bill.recurrenceSourceId
                            ? "Sim"
                            : "Não"}
                        </td>
                        <td>
                          <div className="row-actions">
                            <button
                              title={
                                bill.status === "paid"
                                  ? "Marcar como pendente"
                                  : "Marcar como paga"
                              }
                              aria-label={
                                bill.status === "paid"
                                  ? "Marcar como pendente"
                                  : "Marcar como paga"
                              }
                              onClick={() => void togglePayment(bill)}
                              className={`row-action ${bill.status === "paid" ? "row-action-active" : ""}`}
                            >
                              <Check size={15} />
                            </button>
                            <button
                              title="Editar conta"
                              onClick={() => setDialog(bill)}
                              className="row-action"
                            >
                              <Pencil size={15} />
                            </button>
                            <button
                              title={
                                bill.recurring || bill.recurrenceSourceId
                                  ? "Tirar da recorrência"
                                  : "Tornar recorrente"
                              }
                              aria-label={
                                bill.recurring || bill.recurrenceSourceId
                                  ? "Tirar da recorrência"
                                  : "Tornar recorrente"
                              }
                              onClick={() => void toggleRecurrence(bill)}
                              className={`row-action ${bill.recurring || bill.recurrenceSourceId ? "row-action-active" : ""}`}
                            >
                              <Repeat size={15} />
                            </button>
                            <button
                              title="Excluir conta"
                              onClick={() => setBillToDelete(bill)}
                              className="row-action action-delete"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
          <section
            className="panel recurring-bills-panel"
            id="recurring-section"
          >
            <div className="panel-heading bills-heading">
              <div>
                <span className="panel-kicker">GESTÃO DE RECORRÊNCIAS</span>
                <h2>
                  Contas recorrentes{" "}
                  <span className="count-badge">
                    {filteredRecurringBills.length}
                  </span>
                </h2>
              </div>
              <div className="table-actions">
                <label className="search-field">
                  <Search size={16} />
                  <input
                    placeholder="Buscar conta recorrente..."
                    value={recurringSearch}
                    onChange={(event) => setRecurringSearch(event.target.value)}
                  />
                </label>
                <select
                  className="filter-select"
                  value={recurringCategory}
                  onChange={(event) => setRecurringCategory(event.target.value)}
                  aria-label="Filtrar recorrências por categoria"
                >
                  <option value="all">Todas categorias</option>
                  {recurringCategories.map((item) => (
                    <option key={item}>{item}</option>
                  ))}
                </select>
              </div>
            </div>
            {recurringLoading ? (
              <div className="empty-state">
                <span className="loader" />
                <p>Carregando contas recorrentes...</p>
              </div>
            ) : filteredRecurringBills.length === 0 ? (
              <div className="empty-state">
                <span className="empty-icon">
                  <Repeat size={22} />
                </span>
                <b>
                  {recurringBills.length
                    ? "Nenhuma recorrência corresponde aos filtros"
                    : "Nenhuma conta recorrente cadastrada"}
                </b>
                <p>
                  {recurringBills.length
                    ? "Tente buscar por outro nome ou categoria."
                    : "Ative a recorrência ao adicionar uma conta."}
                </p>
              </div>
            ) : (
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>CONTA</th>
                      <th>CATEGORIA</th>
                      <th>VENCIMENTO INICIAL</th>
                      <th>VALOR</th>
                      <th>
                        <span className="sr-only">Ações</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRecurringBills.map((bill) => (
                      <tr key={bill.id}>
                        <td>
                          <div className="bill-title-cell">
                            <span
                              className={`bill-category-icon ${bill.status}`}
                            >
                              <Repeat size={16} />
                            </span>
                            <div>
                              <b>{bill.title}</b>
                              <small>{bill.notes || bill.category}</small>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className="category-label">
                            {bill.category}
                          </span>
                        </td>
                        <td>{formatDate(bill.dueDate)}</td>
                        <td className="amount-cell">
                          {formatCurrency(bill.amount)}
                        </td>
                        <td>
                          <div className="row-actions">
                            <button
                              title="Editar conta recorrente"
                              aria-label="Editar conta recorrente"
                              onClick={() => setDialog(bill)}
                              className="row-action"
                            >
                              <Pencil size={15} />
                            </button>
                            <button
                              title="Tirar da recorrência"
                              aria-label="Tirar da recorrência"
                              onClick={() => void toggleRecurrence(bill)}
                              className="row-action row-action-active"
                            >
                              <Repeat size={15} />
                            </button>
                            <button
                              title="Excluir conta"
                              aria-label="Excluir conta"
                              onClick={() => setBillToDelete(bill)}
                              className="row-action action-delete"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
          <section className="panel payments-panel" id="payments-section">
            <div className="panel-heading">
              <div>
                <span className="panel-kicker">HISTÓRICO</span>
                <h2>Pagamentos recentes</h2>
              </div>
              <button
                className="subtle-link"
                onClick={() => {
                  setStatus("paid");
                  document
                    .getElementById("bills-section")
                    ?.scrollIntoView({ behavior: "smooth" });
                }}
              >
                Ver contas pagas <ArrowRight size={15} />
              </button>
            </div>
            {data?.recentPayments.length ? (
              <div className="payment-list">
                {data.recentPayments.map((bill) => (
                  <div className="payment-item" key={bill.id}>
                    <span className="payment-check">
                      <Check size={15} />
                    </span>
                    <div className="payment-name">
                      <b>{bill.title}</b>
                      <small>
                        {bill.category} · pago em{" "}
                        {bill.paidAt
                          ? formatDate(bill.paidAt)
                          : formatDate(bill.dueDate)}
                      </small>
                    </div>
                    <b className="payment-amount">
                      {formatCurrency(bill.amount)}
                    </b>
                    <span className="payment-status">Pago</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="no-payments">
                Os pagamentos registrados neste mês aparecerão aqui.
              </p>
            )}
          </section>
          <footer className="dashboard-footer">
            <span>© 2025 Monevo · Seu dinheiro, no ritmo certo.</span>
            <span>
              <ShieldCheck size={14} /> Seus dados são privados
            </span>
          </footer>
        </div>
      </main>
      {dialog && (
        <BillDialog
          value={dialog === "new" ? null : dialog}
          onClose={() => setDialog(null)}
          onSaved={async (dueDate) => {
            setDialog(null);
            const savedMonth = dueDate.slice(0, 7);
            if (savedMonth === month) {
              await loadDashboard();
            } else {
              setMonth(savedMonth);
            }
            await loadRecurringBills();
          }}
        />
      )}
      {billToDelete && (
        <ConfirmDialog
          title="Excluir conta?"
          description={`Excluir "${billToDelete.title}"? Esta ação não pode ser desfeita.`}
          confirmLabel="Excluir conta"
          destructive
          busy={deleteBusy}
          onConfirm={() => void deleteBill(billToDelete)}
          onClose={() => {
            if (!deleteBusy) setBillToDelete(null);
          }}
        />
      )}
      {error && (
        <AlertDialog
          title="Não foi possível concluir"
          description={error}
          onClose={() => setError("")}
        />
      )}
    </div>
  );
}
