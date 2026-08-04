"use client";

import { useActionState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { loginAction, signInWithGoogleAction, type AuthActionState } from "./actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { SubmitButton } from "@/components/submit-button";

const initialState: AuthActionState = {};

export function LoginForm() {
  const [state, formAction, pending] = useActionState(loginAction, initialState);
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") ?? "";
  const justReset = searchParams.get("redefinicao") === "concluida";
  const googleOAuthFailed = searchParams.get("erro") === "google-oauth";

  return (
    <div className="w-full space-y-4">
      <form action={formAction} className="space-y-4" noValidate>
        <input type="hidden" name="redirect" value={redirectTo} />

        {justReset ? (
          <p className="rounded-md bg-secondary p-3 text-sm text-foreground" role="status">
            Sua senha foi redefinida. Entre com a nova senha.
          </p>
        ) : null}

        {googleOAuthFailed ? (
          <p className="rounded-md bg-destructive/10 p-3 text-sm text-destructive" role="alert">
            Não foi possível entrar com o Google. Tente novamente ou use seu e-mail e senha.
          </p>
        ) : null}

        {state.error ? (
          <p className="rounded-md bg-destructive/10 p-3 text-sm text-destructive" role="alert">
            {state.error}
          </p>
        ) : null}

        <div className="space-y-2">
          <Label htmlFor="email">E-mail</Label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            aria-invalid={Boolean(state.fieldErrors?.email)}
          />
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
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            aria-invalid={Boolean(state.fieldErrors?.password)}
          />
          {state.fieldErrors?.password ? (
            <p className="text-xs text-destructive">{state.fieldErrors.password}</p>
          ) : null}
        </div>

        <Button type="submit" className="w-full" disabled={pending}>
          {pending ? "Entrando..." : "Entrar"}
        </Button>
      </form>

      <div className="flex items-center gap-2">
        <div className="h-px flex-1 bg-border" />
        <span className="text-xs text-muted-foreground">OU CONTINUE COM</span>
        <div className="h-px flex-1 bg-border" />
      </div>

      <form action={signInWithGoogleAction}>
        <input type="hidden" name="redirect" value={redirectTo} />
        <SubmitButton variant="secondary" className="w-full" aria-label="Continuar com Google" hideChildrenWhilePending>
          <Image src="/auth/google-icon.svg" alt="" width={16} height={16} />
        </SubmitButton>
      </form>

      <p className="text-center text-sm text-foreground">
        Não tem uma conta?{" "}
        <Link href="/cadastro" className="underline hover:no-underline">
          Cadastre-se
        </Link>
      </p>
    </div>
  );
}
