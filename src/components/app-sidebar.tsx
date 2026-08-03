"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Target, ClipboardCheck, History, ListChecks, CreditCard, UserCircle, Menu } from "lucide-react";
import { Wordmark } from "@/components/wordmark";
import { Button } from "@/components/ui/button";
import { SubmitButton } from "@/components/submit-button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { logoutAction } from "@/features/auth/actions";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/app/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/app/analise-perfil", label: "Análise de Perfil", icon: Target },
  { href: "/app/aderencia", label: "Diagnóstico de Aderência", icon: ClipboardCheck },
  { href: "/app/historico", label: "Histórico", icon: History },
  { href: "/app/acoes", label: "Ações", icon: ListChecks },
  { href: "/app/creditos", label: "Créditos", icon: CreditCard },
  { href: "/app/conta", label: "Conta", icon: UserCircle },
];

function NavLinks({ pathname, onNavigate }: { pathname: string; onNavigate?: () => void }) {
  return (
    <nav className="flex flex-1 flex-col gap-1 p-3">
      {NAV_ITEMS.map((item) => {
        const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors",
              isActive
                ? "bg-secondary text-foreground"
                : "text-muted-foreground hover:bg-secondary hover:text-foreground",
            )}
          >
            <Icon className="h-4 w-4 shrink-0" aria-hidden />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

function SidebarFooter({ userEmail }: { userEmail: string }) {
  return (
    <div className="border-t border-border p-3">
      <p className="mb-2 truncate px-1 text-xs text-muted-foreground">{userEmail}</p>
      <form action={logoutAction}>
        <SubmitButton variant="secondary" size="sm" className="w-full">
          Sair
        </SubmitButton>
      </form>
    </div>
  );
}

export function AppSidebar({ userEmail }: { userEmail: string }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <div className="flex h-14 items-center justify-between border-b border-border px-4 md:hidden">
        <Link href="/app/dashboard">
          <Wordmark className="h-6" />
        </Link>
        <Button variant="tertiary" size="sm" onClick={() => setMobileOpen(true)} aria-label="Abrir menu">
          <Menu className="h-5 w-5" />
        </Button>
      </div>

      <aside className="fixed inset-y-0 left-0 z-10 hidden w-64 flex-col border-r border-border bg-card md:flex">
        <div className="flex h-16 items-center px-6">
          <Link href="/app/dashboard">
            <Wordmark className="h-7" />
          </Link>
        </div>
        <NavLinks pathname={pathname} />
        <SidebarFooter userEmail={userEmail} />
      </aside>

      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="flex w-64 flex-col p-0">
          <SheetHeader className="sr-only">
            <SheetTitle>Menu</SheetTitle>
            <SheetDescription>Navegação do CareerTwin</SheetDescription>
          </SheetHeader>
          <div className="flex h-16 items-center px-6">
            <Wordmark className="h-7" />
          </div>
          <NavLinks pathname={pathname} onNavigate={() => setMobileOpen(false)} />
          <SidebarFooter userEmail={userEmail} />
        </SheetContent>
      </Sheet>
    </>
  );
}
