import Link from "next/link";
import { AuthShell } from "@/components/auth-shell";
import { SignUpForm } from "@/features/auth/sign-up-form";

export const metadata = { title: "Criar conta — CareerTwin" };

export default function SignUpPage() {
  return (
    <AuthShell
      title="Criar conta"
      description="Leva menos de um minuto. Você poderá enviar seu currículo e LinkedIn na próxima etapa."
      footer={
        <>
          Já tem conta?{" "}
          <Link href="/login" className="font-medium text-primary hover:underline">
            Entrar
          </Link>
        </>
      }
    >
      <SignUpForm />
    </AuthShell>
  );
}
