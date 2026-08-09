"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, FileText, Briefcase, DollarSign, Settings } from "lucide-react";
import { NavUser } from "@/components/nav-user";
import { useAppTheme } from "@/components/theme-provider";
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
  { href: "/app/conta", label: "Minha conta", icon: Settings },
];

function SidebarLogo() {
  const { state } = useSidebar();
  const { theme, mounted } = useAppTheme();
  const isDark = mounted && theme === "dark";

  if (state === "collapsed") {
    return <Image src="/auth/logo-glyph.svg" alt="CareerTwin" width={40} height={40} className="h-10 w-10" />;
  }
  if (isDark) {
    return (
      <Image src="/sidebar/logo-full-dark.svg" alt="CareerTwin" width={183} height={44} className="h-11 w-[183px]" />
    );
  }
  return (
    <div className="relative h-11 w-[183px] shrink-0">
      <Image src="/sidebar/logo-icon.svg" alt="" width={46} height={44} className="absolute left-0 top-0 h-11 w-[46px]" />
      <Image
        src="/sidebar/logo-wordmark.svg"
        alt="CareerTwin"
        width={129}
        height={19}
        className="absolute left-[53px] top-3 h-[19px] w-[129px]"
      />
    </div>
  );
}

export function AppSidebar({ userEmail, ...props }: { userEmail: string } & React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();

  return (
    <Sidebar collapsible="icon" className="border-r border-border bg-card" {...props}>
      <SidebarHeader className="items-center px-[18px] py-4">
        <Link href="/app/dashboard">
          <SidebarLogo />
        </Link>
      </SidebarHeader>
      <SidebarContent className="gap-2 px-0 pt-4">
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
                    // Figma spec is 24px nav icons — overrides the sidebar
                    // primitive's own [&>svg]:size-4 (16px) base, which wins
                    // on specificity over a plain size-6 on the <svg> itself.
                    "h-12 rounded-none pl-[29px] pr-[18px] text-muted-foreground [&>svg]:size-6",
                    "group-data-[collapsible=icon]:pl-[29px] group-data-[collapsible=icon]:pr-[18px]",
                    isActive && "border-r-4 border-primary bg-transparent text-primary hover:bg-transparent hover:text-primary",
                  )}
                >
                  <Link href={item.href}>
                    <item.icon className="size-6 shrink-0" />
                    <span className="group-data-[collapsible=icon]:hidden">{item.label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="p-0">
        <NavUser email={userEmail} />
      </SidebarFooter>
    </Sidebar>
  );
}
