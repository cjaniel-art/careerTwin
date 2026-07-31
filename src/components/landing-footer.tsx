import Link from "next/link";
import { Wordmark } from "@/components/wordmark";

export function LandingFooter() {
  return (
    <footer className="border-t border-border bg-white">
      <div className="mx-auto flex max-w-content flex-col items-center justify-between gap-4 px-6 py-8 md:flex-row md:px-14">
        <Wordmark />
        <nav className="flex flex-wrap items-center justify-center gap-2 text-sm font-medium text-foreground">
          <Link href="/termos" className="rounded-md px-4 py-2 hover:text-primary">
            Termos de Uso
          </Link>
          <Link href="/privacidade" className="rounded-md px-4 py-2 hover:text-primary">
            Política de Privacidade
          </Link>
          <Link href="/login" className="rounded-md px-4 py-2 hover:text-primary">
            Entrar
          </Link>
        </nav>
      </div>
    </footer>
  );
}
