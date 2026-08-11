-- Correction: the "Tenho interesse" pilot mechanic isn't an unlimited-credit
-- "Full plan" — it's SIMULATED_OFFER.creditsDisplayed (a fixed number of
-- credits, 15) granted once per user. Reverts the user_plans/unlimited_plan
-- machinery added in 20260101000027 (nothing ever depended on it in
-- production) and replaces it with a straightforward ledger-recorded grant,
-- mirroring the welcome-credit pattern in ct_handle_new_user
-- (20260101000013_new_user_provisioning.sql).

drop trigger if exists user_plans_set_updated_at on user_plans;
drop policy if exists user_plans_select_own on user_plans;
drop table if exists user_plans;
drop function if exists ct_upgrade_to_full_plan(integer);

alter table credit_reservations drop constraint credit_reservations_exemption_type_check;
alter table credit_reservations add constraint credit_reservations_exemption_type_check
  check (exemption_type in ('technical_retry', 'identical_result_reuse', 'pilot_grant', 'administrative_adjustment'));

create or replace function ct_reserve_credit(p_analysis_id uuid, p_policy_version text)
returns boolean
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_user_id uuid := auth.uid();
  v_available integer;
begin
  if v_user_id is null then
    raise exception 'ct_reserve_credit: no authenticated user';
  end if;

  if not exists (select 1 from analyses where id = p_analysis_id and user_id = v_user_id) then
    raise exception 'ct_reserve_credit: analysis % does not belong to caller', p_analysis_id;
  end if;

  select available_credits into v_available from credit_accounts where user_id = v_user_id for update;
  if v_available is null or v_available < 1 then
    return false;
  end if;

  update credit_accounts
    set available_credits = available_credits - 1, reserved_credits = reserved_credits + 1
    where user_id = v_user_id;

  insert into credit_reservations (user_id, analysis_id, amount, status, policy_version, idempotency_key, reserved_at)
  values (v_user_id, p_analysis_id, 1, 'reserved', p_policy_version, 'reserve-' || p_analysis_id::text, now())
  on conflict (user_id, idempotency_key) do nothing;

  return true;
end;
$$;

create or replace function ct_confirm_credit_reservation(p_analysis_id uuid, p_policy_version text)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_user_id uuid := auth.uid();
  v_reservation_id uuid;
  v_available integer;
begin
  if v_user_id is null then
    raise exception 'ct_confirm_credit_reservation: no authenticated user';
  end if;

  select id into v_reservation_id from credit_reservations
    where analysis_id = p_analysis_id and user_id = v_user_id and status = 'reserved'
    for update;
  if v_reservation_id is null then
    return;
  end if;

  update credit_reservations set status = 'confirmed', confirmed_at = now() where id = v_reservation_id;

  update credit_accounts set reserved_credits = greatest(0, reserved_credits - 1)
    where user_id = v_user_id
    returning available_credits into v_available;

  insert into credit_ledger (user_id, analysis_id, reservation_id, transaction_type, amount, balance_after, idempotency_key, reason, policy_version)
  values (v_user_id, p_analysis_id, v_reservation_id, 'consumption', -1, v_available, 'consume-' || p_analysis_id::text, 'Consumo de crédito por análise concluída.', p_policy_version)
  on conflict (user_id, idempotency_key) do nothing;
end;
$$;

create or replace function ct_release_credit_reservation(p_analysis_id uuid, p_policy_version text, p_reason text)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_user_id uuid := auth.uid();
  v_reservation_id uuid;
  v_available integer;
begin
  if v_user_id is null then
    raise exception 'ct_release_credit_reservation: no authenticated user';
  end if;

  select id into v_reservation_id from credit_reservations
    where analysis_id = p_analysis_id and user_id = v_user_id and status = 'reserved'
    for update;
  if v_reservation_id is null then
    return;
  end if;

  update credit_reservations set status = 'released', released_at = now() where id = v_reservation_id;

  update credit_accounts
    set available_credits = available_credits + 1, reserved_credits = greatest(0, reserved_credits - 1)
    where user_id = v_user_id
    returning available_credits into v_available;

  insert into credit_ledger (user_id, analysis_id, reservation_id, transaction_type, amount, balance_after, idempotency_key, reason, policy_version)
  values (v_user_id, p_analysis_id, v_reservation_id, 'restoration', 1, v_available, 'restore-' || p_analysis_id::text, p_reason, p_policy_version)
  on conflict (user_id, idempotency_key) do nothing;
