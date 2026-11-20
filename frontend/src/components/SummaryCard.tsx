import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import type { ReactNode } from "react";
import { formatCurrency } from "../utils/format";

export default function SummaryCard({
  title,
  value,
  icon,
  tone,
  footer,
}: {
  title: string;
  value: number;
  icon: ReactNode;
  tone: string;
  footer: string;
}) {
  const toneStyles = {
    green: "bg-[#e7f2ec] text-teal dark:bg-[#20372d]",
    teal: "bg-[#e9f4f1] text-teal dark:bg-[#20372d]",
    orange: "bg-[#fff5dc] text-[#c8912d] dark:bg-[#3a3220] dark:text-[#f0c56f]",
    red: "bg-[#fff0e9] text-[#e86a45] dark:bg-[#3b2923] dark:text-[#ff9a79]",
  };
  const footerStyle =
    tone === "teal"
      ? "text-teal"
      : tone === "red"
        ? "text-[#dc6847]"
        : "text-[#9aa49e] dark:text-[#9eafa5]";

  return (
    <div className="min-h-[121px] rounded-[11px] border border-[#e9ede6] bg-white px-4 pb-[13px] pt-[15px] dark:border-dark-border dark:bg-dark-surface min-[1450px]:min-h-[132px] min-[1450px]:px-[18px] min-[1450px]:py-[17px] max-[1080px]:px-3 max-[600px]:min-h-[110px] max-[600px]:p-3">
      <div className="flex items-center justify-between text-[10px] text-[#78857e] dark:text-dark-muted">
        <span>{title}</span>
        <span
          className={`grid size-[29px] place-items-center rounded-lg ${toneStyles[tone as keyof typeof toneStyles]}`}
        >
          {icon}
        </span>
      </div>
      <b className="mt-[10px] block font-display text-[23px] font-semibold tracking-[-0.7px] text-[#183d34] dark:text-[#e2ece5]">
        {formatCurrency(value)}
      </b>
      <div
        className={`mt-[5px] flex items-center gap-[5px] text-[10px] ${footerStyle}`}
      >
        {tone === "teal" ? (
          <ArrowDownRight size={14} />
        ) : tone === "red" ? (
          <ArrowUpRight size={14} />
        ) : (
          <span className="size-[5px] rounded-full bg-[#bcc7bd]" />
        )}
        {footer}
      </div>
    </div>
  );
}
