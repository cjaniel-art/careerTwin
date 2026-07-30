-- credit_ledger is append-only/immutable (see ct_ledger_is_append_only in
-- 20260101000009_credits.sql). A raw ON DELETE CASCADE from user_accounts would
-- try to DELETE ledger rows when an account is removed, which the immutability
-- trigger correctly rejects — found via live RLS/integrity testing against a
-- real Supabase project during this implementation session.
--
-- Account deletion must go through the orchestrated deletion_requests flow
-- (Segurança §7), which retains the credit ledger for financial/audit
-- reconciliation (a legitimate retention obligation, Segurança §7 step "registros
-- mantidos por obrigação legítima devem ser [...] desvinculados quando possível")
-- rather than deleting it outright. Postgres must refuse — not silently cascade —
-- if a raw auth.users/user_accounts deletion is ever attempted outside that flow
-- while ledger rows still exist for the user.
alter table credit_ledger drop constraint credit_ledger_user_id_fkey;
alter table credit_ledger
  add constraint credit_ledger_user_id_fkey
  foreign key (user_id) references user_accounts (user_id); -- no action (default), not cascade
