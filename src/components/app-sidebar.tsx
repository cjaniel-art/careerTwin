"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Target, ClipboardCheck, History, ListChecks, CreditCard, UserCircle } from "lucide-react";
import { Wordmark } from "@/components/wordmark";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

const NAV_ITEMS = [
  { href: "/app/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/app/analise-perfil", label: "Análise de Perfil", icon: Target },
  { href: "/app/aderencia", label: "Diagnóstico de Aderência", icon: ClipboardCheck },
  { href: "/app/historico", label: "Histórico", icon: History },
  { href: "/app/acoes", label: "Ações", icon: ListChecks },
  { href: "/app/creditos", label: "Créditos", icon: CreditCard },
  { href: "/app/conta", label: "Conta", icon: UserCircle },
];

export function AppSidebar({ userEmail, ...props }: { userEmail: string } & React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader className="border-b border-border">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild className="h-auto py-2">
              <Link href="/app/dashboard">
                <Wordmark className="h-6 w-auto" />
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarGroupLabel>Menu</SidebarGroupLabel>
            <SidebarMenu>
              {NAV_ITEMS.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton asChild isActive={isActive} tooltip={item.label}>
                      <Link href={item.href}>
                        <item.icon />
                        <span>{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <NavUser email={userEmail} />
      </SidebarFooter>
    </Sidebar>
  );
}
