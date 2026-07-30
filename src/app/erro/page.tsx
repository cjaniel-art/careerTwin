import Link from "next/link";
import { Wordmark } from "@/components/wordmark";
import { Button } from "@/components/ui/button";

export const metadata = { title: "Erro temporário — CareerTwin" };

export default function ErrorPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 px-6 text-center">
      <Wordmark />
      <div className="max-w-md space-y-2">
        <h1 className="text-2xl font-semibold text-foreground">Algo deu errado</h1>
        <p className="text-sm text-muted-foreground">
          Ocorreu um erro temporário. Tente novamente em instantes — nenhuma informação sua foi perdida.
        </p>
      </div>
      <Button asChild>
        <Link href="/">Voltar para a página inicial</Link>
      </Button>
    </main>
  );
}
