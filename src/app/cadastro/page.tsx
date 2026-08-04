import Image from "next/image";
import { SignUpForm } from "@/features/auth/sign-up-form";
import { LegalLinks } from "@/features/auth/legal-links";

export const metadata = { title: "Criar conta — CareerTwin" };

export default function SignUpPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-white px-6 py-12">
      <div className="w-full max-w-[956px]">
        <div className="flex flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm md:h-[716px] md:flex-row">
          <div className="mx-auto flex w-full max-w-[484px] flex-col items-center gap-6 p-8 md:w-[484px]">
            <div className="flex w-full flex-col items-center gap-2 px-6">
              <Image src="/auth/logo-glyph.svg" alt="" width={49} height={48} className="mb-4 h-12 w-auto" />
              <h1 className="text-center text-2xl font-semibold text-card-foreground">Crie sua conta</h1>
              <p className="text-center text-sm text-muted-foreground">
                Digite seu e-mail abaixo para criar sua conta
              </p>
            </div>
            <SignUpForm />
          </div>
          <div className="relative hidden w-[472px] shrink-0 md:block">
            <Image src="/auth/cadastro-photo.png" alt="" fill priority sizes="472px" className="object-cover" />
          </div>
        </div>

        <LegalLinks />
      </div>
    </main>
  );
}
