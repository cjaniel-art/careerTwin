"use client";

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";

type Theme = "light" | "dark";

interface ThemeContextValue {
  theme: Theme;
  toggleTheme: () => void;
  /** False until the persisted preference has been read on the client — avoids a light→dark flash/hydration mismatch. */
  mounted: boolean;
  /** DOM node carrying the "dark" class — Radix portals (Sheet/Dialog/Select/DropdownMenu/Tooltip) must
   *  render into this instead of their document.body default, or their content escapes the CSS-variable
   *  cascade and never sees dark colors. See usePortalContainer. */
  portalContainer: HTMLDivElement | null;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

const STORAGE_KEY = "careertwin-app-theme";

/**
 * Scoped to the /app shell only (wraps SidebarProvider in app/layout.tsx) —
 * marketing/auth pages never see the "dark" class. Deliberately not
 * next-themes: that library targets <html>, which would leak dark mode into
 * pages that were never designed for it (hardcoded bg-white/bg-foreground
 * sections on the landing page, see the CTA/pricing blocks in page.tsx).
 * Applying "dark" to a wrapper div instead keeps the CSS-variable cascade
 * (globals.css's .dark block) scoped to this subtree, same mechanism, safer blast radius.
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>("light");
  const [mounted, setMounted] = useState(false);
  const [portalContainer, setPortalContainer] = useState<HTMLDivElement | null>(null);

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === "dark" || stored === "light") setTheme(stored);
    setMounted(true);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => {
      const next = prev === "dark" ? "light" : "dark";
      window.localStorage.setItem(STORAGE_KEY, next);
      return next;
    });
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, mounted, portalContainer }}>
      <div ref={setPortalContainer} className={mounted && theme === "dark" ? "dark" : undefined}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
}

export function useAppTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useAppTheme must be used within a ThemeProvider");
  return ctx;
}

/**
 * Safe outside the /app shell too (returns undefined, Radix's own
 * document.body default) — the ui/* primitives this feeds are shared with
 * marketing pages, which never mount ThemeProvider.
 */
export function usePortalContainer(): HTMLDivElement | undefined {
  const ctx = useContext(ThemeContext);
  return ctx?.portalContainer ?? undefined;
}
