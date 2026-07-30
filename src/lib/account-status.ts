import type { createSupabaseServerClient } from "@/infrastructure/auth/supabase-server-client";

/**
 * Segurança §7, passo 6 — "novas análises e uploads bloqueados" once a
 * deletion request has been registered (user_accounts.status =
 * 'deletion_pending'). Checked at the two entry points that create new work
 * (document upload, starting a Core 1/Core 2 analysis) — editing already
 * in-flight drafts is not blocked, only new work.
 */
export async function isAccountDeletionPending(
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
  userId: string,
): Promise<boolean> {
  const { data } = await supabase.from("user_accounts").select("status").eq("user_id", userId).maybeSingle();
  return data?.status === "deletion_pending";
}
