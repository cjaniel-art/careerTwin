"use client";

import { useActionState } from "react";
import { savePersonalDataAction, type OnboardingActionState } from "../actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const initialState: OnboardingActionState = {};

export function IdentificationStep() {
  const [state, formAction, pending] = useActionState(savePersonalDataAction, initialState);

  return (
    <Card>
      <CardContent className="space-y-4 pt-6">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Seus dados</h2>
          <p className="text-sm text-muted-foreground">
            Esses dados ficam separados do seu perfil profissional e não influenciam nenhuma análise.
          </p>
        </div>

        {state.error ? (
          <p className="rounded-md bg-destructive/10 p-3 text-sm text-destructive" role="alert">
            {state.error}
          </p>
        ) : null}

        <form action={formAction} className="space-y-4" noValidate>
          <div className="space-y-2">
            <Label htmlFor="fullName">Nome completo</Label>
            <Input
              id="fullName"
              name="fullName"
              required
              autoComplete="name"
              aria-invalid={Boolean(state.fieldErrors?.fullName)}
            />
            {state.fieldErrors?.fullName ? (
              <p className="text-xs text-destructive">{state.fieldErrors.fullName}</p>
            ) : null}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city">Cidade (opcional)</Label>
              <Input id="city" name="city" autoComplete="address-level2" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="state">Estado (opcional)</Label>
              <Input id="state" name="state" autoComplete="address-level1" />
            </div>
          </div>
          <Button type="submit" disabled={pending}>
            {pending ? "Salvando..." : "Continuar"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
