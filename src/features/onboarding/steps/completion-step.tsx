"use client";

import { useEffect, useRef } from "react";
import { Loader2 } from "lucide-react";
import { completeOnboardingAction } from "../actions";
import { Card, CardContent } from "@/components/ui/card";

/** Auto-submits on mount — no click required. Runs onboarding completion + the first Análise de Perfil, then redirects to the dashboard once both are done. */
export function CompletionStep() {
  const formRef = useRef<HTMLFormElement>(null);
  const hasSubmittedRef = useRef(false);

  useEffect(() => {
    if (hasSubmittedRef.current) return;
    hasSubmittedRef.current = true;
    formRef.current?.requestSubmit();
  }, []);

  return (
    <Card>
      <CardContent className="space-y-4 pt-6 text-center">
        <Loader2 className="mx-auto size-8 animate-spin text-primary" aria-hidden />
        <div>
          <h2 className="text-lg font-semibold text-foreground">Criando seu perfil</h2>
          <p className="text-sm text-muted-foreground">
            Estamos montando seu Thin Twin e gerando sua primeira Análise de Perfil. Isso pode levar um instante.
          </p>
        </div>
        <form ref={formRef} action={completeOnboardingAction} className="hidden" />
      </CardContent>
    </Card>
  );
}
