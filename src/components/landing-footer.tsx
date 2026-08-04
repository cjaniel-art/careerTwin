import Link from "next/link";
import { Wordmark } from "@/components/wordmark";
import { TermsSheetTrigger, PrivacySheetTrigger } from "@/components/legal-sheet-triggers";

export function LandingFooter() {
  return (
    <footer className="border-t border-border bg-white">
      <div className="mx-auto flex max-w-content flex-col items-center justify-between gap-4 px-6 pt-8 pb-[120px] md:flex-row md:px-14 md:pb-8">
        <Wordmark className="h-[56px] w-[232px]" />
        <nav className="flex flex-wrap items-center justify-center gap-2 text-sm font-medium text-foreground">
          <TermsSheetTrigger className="rounded-md px-4 py-2 hover:text-primary" />
          <PrivacySheetTrigger className="rounded-md px-4 py-2 hover:text-primary" />
          <Link href="/login" className="hidden rounded-md px-4 py-2 hover:text-primary md:inline-block">
            Entrar
          </Link>
        </nav>
      </div>
    </footer>
  );
}
