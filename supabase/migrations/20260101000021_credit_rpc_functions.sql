-- Found via live end-to-end testing: credit_accounts/credit_reservations/
-- credit_ledger had only SELECT policies. A plain owner-scoped INSERT/UPDATE
-- policy (the fix used for processing_jobs/requirements) is NOT sufficient
-- here: it would let an authenticated user set their own available_credits
-- to an arbitrary value via the REST API directly, bypassing all application
-- logic — exactly the "duplicação de crédito" class of issue Segurança §17
-- lists as a release blocker.
--
-- Instead, credit mutations go through SECURITY DEFINER RPC functions that
-- always resolve the user from auth.uid() (never a client-supplied id) and
-- enforce the actual business rules (reserve only if available, confirm/
-- release only a reservation that is currently 'reserved' and belongs to the
-- caller). The client can call these functions but can never write the
-- tables directly — no other INSERT/UPDATE policy is added.

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

  -- Ownership check: the analysis must belong to the caller.
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
revoke execute on function ct_reserve_credit(uuid, text) from public, anon;
grant execute on function ct_reserve_credit(uuid, text) to authenticated;

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
    return; -- nothing reserved (e.g. Core 1, which never reserves) — no-op, not an error
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
revoke execute on function ct_confirm_credit_reservation(uuid, text) from public, anon;
grant execute on function ct_confirm_credit_reservation(uuid, text) to authenticated;

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
revoke execute on function ct_release_credit_reservation(uuid, text, text) from public, anon;
grant execute on function ct_release_credit_reservation(uuid, text, text) to authenticated;
