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
    <section className="insights-grid">
      <div className="panel spending-panel">
        <div className="panel-heading">
          <div>
            <span className="panel-kicker">ACOMPANHAMENTO</span>
            <h2>Suas despesas</h2>
          </div>
          <span className="period-tag">
            <span /> {month}
          </span>
        </div>
        <div className="chart-total">
          {formatCurrency(data?.summary.total ?? 0)}
          <span> no período</span>
        </div>
        <div className="spending-chart">
          {loading ? (
            <div className="chart-loading">Carregando dados...</div>
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
        <div className="chart-footnote">
          <span>
            <span className="legend-dot teal-dot" /> Despesas por categoria
          </span>
          <span>Valores em reais (R$)</span>
        </div>
      </div>
      <div className="panel status-panel">
        <div className="panel-heading">
          <div>
            <span className="panel-kicker">SEU MÊS EM FOCO</span>
            <h2>Status das contas</h2>
          </div>
          <div className="month-filter-control" ref={monthPickerRef}>
            <button
              className="icon-button"
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
                className="month-picker-popover"
                role="dialog"
                aria-label="Selecionar mês do painel"
              >
                <div className="month-picker-heading">
                  <button
                    className="month-picker-year-button"
                    type="button"
                    aria-label="Ano anterior"
                    onClick={() => setCalendarYear((year) => year - 1)}
                  >
                    <ChevronLeft size={17} />
                  </button>
                  <b>{calendarYear}</b>
                  <button
                    className="month-picker-year-button"
                    type="button"
                    aria-label="Próximo ano"
                    onClick={() => setCalendarYear((year) => year + 1)}
                  >
                    <ChevronRight size={17} />
                  </button>
                </div>
                <div className="month-picker-grid">
                  {monthOptions.map(({ value, label }) => (
                    <button
                      key={value}
                      type="button"
                      className={`month-picker-option ${calendarYear === Number(monthValue.slice(0, 4)) && value === selectedMonth ? "month-picker-option-active" : ""}`}
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
        <div className="status-chart-wrap">
          <div className="status-donut">
            {loading ? (
              <span className="loader small-loader" />
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
                <div className="donut-label">
                  <b>{data?.bills.length ?? 0}</b>
                  <span>contas</span>
                </div>
              </>
            )}
          </div>
          <div className="status-legend">
            <div>
              <span className="legend-dot teal-dot" />
              <span>Pagas</span>
              <b>{paidCount}</b>
            </div>
            <div>
              <span className="legend-dot yellow-dot" />
              <span>Pendentes</span>
              <b>{pendingCount}</b>
            </div>
            <div>
              <span className="legend-dot coral-dot" />
              <span>Atrasadas</span>
              <b>{overdueCount}</b>
            </div>
          </div>
        </div>
        <div className="monthly-progress">
          <div>
            <span>Contas pagas</span>
            <b>{paidPercentage}%</b>
          </div>
          <div className="progress-track">
            <span style={{ width: `${paidPercentage}%` }} />
          </div>
        </div>
      </div>
    </section>
  );
}
