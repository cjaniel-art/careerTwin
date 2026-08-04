"use client";

import { TermsSheetTrigger, PrivacySheetTrigger } from "@/components/legal-sheet-triggers";

const linkClass = "underline hover:no-underline";

/** Abre Termos de Uso / Política de Privacidade em um Sheet em vez de navegar para /termos e /privacidade. */
export function LegalLinks() {
  return (
    <p className="mt-6 text-center text-xs text-muted-foreground">
      Ao clicar em Continuar, você concorda com nossos{" "}
      <TermsSheetTrigger className={linkClass} label="Termos de Serviço" />{" "}
      e <PrivacySheetTrigger className={linkClass} label="Política de Privacidade." />
    </p>
  );
}
