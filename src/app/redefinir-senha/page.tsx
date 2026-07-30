import { AuthShell } from "@/components/auth-shell";
import { UpdatePasswordForm } from "@/features/auth/update-password-form";

export const metadata = { title: "Redefinir senha — CareerTwin" };

export default function UpdatePasswordPage() {
  return (
    <AuthShell title="Redefinir senha" description="Escolha uma nova senha para sua conta.">
      <UpdatePasswordForm />
    </AuthShell>
  );
}
