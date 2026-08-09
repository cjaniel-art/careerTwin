"use client";

import { Moon, Sun } from "lucide-react";
import { useAppTheme } from "@/components/theme-provider";

/** Light/dark switch for the app shell — see ThemeProvider for why this is scoped to /app only. */
export function ThemeToggle() {
  const { theme, toggleTheme, mounted } = useAppTheme();
  const isDark = mounted && theme === "dark";

  return (
    <button
      type="button"
      aria-label={isDark ? "Mudar para tema claro" : "Mudar para tema escuro"}
      className="text-foreground hover:text-primary"
      onClick={toggleTheme}
    >
      {isDark ? <Sun className="size-6" /> : <Moon className="size-6" />}
    </button>
  );
}
