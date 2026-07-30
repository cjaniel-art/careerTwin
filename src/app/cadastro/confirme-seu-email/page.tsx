import { AuthShell } from "@/components/auth-shell";

export const metadata = { title: "Confirme seu e-mail — CareerTwin" };

export default function ConfirmEmailPage() {
  return (
    <AuthShell title="Confirme seu e-mail">
      <p className="text-sm text-muted-foreground">
        Enviamos um link de confirmação para o e-mail informado. Acesse sua caixa de entrada e confirme sua
        conta para continuar.
      </p>
    </AuthShell>
  );
}
