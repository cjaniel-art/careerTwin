import Link from "next/link";
import { Wordmark } from "@/components/wordmark";
import { TermsSheetTrigger, PrivacySheetTrigger } from "@/components/legal-sheet-triggers";

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-secondary">
      <div className="mx-auto flex max-w-content flex-col gap-4 px-6 py-10 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col gap-2">
          <Wordmark />
          <p className="max-w-md">
            Mentor de carreira com inteligência artificial para profissionais brasileiros de tecnologia,
            produto e design.
          </p>
        </div>
        <div className="flex gap-6">
          <TermsSheetTrigger className="hover:text-foreground" />
          <PrivacySheetTrigger className="hover:text-foreground" />
          <Link href="/login" className="hover:text-foreground">
            Entrar
          </Link>
        </div>
      </div>
    </footer>
  );
}
