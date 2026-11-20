import { Moon, Sun } from "lucide-react";
import type { ThemeMode } from "../types";

export default function ThemeToggle({
  theme,
  onToggle,
  compact = false,
}: {
  theme: ThemeMode;
  onToggle: () => void;
  compact?: boolean;
}) {
  const label = theme === "dark" ? "Ativar modo claro" : "Ativar modo escuro";
  return (
    <button
      className={`inline-flex min-h-9 items-center justify-center gap-[7px] rounded-lg border border-[#e2e9e1] bg-transparent px-[11px] text-xs font-semibold text-[#53675e] transition-colors duration-150 hover:bg-[#eaf3ef] hover:text-teal dark:border-[#34483d] dark:bg-[#18271f] dark:text-[#c1d0c7] dark:hover:bg-[#20372d] dark:hover:text-[#8bd5c0] ${compact ? "w-9 px-0" : "max-[600px]:w-9 max-[600px]:p-0 max-[600px]:[&>span]:hidden"}`}
      onClick={onToggle}
      aria-label={label}
      title={label}
    >
      {theme === "dark" ? <Sun size={17} /> : <Moon size={17} />}
      {!compact && (
        <span>{theme === "dark" ? "Modo claro" : "Modo escuro"}</span>
      )}
    </button>
  );
}
