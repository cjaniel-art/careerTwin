import Link from "next/link";
import Image from "next/image";
import { SignUpForm } from "@/features/auth/sign-up-form";

export const metadata = { title: "Criar conta — CareerTwin" };

export default function SignUpPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-white px-6 py-12">
      <div className="w-full max-w-[895px]">
        <div className="flex flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm md:flex-row">
          <div className="flex w-full max-w-[383px] flex-col items-center gap-6 p-8">
            <div className="flex w-full flex-col items-center gap-2 px-6">
              <Image src="/auth/logo-glyph.svg" alt="" width={49} height={48} className="mb-4 h-12 w-auto" />
              <h1 className="text-center text-2xl font-semibold text-card-foreground">Crie sua conta</h1>
              <p className="text-center text-sm text-muted-foreground">
                Digite seu e-mail abaixo para criar sua conta
              </p>
            </div>
            <SignUpForm />
          </div>
          <div className="relative hidden w-[512px] shrink-0 self-stretch md:block">
            <Image src="/auth/cadastro-photo.png" alt="" fill priority sizes="512px" className="object-cover" />
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          Ao clicar em Continuar, você concorda com nossos{" "}
          <Link href="/termos" className="underline hover:no-underline">
            Termos de Serviço
          </Link>{" "}
          e{" "}
          <Link href="/privacidade" className="underline hover:no-underline">
            Política de Privacidade.
          </Link>
        </p>
      </div>
    </main>
  );
}
