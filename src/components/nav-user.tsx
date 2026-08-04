"use client";

import { LogOut } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { logoutAction } from "@/features/auth/actions";

export function NavUser({ email }: { email: string }) {
  const initial = email.slice(0, 1).toUpperCase();

  return (
    <div className="flex items-center gap-2 py-2 pl-[22px] pr-2 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:pl-0">
      <Avatar className="h-10 w-10 shrink-0 group-data-[collapsible=icon]:hidden">
        <AvatarFallback className="bg-[#e9ecf1] text-[#717998]">{initial}</AvatarFallback>
      </Avatar>
      <div className="grid min-w-0 flex-1 text-left text-[#8d8d8d] group-data-[collapsible=icon]:hidden">
        <span className="truncate text-sm font-medium leading-[22px]">{email}</span>
      </div>
      <form action={logoutAction}>
        <button type="submit" aria-label="Sair" className="shrink-0 text-[#8d8d8d] hover:text-foreground">
          <LogOut className="size-6" />
        </button>
      </form>
    </div>
  );
}
