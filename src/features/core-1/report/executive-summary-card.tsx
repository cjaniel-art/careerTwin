import { AlertTriangle, Compass, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

function MicroItem({
  icon: Icon,
  label,
  text,
  tone,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  text: string;
  tone: "success" | "primary" | "info";
}) {
  const toneClasses = {
    success: "bg-success/10 text-success",
    primary: "bg-primary/10 text-primary",
    info: "bg-secondary text-muted-foreground",
  }[tone];

  return (
    <div className="flex items-start gap-2.5">
      <span className={cn("mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full", toneClasses)}>
        <Icon className="size-3.5" aria-hidden />
      </span>
      <div className="min-w-0">
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        <p className="mt-0.5 text-sm leading-5 text-foreground">{text}</p>
      </div>
    </div>
  );
}

/** §2 (Card 1) — primeira leitura do relatório. Todo texto vem de profile_analysis_results, nunca hardcoded. */
export function ExecutiveSummaryCard({
  summary,
  mainStrength,
  mainGap,
  nextBestAction,
}: {
  summary: string;
  mainStrength: string;
  mainGap: string;
  nextBestAction: string;
}) {
  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle className="text-base">Resumo executivo</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-4">
        <p className="text-sm leading-6 text-foreground">{summary}</p>
        <Separator />
        <div className="flex flex-col gap-3">
          <MicroItem icon={TrendingUp} label="Ponto forte" text={mainStrength} tone="success" />
          <MicroItem icon={AlertTriangle} label="Principal lacuna" text={mainGap} tone="primary" />
          <MicroItem icon={Compass} label="Próxima ação" text={nextBestAction} tone="info" />
        </div>
      </CardContent>
    </Card>
  );
}
