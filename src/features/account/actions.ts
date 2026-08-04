"use server";

import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/infrastructure/auth/supabase-server-client";
import { trackEvent } from "@/infrastructure/analytics";
import { ANALYTICS_EVENTS } from "@/infrastructure/analytics/events";

async function requireUser() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?redirect=/app/conta");
  return { supabase, user };
}

/**
 * Immediate, full account deletion — the user types a confirmation word in
 * the UI (DeleteAccountDialog) before this ever runs. Delegates the actual
 * removal to ct_delete_own_account (SECURITY DEFINER), which deletes every
 * row scoped to this user across all tables and finally auth.users itself —
 * a later signup with the same e-mail starts onboarding from zero. See
 * supabase/migrations/20260101000023_delete_own_account.sql for exactly what
 * is removed and why each step is ordered the way it is.
 */
export async function deleteAccountAction(): Promise<void> {
  const { supabase, user } = await requireUser();
  const userId = user.id;

  const { error } = await supabase.rpc("ct_delete_own_account");
  if (error) {
    console.error("deleteAccountAction: ct_delete_own_account failed:", error.message);
    redirect("/app/conta?erro=exclusao");
  }

  trackEvent(ANALYTICS_EVENTS.accountDeleted, { userId });
  await supabase.auth.signOut();
  redirect("/?conta-excluida=1");
}
