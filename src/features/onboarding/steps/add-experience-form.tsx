"use client";

import { useActionState } from "react";
import { addExperienceAction, type OnboardingActionState } from "../actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const initialState: OnboardingActionState = {};

export function AddExperienceForm() {
  const [state, formAction, pending] = useActionState(addExperienceAction, initialState);

  return (
    <Card>
      <CardContent className="space-y-3 pt-6">
        <h3 className="text-sm font-semibold text-foreground">Adicionar experiência</h3>
        {state.error ? <p className="text-xs text-destructive">{state.error}</p> : null}
        <form action={formAction} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="roleTitle">Cargo</Label>
              <Input id="roleTitle" name="roleTitle" required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="companyName">Empresa ou contexto</Label>
              <Input id="companyName" name="companyName" required />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="description">Descrição (opcional)</Label>
            <Input id="description" name="description" />
          </div>
          <Button type="submit" variant="secondary" size="sm" disabled={pending}>
            {pending ? "Adicionando..." : "Adicionar"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
