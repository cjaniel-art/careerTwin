"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, FileText, Briefcase, DollarSign, UserCircle } from "lucide-react";
import { Wordmark } from "@/components/wordmark";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/app/dashboard", label: "Dashboard", icon: Home },
  { href: "/app/analise-perfil", label: "Análise de perfil", icon: FileText },
  { href: "/app/aderencia", label: "Aderência à Vaga", icon: Briefcase },
  { href: "/app/assinatura", label: "Assinatura", icon: DollarSign },
  { href: "/app/conta", label: "Minha conta", icon: UserCircle },
];

function SidebarLogo() {
  const { state } = useSidebar();
  if (state === "collapsed") {
    return <Image src="/auth/logo-glyph.svg" alt="CareerTwin" width={40} height={40} className="h-10 w-10" />;
  }
  return <Wordmark variant="light" className="h-9 w-auto" />;
}

export function AppSidebar({ userEmail, ...props }: { userEmail: string } & React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();

  return (
    <Sidebar collapsible="icon" className="border-none bg-[#020000] text-white" {...props}>
      <SidebarHeader className="items-center px-3 py-4">
        <Link href="/app/dashboard">
          <SidebarLogo />
        </Link>
      </SidebarHeader>
      <SidebarContent className="gap-1 px-2 pt-2">
        <SidebarMenu>
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                  asChild
                  isActive={isActive}
                  tooltip={item.label}
                  className={cn(
                    "h-12 rounded-none px-[29px] text-white hover:bg-white/5 hover:text-white active:bg-white/5 active:text-white",
                    "group-data-[collapsible=icon]:px-[29px]",
                    isActive && "border-r-4 border-primary bg-transparent text-primary hover:bg-transparent hover:text-primary",
                  )}
                >
                  <Link href={item.href}>
                    <item.icon className="size-6 shrink-0" />
                    <span>{item.label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="border-t border-white/10 p-0">
        <NavUser email={userEmail} />
      </SidebarFooter>
    </Sidebar>
  );
}
