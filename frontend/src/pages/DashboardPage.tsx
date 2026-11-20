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
import SummaryBillsDialog from "../components/SummaryBillsDialog";
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
import {
  buttonBaseClasses,
  buttonDarkClasses,
  iconButtonClasses,
} from "../utils/tailwind";

const DashboardCharts = lazy(() => import("../components/DashboardCharts"));

const tableHeaderClasses =
  "h-[34px] border-b border-[#edf0eb] px-3 text-[10px] font-semibold tracking-[0.65px] text-[#a1aaa4] dark:border-dark-border";
const tableCellClasses =
  "h-[57px] border-b border-[#f0f2ee] px-3 text-[12px] text-[#68766f] dark:border-dark-border";
const tableAmountClasses =
  "h-[57px] border-b border-[#f0f2ee] px-3 text-[10px] font-semibold text-[#31483e] dark:border-dark-border dark:text-[#e2ece5]";

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
  const [summaryDialog, setSummaryDialog] = useState<{
    title: string;
    filter: StatusFilter;
  } | null>(null);
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
  const summaryDialogBills = summaryDialog
    ? (data?.bills ?? []).filter(
        (bill) =>
          summaryDialog.filter === "all" ||
          bill.status === summaryDialog.filter,
      )
    : [];

  return (
    <div className="min-h-screen overflow-x-clip bg-[#f5f6f2] dark:bg-dark-canvas">
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
          className="hidden max-[820px]:fixed max-[820px]:inset-0 max-[820px]:z-[12] max-[820px]:block max-[820px]:bg-[#12251f99]"
          aria-label="Fechar menu"
          onClick={() => setMobileMenu(false)}
        />
      )}
      <main className="ml-[232px] min-h-screen max-[1080px]:ml-[205px] max-[820px]:ml-0">
        <header className="flex h-[68px] items-center justify-between border-b border-[#e9ede6] bg-white px-[37px] dark:border-dark-border dark:bg-dark-raised max-[1080px]:px-6 max-[820px]:h-[61px] max-[820px]:px-[18px] max-[600px]:px-3">
          <button
            className="hidden border-0 bg-transparent text-[#456057] dark:text-[#c0d0c6] max-[820px]:grid max-[820px]:place-items-center"
            onClick={() => setMobileMenu(!mobileMenu)}
            aria-label="Abrir menu"
          >
            <Menu size={21} />
          </button>
          <div className="mr-auto text-xs text-[#98a39d] max-[820px]:ml-[11px] max-[600px]:text-[10px]">
            Seu espaço <span className="px-2 text-[#c3cbc4]">/</span>{" "}
            <b className="font-semibold text-[#506159] dark:text-[#e2ece5]">
              Visão geral
            </b>
          </div>
          <div className="flex items-center gap-3 max-[600px]:gap-[7px]">
            <ThemeToggle theme={theme} onToggle={onToggleTheme} compact />
            <div className="mx-[3px] h-7 w-px bg-[#e9ede6] dark:bg-dark-border" />
            <Link
              className="flex items-center gap-[9px]"
              to="/account"
              aria-label="Abrir minha conta"
            >
              <div className="grid size-[31px] place-items-center overflow-hidden rounded-full bg-[#e2f0e9] font-display text-xs font-semibold text-[#0a675d] dark:bg-[#20372d] dark:text-[#a9e3ce]">
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
              <div className="max-[600px]:hidden">
                <b className="block text-xs font-semibold text-[#31443e] dark:text-[#e2ece5]">
                  {user.name.split(" ")[0]}
                </b>
                <span className="mt-[3px] block text-[10px] text-[#96a19b]">
                  Minha conta
                </span>
              </div>
            </Link>
          </div>
        </header>
        <div className="mx-auto w-full max-w-[1250px] px-[37px] pb-5 pt-[31px] max-[1080px]:px-6 max-[820px]:max-w-[740px] max-[820px]:px-5 max-[820px]:py-[25px] max-[600px]:px-[13px] max-[600px]:pb-4 max-[600px]:pt-[21px]">
          <div className="mb-[21px] flex items-center justify-between max-[600px]:items-start">
            <div>
              <div className="text-[10px] capitalize text-[#89968f] dark:text-[#a5b5ac]">
                {new Intl.DateTimeFormat("pt-BR", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                }).format(new Date())}
              </div>
              <h1 className="mb-[2px] mt-[5px] font-display text-[25px] font-semibold tracking-[-0.6px] text-[#123d33] dark:text-[#e5eee8] max-[600px]:text-[21px]">
                Bom dia, {user.name.split(" ")[0]}{" "}
                <span className="align-[2px] text-[18px] text-coral">✳</span>
              </h1>
              <p className="m-0 text-[12px] text-[#7b8881] dark:text-[#a5b5ac] max-[600px]:text-[10px]">
                Aqui está o resumo das suas contas.
              </p>
            </div>
            <button
              className={`${buttonBaseClasses} ${buttonDarkClasses} min-h-[39px] rounded-lg px-[14px] text-[12px] max-[600px]:min-h-[35px] max-[600px]:gap-1 max-[600px]:px-2 max-[600px]:text-[10px]`}
              onClick={() => setDialog("new")}
            >
              <Plus size={18} /> Novo lançamento
            </button>
          </div>
          <section
            className="grid grid-cols-4 gap-[13px] max-[1080px]:gap-[9px] max-[820px]:grid-cols-2 max-[600px]:gap-2"
            aria-label="Resumo mensal"
          >
            <SummaryCard
              title="Total de contas"
              value={data?.summary.total ?? 0}
              icon={<Wallet size={18} />}
              tone="green"
              footer={`${data?.bills.length ?? 0} contas neste mês`}
              onClick={() =>
                setSummaryDialog({ title: "Todas as contas", filter: "all" })
              }
            />
            <SummaryCard
              title="Já pagas"
              value={data?.summary.paid ?? 0}
              icon={<CheckCircle2 size={18} />}
              tone="teal"
              footer={`${paidPercentage}% das contas do mês`}
              onClick={() =>
                setSummaryDialog({ title: "Contas pagas", filter: "paid" })
              }
            />
            <SummaryCard
              title="A vencer"
              value={data?.summary.pending ?? 0}
              icon={<CalendarDays size={18} />}
              tone="orange"
              footer="Contas ainda não pagas"
              onClick={() =>
                setSummaryDialog({
                  title: "Contas a vencer",
                  filter: "pending",
                })
              }
            />
            <SummaryCard
              title="Atrasadas"
              value={data?.summary.overdue ?? 0}
              icon={<ArrowUpRight size={18} />}
              tone="red"
              footer="Precisam da sua atenção"
              onClick={() =>
                setSummaryDialog({
                  title: "Contas atrasadas",
                  filter: "overdue",
                })
              }
            />
          </section>
          <Suspense
            fallback={
              <div className="mt-[14px] grid grid-cols-[1.55fr_1fr] gap-[14px] max-[1080px]:grid-cols-[1.3fr_1fr] max-[1080px]:gap-[10px] max-[820px]:mt-[9px] max-[820px]:grid-cols-1 max-[820px]:gap-[9px]">
                <div className="grid h-full place-items-center rounded-[11px] border border-[#e9ede6] bg-white text-[12px] text-[#89968f] dark:border-dark-border dark:bg-dark-surface">
                  Carregando gráficos...
                </div>
                <div className="grid h-full place-items-center rounded-[11px] border border-[#e9ede6] bg-white text-[12px] text-[#89968f] dark:border-dark-border dark:bg-dark-surface">
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
          <section
            className="mt-[14px] scroll-mt-[15px] rounded-[11px] border border-[#e9ede6] bg-white px-[19px] pb-0 pt-[17px] dark:border-dark-border dark:bg-dark-surface max-[600px]:px-[11px] max-[600px]:pt-[13px]"
            id="bills-section"
          >
            <div className="flex items-center justify-between max-[820px]:flex-wrap max-[820px]:gap-[10px]">
              <div>
                <span className="text-[10px] font-bold tracking-[1.1px] text-[#9aa59e] dark:text-[#9eafa5]">
                  ACOMPANHE DE PERTO
                </span>
                <h2 className="mt-[5px] flex items-center gap-2 font-display text-[16px] font-semibold tracking-[-0.3px] text-[#173d33] dark:text-[#e2ece5]">
                  Suas contas{" "}
                  <span className="inline-grid h-[19px] min-w-[19px] place-items-center rounded-md bg-[#e8f3ee] px-[5px] font-sans text-[10px] font-semibold text-teal">
                    {data?.bills.length ?? 0}
                  </span>
                </h2>
              </div>
              <div className="flex items-center gap-2 max-[600px]:w-full">
                <label className="flex min-h-[34px] flex-1 items-center gap-[7px] rounded-[7px] border border-[#e8ede7] px-[9px] text-[#9aa49e] dark:border-dark-border">
                  <Search size={16} />
                  <input
                    className="w-[116px] border-0 bg-transparent p-0 text-[10px] text-[#43564c] outline-none placeholder:text-[#a3ada7] dark:text-[#e2ece5] dark:placeholder:text-[#83958a] max-[600px]:w-full"
                    placeholder="Buscar conta..."
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                  />
                </label>
                <select
                  className="h-[34px] max-w-[46%] rounded-[7px] border border-[#e8ede7] bg-white px-[9px] pr-[25px] text-[10px] text-[#68766f] dark:border-dark-border dark:bg-[#1c2c24] dark:text-[#dce8df]"
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
            <div className="my-[13px] mb-[2px] flex items-center gap-[6px] overflow-x-auto pb-[3px]">
              <span className="mr-[3px] shrink-0 text-[10px] text-[#9aa49d] dark:text-[#a5b5ac]">
                Mostrar:
              </span>
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
                  className={`inline-flex min-h-[25px] shrink-0 items-center gap-[5px] rounded-md border px-[9px] text-[12px] ${status === value ? "border-[#dfebe4] bg-[#edf5f0] font-semibold text-[#0a6e63] dark:border-[#34574b] dark:bg-[#20372d] dark:text-[#a9e3ce]" : "border-transparent bg-transparent text-[#859189] hover:bg-[#f5f7f3] dark:text-[#a8b7ae] dark:hover:bg-[#1c2c24]"}`}
                >
                  {label}
                  {value === "overdue" &&
                    (data?.bills.filter((bill) => bill.status === "overdue")
                      .length ?? 0) > 0 && (
                      <span className="grid size-[14px] place-items-center rounded-full bg-[#ffe8de] text-[10px] text-[#bf5639]">
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
              <div className="flex min-h-[190px] flex-col items-center justify-center text-[#84918a] dark:text-[#a5b5ac]">
                <span className="inline-block size-5 animate-spin rounded-full border-2 border-[#dbe8df] border-t-teal" />
                <p className="my-[9px] mb-3 text-[10px]">
                  Carregando suas contas...
                </p>
              </div>
            ) : bills.length === 0 ? (
              <div className="flex min-h-[190px] flex-col items-center justify-center text-[#84918a] dark:text-[#a5b5ac]">
                <span className="grid size-10 place-items-center rounded-xl bg-[#e8f3ee] text-teal">
                  <FileText size={22} />
                </span>
                <b className="mt-[11px] text-[12px] text-[#40564c] dark:text-[#e2ece5]">
                  {data?.bills.length
                    ? "Nenhuma conta com esses filtros"
                    : "Tudo começa com uma conta"}
                </b>
                <p className="my-[9px] mb-3 text-center text-[10px]">
                  {data?.bills.length
                    ? "Tente mudar os filtros ou o período."
                    : "Cadastre sua primeira conta e acompanhe tudo por aqui."}
                </p>
                {!data?.bills.length && (
                  <button
                    className={`${buttonBaseClasses} ${buttonDarkClasses} min-h-[42px] px-4 text-xs`}
                    onClick={() => setDialog("new")}
                  >
                    <Plus size={16} /> Adicionar conta
                  </button>
                )}
              </div>
            ) : (
              <>
                <div className="w-full min-w-0 max-w-full overscroll-x-contain overflow-x-auto max-[820px]:hidden">
                  <table className="w-full min-w-[720px] border-collapse text-left [white-space:nowrap]">
                    <thead>
                      <tr>
                        <th className={tableHeaderClasses}>CONTA</th>
                        <th className={tableHeaderClasses}>CATEGORIA</th>
                        <th className={tableHeaderClasses}>VENCIMENTO</th>
                        <th className={tableHeaderClasses}>VALOR</th>
                        <th className={tableHeaderClasses}>SITUAÇÃO</th>
                        <th className={tableHeaderClasses}>RECORRENTE</th>
                        <th className={tableHeaderClasses}>
                          <span className="sr-only">Ações</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {bills.map((bill) => (
                        <tr key={bill.id}>
                          <td className={tableCellClasses}>
                            <div className="flex items-center gap-[9px]">
                              <span
                                className={`grid size-[31px] place-items-center rounded-lg ${bill.status === "paid" ? "bg-[#e7f3ee] text-teal" : bill.status === "overdue" ? "bg-[#fff0e9] text-[#e46e4c]" : "bg-[#fff5dd] text-[#bc8e3b]"}`}
                              >
                                <FileText size={16} />
                              </span>
                              <div>
                                <b className="block max-w-[175px] overflow-hidden text-ellipsis text-[12px] font-semibold text-[#294239] dark:text-[#e2ece5]">
                                  {bill.title}
                                </b>
                                <small className="mt-1 block max-w-[175px] overflow-hidden text-ellipsis text-[12px] text-[#9ba59e]">
                                  {bill.notes || bill.category}
                                </small>
                              </div>
                            </div>
                          </td>
                          <td className={tableCellClasses}>
                            <span className="rounded-[5px] bg-[#f4f6f2] px-2 py-[5px] text-[12px] text-[#728078] dark:bg-[#1c2c24] dark:text-[#a5b5ac]">
                              {bill.category}
                            </span>
                          </td>
                          <td className={tableCellClasses}>
                            <span
                              className={
                                bill.status === "overdue" ? "due-overdue" : ""
                              }
                            >
                              {formatDate(bill.dueDate)}
                            </span>
                          </td>
                          <td className={tableAmountClasses}>
                            {formatCurrency(bill.amount)}
                          </td>
                          <td className={tableCellClasses}>
                            <StatusBadge
                              status={bill.status}
                              animateBackground={bill.status === "overdue"}
                            />
                          </td>
                          <td className={tableCellClasses}>
                            {bill.recurring || bill.recurrenceSourceId
                              ? "Sim"
                              : "Não"}
                          </td>
                          <td className={tableCellClasses}>
                            <div className="flex justify-end gap-1">
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
                                className={`grid size-[27px] place-items-center rounded-md ${bill.status === "paid" ? "bg-[#edf5f0] text-teal dark:bg-[#20372d] dark:text-[#a9e3ce]" : "bg-transparent text-[#9aa59e] hover:bg-[#edf5f0] hover:text-teal"}`}
                              >
                                <Check size={15} />
                              </button>
                              <button
                                title="Editar conta"
                                onClick={() => setDialog(bill)}
                                className={`${iconButtonClasses} !size-[27px] !border-0 !bg-transparent !text-[#9aa59e]`}
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
                                className={`grid size-[27px] place-items-center rounded-md ${bill.recurring || bill.recurrenceSourceId ? "bg-[#edf5f0] text-teal dark:bg-[#20372d] dark:text-[#a9e3ce]" : "bg-transparent text-[#9aa59e] hover:bg-[#edf5f0] hover:text-teal"}`}
                              >
                                <Repeat size={15} />
                              </button>
                              <button
                                title="Excluir conta"
                                onClick={() => setBillToDelete(bill)}
                                className="grid size-[27px] place-items-center rounded-md bg-transparent text-[#9aa59e] hover:bg-[#fff1eb] hover:text-[#dd6245]"
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
                <div className="hidden min-w-0 space-y-2 overflow-hidden pb-3 max-[820px]:block">
                  {bills.map((bill) => (
                    <article
                      key={bill.id}
                      className="min-w-0 overflow-hidden rounded-lg border border-[#e8ede7] p-3 dark:border-dark-border"
                    >
                      <div className="flex min-w-0 items-start justify-between gap-2">
                        <div className="flex min-w-0 items-start gap-2">
                          <span
                            className={`grid size-[31px] shrink-0 place-items-center rounded-lg ${bill.status === "paid" ? "bg-[#e7f3ee] text-teal" : bill.status === "overdue" ? "bg-[#fff0e9] text-[#e46e4c]" : "bg-[#fff5dd] text-[#bc8e3b]"}`}
                          >
                            <FileText size={16} />
                          </span>
                          <div className="min-w-0">
                            <b className="block break-words text-[12px] font-semibold text-[#294239] dark:text-[#e2ece5]">
                              {bill.title}
                            </b>
                            <small className="mt-1 block break-words text-[11px] text-[#9ba59e]">
                              {bill.notes || bill.category}
                            </small>
                          </div>
                        </div>
                        <b className="shrink-0 text-[12px] font-semibold text-[#31483e] dark:text-[#e2ece5]">
                          {formatCurrency(bill.amount)}
                        </b>
                      </div>
                      <div className="mt-3 flex flex-wrap items-center gap-2 text-[10px] text-[#68766f] dark:text-[#c1d0c7]">
                        <span>{formatDate(bill.dueDate)}</span>
                        <StatusBadge
                          status={bill.status}
                          animateBackground={bill.status === "overdue"}
                        />
                        <span className="rounded-md bg-[#f4f6f2] px-2 py-1 dark:bg-[#1c2c24]">
                          {bill.recurring || bill.recurrenceSourceId
                            ? "Recorrente"
                            : "Não recorrente"}
                        </span>
                      </div>
                      <div className="mt-2 flex justify-end gap-1 border-t border-[#f0f2ee] pt-2 dark:border-dark-border">
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
                          className={`grid size-[27px] place-items-center rounded-md ${bill.status === "paid" ? "bg-[#edf5f0] text-teal dark:bg-[#20372d] dark:text-[#a9e3ce]" : "bg-transparent text-[#9aa59e] hover:bg-[#edf5f0] hover:text-teal"}`}
                        >
                          <Check size={15} />
                        </button>
                        <button
                          title="Editar conta"
                          aria-label="Editar conta"
                          onClick={() => setDialog(bill)}
                          className={`${iconButtonClasses} !size-[27px] !border-0 !bg-transparent !text-[#9aa59e]`}
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
                          className={`grid size-[27px] place-items-center rounded-md ${bill.recurring || bill.recurrenceSourceId ? "bg-[#edf5f0] text-teal dark:bg-[#20372d] dark:text-[#a9e3ce]" : "bg-transparent text-[#9aa59e] hover:bg-[#edf5f0] hover:text-teal"}`}
                        >
                          <Repeat size={15} />
                        </button>
                        <button
                          title="Excluir conta"
                          aria-label="Excluir conta"
                          onClick={() => setBillToDelete(bill)}
                          className="grid size-[27px] place-items-center rounded-md bg-transparent text-[#9aa59e] hover:bg-[#fff1eb] hover:text-[#dd6245]"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              </>
            )}
          </section>
          <section
            className="mt-[14px] scroll-mt-[15px] rounded-[11px] border border-[#e9ede6] bg-white px-[19px] pb-0 pt-[17px] dark:border-dark-border dark:bg-dark-surface max-[600px]:px-[11px] max-[600px]:pt-[13px]"
            id="recurring-section"
          >
            <div className="flex items-center justify-between max-[820px]:flex-wrap max-[820px]:gap-[10px]">
              <div>
                <span className="text-[10px] font-bold tracking-[1.1px] text-[#9aa59e] dark:text-[#9eafa5]">
                  GESTÃO DE RECORRÊNCIAS
                </span>
                <h2 className="mt-[5px] flex items-center gap-2 font-display text-[16px] font-semibold tracking-[-0.3px] text-[#173d33] dark:text-[#e2ece5]">
                  Contas recorrentes{" "}
                  <span className="inline-grid h-[19px] min-w-[19px] place-items-center rounded-md bg-[#e8f3ee] px-[5px] font-sans text-[10px] font-semibold text-teal">
                    {filteredRecurringBills.length}
                  </span>
                </h2>
              </div>
              <div className="flex items-center gap-2 max-[600px]:w-full">
                <label className="flex min-h-[34px] flex-1 items-center gap-[7px] rounded-[7px] border border-[#e8ede7] px-[9px] text-[#9aa49e] dark:border-dark-border">
                  <Search size={16} />
                  <input
                    className="w-[116px] border-0 bg-transparent p-0 text-[10px] text-[#43564c] outline-none placeholder:text-[#a3ada7] dark:text-[#e2ece5] dark:placeholder:text-[#83958a] max-[600px]:w-full"
                    placeholder="Buscar conta recorrente..."
                    value={recurringSearch}
                    onChange={(event) => setRecurringSearch(event.target.value)}
                  />
                </label>
                <select
                  className="h-[34px] max-w-[46%] rounded-[7px] border border-[#e8ede7] bg-white px-[9px] pr-[25px] text-[10px] text-[#68766f] dark:border-dark-border dark:bg-[#1c2c24] dark:text-[#dce8df]"
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
              <div className="flex min-h-[190px] flex-col items-center justify-center text-[#84918a] dark:text-[#a5b5ac]">
                <span className="inline-block size-5 animate-spin rounded-full border-2 border-[#dbe8df] border-t-teal" />
                <p className="my-[9px] mb-3 text-[10px]">
                  Carregando contas recorrentes...
                </p>
              </div>
            ) : filteredRecurringBills.length === 0 ? (
              <div className="flex min-h-[190px] flex-col items-center justify-center text-[#84918a] dark:text-[#a5b5ac]">
                <span className="grid size-10 place-items-center rounded-xl bg-[#e8f3ee] text-teal">
                  <Repeat size={22} />
                </span>
                <b className="mt-[11px] text-[12px] text-[#40564c] dark:text-[#e2ece5]">
                  {recurringBills.length
                    ? "Nenhuma recorrência corresponde aos filtros"
                    : "Nenhuma conta recorrente cadastrada"}
                </b>
                <p className="my-[9px] mb-3 text-center text-[10px]">
                  {recurringBills.length
                    ? "Tente buscar por outro nome ou categoria."
                    : "Ative a recorrência ao adicionar uma conta."}
                </p>
              </div>
            ) : (
              <>
                <div className="w-full min-w-0 max-w-full overscroll-x-contain overflow-x-auto max-[820px]:hidden">
                  <table className="w-full min-w-[620px] border-collapse text-left [white-space:nowrap]">
                    <thead>
                      <tr>
                        <th className={tableHeaderClasses}>CONTA</th>
                        <th className={tableHeaderClasses}>CATEGORIA</th>
                        <th className={tableHeaderClasses}>
                          VENCIMENTO INICIAL
                        </th>
                        <th className={tableHeaderClasses}>VALOR</th>
                        <th className={tableHeaderClasses}>
                          <span className="sr-only">Ações</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredRecurringBills.map((bill) => (
                        <tr key={bill.id}>
                          <td className={tableCellClasses}>
                            <div className="flex items-center gap-[9px]">
                              <span
                                className={`grid size-[31px] shrink-0 place-items-center rounded-lg max-[600px]:size-6 ${bill.status === "paid" ? "bg-[#e7f3ee] text-teal" : bill.status === "overdue" ? "bg-[#fff0e9] text-[#e46e4c]" : "bg-[#fff5dd] text-[#bc8e3b]"}`}
                              >
                                <Repeat size={16} />
                              </span>
                              <div className="min-w-0">
                                <b className="block max-w-[175px] overflow-hidden text-ellipsis text-[12px] font-semibold text-[#294239] dark:text-[#e2ece5] max-[600px]:truncate">
                                  {bill.title}
                                </b>
                                <small className="mt-1 block max-w-[175px] overflow-hidden text-ellipsis text-[12px] text-[#9ba59e] max-[600px]:truncate">
                                  {bill.notes || bill.category}
                                </small>
                              </div>
                            </div>
                          </td>
                          <td className={tableCellClasses}>
                            <span className="rounded-[5px] bg-[#f4f6f2] px-2 py-[5px] text-[12px] text-[#728078] dark:bg-[#1c2c24] dark:text-[#a5b5ac]">
                              {bill.category}
                            </span>
                          </td>
                          <td className={tableCellClasses}>
                            {formatDate(bill.dueDate)}
                          </td>
                          <td className={tableAmountClasses}>
                            {formatCurrency(bill.amount)}
                          </td>
                          <td className={tableCellClasses}>
                            <div className="flex justify-end gap-1">
                              <button
                                title="Editar conta recorrente"
                                aria-label="Editar conta recorrente"
                                onClick={() => setDialog(bill)}
                                className={`${iconButtonClasses} !size-[27px] !border-0 !bg-transparent !text-[#9aa59e]`}
                              >
                                <Pencil size={15} />
                              </button>
                              <button
                                title="Tirar da recorrência"
                                aria-label="Tirar da recorrência"
                                onClick={() => void toggleRecurrence(bill)}
                                className="grid size-[27px] place-items-center rounded-md bg-[#edf5f0] text-teal dark:bg-[#20372d] dark:text-[#a9e3ce]"
                              >
                                <Repeat size={15} />
                              </button>
                              <button
                                title="Excluir conta"
                                aria-label="Excluir conta"
                                onClick={() => setBillToDelete(bill)}
                                className="grid size-[27px] place-items-center rounded-md bg-transparent text-[#9aa59e] hover:bg-[#fff1eb] hover:text-[#dd6245]"
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
                <div className="hidden min-w-0 space-y-2 overflow-hidden pb-3 max-[820px]:block">
                  {filteredRecurringBills.map((bill) => (
                    <article
                      key={bill.id}
                      className="min-w-0 overflow-hidden rounded-lg border border-[#e8ede7] p-3 dark:border-dark-border"
                    >
                      <div className="flex min-w-0 items-start justify-between gap-2">
                        <div className="flex min-w-0 items-start gap-2">
                          <span
                            className={`grid size-[31px] shrink-0 place-items-center rounded-lg ${bill.status === "paid" ? "bg-[#e7f3ee] text-teal" : bill.status === "overdue" ? "bg-[#fff0e9] text-[#e46e4c]" : "bg-[#fff5dd] text-[#bc8e3b]"}`}
                          >
                            <Repeat size={16} />
                          </span>
                          <div className="min-w-0">
                            <b className="block break-words text-[12px] font-semibold text-[#294239] dark:text-[#e2ece5]">
                              {bill.title}
                            </b>
                            <small className="mt-1 block break-words text-[11px] text-[#9ba59e]">
                              {bill.category}
                            </small>
                          </div>
                        </div>
                        <b className="shrink-0 text-[12px] font-semibold text-[#31483e] dark:text-[#e2ece5]">
                          {formatCurrency(bill.amount)}
                        </b>
                      </div>
                      <div className="mt-3 flex items-center justify-between gap-2 border-t border-[#f0f2ee] pt-2 dark:border-dark-border">
                        <span className="text-[10px] text-[#68766f] dark:text-[#c1d0c7]">
                          Próximo vencimento: {formatDate(bill.dueDate)}
                        </span>
                        <div className="flex shrink-0 gap-1">
                          <button
                            title="Editar conta recorrente"
                            aria-label="Editar conta recorrente"
                            onClick={() => setDialog(bill)}
                            className={`${iconButtonClasses} !size-[27px] !border-0 !bg-transparent !text-[#9aa59e]`}
                          >
                            <Pencil size={15} />
                          </button>
                          <button
                            title="Tirar da recorrência"
                            aria-label="Tirar da recorrência"
                            onClick={() => void toggleRecurrence(bill)}
                            className="grid size-[27px] place-items-center rounded-md bg-[#edf5f0] text-teal dark:bg-[#20372d] dark:text-[#a9e3ce]"
                          >
                            <Repeat size={15} />
                          </button>
                          <button
                            title="Excluir conta"
                            aria-label="Excluir conta"
                            onClick={() => setBillToDelete(bill)}
                            className="grid size-[27px] place-items-center rounded-md bg-transparent text-[#9aa59e] hover:bg-[#fff1eb] hover:text-[#dd6245]"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </>
            )}
          </section>
          <section
            className="mt-[14px] scroll-mt-[15px] rounded-[11px] border border-[#e9ede6] bg-white px-[19px] pb-3 pt-[17px] dark:border-dark-border dark:bg-dark-surface"
            id="payments-section"
          >
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold tracking-[1.1px] text-[#9aa59e] dark:text-[#9eafa5]">
                  HISTÓRICO
                </span>
                <h2 className="mt-[5px] font-display text-[16px] font-semibold tracking-[-0.3px] text-[#173d33] dark:text-[#e2ece5]">
                  Pagamentos recentes
                </h2>
              </div>
              <button
                className="inline-flex items-center gap-[5px] border-0 bg-transparent text-[10px] font-semibold text-teal"
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
              <div className="mt-2">
                {data.recentPayments.map((bill) => (
                  <div
                    className="flex min-h-[49px] items-center gap-[10px] border-b border-[#f0f2ee] text-[#334a40] last:border-0 max-[600px]:gap-[7px] dark:border-dark-border dark:text-[#e2ece5]"
                    key={bill.id}
                  >
                    <span className="grid size-[25px] place-items-center rounded-full bg-[#e8f4ee] text-teal">
                      <Check size={15} />
                    </span>
                    <div className="flex-1">
                      <b className="block text-[12px] font-semibold text-[#334a40] dark:text-[#e2ece5]">
                        {bill.title}
                      </b>
                      <small className="mt-1 block text-[12px] text-[#98a39c]">
                        {bill.category} · pago em{" "}
                        {bill.paidAt
                          ? formatDate(bill.paidAt)
                          : formatDate(bill.dueDate)}
                      </small>
                    </div>
                    <b className="text-[12px] font-semibold text-[#31483e] dark:text-[#e2ece5]">
                      {formatCurrency(bill.amount)}
                    </b>
                    <span className="ml-[13px] rounded-[5px] bg-[#e8f4ee] px-[7px] py-[5px] text-[10px] text-teal max-[600px]:ml-[3px]">
                      Pago
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="my-[22px] mb-5 text-center text-[10px] text-[#8c9891]">
                Os pagamentos registrados neste mês aparecerão aqui.
              </p>
            )}
          </section>
          <footer className="flex justify-between gap-2 px-0 pb-[3px] pt-[18px] text-[12px] text-[#9aa59e] max-[600px]:text-[9px]">
            <span>© 2025 Monevo · Seu dinheiro, no ritmo certo.</span>
            <span className="inline-flex items-center gap-[5px] text-[9px]">
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
      {summaryDialog && (
        <SummaryBillsDialog
          title={summaryDialog.title}
          bills={summaryDialogBills}
          onClose={() => setSummaryDialog(null)}
          onEdit={(bill) => {
            setSummaryDialog(null);
            setDialog(bill);
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
