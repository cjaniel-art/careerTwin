import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { TermsContent } from "@/components/legal-content";

export const metadata = { title: "Termos de Uso — CareerTwin" };

export default function TermsPage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-6 py-16">
        <h1 className="text-3xl font-bold text-foreground">Termos de Uso</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Conteúdo provisório — pendente de revisão jurídica antes da publicação (ver
          docs/implementation/open-decisions.md #11).
        </p>

        <div className="mt-8">
          <TermsContent />
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
