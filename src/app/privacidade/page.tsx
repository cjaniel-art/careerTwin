import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { PrivacyContent } from "@/components/legal-content";

export const metadata = { title: "Política de Privacidade — CareerTwin" };

export default function PrivacyPage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-6 py-16">
        <h1 className="text-3xl font-bold text-foreground">Política de Privacidade</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Conteúdo provisório — pendente de revisão jurídica antes da publicação (ver
          docs/implementation/open-decisions.md #11). Reflete as regras vigentes do documento interno
          &ldquo;Segurança, Privacidade e Retenção&rdquo;.
        </p>

        <div className="mt-8">
          <PrivacyContent />
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
