"use client";

import { useActionState } from "react";
import { saveTargetContextAction, type OnboardingActionState } from "../actions";
import { TARGET_AREA_OPTIONS, SENIORITY_OPTIONS } from "../schemas";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { OnboardingStepHeader } from "../onboarding-step-header";
import { OnboardingStepFooter } from "../onboarding-step-footer";
import { cn } from "@/lib/utils";
import type { OnboardingStepId } from "../step-config";

const initialState: OnboardingActionState = {};

function SegmentedField({
  name,
  options,
  defaultValue,
}: {
  name: string;
  options: readonly { value: string; label: string }[];
  defaultValue?: string;
}) {
  return (
    <div className="inline-flex">
      {options.map((option, index) => (
        <label
          key={option.value}
          className={cn(
            "flex h-9 cursor-pointer items-center justify-center border border-border px-4 text-sm font-medium text-foreground transition-colors",
            "has-[:checked]:border-primary has-[:checked]:bg-primary has-[:checked]:text-primary-foreground",
            index === 0 && "rounded-l-md",
            index === options.length - 1 && "rounded-r-md",
            index > 0 && "-ml-px",
          )}
        >
          <input type="radio" name={name} value={option.value} defaultChecked={defaultValue === option.value} required className="sr-only" />
          {option.label}
        </label>
      ))}
    </div>
  );
}

export function TargetContextStep({
  backHref,
  completedSteps,
  defaultValues,
}: {
  backHref: string;
  completedSteps: OnboardingStepId[];
  defaultValues: { targetArea: string; targetRole: string; desiredSeniority: string } | null;
}) {
  const [state, formAction] = useActionState(saveTargetContextAction, initialState);

  return (
    <>
      <OnboardingStepHeader activeStep="target-context" completedSteps={completedSteps} backHref={backHref} />
      <form action={formAction} className="flex flex-1 flex-col" noValidate>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <h1 className="text-2xl font-extrabold leading-8 text-foreground">Defina seu objetivo profissional</h1>
            <p className="text-base leading-6 text-foreground">
              Conte-nos qual direção você deseja analisar. Essas escolhas ajudam o CareerTwin a avaliar seu perfil
              de acordo com o contexto certo.
              <br />
              <br />
              Você poderá alterar esse objetivo depois sem modificar as informações já confirmadas do seu perfil.
            </p>
          </div>

          {state.error ? (
            <p className="rounded-md bg-destructive/10 p-3 text-sm text-destructive" role="alert">
              {state.error}
            </p>
          ) : null}

          <div className="flex flex-col gap-12">
            <fieldset className="space-y-3">
              <legend className="text-sm font-medium leading-none text-foreground">Área de interesse</legend>
              <SegmentedField name="targetArea" options={TARGET_AREA_OPTIONS} defaultValue={defaultValues?.targetArea} />
              {state.fieldErrors?.targetArea ? <p className="text-xs text-destructive">{state.fieldErrors.targetArea}</p> : null}
            </fieldset>

            <div className="space-y-3">
              <Label htmlFor="targetRole">Cargo-alvo</Label>
              <Input
                id="targetRole"
                name="targetRole"
                placeholder="Ex.: Product Manager"
                required
                defaultValue={defaultValues?.targetRole}
                aria-invalid={Boolean(state.fieldErrors?.targetRole)}
              />
              {state.fieldErrors?.targetRole ? <p className="text-xs text-destructive">{state.fieldErrors.targetRole}</p> : null}
            </div>

            <fieldset className="space-y-3">
              <legend className="text-sm font-medium leading-none text-foreground">Nível de senioridade</legend>
              <SegmentedField name="desiredSeniority" options={SENIORITY_OPTIONS} defaultValue={defaultValues?.desiredSeniority} />
              {state.fieldErrors?.desiredSeniority ? (
                <p className="text-xs text-destructive">{state.fieldErrors.desiredSeniority}</p>
              ) : null}
            </fieldset>
          </div>
        </div>

        <OnboardingStepFooter backHref={backHref} continueLabel="Concluir configuração" variant="success" />
      </form>
    </>
  );
}
