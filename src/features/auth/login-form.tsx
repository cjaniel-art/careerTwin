"use client";

import { useActionState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { loginAction, type AuthActionState } from "./actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

const initialState: AuthActionState = {};

export function LoginForm() {
  const [state, formAction, pending] = useActionState(loginAction, initialState);
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") ?? "";
  const justReset = searchParams.get("redefinicao") === "concluida";

  return (
    <form action={formAction} className="space-y-4" noValidate>
      <input type="hidden" name="redirect" value={redirectTo} />

      {justReset ? (
        <p className="rounded-md bg-secondary p-3 text-sm text-foreground" role="status">
          Sua senha foi redefinida. Entre com a nova senha.
        </p>
      ) : null}

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
        <div className="flex items-center justify-between">
          <Label htmlFor="password">Senha</Label>
          <Link href="/recuperar-senha" className="text-xs font-medium text-primary hover:underline">
            Esqueceu a senha?
          </Link>
        </div>
        <Input id="password" name="password" type="password" autoComplete="current-password" required />
        {state.fieldErrors?.password ? (
          <p className="text-xs text-destructive">{state.fieldErrors.password}</p>
        ) : null}
      </div>

      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "Entrando..." : "Entrar"}
      </Button>
    </form>
  );
}
