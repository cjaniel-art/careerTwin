-- The Core 2 diagnosis (core2-analysis Edge Function) confirms/releases its
-- own credit reservation from inside EdgeRuntime.waitUntil, using a
-- SUPABASE_SERVICE_ROLE_KEY client — there is no end-user session there, so
-- auth.uid() is always null and the existing ct_confirm_credit_reservation /
-- ct_release_credit_reservation RPCs (20260101000021) always raise "no
-- authenticated user". Found live: an analysis completed successfully but
-- its credit stayed stuck at credit_reservations.status = 'reserved'
-- forever. These _service overloads take the user id explicitly instead of
-- reading it from auth.uid(), and are locked to service_role only — an
-- ordinary authenticated user must never be able to confirm/release another
-- user's reservation by passing an arbitrary p_user_id.

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
revoke execute on function ct_confirm_credit_reservation_service(uuid, uuid, text) from public, anon, authenticated;
grant execute on function ct_confirm_credit_reservation_service(uuid, uuid, text) to service_role;

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
revoke execute on function ct_release_credit_reservation_service(uuid, uuid, text, text) from public, anon, authenticated;
grant execute on function ct_release_credit_reservation_service(uuid, uuid, text, text) to service_role;
