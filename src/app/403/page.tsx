import Link from "next/link";
import { Wordmark } from "@/components/wordmark";
import { Button } from "@/components/ui/button";

export const metadata = { title: "Acesso não autorizado — CareerTwin" };

export default function ForbiddenPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 px-6 text-center">
      <Wordmark />
      <div className="max-w-md space-y-2">
        <h1 className="text-2xl font-semibold text-foreground">Acesso não autorizado</h1>
        <p className="text-sm text-muted-foreground">
          Você não tem permissão para acessar este recurso. Se você acredita que isso é um engano, entre
          novamente na sua conta.
        </p>
      </div>
      <Button asChild>
        <Link href="/app/dashboard">Voltar ao início</Link>
      </Button>
    </main>
  );
}
