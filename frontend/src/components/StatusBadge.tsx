import type { Bill } from "../types";

export default function StatusBadge({
  status,
  animateBackground = false,
}: {
  status: Bill["status"];
  animateBackground?: boolean;
}) {
  const labels = { paid: "Paga", pending: "Pendente", overdue: "Atrasada" };
  const styles = {
    paid: "bg-[#e8f4ee] text-teal dark:bg-[#20372d] dark:text-[#9cdec6]",
    pending:
      "bg-[#fff5dc] text-[#b38329] dark:bg-[#3a321f] dark:text-[#f2ce7e]",
    overdue:
      "bg-[#fff0e8] text-[#d65f3f] dark:bg-[#3a2923] dark:text-[#ffab8d]",
  };
  const animationClasses = animateBackground
    ? "[--overdue-bg:#fff0e8] [--overdue-bg-pulse:#ffd1c2] [--overdue-ring:#d65f3f44] dark:[--overdue-bg:#3a2923] dark:[--overdue-bg-pulse:#634032] dark:[--overdue-ring:#ffab8d55] motion-safe:animate-overdue-pulse"
    : "";

  return (
    <span
      className={`inline-flex items-center gap-[5px] rounded-[5px] px-[7px] py-[5px] text-[10px] ${styles[status]} ${animationClasses}`}
    >
      <span className="size-[5px] rounded-full bg-current" />
      {labels[status]}
    </span>
  );
}
