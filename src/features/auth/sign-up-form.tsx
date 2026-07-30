"use client";

import { useActionState } from "react";
import Link from "next/link";
import { signUpAction, type AuthActionState } from "./actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

const initialState: AuthActionState = {};

export function SignUpForm() {
  const [state, formAction, pending] = useActionState(signUpAction, initialState);

  return (
    <form action={formAction} className="space-y-4" noValidate>
      {state.error ? (
        <p className="rounded-md bg-destructive/10 p-3 text-sm text-destructive" role="alert">
          {state.error}
        </p>
      ) : null}

      <div className="space-y-2">
        <Label htmlFor="email">E-mail</Label>
        <Input id="email" name="email" type="email" autoComplete="email" required />
        {state.fieldErrors?.email ? (
          <p className="text-xs text-destructive">{state.fieldErrors.email}</p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Senha</Label>
        <Input id="password" name="password" type="password" autoComplete="new-password" required minLength={8} />
        {state.fieldErrors?.password ? (
          <p className="text-xs text-destructive">{state.fieldErrors.password}</p>
        ) : null}
      </div>

      <div className="flex items-start gap-2">
        <input id="acceptedTerms" name="acceptedTerms" type="checkbox" className="mt-1" required />
        <Label htmlFor="acceptedTerms" className="font-normal">
          Li e aceito os{" "}
          <Link href="/termos" className="text-primary hover:underline" target="_blank">
            Termos de Uso
          </Link>
          .
        </Label>
      </div>
      {state.fieldErrors?.acceptedTerms ? (
        <p className="text-xs text-destructive">{state.fieldErrors.acceptedTerms}</p>
      ) : null}

      <div className="flex items-start gap-2">
        <input id="acceptedPrivacy" name="acceptedPrivacy" type="checkbox" className="mt-1" required />
        <Label htmlFor="acceptedPrivacy" className="font-normal">
          Li e aceito a{" "}
          <Link href="/privacidade" className="text-primary hover:underline" target="_blank">
            Política de Privacidade
          </Link>
          .
        </Label>
      </div>
      {state.fieldErrors?.acceptedPrivacy ? (
        <p className="text-xs text-destructive">{state.fieldErrors.acceptedPrivacy}</p>
      ) : null}

      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "Criando conta..." : "Criar minha conta"}
      </Button>
    </form>
  );
}
