import Link from "next/link";
import { AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Core1Gap } from "@/config/schemas/core1";
import { GAP_TYPE_LABELS } from "@/lib/result-labels";

/** §7 (Card-resumo B) — prévia das lacunas reais (calculation_snapshot.gaps), com tag de categoria. */
export function GapsCard({ gaps }: { gaps: Core1Gap[] }) {
  const preview = gaps.slice(0, 4);

  return (
    <Card className="flex flex-col">
      <CardHeader className="flex-row items-center gap-2 space-y-0">
        <CardTitle className="text-base">Lacunas identificadas</CardTitle>
        <Badge variant="secondary">{gaps.length}</Badge>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-2.5">
        {preview.length > 0 ? (
          preview.map((gap, i) => (
            <div key={i} className="flex items-center gap-2.5">
              <AlertCircle className="size-4 shrink-0 text-primary" aria-hidden />
              <span className="min-w-0 flex-1 truncate text-sm text-foreground">{gap.description}</span>
              <Badge variant="outline" className="shrink-0">
                {GAP_TYPE_LABELS[gap.type] ?? gap.type}
              </Badge>
            </div>
          ))
        ) : (
          <p className="text-sm text-muted-foreground">Nenhuma lacuna identificada nesta análise.</p>
        )}
      </CardContent>
      {gaps.length > 0 ? (
        <div className="border-t border-border px-6 py-3">
          <Button asChild variant="tertiary" size="sm">
            <Link href="#lacunas">Ver todas</Link>
          </Button>
        </div>
      ) : null}
    </Card>
  );
}
