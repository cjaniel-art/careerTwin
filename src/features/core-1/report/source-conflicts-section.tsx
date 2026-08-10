import { ShieldAlert } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

/**
 * §13 — analyses.conflicts é uma lista de afirmações (texto), não um objeto
 * estruturado por campo (cargo/período/ferramenta). A UI não decide qual fonte
 * está correta — apenas relata o que a análise encontrou e pede confirmação.
 */
export function SourceConflictsSection({ conflicts }: { conflicts: string[] }) {
  if (conflicts.length === 0) return null;
  return (
    <Card id="inconsistencias">
      <CardHeader>
        <CardTitle>Inconsistências entre Currículo e LinkedIn</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {conflicts.map((conflict) => (
          <div key={conflict} className="flex items-start gap-3 rounded-md border border-border p-3">
            <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-destructive/10 text-destructive">
              <ShieldAlert className="size-3.5" aria-hidden />
            </span>
            <div className="min-w-0">
              <p className="text-sm text-foreground">{conflict}</p>
              <p className="mt-1 text-xs text-muted-foreground">Esta divergência precisa ser confirmada por você.</p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
