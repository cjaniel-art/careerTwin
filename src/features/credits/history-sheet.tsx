"use client";

import { ChevronDown, History } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetCircleClose, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import type { CreditHistoryRow } from "@/features/credits/get-history";

/** Mesmo padrão de Sheet do HistorySheet (Core 1) — `items` já vem pronto de getCreditHistory. */
export function CreditHistorySheet({ items }: { items: CreditHistoryRow[] }) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="secondary" size="sm">
          <History className="size-4" aria-hidden />
          Ver detalhes
          <ChevronDown className="size-3.5" aria-hidden />
        </Button>
      </SheetTrigger>
      <SheetContent showCloseButton={false} className="w-full gap-0 border-none bg-transparent p-0 sm:w-[45%] sm:max-w-none">
        <div className="flex h-full items-start">
          <SheetCircleClose />

          <div className="flex h-full flex-1 flex-col bg-card px-8">
            <div className="border-b border-border py-4">
              <p className="text-xs text-muted-foreground">Todas as movimentações</p>
              <p className="text-2xl font-semibold text-foreground">Histórico de créditos</p>
            </div>

            <div className="flex flex-1 flex-col gap-3 overflow-y-auto py-6">
              {items.length > 0 ? (
                items.map((item) => (
                  <div key={item.id} className="flex items-center justify-between gap-4 rounded-lg border border-border p-4">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-foreground">{item.vaga}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{item.dateLabel}</p>
                    </div>
                    <span className={`shrink-0 text-sm font-semibold ${item.amount >= 0 ? "text-foreground" : "text-muted-foreground"}`}>
                      {item.amount >= 0 ? "+" : ""}
                      {item.amount}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">Nenhuma movimentação ainda.</p>
              )}
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
