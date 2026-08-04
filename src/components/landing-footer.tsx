import Link from "next/link";
import { Wordmark } from "@/components/wordmark";

export function LandingFooter() {
  return (
    <footer className="border-t border-border bg-white">
      <div className="mx-auto flex max-w-content flex-col items-center justify-between gap-4 px-6 pt-8 pb-[120px] md:flex-row md:px-14 md:pb-8">
        <Wordmark className="h-[56px] w-[232px]" />
        <nav className="flex flex-wrap items-center justify-center gap-2 text-sm font-medium text-foreground">
          <Link href="/termos" className="rounded-md px-4 py-2 hover:text-primary">
            Termos de Uso
          </Link>
          <Link href="/privacidade" className="rounded-md px-4 py-2 hover:text-primary">
            Política de Privacidade
          </Link>
          <Link href="/login" className="hidden rounded-md px-4 py-2 hover:text-primary md:inline-block">
            Entrar
          </Link>
        </nav>
      </div>
    </footer>
  );
}
