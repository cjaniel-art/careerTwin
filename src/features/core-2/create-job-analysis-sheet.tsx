"use client";

import { useActionState, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Plus, ArrowLeft, CheckCircle2, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SubmitButton } from "@/components/submit-button";
import { Sheet, SheetCircleClose, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { createAndRunJobAnalysisAction, type CreateJobAnalysisState } from "@/features/core-2/actions";

const INITIAL_STATE: CreateJobAnalysisState = {};

/** "Criar análise" flow — Figma nodes 156:6207 (formulário) e 164:10787 (sucesso). */
export function CreateJobAnalysisSheet({ hasCredits }: { hasCredits: boolean }) {
  const [open, setOpen] = useState(false);
  const [sheetKey, setSheetKey] = useState(0);

  return (
    <Sheet
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (next) setSheetKey((k) => k + 1);
      }}
    >
      <SheetTrigger asChild>
        <Button className="h-8 gap-1.5 rounded-[10px] px-[10px] text-sm">
          <Plus className="size-4" />
          Nova análise
        </Button>
      </SheetTrigger>
      <SheetContent showCloseButton={false} className="w-full gap-0 border-none bg-transparent p-0 sm:w-[45%] sm:max-w-none">
        <SheetInner key={sheetKey} hasCredits={hasCredits} onClose={() => setOpen(false)} />
      </SheetContent>
    </Sheet>
  );
}

function SheetInner({ hasCredits, onClose }: { hasCredits: boolean; onClose: () => void }) {
  const [state, formAction] = useActionState(createAndRunJobAnalysisAction, INITIAL_STATE);
  const router = useRouter();

  return (
    <div className="flex h-full items-start">
      <SheetCircleClose />

      {state.analysisId ? (
        <SuccessView
          onViewResult={() => {
            onClose();
            router.push(`/app/aderencia/${state.analysisId}`);
          }}
        />
      ) : !hasCredits ? (
        <NoCreditsView onCancel={onClose} />
      ) : (
        <FormView formAction={formAction} error={state.error} onCancel={onClose} />
      )}
    </div>
  );
}

function FormView({
  formAction,
  error,
  onCancel,
}: {
  formAction: (formData: FormData) => void;
  error?: string;
  onCancel: () => void;
}) {
  return (
    <form action={formAction} className="flex h-full flex-1 flex-col bg-card px-8">
      <div className="border-b border-border py-4">
        <p className="text-xs text-muted-foreground">Análise de</p>
        <p className="text-2xl font-semibold text-foreground">Aderência à Vaga</p>
      </div>

      <div className="flex flex-1 flex-col gap-7 overflow-y-auto py-6">
        {error ? (
          <p className="rounded-md bg-destructive/10 p-3 text-sm text-destructive" role="alert">
            {error}
          </p>
        ) : null}

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-3">
            <Label htmlFor="title">Cargo-alvo</Label>
            <Input id="title" name="title" />
          </div>
          <div className="space-y-3">
            <Label htmlFor="company">Empresa (opcional)</Label>
            <Input id="company" name="company" />
          </div>
        </div>

        <div className="space-y-3">
          <Label htmlFor="pastedText">Descrição da vaga</Label>
          <textarea
            id="pastedText"
            name="pastedText"
            rows={8}
            maxLength={100_000}
            required
            className="flex h-[180px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            placeholder="Cole aqui a descrição completa da vaga"
          />
        </div>
      </div>

      <div className="flex items-center gap-5 border-t border-border py-4">
        <Button type="button" variant="secondary" size="sm" className="size-9 rounded-md p-0" onClick={onCancel}>
          <ArrowLeft className="size-4" />
          <span className="sr-only">Cancelar</span>
        </Button>
        <SubmitButton variant="success" className="h-9 flex-1 rounded-lg">
          Cria análise
        </SubmitButton>
      </div>
    </form>
  );
}

/** Mostrado assim que o Sheet abre, em vez do formulário, quando não há créditos — evita o usuário preencher tudo só para ver o erro no final. */
function NoCreditsView({ onCancel }: { onCancel: () => void }) {
  return (
    <div className="flex h-full flex-1 flex-col bg-card px-8">
      <div className="border-b border-border py-4">
        <p className="text-xs text-muted-foreground">Análise de</p>
        <p className="text-2xl font-semibold text-foreground">Aderência à Vaga</p>
      </div>
      <div className="flex flex-1 flex-col items-center justify-center gap-[30px] text-center">
        <CreditCard className="size-[120px] text-muted-foreground" strokeWidth={1.5} aria-hidden />
        <div className="flex max-w-80 flex-col gap-1.5">
          <p className="text-xl font-semibold text-foreground">Você não possui créditos disponíveis</p>
          <p className="text-sm text-muted-foreground">
            Contrate um plano para gerar um novo Diagnóstico de Aderência à Vaga.
          </p>
        </div>
        <Button asChild className="w-[206px] rounded-md" onClick={onCancel}>
          <Link href="/app/assinatura">Ver planos</Link>
        </Button>
      </div>
    </div>
  );
}

function SuccessView({ onViewResult }: { onViewResult: () => void }) {
  return (
    <div className="flex h-full flex-1 flex-col items-center justify-center gap-[30px] bg-card px-8">
      <div className="flex flex-col items-center gap-[30px]">
        <CheckCircle2 className="size-[172px] text-primary" strokeWidth={1.5} />
        <p className="text-center text-2xl font-semibold text-foreground">Análise efetuada com sucesso</p>
      </div>
      <Button onClick={onViewResult} className="w-[186px] rounded-md">
        Ver análise
      </Button>
    </div>
  );
}
