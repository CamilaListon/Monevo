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
      className={`theme-toggle ${compact ? "theme-toggle-compact" : ""}`}
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
