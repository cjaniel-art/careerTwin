"use client";

import { useActionState } from "react";
import { submitOpportunityAction, type Core2ActionState } from "./actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

const initialState: Core2ActionState = {};

export function SubmitOpportunityForm() {
  const [state, formAction, pending] = useActionState(submitOpportunityAction, initialState);

  return (
    <form action={formAction} className="space-y-4" noValidate>
      {state.error ? (
        <p className="rounded-md bg-destructive/10 p-3 text-sm text-destructive" role="alert">
          {state.error}
        </p>
      ) : null}

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="title">Título da vaga (opcional)</Label>
          <Input id="title" name="title" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="company">Empresa (opcional)</Label>
          <Input id="company" name="company" />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="referenceUrl">URL de referência (opcional)</Label>
        <Input id="referenceUrl" name="referenceUrl" placeholder="https://" />
        <p className="text-xs text-muted-foreground">
          A URL será armazenada apenas como referência. O CareerTwin não acessará o conteúdo automaticamente.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="pastedText">Descrição da vaga</Label>
        <textarea
          id="pastedText"
          name="pastedText"
          rows={10}
          maxLength={100_000}
          required
          className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          placeholder="Cole a descrição completa da vaga aqui."
        />
      </div>

      <Button type="submit" disabled={pending}>
        {pending ? "Estruturando vaga..." : "Continuar"}
      </Button>
    </form>
  );
}
