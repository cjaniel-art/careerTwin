"use client";

import { useActionState } from "react";
import { uploadDocumentAction, type OnboardingActionState } from "../actions";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const initialState: OnboardingActionState = {};

export function DocumentUploadStep({
  documentType,
  title,
  description,
}: {
  documentType: "resume" | "linkedin";
  title: string;
  description: string;
}) {
  const [state, formAction, pending] = useActionState(uploadDocumentAction, initialState);

  return (
    <Card>
      <CardContent className="space-y-4 pt-6">
        <div>
          <h2 className="text-lg font-semibold text-foreground">{title}</h2>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>

        {state.error ? (
          <p className="rounded-md bg-destructive/10 p-3 text-sm text-destructive" role="alert">
            {state.error}
          </p>
        ) : null}

        <form action={formAction} className="space-y-4" noValidate>
          <input type="hidden" name="documentType" value={documentType} />

          <div className="space-y-2">
            <Label htmlFor="file">Arquivo (PDF ou DOCX, até 10 MB)</Label>
            <input
              id="file"
              name="file"
              type="file"
              accept=".pdf,.docx"
              className="block w-full text-sm text-foreground file:mr-4 file:rounded-md file:border-0 file:bg-secondary file:px-4 file:py-2 file:text-sm file:font-medium file:text-foreground hover:file:bg-secondary/80"
            />
          </div>

          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <div className="h-px flex-1 bg-border" />
            ou
            <div className="h-px flex-1 bg-border" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="pastedText">Colar conteúdo em texto</Label>
            <textarea
              id="pastedText"
              name="pastedText"
              rows={6}
              maxLength={100_000}
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              placeholder={documentType === "resume" ? "Cole o conteúdo do seu currículo aqui." : "Cole o conteúdo do seu perfil do LinkedIn aqui."}
            />
          </div>

          <Button type="submit" disabled={pending}>
            {pending ? "Enviando..." : "Continuar"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
