"use client";

import { ChevronDown, History } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetCircleClose, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { CreditHistoryRow } from "@/features/credits/get-history";

/** Mesmo padrão de Sheet do HistorySheet (Core 1); tabela igual à de /app/aderencia. */
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

            <div className="flex-1 overflow-y-auto py-6">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Vaga</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead className="text-right">Crédito consumido</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.length > 0 ? (
                    items.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="whitespace-normal py-4">
                          <p className="font-medium text-foreground">{item.title}</p>
                          {item.subtitle ? <p className="text-muted-foreground">{item.subtitle}</p> : null}
                        </TableCell>
                        <TableCell className="py-4">
                          <p className="font-medium text-foreground">{item.dateLabel}</p>
                          <p className="text-muted-foreground">{item.timeLabel}</p>
                        </TableCell>
                        <TableCell className={`text-right font-bold ${item.amount >= 0 ? "text-success" : "text-foreground"}`}>
                          {item.amount >= 0 ? "+" : ""}
                          {item.amount}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={3} className="py-10 text-center text-muted-foreground">
                        Nenhuma movimentação ainda.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
