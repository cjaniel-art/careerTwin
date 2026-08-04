"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { SubmitButton } from "@/components/submit-button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { deleteAccountAction } from "./actions";

const CONFIRMATION_WORD = "DELETAR";

export function DeleteAccountDialog() {
  const [open, setOpen] = useState(false);
  const [confirmation, setConfirmation] = useState("");
  const confirmed = confirmation === CONFIRMATION_WORD;

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) setConfirmation("");
      }}
    >
      <DialogTrigger asChild>
        <Button variant="destructive" size="sm">
          Excluir conta
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Excluir conta permanentemente</DialogTitle>
          <DialogDescription>
            Isso apaga imediatamente todos os seus dados: perfil (Thin Twin), contextos-alvo, documentos,
            oportunidades, análises, recomendações, ações e feedbacks. Não é possível desfazer, e um novo cadastro
            com o mesmo e-mail passará por todo o processo de onboarding novamente.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          <label htmlFor="delete-confirmation" className="text-sm font-medium text-foreground">
            Para confirmar, digite <span className="font-semibold">{CONFIRMATION_WORD}</span>
          </label>
          <Input
            id="delete-confirmation"
            value={confirmation}
            onChange={(e) => setConfirmation(e.target.value)}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            placeholder={CONFIRMATION_WORD}
          />
        </div>

        <DialogFooter>
          <Button variant="secondary" size="sm" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <form action={deleteAccountAction}>
            <SubmitButton variant="destructive" size="sm" disabled={!confirmed}>
              Excluir conta permanentemente
            </SubmitButton>
          </form>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
