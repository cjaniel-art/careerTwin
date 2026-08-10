"use client";

import * as React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ReportTabsContextValue {
  goToTab: (value: string) => void;
}

const ReportTabsContext = React.createContext<ReportTabsContextValue | null>(null);

function useGoToReportTab(): (value: string) => void {
  const ctx = React.useContext(ReportTabsContext);
  if (!ctx) throw new Error("useGoToReportTab must be used within a ReportTabsRoot");
  return ctx.goToTab;
}

/**
 * §5 — abas reais (Radix Tabs controlado): só o painel ativo fica montado/visível,
 * em vez da navegação por âncora anterior que deixava todas as seções na tela ao
 * mesmo tempo. O contexto expõe `goToTab` para que botões "Ver todos" dentro do
 * painel "Visão geral" troquem de aba em vez de rolar até um id.
 */
export function ReportTabsRoot({ defaultValue, children }: { defaultValue: string; children: React.ReactNode }) {
  const [value, setValue] = React.useState(defaultValue);
  const goToTab = React.useCallback((v: string) => setValue(v), []);

  return (
    <ReportTabsContext.Provider value={{ goToTab }}>
      <Tabs value={value} onValueChange={setValue} className="flex flex-col gap-6">
        {children}
      </Tabs>
    </ReportTabsContext.Provider>
  );
}

export function ReportTabsList({ className, ...props }: React.ComponentProps<typeof TabsList>) {
  return (
    <TabsList
      className={cn(
        "h-auto w-full items-stretch justify-start gap-1 overflow-x-auto rounded-none border-b border-border bg-transparent p-0",
        className,
      )}
      {...props}
    />
  );
}

export function ReportTabsTrigger({ className, ...props }: React.ComponentProps<typeof TabsTrigger>) {
  return (
    <TabsTrigger
      className={cn(
        "h-auto flex-none items-center gap-1.5 whitespace-nowrap rounded-none border-b-2 border-transparent px-3 py-2.5 text-sm font-medium text-muted-foreground shadow-none transition-colors",
        "data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:shadow-none",
        "hover:text-foreground",
        className,
      )}
      {...props}
    />
  );
}

export const ReportTabsContent = TabsContent;

export function GoToTabButton({
  tab,
  className,
  children,
}: {
  tab: string;
  className?: string;
  children: React.ReactNode;
}) {
  const goToTab = useGoToReportTab();
  return (
    <Button type="button" variant="tertiary" size="sm" className={className} onClick={() => goToTab(tab)}>
      {children}
    </Button>
  );
}

export function GoToTabRow({
  tab,
  className,
  children,
}: {
  tab: string;
  className?: string;
  children: React.ReactNode;
}) {
  const goToTab = useGoToReportTab();
  return (
    <button type="button" onClick={() => goToTab(tab)} className={cn("text-left", className)}>
      {children}
    </button>
  );
}
