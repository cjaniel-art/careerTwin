import Link from "next/link";
import { Wordmark } from "@/components/wordmark";
import { Button } from "@/components/ui/button";

export function SiteHeader() {
  return (
    <header className="border-b border-border bg-background">
      <div className="mx-auto flex h-16 max-w-content items-center justify-between px-6">
        <Link href="/" className="flex items-center">
          <Wordmark />
        </Link>
        <nav className="hidden items-center gap-6 text-sm font-medium text-muted-foreground md:flex">
          <a href="#como-funciona" className="hover:text-foreground">
            Como funciona
          </a>
          <a href="#core-1" className="hover:text-foreground">
            Análise de Perfil
          </a>
          <a href="#core-2" className="hover:text-foreground">
            Diagnóstico de Aderência
          </a>
        </nav>
        <div className="flex items-center gap-3">
          <Button asChild variant="tertiary" size="sm">
            <Link href="/login">Entrar</Link>
          </Button>
          <Button asChild size="sm">
            <Link href="/cadastro">Criar conta</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
