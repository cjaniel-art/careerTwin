"use client";

import { usePathname } from "next/navigation";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";

const TITLES: Record<string, string> = {
  "/app/dashboard": "Dashboard",
  "/app/analise-perfil": "Análise de Perfil",
  "/app/aderencia": "Diagnóstico de Aderência",
  "/app/historico": "Histórico",
  "/app/acoes": "Ações",
  "/app/creditos": "Créditos",
  "/app/conta": "Conta",
};

function titleFor(pathname: string): string {
  const exact = TITLES[pathname];
  if (exact) return exact;
  const match = Object.keys(TITLES).find((prefix) => pathname.startsWith(`${prefix}/`));
  return (match ? TITLES[match] : undefined) ?? "CareerTwin";
}

export function AppHeader() {
  const pathname = usePathname() ?? "";

  return (
    <header className="sticky top-0 z-10 flex h-[var(--header-height)] shrink-0 items-center gap-2 border-b border-border bg-background/90 backdrop-blur">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1 md:hidden" />
        <Separator orientation="vertical" className="mx-2 h-4 md:hidden" />
        <h1 className="text-base font-medium text-foreground">{titleFor(pathname)}</h1>
      </div>
    </header>
  );
}
