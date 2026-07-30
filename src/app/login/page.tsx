import Link from "next/link";
import { Suspense } from "react";
import { AuthShell } from "@/components/auth-shell";
import { LoginForm } from "@/features/auth/login-form";

export const metadata = { title: "Entrar — CareerTwin" };

export default function LoginPage() {
  return (
    <AuthShell
      title="Entrar"
      footer={
        <>
          Não tem conta?{" "}
          <Link href="/cadastro" className="font-medium text-primary hover:underline">
            Criar conta
          </Link>
        </>
      }
    >
      <Suspense>
        <LoginForm />
      </Suspense>
    </AuthShell>
  );
}
