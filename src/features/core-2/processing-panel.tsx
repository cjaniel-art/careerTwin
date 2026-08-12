"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type StepId = "dispatch" | "diagnosis";
type StepState = "pending" | "active" | "done" | "error";

const STEPS: { id: StepId; label: string }[] = [
  { id: "dispatch", label: "Enviando vaga e perfil confirmado para o motor de IA" },
  { id: "diagnosis", label: "Gerando o Diagnóstico de Aderência (IAO, pontos fortes, lacunas e plano de ação)" },
];

const INITIAL_STEPS: Record<StepId, StepState> = { dispatch: "done", diagnosis: "active" };

const POLL_INTERVAL_MS = 3000;
// core2-analysis's own Edge Function ceiling is 150s; this gives a wide margin
// for the compare-and-set redispatch (see runJobAnalysisStage) to recover a
// stalled round before giving up.
const MAX_ROUNDS = 110;

function StepRow({ label, state }: { label: string; state: StepState }) {
  return (
    <li className="flex items-center gap-2.5 text-sm">
      <span
        className={cn(
          "flex size-5 shrink-0 items-center justify-center rounded-full",
          state === "done" && "bg-success text-success-foreground",
          state === "active" && "text-primary",
          state === "error" && "bg-destructive text-destructive-foreground",
          state === "pending" && "border border-border",
        )}
      >
        {state === "done" ? <Check className="size-3.5" /> : null}
        {state === "active" ? <Loader2 className="size-4 animate-spin" /> : null}
        {state === "error" ? <span className="text-xs leading-none">!</span> : null}
      </span>
      <span
        className={cn(
          "leading-tight",
          state === "pending" && "text-muted-foreground",
          state === "done" && "text-foreground",
          state === "active" && "font-medium text-foreground",
          state === "error" && "text-destructive",
        )}
      >
        {label}
      </span>
    </li>
  );
}

interface StageResponse {
  ok: boolean;
  done: boolean;
  status?: "processing" | "completed" | "insufficient_data" | "failed_retryable";
}

/**
 * Client-driven polling counterpart of CompletionStep/ProcessingStepPanel
 * (onboarding), adapted for Core 2: the diagnosis is a single opaque Edge
 * Function call (core2-analysis), not several sequential model calls like
 * Core 1's dimensions/recommendations — so "dispatch" starts already "done"
 * (both callers of this hook only start polling once dispatch already
 * happened) and "diagnosis" is the one real step, driven by actual
 * /api/aderencia/process responses rather than a fixed timer.
 */
function useJobAnalysisPolling(analysisId: string | null, onDone: (analysisId: string) => void) {
  const [steps, setSteps] = useState<Record<StepId, StepState>>({ dispatch: "pending", diagnosis: "pending" });
  const [failed, setFailed] = useState(false);
  const [failReason, setFailReason] = useState<string | null>(null);
  const startedRef = useRef(false);

  const run = useCallback(async () => {
    if (!analysisId) return;
    setFailed(false);
    setFailReason(null);
    setSteps(INITIAL_STEPS);
    try {
      for (let round = 0; round < MAX_ROUNDS; round++) {
        const response = await fetch("/api/aderencia/process", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ analysisId }),
        });
        const result = (await response.json()) as StageResponse;

        if (!result.ok) {
          setSteps((prev) => ({ ...prev, diagnosis: "error" }));
          setFailed(true);
          return;
        }
        if (result.done) {
          if (result.status === "completed") {
            setSteps((prev) => ({ ...prev, diagnosis: "done" }));
            onDone(analysisId);
            return;
          }
          setSteps((prev) => ({ ...prev, diagnosis: "error" }));
          setFailReason(
            result.status === "insufficient_data"
              ? "Não há requisitos suficientes para gerar um diagnóstico confiável."
              : "Tente novamente. Se um crédito havia sido reservado, ele foi restaurado.",
          );
          setFailed(true);
          return;
        }
        await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
      }
      setSteps((prev) => ({ ...prev, diagnosis: "error" }));
      setFailed(true);
    } catch {
      setSteps((prev) => ({ ...prev, diagnosis: "error" }));
      setFailed(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [analysisId]);

  useEffect(() => {
    if (!analysisId || startedRef.current) return;
    startedRef.current = true;
    void run();
  }, [analysisId, run]);

  const doneCount = STEPS.filter((s) => steps[s.id] === "done").length;
  const progressPercent = Math.round((doneCount / STEPS.length) * 100);

  return { steps, failed, failReason, progressPercent, retry: run };
}

