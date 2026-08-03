"use client";

import { ChevronsUpDown, CreditCard, LogOut, UserCircle } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from "@/components/ui/sidebar";
import { logoutAction } from "@/features/auth/actions";

export function NavUser({ email }: { email: string }) {
  const { isMobile } = useSidebar();
  const initial = email.slice(0, 1).toUpperCase();

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton size="lg">
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarFallback className="rounded-lg">{initial}</AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{email}</span>
              </div>
              <ChevronsUpDown className="ml-auto h-4 w-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuItem asChild>
              <a href="/app/conta">
                <UserCircle className="h-4 w-4" />
                Conta
              </a>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <a href="/app/creditos">
                <CreditCard className="h-4 w-4" />
                Créditos
              </a>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <form action={logoutAction} className="contents">
              <button type="submit" className="w-full">
                <DropdownMenuItem asChild>
                  <span>
                    <LogOut className="h-4 w-4" />
                    Sair
                  </span>
                </DropdownMenuItem>
              </button>
            </form>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
