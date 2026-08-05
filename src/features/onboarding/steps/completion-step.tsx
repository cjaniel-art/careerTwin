"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { runOnboardingStageAction, type OnboardingStage } from "../actions";
import { Button } from "@/components/ui/button";

const STAGE_LABELS: Record<OnboardingStage, string> = {
  read_resume: "Lendo seu currículo",
  resume: "Organizando as informações do seu currículo",
  read_linkedin: "Lendo seu perfil do LinkedIn",
  linkedin: "Organizando as informações do seu LinkedIn",
  profile: "Montando seu perfil profissional",
  analysis: "Gerando sua Análise de Perfil",
};

/**
 * Full-page (no OnboardingShell photo panel) — matches Figma nodes 180:995
 * (preparing) / 199:1375 (error). Chains the pipeline one stage per request:
 * a single request covering all of them would blow the 60s serverless limit.
 * On failure, "Tentar novamente" resumes from the stage that failed.
 */
export function CompletionStep() {
  const router = useRouter();
  const [stage, setStage] = useState<OnboardingStage>("read_resume");
  const [failed, setFailed] = useState(false);
  const isRunningRef = useRef(false);

  const run = useCallback(
    async (from: OnboardingStage) => {
      if (isRunningRef.current) return;
      isRunningRef.current = true;
      setFailed(false);

      let current: OnboardingStage | null = from;
      while (current) {
        setStage(current);
        const result = await runOnboardingStageAction(current);
        if (!result.ok) {
          setStage(result.next ?? current);
          setFailed(true);
          break;
        }
        if (result.redirectTo) {
          router.replace(result.redirectTo);
          return;
        }
        current = result.next;
      }

      isRunningRef.current = false;
    },
    [router],
  );

  useEffect(() => {
    void run("read_resume");
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
        {!failed ? <p className="text-sm leading-5 text-muted-foreground">{STAGE_LABELS[stage]}…</p> : null}
      </div>
      {failed ? (
        <Button className="h-9 w-[206px] rounded-[10px] text-sm" onClick={() => void run(stage)}>
          Tentar novamente
        </Button>
      ) : null}
    </div>
  );
}
