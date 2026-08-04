"use client";

import { useActionState } from "react";
import Link from "next/link";
import Image from "next/image";
import { signUpAction, signInWithGoogleAction, type AuthActionState } from "./actions";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { SubmitButton } from "@/components/submit-button";

const initialState: AuthActionState = {};

export function SignUpForm() {
  const [state, formAction, pending] = useActionState(signUpAction, initialState);

  return (
    <div className="w-full space-y-4">
      <form action={formAction} className="space-y-4" noValidate>
        {state.error ? (
          <p className="rounded-md bg-destructive/10 p-3 text-sm text-destructive" role="alert">
            {state.error}
          </p>
        ) : null}

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="m@example.com"
            required
            aria-invalid={Boolean(state.fieldErrors?.email)}
          />
          <p className="text-sm text-muted-foreground">Usaremos este e-mail para entrar em contato com você.</p>
          {state.fieldErrors?.email ? (
            <p className="text-xs text-destructive">{state.fieldErrors.email}</p>
          ) : null}
        </div>

        <div className="space-y-3">
          <div className="flex gap-4">
            <div className="flex-1 space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                minLength={8}
                aria-invalid={Boolean(state.fieldErrors?.password)}
              />
            </div>
            <div className="flex-1 space-y-2">
              <Label htmlFor="confirmPassword">Confirmar senha</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                minLength={8}
                aria-invalid={Boolean(state.fieldErrors?.confirmPassword)}
              />
            </div>
          </div>
          <p className="text-sm text-muted-foreground">A senha deve ter pelo menos 8 caracteres.</p>
          {state.fieldErrors?.password ? (
            <p className="text-xs text-destructive">{state.fieldErrors.password}</p>
          ) : null}
          {state.fieldErrors?.confirmPassword ? (
            <p className="text-xs text-destructive">{state.fieldErrors.confirmPassword}</p>
          ) : null}
        </div>

        <Button type="submit" className="w-full" disabled={pending}>
          {pending ? "Criando conta..." : "Criar conta"}
        </Button>
      </form>

      <div className="flex items-center gap-2">
        <div className="h-px flex-1 bg-border" />
        <span className="text-xs text-muted-foreground">OU CONTINUE COM</span>
        <div className="h-px flex-1 bg-border" />
      </div>

      <form action={signInWithGoogleAction}>
        <input type="hidden" name="redirect" value="" />
        <SubmitButton variant="secondary" className="w-full" aria-label="Continuar com Google" hideChildrenWhilePending>
          <Image src="/auth/google-icon.svg" alt="" width={16} height={16} />
        </SubmitButton>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        Já tem uma conta?{" "}
        <Link href="/login" className="underline hover:no-underline">
          Entrar
        </Link>
      </p>
    </div>
  );
}
