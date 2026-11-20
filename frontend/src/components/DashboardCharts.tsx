import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Filter } from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { DashboardData } from "../types";
import { formatCurrency } from "../utils/format";
import { iconButtonClasses } from "../utils/tailwind";

export default function DashboardCharts({
  data,
  month,
  monthValue,
  loading,
  onMonthChange,
}: {
  data: DashboardData | null;
  month: string;
  monthValue: string;
  loading: boolean;
  onMonthChange: (month: string) => void;
}) {
  const [monthPickerOpen, setMonthPickerOpen] = useState(false);
  const [calendarYear, setCalendarYear] = useState(
    Number(monthValue.slice(0, 4)),
  );
  const monthPickerRef = useRef<HTMLDivElement>(null);
  const selectedMonth = Number(monthValue.slice(5, 7)) - 1;
  const monthOptions = Array.from({ length: 12 }, (_, monthIndex) => ({
    value: monthIndex,
    label: new Intl.DateTimeFormat("pt-BR", {
      month: "long",
      timeZone: "UTC",
    }).format(new Date(Date.UTC(calendarYear, monthIndex, 1))),
  }));

  useEffect(() => {
    if (!monthPickerOpen) return;

    function handlePointerDown(event: PointerEvent) {
      if (
        event.target instanceof Node &&
        !monthPickerRef.current?.contains(event.target)
      ) {
        setMonthPickerOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setMonthPickerOpen(false);
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [monthPickerOpen]);

  const paidCount =
    data?.bills.filter((bill) => bill.status === "paid").length ?? 0;
  const paidPercentage = data?.bills.length
    ? Math.round((paidCount / data.bills.length) * 100)
    : 0;
  const pendingCount =
    data?.bills.filter((bill) => bill.status === "pending").length ?? 0;
  const overdueCount =
    data?.bills.filter((bill) => bill.status === "overdue").length ?? 0;

  return (
    <section className="mt-[14px] grid grid-cols-[1.55fr_1fr] gap-[14px] min-[1450px]:mt-[17px] max-[1080px]:grid-cols-[1.3fr_1fr] max-[1080px]:gap-[10px] max-[820px]:mt-[9px] max-[820px]:grid-cols-1 max-[820px]:gap-[9px]">
      <div className="min-h-[274px] rounded-[11px] border border-[#e9ede6] bg-white px-[19px] pb-[13px] pt-[17px] dark:border-dark-border dark:bg-dark-surface min-[1450px]:min-h-[295px] min-[1450px]:px-[22px] min-[1450px]:pb-[15px] min-[1450px]:pt-5 max-[600px]:min-h-[260px] max-[600px]:p-[15px]">
        <div className="flex items-start justify-between">
          <div>
            <span className="text-[10px] font-bold tracking-[1.1px] text-[#9aa59e] dark:text-[#9eafa5]">
              ACOMPANHAMENTO
            </span>
            <h2 className="mt-[5px] flex items-center gap-2 font-display text-[16px] font-semibold tracking-[-0.3px] text-[#173d33] dark:text-[#e2ece5]">
              Suas despesas
            </h2>
          </div>
          <span className="mt-1 inline-flex items-center gap-[5px] rounded-md bg-[#f6f8f5] px-2 py-[6px] text-[10px] capitalize text-[#74817a] dark:bg-[#1c2c24] dark:text-[#b6c7bd]">
            <span className="size-[5px] rounded-full bg-teal" /> {month}
          </span>
        </div>
        <div className="mt-3 font-display text-[21px] font-semibold text-[#173d33] dark:text-[#e8f0ea]">
          {formatCurrency(data?.summary.total ?? 0)}
          <span className="font-sans text-[10px] font-normal text-[#9aa49e] dark:text-[#a5b5ac]">
            {" "}
            no período
          </span>
        </div>
        <div className="mt-[5px] h-[139px] min-[1450px]:h-[155px] max-[600px]:h-[134px]">
          {loading ? (
            <div className="grid h-full place-items-center text-[12px] text-[#89968f]">
              Carregando dados...
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={data?.byCategory ?? []}
                margin={{ top: 8, right: 6, left: -18, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="spendingFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0A7C78" stopOpacity={0.19} />
                    <stop offset="95%" stopColor="#0A7C78" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="var(--chart-grid)" vertical={false} />
                <XAxis
                  dataKey="category"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "var(--chart-text)", fontSize: 12 }}
                  tickMargin={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "var(--chart-text)", fontSize: 11 }}
                  tickFormatter={(value: number) =>
                    value >= 1000
                      ? `R$${(value / 1000).toFixed(0)}k`
                      : `${value}`
                  }
                />
                <Tooltip
                  formatter={(value) => formatCurrency(Number(value))}
                  contentStyle={{
                    borderRadius: 12,
                    border: "1px solid var(--chart-tooltip-border)",
                    backgroundColor: "var(--chart-tooltip-bg)",
                    color: "var(--chart-text)",
                    fontSize: 13,
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="total"
                  stroke="#0A7C78"
                  strokeWidth={2.5}
                  fill="url(#spendingFill)"
                  activeDot={{
                    r: 5,
                    fill: "#0A7C78",
                    stroke: "white",
                    strokeWidth: 3,
                  }}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
        <div className="flex items-center justify-between text-[10px] text-[#9ba59f]">
          <span className="flex items-center gap-[6px] text-[#74817a] dark:text-[#a5b5ac]">
            <span className="size-[7px] shrink-0 rounded-full bg-teal" />{" "}
            Despesas por categoria
          </span>
          <span>Valores em reais (R$)</span>
        </div>
      </div>
      <div className="min-h-[274px] rounded-[11px] border border-[#e9ede6] bg-white px-[19px] pb-[13px] pt-[17px] dark:border-dark-border dark:bg-dark-surface min-[1450px]:min-h-[295px] min-[1450px]:px-[22px] min-[1450px]:pb-[15px] min-[1450px]:pt-5 max-[600px]:min-h-[260px] max-[600px]:p-[15px]">
        <div className="flex items-start justify-between">
          <div>
            <span className="text-[10px] font-bold tracking-[1.1px] text-[#9aa59e] dark:text-[#9eafa5]">
              SEU MÊS EM FOCO
            </span>
            <h2 className="mt-[5px] flex items-center gap-2 font-display text-[16px] font-semibold tracking-[-0.3px] text-[#173d33] dark:text-[#e2ece5]">
              Status das contas
            </h2>
          </div>
          <div className="relative" ref={monthPickerRef}>
            <button
              className={iconButtonClasses}
              title="Filtrar por mês"
              aria-label="Alterar mês do painel"
              type="button"
              aria-haspopup="dialog"
              aria-expanded={monthPickerOpen}
              onClick={() => {
                setCalendarYear(Number(monthValue.slice(0, 4)));
                setMonthPickerOpen((open) => !open);
              }}
            >
              <Filter size={17} />
            </button>
            {monthPickerOpen && (
              <div
                className="absolute right-0 top-[calc(100%+9px)] z-20 w-[258px] rounded-xl border border-[#e6ebe4] bg-white p-[13px] shadow-[0_14px_36px_#10201d24] dark:border-[#34483d] dark:bg-dark-surface dark:shadow-[0_14px_36px_#00000045] max-[600px]:right-[-16px] max-[600px]:w-[calc(100vw-19px)] max-[600px]:max-w-[367px] max-[600px]:max-h-[calc(100dvh-24px-env(safe-area-inset-top))] max-[600px]:overflow-y-auto max-[600px]:rounded-2xl max-[600px]:p-[17px] max-[600px]:shadow-[0_18px_48px_#10201d35]"
                role="dialog"
                aria-label="Selecionar mês do painel"
              >
                <div className="mb-[10px] flex items-center justify-between text-[14px] text-[#31443e] dark:text-[#e2ece5] max-[600px]:mb-3 max-[600px]:text-[16px]">
                  <button
                    className="grid size-[34px] place-items-center rounded-lg border-0 bg-transparent text-[#74817b] hover:bg-[#f0f6f2] hover:text-teal dark:text-[#c1d0c7] dark:hover:bg-[#20372d] dark:hover:text-[#8bd5c0] max-[600px]:size-11"
                    type="button"
                    aria-label="Ano anterior"
                    onClick={() => setCalendarYear((year) => year - 1)}
                  >
                    <ChevronLeft size={17} />
                  </button>
                  <b>{calendarYear}</b>
                  <button
                    className="grid size-[34px] place-items-center rounded-lg border-0 bg-transparent text-[#74817b] hover:bg-[#f0f6f2] hover:text-teal dark:text-[#c1d0c7] dark:hover:bg-[#20372d] dark:hover:text-[#8bd5c0] max-[600px]:size-11"
                    type="button"
                    aria-label="Próximo ano"
                    onClick={() => setCalendarYear((year) => year + 1)}
                  >
                    <ChevronRight size={17} />
                  </button>
                </div>
                <div className="grid grid-cols-3 gap-[5px] max-[600px]:gap-[7px]">
                  {monthOptions.map(({ value, label }) => (
                    <button
                      key={value}
                      type="button"
                      className={`min-h-9 rounded-[7px] border-0 bg-transparent p-1 text-[12px] capitalize text-[#586760] hover:bg-[#f0f6f2] hover:text-teal dark:text-[#c1d0c7] dark:hover:bg-[#20372d] dark:hover:text-[#8bd5c0] max-[600px]:min-h-[46px] max-[600px]:text-xs ${calendarYear === Number(monthValue.slice(0, 4)) && value === selectedMonth ? "bg-teal font-semibold text-white hover:bg-[#086b67] hover:text-white" : ""}`}
                      aria-pressed={
                        calendarYear === Number(monthValue.slice(0, 4)) &&
                        value === selectedMonth
                      }
                      onClick={() => {
                        onMonthChange(
                          `${calendarYear}-${String(value + 1).padStart(2, "0")}`,
                        );
                        setMonthPickerOpen(false);
                      }}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="mt-[7px] flex min-w-0 items-center gap-[17px] max-[600px]:gap-[10px]">
          <div className="relative h-[137px] w-[148px] flex-[0_0_148px] max-[1080px]:w-[120px] max-[1080px]:flex-[0_0_120px]">
            {loading ? (
              <span className="absolute left-1/2 top-1/2 inline-block size-5 -translate-x-1/2 -translate-y-1/2 animate-spin rounded-full border-2 border-[#dbe8df] border-t-teal" />
            ) : (
              <>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={[
                        { name: "Pagas", value: data?.summary.paid ?? 0 },
                        {
                          name: "Pendentes",
                          value: data?.summary.pending ?? 0,
                        },
                        {
                          name: "Atrasadas",
                          value: data?.summary.overdue ?? 0,
                        },
                      ]}
                      dataKey="value"
                      innerRadius="72%"
                      outerRadius="92%"
                      paddingAngle={4}
                      stroke="none"
                    >
                      <Cell fill="#0A7C78" />
                      <Cell fill="#F2B84B" />
                      <Cell fill="#F26A3D" />
                    </Pie>
                    <Tooltip
                      formatter={(value) => formatCurrency(Number(value))}
                      contentStyle={{
                        borderRadius: 12,
                        border: "1px solid var(--chart-tooltip-border)",
                        backgroundColor: "var(--chart-tooltip-bg)",
                        color: "var(--chart-text)",
                        fontSize: 13,
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                  <b className="font-display text-xl font-semibold text-[#173d33] dark:text-[#e2ece5]">
                    {data?.bills.length ?? 0}
                  </b>
                  <span className="mt-px text-[10px] text-[#96a29b] dark:text-[#a5b5ac]">
                    contas
                  </span>
                </div>
              </>
            )}
          </div>
          <div className="flex min-w-0 flex-1 flex-col gap-[13px]">
            <div className="grid grid-cols-[8px_1fr_auto] items-center gap-[6px]">
              <span className="size-[7px] shrink-0 rounded-full bg-teal" />
              <span className="text-[10px] text-[#74817a] dark:text-[#a5b5ac]">
                Pagas
              </span>
              <b className="text-[10px] font-semibold text-[#354c42] dark:text-[#e2ece5]">
                {paidCount}
              </b>
            </div>
            <div className="grid grid-cols-[8px_1fr_auto] items-center gap-[6px]">
              <span className="size-[7px] shrink-0 rounded-full bg-[#f2b84b]" />
              <span className="text-[10px] text-[#74817a] dark:text-[#a5b5ac]">
                Pendentes
              </span>
              <b className="text-[10px] font-semibold text-[#354c42] dark:text-[#e2ece5]">
                {pendingCount}
              </b>
            </div>
            <div className="grid grid-cols-[8px_1fr_auto] items-center gap-[6px]">
              <span className="size-[7px] shrink-0 rounded-full bg-coral" />
              <span className="text-[10px] text-[#74817a] dark:text-[#a5b5ac]">
                Atrasadas
              </span>
              <b className="text-[10px] font-semibold text-[#354c42] dark:text-[#e2ece5]">
                {overdueCount}
              </b>
            </div>
          </div>
        </div>
        <div className="mt-[2px] border-t border-[#eff1ed] pt-[11px] dark:border-dark-border">
          <div className="flex justify-between text-[10px] text-[#86928b] dark:text-[#a5b5ac]">
            <span>Contas pagas</span>
            <b className="font-semibold text-teal">{paidPercentage}%</b>
          </div>
          <div className="mt-[7px] h-1 overflow-hidden rounded-[10px] bg-[#edf2ed] dark:bg-[#20372d]">
            <span
              className="block h-full rounded-[inherit] bg-teal transition-[width] duration-300"
              style={{ width: `${paidPercentage}%` }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
