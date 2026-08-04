"use client";

import { LogOut } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { logoutAction } from "@/features/auth/actions";

export function NavUser({ email }: { email: string }) {
  const initial = email.slice(0, 1).toUpperCase();

  return (
    <div className="flex items-center gap-2 py-2 pl-[22px] pr-2 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:pl-0">
      <Avatar className="h-10 w-10 shrink-0">
        <AvatarFallback className="bg-white/10 text-white">{initial}</AvatarFallback>
      </Avatar>
      <div className="grid min-w-0 flex-1 text-left text-white group-data-[collapsible=icon]:hidden">
        <span className="truncate text-sm font-medium leading-[22px]">{email}</span>
      </div>
      <form action={logoutAction} className="group-data-[collapsible=icon]:hidden">
        <button type="submit" aria-label="Sair" className="shrink-0 text-white/70 hover:text-white">
          <LogOut className="size-6" />
        </button>
      </form>
    </div>
  );
}
