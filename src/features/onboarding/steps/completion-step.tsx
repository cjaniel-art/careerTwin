"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Check, Loader2 } from "lucide-react";
import { runStageToCompletion } from "../run-stage";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type StepId = "resume" | "linkedin" | "profile" | "dimensions" | "recommendations";
type StepState = "pending" | "active" | "done" | "error";

const STEPS: { id: StepId; label: string }[] = [
  { id: "resume", label: "Lendo seu currículo" },
  { id: "linkedin", label: "Lendo seu perfil do LinkedIn" },
  { id: "profile", label: "Montando seu perfil profissional" },
  { id: "dimensions", label: "Classificando as dimensões do seu perfil" },
  { id: "recommendations", label: "Gerando recomendações personalizadas" },
];

const INITIAL_STEP_STATE: Record<StepId, StepState> = {
  resume: "pending",
  linkedin: "pending",
  profile: "pending",
  dimensions: "pending",
  recommendations: "pending",
};

/**
 * Rotates while the user waits — original CareerTwin copy, not a generic
 * loading message. Any resemblance to a specific source's phrasing is
 * coincidental; write new tips here rather than copying one from elsewhere.
 */
const WAITING_TIPS = [
  "Resultados quantificáveis (%, R$, tempo) pesam mais do que listas de responsabilidades.",
  "Comece cada item do currículo pelo resultado entregue, não pela tarefa realizada.",
  "Consistência entre currículo e LinkedIn é um dos fatores que mais afeta a credibilidade do seu perfil.",
  "Termos vagos como \"proativo\" e \"dinâmico\" pesam menos do que evidências concretas do que você entregou.",
  "Um objetivo de carreira claro ajuda a análise a avaliar seu perfil no contexto certo.",
];

function StepRow({ label, state }: { label: string; state: StepState }) {
  return (
    <li className="flex items-center gap-2.5 text-sm">
      <span
        className={cn(
          "flex size-5 shrink-0 items-center justify-center rounded-full",
          state === "done" && "bg-success text-success-foreground",
          state === "active" && "text-primary",
          state === "error" && "bg-destructive text-destructive-foreground",
          state === "pending" && "border border-[#bdbdbd]",
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

/**
 * Full-page (no OnboardingShell photo panel) — matches Figma nodes 180:995
 * (preparing) / 199:1375 (error), extended with a step-by-step checklist so
 * the wait isn't a single opaque spinner.
 *
 * Résumé and LinkedIn run concurrently: they touch different documents and
 * nothing downstream, so the wait is the slower of the two rather than their
 * sum. Anything the background prewarm already finished during data collection
 * completes near-instantly here. Análise de Perfil is itself two model calls
 * (dimensions, then recommendations) — each its own request — surfaced as two
 * checklist rows via runStageToCompletion's onRound callback rather than one
 * opaque "Gerando análise" spinner.
 */
export function CompletionStep() {
  const router = useRouter();
  const [steps, setSteps] = useState<Record<StepId, StepState>>(INITIAL_STEP_STATE);
  const [failed, setFailed] = useState(false);
  const [tipIndex, setTipIndex] = useState(0);
  const isRunningRef = useRef(false);

  useEffect(() => {
    if (failed) return;
    const interval = setInterval(() => setTipIndex((i) => (i + 1) % WAITING_TIPS.length), 6000);
    return () => clearInterval(interval);
  }, [failed]);

  const setStep = useCallback((id: StepId, state: StepState) => {
    setSteps((prev) => ({ ...prev, [id]: state }));
  }, []);

  const run = useCallback(async () => {
    if (isRunningRef.current) return;
    isRunningRef.current = true;
    setFailed(false);
    setSteps(INITIAL_STEP_STATE);

    try {
      setStep("resume", "active");
      setStep("linkedin", "active");
      const [resumeResult, linkedinResult] = await Promise.all([
        runStageToCompletion("resume").then((r) => {
          setStep("resume", r.ok ? "done" : "error");
          return r;
        }),
        runStageToCompletion("linkedin").then((r) => {
          setStep("linkedin", r.ok ? "done" : "error");
          return r;
        }),
      ]);
      if (!resumeResult.ok || !linkedinResult.ok) {
        setFailed(true);
        return;
      }

      setStep("profile", "active");
      const profileResult = await runStageToCompletion("profile");
      setStep("profile", profileResult.ok ? "done" : "error");
      if (!profileResult.ok) {
        setFailed(true);
        return;
      }

      setStep("dimensions", "active");
      const analysisResult = await runStageToCompletion("analysis", (round) => {
        setSteps((prev) => {
          if (!round.ok) {
            // Whichever half was in flight when it failed gets the error mark.
            const failedStep: StepId = prev.dimensions === "done" ? "recommendations" : "dimensions";
            return { ...prev, [failedStep]: "error" };
          }
          // The first successful round always means dimensions have landed —
          // either it ran just now, or (on a retry) it was already done and
          // this round went straight to recommendations. `done: true` on that
          // same round means recommendations finished too, in one round.
          return { ...prev, dimensions: "done", recommendations: round.done ? "done" : "active" };
        });
      });
      if (!analysisResult.ok || !analysisResult.redirectTo) {
        setFailed(true);
        return;
      }

      router.replace(analysisResult.redirectTo);
    } finally {
      isRunningRef.current = false;
    }
  }, [router, setStep]);

  useEffect(() => {
    void run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const doneCount = STEPS.filter((s) => steps[s.id] === "done").length;
  const progressPercent = Math.round((doneCount / STEPS.length) * 100);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-white px-6 py-12 text-center">
      {failed ? (
        <Image src="/onboarding/analysis-error-icon.svg" alt="" width={208} height={208} className="size-[208px]" />
      ) : (
        <Image src="/onboarding/analysis-loading-icon.svg" alt="" width={223} height={218} className="h-[218px] w-[223px]" />
      )}
      <div className="flex max-w-[565px] flex-col gap-1.5">
        <p className="text-xl font-black leading-7 text-foreground">
          {failed ? "Não foi possível concluir sua Análise de Perfil" : "Sua Análise de Perfil está sendo preparada"}
        </p>
        <p className="text-sm leading-5 text-foreground">
          {failed
            ? "Encontramos um problema durante o processamento das suas informações."
            : "Estamos analisando seu currículo, LinkedIn e objetivo profissional para transformar sua trajetória em recomendações claras e priorizadas. Isso pode levar até 2 minutos."}
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

      {!failed ? (
        <div className="flex max-w-[420px] flex-col gap-1">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Enquanto isso</p>
          <p className="text-sm leading-5 text-muted-foreground">{WAITING_TIPS[tipIndex]}</p>
        </div>
      ) : null}

      {failed ? (
        <Button className="h-9 w-[206px] rounded-[10px] text-sm" onClick={() => void run()}>
          Tentar novamente
        </Button>
      ) : null}
    </div>
  );
}
