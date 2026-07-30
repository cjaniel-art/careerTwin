"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/infrastructure/auth/supabase-server-client";

async function requireUser() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?redirect=/app/conta");
  return { supabase, user };
}

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Segurança §7 (21 passos) — this implements steps 1-6 only: the user
 * explicitly confirms, the request is registered, and the account moves to
 * `deletion_pending` (blocking new analyses/uploads — see
 * src/lib/account-status.ts). Steps 7-21 (purging every table, removing the
 * auth account, expiring backups) require a worker process that does not
 * exist in this environment — same limitation as open-decisions.md #20.
 * Registered as open-decisions.md #22, not silently skipped.
 */
export async function requestAccountDeletionAction(): Promise<void> {
  const { supabase, user } = await requireUser();

  const now = Date.now();
  // deletion_requests_one_active_per_user (partial unique index) is the
  // source of truth for "only one active request" — a conflict here just
  // means one already exists, which is not an error from the user's
  // perspective (the account is already deletion_pending either way).
  const { error } = await supabase.from("deletion_requests").insert({
    user_id: user.id,
    status: "requested",
    active_systems_deadline: new Date(now + 15 * DAY_MS).toISOString(),
    backup_deadline: new Date(now + 30 * DAY_MS).toISOString(),
  });
  if (error && error.code !== "23505") {
    console.error("requestAccountDeletionAction: insert failed:", error.message);
    return;
  }

  await supabase
    .from("user_accounts")
    .update({ status: "deletion_pending", deletion_requested_at: new Date().toISOString() })
    .eq("user_id", user.id);

  revalidatePath("/app/conta");
}
