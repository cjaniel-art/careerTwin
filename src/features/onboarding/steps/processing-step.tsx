import { Card, CardContent } from "@/components/ui/card";
import { retryDocumentProcessingAction } from "../actions";
import { SubmitButton } from "@/components/submit-button";

const STATUS_LABELS: Record<string, string> = {
  awaiting_upload: "Aguardando envio",
  uploading: "Enviando",
  validating: "Validando",
  queued: "Na fila de processamento",
  processing: "Processando",
  ready: "Concluído",
  insufficient_content: "Conteúdo insuficiente",
  failed_retryable: "Falha temporária — você pode tentar novamente",
  failed_final: "Falha no processamento",
};

export function ProcessingStep({
  resumeStatus,
  linkedinStatus,
}: {
  resumeStatus: string | null;
  linkedinStatus: string | null;
}) {
  return (
    <Card>
      <CardContent className="space-y-4 pt-6">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Estamos organizando suas informações</h2>
          <p className="text-sm text-muted-foreground">
            Isso pode levar alguns instantes. Você pode continuar depois; seu progresso será preservado.
          </p>
        </div>

        <ul className="space-y-3 text-sm">
          <li className="flex items-center justify-between rounded-md border border-border p-3">
            <span>Currículo</span>
            <span className="text-muted-foreground">{STATUS_LABELS[resumeStatus ?? ""] ?? "Aguardando"}</span>
          </li>
          <li className="flex items-center justify-between rounded-md border border-border p-3">
            <span>LinkedIn</span>
            <span className="text-muted-foreground">{STATUS_LABELS[linkedinStatus ?? ""] ?? "Aguardando"}</span>
          </li>
        </ul>

        {resumeStatus === "failed_retryable" || linkedinStatus === "failed_retryable" ? (
          <form action={retryDocumentProcessingAction}>
            <SubmitButton variant="secondary">Tentar novamente</SubmitButton>
          </form>
        ) : null}
      </CardContent>
    </Card>
  );
}
