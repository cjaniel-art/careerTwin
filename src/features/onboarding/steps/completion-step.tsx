"use client";

import { useActionState, useEffect, useRef } from "react";
import Image from "next/image";
import { completeOnboardingAction, type CompleteOnboardingState } from "../actions";
import { SubmitButton } from "@/components/submit-button";

const initialState: CompleteOnboardingState = {};

/**
 * Full-page (no OnboardingShell photo panel) — matches Figma nodes 180:995
 * (preparing) / 199:1375 (error). Auto-submits on mount; on failure shows
 * the error state with a manual "Tentar novamente" that resubmits the same
 * action instead of auto-retrying.
 */
export function CompletionStep() {
  const [state, formAction] = useActionState(completeOnboardingAction, initialState);
  const formRef = useRef<HTMLFormElement>(null);
  const hasAutoSubmittedRef = useRef(false);

  useEffect(() => {
    if (hasAutoSubmittedRef.current) return;
    hasAutoSubmittedRef.current = true;
    formRef.current?.requestSubmit();
  }, []);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-white px-6 text-center">
      {state.error ? (
        <Image src="/onboarding/analysis-error-icon.svg" alt="" width={208} height={208} className="size-[208px]" />
      ) : (
        <Image src="/onboarding/analysis-loading-icon.svg" alt="" width={223} height={218} className="h-[218px] w-[223px]" />
      )}
      <div className="flex max-w-[565px] flex-col gap-1.5">
        <p className="text-xl font-black leading-7 text-foreground">
          {state.error ? "Não foi possível concluir sua Análise de Perfil" : "Sua Análise de Perfil está sendo preparada"}
        </p>
        <p className="text-sm leading-5 text-foreground">
          {state.error
            ? "Encontramos um problema durante o processamento das suas informações."
            : "Estamos analisando seu currículo, LinkedIn e objetivo profissional para transformar sua trajetória em recomendações claras e priorizadas."}
        </p>
      </div>
      <form ref={formRef} action={formAction}>
        {state.error ? (
          <SubmitButton className="h-9 w-[206px] rounded-[10px] text-sm">Tentar novamente</SubmitButton>
        ) : null}
      </form>
    </div>
  );
}
