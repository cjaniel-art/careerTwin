"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { runStageToCompletion } from "../run-stage";
import { Button } from "@/components/ui/button";

type Phase = "documents" | "profile" | "analysis";

const PHASE_LABELS: Record<Phase, string> = {
  documents: "Lendo seu currículo e seu perfil do LinkedIn",
  profile: "Montando seu perfil profissional",
  analysis: "Gerando sua Análise de Perfil",
};

/**
 * Full-page (no OnboardingShell photo panel) — matches Figma nodes 180:995
 * (preparing) / 199:1375 (error).
 *
 * Résumé and LinkedIn run concurrently: they touch different documents and
 * nothing downstream, so the wait is the slower of the two rather than their
 * sum. Anything the background prewarm already finished during data collection
 * returns immediately here.
 */
export function CompletionStep() {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("documents");
  const [failed, setFailed] = useState(false);
  const isRunningRef = useRef(false);

  const run = useCallback(async () => {
    if (isRunningRef.current) return;
    isRunningRef.current = true;
    setFailed(false);

    try {
      setPhase("documents");
      const documents = await Promise.all([runStageToCompletion("resume"), runStageToCompletion("linkedin")]);
      if (documents.some((result) => !result.ok)) {
        setFailed(true);
        return;
      }

      setPhase("profile");
      if (!(await runStageToCompletion("profile")).ok) {
        setFailed(true);
        return;
      }

      setPhase("analysis");
      const analysis = await runStageToCompletion("analysis");
      if (!analysis.ok || !analysis.redirectTo) {
        setFailed(true);
        return;
      }

      router.replace(analysis.redirectTo);
    } finally {
      isRunningRef.current = false;
    }
  }, [router]);

  useEffect(() => {
    void run();
  }, [run]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-white px-6 text-center">
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
            : "Estamos analisando seu currículo, LinkedIn e objetivo profissional para transformar sua trajetória em recomendações claras e priorizadas."}
        </p>
        {!failed ? <p className="text-sm leading-5 text-muted-foreground">{PHASE_LABELS[phase]}…</p> : null}
      </div>
      {failed ? (
        <Button className="h-9 w-[206px] rounded-[10px] text-sm" onClick={() => void run()}>
          Tentar novamente
        </Button>
      ) : null}
    </div>
  );
}
