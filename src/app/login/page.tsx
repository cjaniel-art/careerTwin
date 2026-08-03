import Link from "next/link";
import Image from "next/image";
import { Suspense } from "react";
import { LoginForm } from "@/features/auth/login-form";

export const metadata = { title: "Entrar — CareerTwin" };

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-white px-6 py-12">
      <div className="w-full max-w-[855px]">
        <div className="flex flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm md:flex-row">
          <div className="flex w-full max-w-[383px] flex-col items-center gap-6 p-8 md:h-[592px] md:w-[383px]">
            <div className="flex w-full flex-col items-center gap-2 px-6">
              <Image
                src="/auth/logo-glyph.svg"
                alt=""
                width={49}
                height={48}
                className="mb-4 h-12 w-auto"
              />
              <h1 className="text-center text-2xl font-semibold text-card-foreground">Bem-vindo de volta</h1>
              <p className="text-center text-sm text-muted-foreground">Entre na sua conta da CareerTwin</p>
            </div>
            <Suspense>
              <LoginForm />
            </Suspense>
          </div>
          <div className="hidden h-[590px] w-[472px] shrink-0 md:block">
            <Image
              src="/auth/login-photo.png"
              alt=""
              width={472}
              height={590}
              priority
              className="h-full w-full object-cover"
            />
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
