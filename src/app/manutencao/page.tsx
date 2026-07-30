import { Wordmark } from "@/components/wordmark";

export const metadata = { title: "Em manutenção — CareerTwin" };

export default function MaintenancePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 px-6 text-center">
      <Wordmark />
      <div className="max-w-md space-y-2">
        <h1 className="text-2xl font-semibold text-foreground">Estamos em manutenção</h1>
        <p className="text-sm text-muted-foreground">
          O CareerTwin está passando por uma manutenção programada. Voltamos em breve.
        </p>
      </div>
    </main>
  );
}
