"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, LayoutDashboard } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ThemeToggle } from "@/components/theme-toggle";
import { cn } from "@/lib/utils";

const TITLES: Record<string, string> = {
  "/app/dashboard": "Dashboard",
  "/app/analise-perfil": "Análise de perfil",
  "/app/aderencia": "Aderência à Vaga",
  "/app/acoes": "Plano de ação",
  "/app/historico": "Histórico",
  "/app/assinatura": "Créditos",
  "/app/conta": "Minha conta",
};

function titleFor(pathname: string): string {
  const exact = TITLES[pathname];
  if (exact) return exact;
  const match = Object.keys(TITLES).find((prefix) => pathname.startsWith(`${prefix}/`));
  return (match ? TITLES[match] : undefined) ?? "CareerTwin";
}

export function AppHeader({ isAdmin = false }: { isAdmin?: boolean }) {
  const pathname = usePathname() ?? "";
  const title = titleFor(pathname);
  const isDashboard = pathname === "/app/dashboard";

  return (
    <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center gap-2 border-b border-border bg-background px-4">
      <SidebarTrigger />
      <Separator orientation="vertical" className="mx-2 h-4 w-px" />
      <div className="flex flex-1 items-center gap-2 text-sm">
        <Link
          href="/app/dashboard"
          aria-label="Ir para o Dashboard"
          className={cn("flex items-center gap-1.5 font-medium", isDashboard ? "text-primary" : "text-foreground hover:text-primary")}
        >
          <Home className="size-4" aria-hidden />
          Dashboard
        </Link>
        {!isDashboard ? (
          <>
            <span className="text-muted-foreground">/</span>
            <span className="font-medium text-primary">{title}</span>
          </>
        ) : null}
      </div>
      <div className="flex items-center gap-4">
        {isAdmin ? (
          <Link href="/app/admin" aria-label="Dashboards administrativos" className="text-foreground hover:text-primary">
            <LayoutDashboard className="size-6" aria-hidden />
          </Link>
        ) : null}
        <ThemeToggle />
      </div>
    </header>
  );
}
