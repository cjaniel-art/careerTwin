"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ThemeToggle } from "@/components/theme-toggle";
import { cn } from "@/lib/utils";

const TITLES: Record<string, string> = {
  "/app/dashboard": "Dashboard",
  "/app/analise-perfil": "Análise de perfil",
  "/app/aderencia": "Aderência à Vaga",
  "/app/assinatura": "Assinatura",
  "/app/conta": "Minha conta",
};

function titleFor(pathname: string): string {
  const exact = TITLES[pathname];
  if (exact) return exact;
  const match = Object.keys(TITLES).find((prefix) => pathname.startsWith(`${prefix}/`));
  return (match ? TITLES[match] : undefined) ?? "CareerTwin";
}

export function AppHeader() {
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
          className={cn("font-medium", isDashboard ? "text-primary" : "text-foreground hover:text-primary")}
        >
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
        <ThemeToggle />
      </div>
    </header>
  );
}
