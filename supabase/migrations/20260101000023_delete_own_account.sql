-- Self-service, immediate, full account deletion (SECURITY DEFINER, always
-- scoped to auth.uid() — never a client-supplied id). Called from
-- src/features/account/actions.ts's deleteAccountAction after the user types
-- the confirmation word in the UI.
--
-- Most of this user's data cascades cleanly once user_accounts is deleted
-- (professional_profiles → profile_versions → experiences/evidences/...,
-- target_contexts → target_context_versions, opportunities →
-- opportunity_versions, documents, personal_data, credit_accounts, etc. all
-- have `on delete cascade` back to user_accounts, directly or transitively).
--
-- Two things stand in the way of a plain `delete from user_accounts`:
--
-- 1. A handful of foreign keys are `on delete no action` because they cross
--    between two *independent* branches of that cascade — e.g. `documents`
--    and `evidences` are both descendants of user_accounts via separate
--    paths (documents directly, evidences via professional_profiles →
--    profile_versions), and evidences.source_document_id points at
--    documents. Postgres does not guarantee an order between sibling
--    cascade branches, so a single cascading delete can and did fail
--    (reproduced during manual testing) depending on which branch it
--    processed first. Fixed by deleting the referencing branches
--    (opportunities, professional_profiles, target_contexts — which
--    transitively remove every no-action reference into documents/analyses)
--    explicitly, in dependency order, before documents/analyses/
--    user_accounts are touched — rather than trying to null the FK columns
--    first.
-- 2. profile_versions/target_context_versions/opportunity_versions/analyses
--    are immutable once confirmed/completed (see their *_immutability
--    triggers) — any UPDATE to a confirmed row raises, even a no-op one.
--    Those triggers only fire on UPDATE, never on DELETE (verified against
--    pg_trigger), so explicit DELETEs in the right order — not UPDATEs that
--    null a column first — are what make this safe regardless of status.
create or replace function public.ct_delete_own_account()
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_user_id uuid := auth.uid();
begin
  if v_user_id is null then
    raise exception 'ct_delete_own_account: no authenticated user';
  end if;

  -- credit_ledger is append-only by design (see credit_ledger_no_delete
  -- trigger, which only blocks DELETE) — disabling it is the documented
  -- escape hatch for account erasure, scoped to this transaction only.
  alter table public.credit_ledger disable trigger credit_ledger_no_delete;
  delete from public.credit_ledger where user_id = v_user_id;
  alter table public.credit_ledger enable trigger credit_ledger_no_delete;

  -- credit_reservations/analysis_feedback/processing_jobs each have a
  -- no-action reference into analyses (or, for analysis_feedback, into
  -- actions — a grandchild of analyses via recommendations) — deleted
  -- explicitly before analyses so that deleting analyses next, and letting
  -- it cascade to recommendations → actions, never races against a
  -- still-existing reference from a sibling branch.
  delete from public.credit_reservations where user_id = v_user_id;
  delete from public.analysis_feedback where user_id = v_user_id;
  delete from public.processing_jobs where user_id = v_user_id;
  delete from public.analyses where user_id = v_user_id;

  -- opportunities/professional_profiles/target_contexts are deleted
  -- explicitly, before documents, because their cascade children
  -- (opportunity_versions.source_document_id, evidences.source_document_id)
  -- hold no-action references into documents — deleting the parent removes
  -- those referencing rows now, instead of leaving them to race against
  -- documents' own direct cascade from user_accounts.
  delete from public.opportunities where user_id = v_user_id;
  delete from public.professional_profiles where user_id = v_user_id;
  delete from public.target_contexts where user_id = v_user_id;

  -- Everything else still attached to this user (documents, personal_data,
  -- credit_accounts, consent_records, deletion_requests, purchase_intents,
  -- and their own children) cascades cleanly from here — no remaining
  -- cross-branch reference into it. Deleting auth.users last is what makes
  -- a future signup with the same e-mail start onboarding from zero.
  delete from public.user_accounts where user_id = v_user_id;
  delete from auth.users where id = v_user_id;
end;
$$;

revoke all on function public.ct_delete_own_account() from public;
grant execute on function public.ct_delete_own_account() to authenticated;