/** Full-page variant — used by /app/aderencia/processando/[analysisId] (direct navigation/refresh). */
export function JobAnalysisProcessingPanel({ analysisId }: { analysisId: string }) {
  const router = useRouter();
  const { steps, failed, failReason, progressPercent, retry } = useJobAnalysisPolling(analysisId, (id) =>
    router.replace(`/app/aderencia/${id}`),
  );

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-white px-6 py-12 text-center">
      <Image
        src={failed ? "/onboarding/analysis-error-icon.svg" : "/onboarding/analysis-loading-icon.svg"}
        alt=""
        width={223}
        height={218}
        className="h-[218px] w-[223px]"
      />
      <div className="flex max-w-[565px] flex-col gap-1.5">
        <p className="text-xl font-black leading-7 text-foreground">
          {failed ? "Não foi possível concluir a análise agora" : "Seu Diagnóstico de Aderência está sendo preparado"}
        </p>
        <p className="text-sm leading-5 text-foreground">
          {failed
            ? (failReason ?? "Encontramos um problema durante o processamento.")
            : "Estamos comparando seu perfil confirmado com os requisitos desta vaga para gerar o índice de aderência, pontos fortes, lacunas e plano de ação. Isso pode levar alguns minutos."}
        </p>
      </div>

      <div className="w-full max-w-[420px] rounded-xl border border-border bg-card p-5 text-left shadow-sm">
        <div className="mb-4 h-2 w-full overflow-hidden rounded-full bg-primary/20">
          <div
            className="h-full rounded-full bg-primary transition-[width] duration-500"
            style={{ width: `${failed ? progressPercent : Math.max(progressPercent, 6)}%` }}
          />
        </div>
        <ol className="flex flex-col gap-3">
          {STEPS.map((step) => (
            <StepRow key={step.id} label={step.label} state={steps[step.id]} />
          ))}
        </ol>
      </div>

      {failed ? (
        <div className="flex gap-3">
          <Button className="h-9 rounded-[10px] text-sm" onClick={() => void retry()}>
            Tentar novamente
          </Button>
          <Button variant="secondary" className="h-9 rounded-[10px] text-sm" onClick={() => router.push("/app/aderencia")}>
            Voltar
          </Button>
        </div>
      ) : null}
    </div>
  );
}

const STRUCTURING_LABEL = "Estruturando a vaga com IA";

/**
 * Single continuous panel covering the whole "Cria análise" flow inside the
 * Sheet — from the instant the form is submitted (structuring, which runs
 * synchronously inside the server action and can take several seconds or
 * fail outright) through diagnosis generation (polled via
 * /api/aderencia/process once the analysis row exists). Previously these
 * were two visually distinct panels (JobAnalysisStructuringPanel /
 * JobAnalysisProcessingStepPanel) swapped at the analysisId boundary; merged
 * into one so the user sees a single progressing step list instead of a
 * jump-cut between two screens. `analysisId` is null until structuring
 * succeeds — useJobAnalysisPolling no-ops until then.
 */
export function JobAnalysisCreateProgressPanel({
  structuringPending,
  structuringError,
  analysisId,
  onDone,
  onRetryStructuring,
}: {
  structuringPending: boolean;
  structuringError?: string;
  analysisId: string | null;
  onDone: (analysisId: string) => void;
  onRetryStructuring: () => void;
}) {
  const { steps, failed: diagnosisFailed, failReason, retry } = useJobAnalysisPolling(analysisId, onDone);

  const structuringFailed = !structuringPending && !analysisId && Boolean(structuringError);
  const structuringState: StepState = analysisId ? "done" : structuringFailed ? "error" : "active";
  const failed = structuringFailed || diagnosisFailed;

  const allSteps: { id: string; label: string; state: StepState }[] = [
    { id: "structuring", label: STRUCTURING_LABEL, state: structuringState },
    ...STEPS.map((step) => ({ ...step, state: analysisId ? steps[step.id] : ("pending" as StepState) })),
  ];
  const doneCount = allSteps.filter((s) => s.state === "done").length;
  const progressPercent = Math.round((doneCount / allSteps.length) * 100);

  const title = structuringFailed
    ? "Não foi possível estruturar a vaga"
    : diagnosisFailed
      ? "Não foi possível concluir a análise"
      : "Preparando sua análise";
  const subtitle = structuringFailed
    ? (structuringError ?? "Tente novamente.")
    : diagnosisFailed
      ? (failReason ?? "Encontramos um problema durante o processamento.")
      : "Estamos lendo e estruturando os requisitos da vaga e comparando com seu perfil confirmado. Isso pode levar alguns minutos.";

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 text-center">
      <Image
        src={failed ? "/onboarding/analysis-error-icon.svg" : "/onboarding/analysis-loading-icon.svg"}
        alt=""
        width={160}
        height={156}
        className="h-[156px] w-[160px]"
      />
      <div className="flex max-w-80 flex-col gap-1.5">
        <p className="text-lg font-semibold text-foreground">{title}</p>
        <p className="text-sm text-muted-foreground">{subtitle}</p>
      </div>
      <div className="w-full max-w-80 rounded-xl border border-border bg-background p-5 text-left">
        <div className="mb-4 h-2 w-full overflow-hidden rounded-full bg-primary/20">
          <div
            className="h-full rounded-full bg-primary transition-[width] duration-500"
            style={{ width: `${failed ? progressPercent : Math.max(progressPercent, 6)}%` }}
          />
        </div>
        <ol className="flex flex-col gap-3">
          {allSteps.map((step) => (
            <StepRow key={step.id} label={step.label} state={step.state} />
          ))}
        </ol>
      </div>
      {failed ? (
        <Button size="sm" onClick={() => (structuringFailed ? onRetryStructuring() : void retry())}>
          Tentar novamente
        </Button>
      ) : null}
    </div>
  );
}
