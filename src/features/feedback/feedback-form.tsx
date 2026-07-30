import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { submitAnalysisFeedbackAction } from "./actions";

const APPLICATION_INTENT_OPTIONS: Array<{ value: string; label: string }> = [
  { value: "apply", label: "Vou me candidatar" },
  { value: "apply_after_adjustments", label: "Vou me candidatar após ajustes" },
  { value: "not_apply", label: "Não vou me candidatar" },
  { value: "undecided", label: "Ainda não decidi" },
];

interface ExistingFeedback {
  usefulness_score: number;
  specificity: string;
  application_intent: string | null;
  comment: string | null;
}

export function FeedbackForm({
  analysisId,
  redirectTo,
  showApplicationIntent,
  existing,
}: {
  analysisId: string;
  redirectTo: string;
  showApplicationIntent: boolean;
  existing: ExistingFeedback | null;
}) {
  if (existing) {
    return (
      <div className="rounded-md bg-secondary p-3 text-sm text-foreground">
        Obrigado pelo feedback — você avaliou esta análise com nota {existing.usefulness_score}/5.
      </div>
    );
  }

  return (
    <form action={submitAnalysisFeedbackAction} className="space-y-4">
      <input type="hidden" name="analysisId" value={analysisId} />
      <input type="hidden" name="redirectTo" value={redirectTo} />

      <div className="space-y-2">
        <Label>O quão útil foi esta análise?</Label>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((n) => (
            <label
              key={n}
              className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-md border border-border text-sm text-foreground has-[:checked]:border-primary has-[:checked]:bg-primary/10"
            >
              <input type="radio" name="usefulnessScore" value={n} required className="sr-only" />
              {n}
            </label>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label>As recomendações foram específicas o suficiente?</Label>
        <div className="flex flex-wrap gap-2">
          {[
            { value: "yes", label: "Sim" },
            { value: "partially", label: "Parcialmente" },
            { value: "no", label: "Não" },
          ].map((opt) => (
            <label
              key={opt.value}
              className="cursor-pointer rounded-md border border-border px-3 py-1.5 text-sm text-foreground has-[:checked]:border-primary has-[:checked]:bg-primary/10"
            >
              <input type="radio" name="specificity" value={opt.value} required className="sr-only" />
              {opt.label}
            </label>
          ))}
        </div>
      </div>

      {showApplicationIntent ? (
        <div className="space-y-2">
          <Label>Você pretende se candidatar a esta vaga?</Label>
          <div className="flex flex-wrap gap-2">
            {APPLICATION_INTENT_OPTIONS.map((opt) => (
              <label
                key={opt.value}
                className="cursor-pointer rounded-md border border-border px-3 py-1.5 text-sm text-foreground has-[:checked]:border-primary has-[:checked]:bg-primary/10"
              >
                <input type="radio" name="applicationIntent" value={opt.value} className="sr-only" />
                {opt.label}
              </label>
            ))}
          </div>
        </div>
      ) : null}

      <div className="space-y-2">
        <Label htmlFor="comment">Comentário (opcional)</Label>
        <textarea
          id="comment"
          name="comment"
          rows={3}
          maxLength={2000}
          className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        />
      </div>

      <Button type="submit" size="sm">
        Enviar feedback
      </Button>
    </form>
  );
}