end;
$$;

create or replace function ct_confirm_credit_reservation_service(p_analysis_id uuid, p_user_id uuid, p_policy_version text)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_reservation_id uuid;
  v_available integer;
begin
  select id into v_reservation_id from credit_reservations
    where analysis_id = p_analysis_id and user_id = p_user_id and status = 'reserved'
    for update;
  if v_reservation_id is null then
    return;
  end if;

  update credit_reservations set status = 'confirmed', confirmed_at = now() where id = v_reservation_id;

  update credit_accounts set reserved_credits = greatest(0, reserved_credits - 1)
    where user_id = p_user_id
    returning available_credits into v_available;

  insert into credit_ledger (user_id, analysis_id, reservation_id, transaction_type, amount, balance_after, idempotency_key, reason, policy_version)
  values (p_user_id, p_analysis_id, v_reservation_id, 'consumption', -1, v_available, 'consume-' || p_analysis_id::text, 'Consumo de crédito por análise concluída.', p_policy_version)
  on conflict (user_id, idempotency_key) do nothing;
end;
$$;

create or replace function ct_release_credit_reservation_service(p_analysis_id uuid, p_user_id uuid, p_policy_version text, p_reason text)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_reservation_id uuid;
  v_available integer;
begin
  select id into v_reservation_id from credit_reservations
    where analysis_id = p_analysis_id and user_id = p_user_id and status = 'reserved'
    for update;
  if v_reservation_id is null then
    return;
  end if;

  update credit_reservations set status = 'released', released_at = now() where id = v_reservation_id;

  update credit_accounts
    set available_credits = available_credits + 1, reserved_credits = greatest(0, reserved_credits - 1)
    where user_id = p_user_id
    returning available_credits into v_available;

  insert into credit_ledger (user_id, analysis_id, reservation_id, transaction_type, amount, balance_after, idempotency_key, reason, policy_version)
  values (p_user_id, p_analysis_id, v_reservation_id, 'restoration', 1, v_available, 'restore-' || p_analysis_id::text, p_reason, p_policy_version)
  on conflict (user_id, idempotency_key) do nothing;
end;
$$;

-- Grants SIMULATED_OFFER.creditsDisplayed credits once per (user, offer_key,
-- offer_version) — idempotent via the credit_ledger unique constraint, same
-- as every other credit-mutating RPC in this file. No p_user_id parameter,
-- so there's nothing for a caller to spoof.
create or replace function ct_grant_purchase_credits(p_credits integer, p_offer_key text, p_offer_version text)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_user_id uuid := auth.uid();
  v_available integer;
  v_idempotency_key text;
begin
  if v_user_id is null then
    raise exception 'ct_grant_purchase_credits: no authenticated user';
  end if;
  if p_credits <= 0 then
    raise exception 'ct_grant_purchase_credits: p_credits must be positive';
  end if;

  v_idempotency_key := 'purchase-intent-' || p_offer_key || '-' || p_offer_version || '-' || v_user_id::text;

  if exists (select 1 from credit_ledger where user_id = v_user_id and idempotency_key = v_idempotency_key) then
    return;
  end if;

  insert into credit_accounts (user_id, available_credits, reserved_credits)
  values (v_user_id, p_credits, 0)
  on conflict (user_id) do update
    set available_credits = credit_accounts.available_credits + p_credits
  returning available_credits into v_available;

  insert into credit_ledger (user_id, transaction_type, amount, balance_after, idempotency_key, reason, policy_version)
  values (
    v_user_id, 'grant', p_credits, v_available, v_idempotency_key,
    'Créditos do pacote "' || p_offer_key || '" (piloto — intenção de compra registrada).', p_offer_version
  );
end;
$$;
revoke execute on function ct_grant_purchase_credits(integer, text, text) from public, anon;
grant execute on function ct_grant_purchase_credits(integer, text, text) to authenticated;
