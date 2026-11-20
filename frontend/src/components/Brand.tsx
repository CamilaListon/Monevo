import { Wallet } from "lucide-react";
import { Link } from "react-router-dom";

export default function Brand({ light = false }: { light?: boolean }) {
  return (
    <Link
      to="/"
      className={`inline-flex items-center gap-[9px] font-display text-[24px] font-bold tracking-[-1.1px] ${light ? "text-white" : "text-forest dark:text-[#e5eee8]"}`}
    >
      <span
        className={`grid size-8 place-items-center rounded-[10px] ${light ? "bg-white text-forest" : "bg-forest text-white dark:bg-[#20372d] dark:text-[#d7eee3]"}`}
      >
        <Wallet size={19} strokeWidth={2.2} />
      </span>
      <span>
        monevo<span className="text-coral">.</span>
      </span>
    </Link>
  );
}
