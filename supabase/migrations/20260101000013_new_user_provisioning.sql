-- Provisions user_accounts + credit_accounts (+ the welcome credit grant)
-- atomically whenever a new auth.users row is created. This is the only
-- INSERT path for user_accounts — there is no client-facing insert policy on
-- purpose, so the client can never fabricate its own account row (Arquitetura
-- §4.3: "o backend não deve confiar em user_id enviado livremente pelo cliente").
--
-- The "1 free job analysis" (CORE_2_CONFIG.credits.freeJobAnalyses) is modeled
-- as a real opening balance recorded through the ledger, not a hidden
-- exemption — consistent with "ledger é fonte de verdade dos créditos".
create or replace function ct_handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_reservation_free_credits constant integer := 1;
begin
  insert into public.user_accounts (user_id) values (new.id);

  insert into public.credit_accounts (user_id, available_credits, reserved_credits)
  values (new.id, v_reservation_free_credits, 0);

  insert into public.credit_ledger (
    user_id, transaction_type, amount, balance_after, idempotency_key, reason, policy_version
  ) values (
    new.id, 'grant', v_reservation_free_credits, v_reservation_free_credits,
    'welcome-grant-' || new.id::text, 'Crédito gratuito de boas-vindas (piloto)', 'pilot-v1'
  );

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function ct_handle_new_user();
