"use client";

import { useActionState } from "react";
import { savePersonalDataAction, type OnboardingActionState } from "../actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { OnboardingStepHeader } from "../onboarding-step-header";
import { OnboardingStepFooter } from "../onboarding-step-footer";

const initialState: OnboardingActionState = {};

export function IdentificationStep({
  defaultValues,
}: {
  defaultValues: { fullName: string; city: string | null; state: string | null } | null;
}) {
  const [state, formAction] = useActionState(savePersonalDataAction, initialState);

  return (
    <>
      <OnboardingStepHeader activeStep="personal-data" completedSteps={[]} backHref="/" />
      <form action={formAction} className="flex flex-1 flex-col" noValidate>
        <div className="flex flex-col gap-10">
          <div className="flex flex-col gap-1.5">
            <h1 className="text-2xl font-extrabold leading-8 text-foreground">
              Vamos preparar seu perfil profissional
            </h1>
            <p className="text-base leading-6 text-foreground">
              Em quatro etapas rápidas, você envia suas informações profissionais, revisa sua trajetória e
              define o objetivo das suas análises.
            </p>
          </div>

          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <h2 className="text-lg font-bold leading-7 text-foreground">Seus dados pessoais</h2>
              <p className="text-base leading-6 text-foreground">
                Essas informações são usadas apenas para identificar sua conta. Elas ficam separadas do seu
                perfil profissional e não influenciam os resultados das análises.
              </p>
            </div>

            {state.error ? (
              <p className="rounded-md bg-destructive/10 p-3 text-sm text-destructive" role="alert">
                {state.error}
              </p>
            ) : null}

            <div className="flex flex-col gap-6">
              <div className="space-y-3">
                <Label htmlFor="fullName">Nome completo</Label>
                <Input
                  id="fullName"
                  name="fullName"
                  required
                  autoComplete="name"
                  placeholder="Ex.: Como você gostaria de ser chamado?"
                  defaultValue={defaultValues?.fullName}
                  aria-invalid={Boolean(state.fieldErrors?.fullName)}
                />
                {state.fieldErrors?.fullName ? (
                  <p className="text-xs text-destructive">{state.fieldErrors.fullName}</p>
                ) : null}
              </div>
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <div className="space-y-3">
                  <Label htmlFor="state">Estado</Label>
                  <Input id="state" name="state" autoComplete="address-level1" defaultValue={defaultValues?.state ?? ""} />
                </div>
                <div className="space-y-3">
                  <Label htmlFor="city">Cidade</Label>
                  <Input id="city" name="city" autoComplete="address-level2" defaultValue={defaultValues?.city ?? ""} />
                </div>
              </div>
            </div>
          </div>
        </div>

        <OnboardingStepFooter />
      </form>
    </>
  );
}
