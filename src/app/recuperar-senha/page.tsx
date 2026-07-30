import Link from "next/link";
import { AuthShell } from "@/components/auth-shell";
import { RequestPasswordResetForm } from "@/features/auth/request-password-reset-form";

export const metadata = { title: "Recuperar senha — CareerTwin" };

export default function RequestPasswordResetPage() {
  return (
    <AuthShell
      title="Recuperar senha"
      footer={
        <Link href="/login" className="font-medium text-primary hover:underline">
          Voltar para login
        </Link>
      }
    >
      <RequestPasswordResetForm />
    </AuthShell>
  );
}
