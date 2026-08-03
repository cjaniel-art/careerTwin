import { completeOnboardingAction } from "../actions";
import { SubmitButton } from "@/components/submit-button";
import { Card, CardContent } from "@/components/ui/card";

export function CompletionStep() {
  return (
    <Card>
      <CardContent className="space-y-4 pt-6 text-center">
        <h2 className="text-lg font-semibold text-foreground">Seu perfil está pronto</h2>
        <p className="text-sm text-muted-foreground">
          Agora você pode iniciar sua Análise de Perfil.
        </p>
        <form action={completeOnboardingAction}>
          <SubmitButton>Ir para o painel</SubmitButton>
        </form>
      </CardContent>
    </Card>
  );
}
