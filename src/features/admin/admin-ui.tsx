import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

/** Mesmo padrão visual do ReportTabsList/ReportTabsTrigger (core-1/report/report-tabs.tsx) — abas sublinhadas em vez de pílula. */
export function AdminTabsList({ className, ...props }: React.ComponentProps<typeof TabsList>) {
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

export function AdminTabsTrigger({ className, ...props }: React.ComponentProps<typeof TabsTrigger>) {
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

export function StatCard({ label, value, hint }: { label: string; value: number | string; hint?: string }) {
  return (
    <div className="rounded-lg border border-border bg-secondary/40 p-4">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-foreground">{value}</p>
      {hint ? <p className="mt-1 text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}

export function BreakdownList({ counts, labels }: { counts: Record<string, number>; labels: Record<string, string> }) {
  const entries = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  if (entries.length === 0) return <p className="text-sm text-muted-foreground">Sem dados ainda.</p>;
  return (
    <ul className="space-y-2">
      {entries.map(([key, count]) => (
        <li key={key} className="flex items-center justify-between text-sm">
          <span className="text-foreground">{labels[key] ?? key}</span>
          <span className="font-medium text-foreground">{count}</span>
        </li>
      ))}
    </ul>
  );
}
