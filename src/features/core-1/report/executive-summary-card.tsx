import { AlertTriangle, Compass, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

const STOPWORDS = new Set([
  "de",
  "da",
  "do",
  "das",
  "dos",
  "em",
  "na",
  "no",
  "nas",
  "nos",
  "e",
  "a",
  "o",
  "as",
  "os",
  "com",
  "para",
  "por",
  "que",
  "ou",
  "um",
  "uma",
  "uns",
  "umas",
  "seu",
  "sua",
  "seus",
  "suas",
  "este",
  "esta",
  "isso",
  "ex",
  "etc",
  "ao",
  "aos",
]);

/**
 * Frase curta para o card compacto, extraída do texto real (nunca inventa conteúdo novo):
 * remove parênteses/exemplos e palavras de ligação, mantendo só as primeiras palavras com
 * significado próprio do texto original. O texto completo continua no resumo acima e nas
 * abas Forças/Lacunas (disponível também no title/tooltip aqui).
 */
function summarizeWords(text: string, maxWords: number): string {
  const withoutParens = text.replace(/\([^)]*\)/g, " ");
  const words = withoutParens
    .trim()
    .split(/\s+/)
    .map((w) => w.replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu, ""))
    .filter((w) => w.length > 0 && !STOPWORDS.has(w.toLowerCase()));
  const picked = words.slice(0, maxWords);
  return picked.length > 0 ? picked.join(" ") : text;
}

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
    <div className="flex min-w-0 flex-col gap-1.5">
      <div className="flex items-center gap-2">
        <span className={cn("flex size-6 shrink-0 items-center justify-center rounded-full", toneClasses)}>
          <Icon className="size-3.5" aria-hidden />
        </span>
        <p className="text-sm font-semibold text-foreground">{label}</p>
      </div>
      <p className="text-sm leading-5 text-muted-foreground" title={text}>
        {summarizeWords(text, 4)}
      </p>
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
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <MicroItem icon={TrendingUp} label="Ponto forte" text={mainStrength} tone="success" />
          <MicroItem icon={AlertTriangle} label="Principal lacuna" text={mainGap} tone="primary" />
          <MicroItem icon={Compass} label="Próxima ação" text={nextBestAction} tone="info" />
        </div>
      </CardContent>
    </Card>
  );
}
