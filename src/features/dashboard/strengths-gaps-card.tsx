import Link from "next/link";
import { AlertTriangle, ArrowRight, CheckCircle2, Scale } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function StrengthsGapsCard({ strengths, gaps, className }: { strengths: string[]; gaps: string[]; className?: string }) {
  return (
    <Card className={cn("flex flex-col", className)}>
      <CardHeader className="flex-row items-center gap-2 space-y-0 pb-2">
        <Scale className="size-4 text-muted-foreground" aria-hidden />
        <CardTitle className="text-base font-semibold">Forças vs lacunas</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-4 pt-2">
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-3">
            <p className="text-sm font-semibold text-foreground">Forças</p>
            <ul className="space-y-2.5">
              {strengths.map((strength) => (
                <li key={strength} className="flex items-start gap-2 text-sm text-foreground">
                  <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success" aria-hidden />
                  <span className="min-w-0">{strength}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="space-y-3">
            <p className="text-sm font-semibold text-primary">Lacunas</p>
            <ul className="space-y-2.5">
              {gaps.map((gap) => (
                <li key={gap} className="flex items-start gap-2 text-sm text-foreground">
                  <AlertTriangle className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
                  <span className="min-w-0">{gap}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <Button asChild variant="secondary" className="mt-auto h-auto py-2">
          <Link href="/app/acoes">
            Ver plano de ação
            <ArrowRight className="size-3.5" aria-hidden />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
