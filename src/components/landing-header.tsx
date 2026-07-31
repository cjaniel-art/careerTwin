import Link from "next/link";
import { Plus } from "lucide-react";
import { Wordmark } from "@/components/wordmark";
import { Button } from "@/components/ui/button";

const NAV_LINKS = [
  { href: "#como-funciona", label: "Como funciona" },
  { href: "#solucao", label: "Nossa solução" },
  { href: "#valores", label: "Valores" },
];

export function LandingHeader() {
  return (
    <header className="flex items-center gap-8 bg-foreground px-6 py-6 text-white md:gap-10 md:px-14">
      <Link href="/" className="shrink-0">
        <Wordmark />
      </Link>
      <nav className="hidden flex-1 items-center justify-center gap-4 text-sm font-medium md:flex">
        {NAV_LINKS.map((link) => (
          <a key={link.href} href={link.href} className="rounded-md px-4 py-2 hover:text-primary">
            {link.label}
          </a>
        ))}
      </nav>
      <div className="ml-auto flex items-center gap-4">
        <Button asChild variant="tertiary" size="sm" className="text-white hover:text-primary">
          <Link href="/login">Entrar</Link>
        </Button>
        <Button asChild size="sm">
          <Link href="/cadastro">
            <Plus className="h-4 w-4" aria-hidden />
            Criar conta
          </Link>
        </Button>
      </div>
    </header>
  );
}
