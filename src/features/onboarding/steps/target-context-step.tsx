"use client";

import { useActionState } from "react";
import { saveTargetContextAction, type OnboardingActionState } from "../actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const initialState: OnboardingActionState = {};

export function TargetContextStep() {
  const [state, formAction, pending] = useActionState(saveTargetContextAction, initialState);

  return (
    <Card>
      <CardContent className="space-y-4 pt-6">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Seu contexto-alvo</h2>
          <p className="text-sm text-muted-foreground">
            Define o objetivo das suas análises. Este contexto é separado do seu perfil e pode ser alterado
            depois sem afetar as informações já confirmadas.
          </p>
        </div>

        {state.error ? <p className="text-xs text-destructive">{state.error}</p> : null}

        <form action={formAction} className="space-y-4" noValidate>
          <div className="space-y-2">
            <Label htmlFor="targetArea">Área de interesse</Label>
            <Input
              id="targetArea"
              name="targetArea"
              placeholder="Ex.: Produto, Tecnologia, Design"
              required
              aria-invalid={Boolean(state.fieldErrors?.targetArea)}
            />
            {state.fieldErrors?.targetArea ? (
              <p className="text-xs text-destructive">{state.fieldErrors.targetArea}</p>
            ) : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="targetRole">Cargo-alvo</Label>
            <Input
              id="targetRole"
              name="targetRole"
              placeholder="Ex.: Product Manager"
              required
              aria-invalid={Boolean(state.fieldErrors?.targetRole)}
            />
            {state.fieldErrors?.targetRole ? (
              <p className="text-xs text-destructive">{state.fieldErrors.targetRole}</p>
            ) : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="desiredSeniority">Senioridade desejada</Label>
            <select
              id="desiredSeniority"
              name="desiredSeniority"
              required
              defaultValue=""
              aria-invalid={Boolean(state.fieldErrors?.desiredSeniority)}
              className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 aria-[invalid=true]:border-destructive aria-[invalid=true]:focus-visible:ring-destructive/40"
            >
              <option value="" disabled>
                Selecione
              </option>
              <option value="intern">Estágio</option>
              <option value="junior">Júnior</option>
              <option value="mid">Pleno</option>
              <option value="senior">Sênior</option>
            </select>
            {state.fieldErrors?.desiredSeniority ? (
              <p className="text-xs text-destructive">{state.fieldErrors.desiredSeniority}</p>
            ) : null}
          </div>
          <Button type="submit" disabled={pending}>
            {pending ? "Salvando..." : "Confirmar contexto-alvo"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
