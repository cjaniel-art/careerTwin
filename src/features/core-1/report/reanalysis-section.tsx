import { SubmitButton } from "@/components/submit-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { startProfileAnalysisAction } from "@/features/core-1/actions";

/**
 * §17 — startProfileAnalysisAction já é idempotente por versão de perfil/contexto-alvo
 * (ver ensureProfileAnalysisRow): sem uma mudança real no Thin Twin ou no
 * objetivo, reexecutar aqui volta para esta mesma análise em vez de criar uma
 * nova — a cópia abaixo já reflete essa regra existente, não a contorna.
 */
export function ReanalysisSection() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Reanalisar perfil</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground">
          Atualizou seu currículo, LinkedIn ou objetivo profissional? Gere uma nova análise para acompanhar sua
          evolução. Esta análise permanece disponível no seu histórico.
        </p>
        <form action={startProfileAnalysisAction}>
          <SubmitButton variant="secondary" size="sm">
            Reanalisar perfil
          </SubmitButton>
        </form>
      </CardContent>
    </Card>
  );
}
