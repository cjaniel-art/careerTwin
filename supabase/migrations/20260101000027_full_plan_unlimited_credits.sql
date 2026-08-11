-- "Tenho interesse" no pacote pago hoje só registra intenção (ver
-- confirmPurchaseIntentAction em src/features/credits/actions.ts) — não há
-- cobrança real nem gateway de pagamento (ver Modelo de Negócio). Esse clique
-- passa também a conceder, de fato, o pacote "Full" por 30 dias com créditos
-- ilimitados, já que este é um modelo simulado/piloto.
--
-- Créditos ilimitados nunca tocam credit_accounts.available_credits — em vez
-- disso, um plano Full ativo faz as RPCs de crédito (reserve/confirm/release)
-- pularem por completo a contabilidade normal (marcando a reserva com
-- exemption_type = 'unlimited_plan'), então quando o plano expira o usuário
-- volta automaticamente ao saldo normal, sem precisar de nenhum estorno.
--
-- Igual ao padrão já estabelecido para credit_accounts (ver comentário em
-- 20260101000021_credit_rpc_functions.sql): a tabela só tem policy de
-- SELECT — a concessão do plano só acontece via RPC SECURITY DEFINER, nunca
-- por escrita direta, senão qualquer usuário autenticado poderia se
-- autoconceder o plano Full via REST (grant de UPDATE de tabela é amplo,
-- RLS é a única barreira real).
create table if not exists user_plans (
  user_id uuid primary key references user_accounts (user_id) on delete cascade,
  plan_type text not null default 'free' check (plan_type in ('free', 'full')),
  plan_started_at timestamptz,
  plan_expires_at timestamptz,
  updated_at timestamptz not null default now()
);

alter table user_plans enable row level security;

create policy user_plans_select_own on user_plans
  for select using (user_id = auth.uid());

create trigger user_plans_set_updated_at
  before update on user_plans
  for each row execute function ct_set_updated_at();

alter table credit_reservations drop constraint credit_reservations_exemption_type_check;
alter table credit_reservations add constraint credit_reservations_exemption_type_check
  check (exemption_type in ('technical_retry', 'identical_result_reuse', 'pilot_grant', 'administrative_adjustment', 'unlimited_plan'));

-- Grants (or renews) the Full plan for the calling user. Only usable by an
-- authenticated caller on their own account — no p_user_id parameter, so
-- there's nothing for a caller to spoof.
create or replace function ct_upgrade_to_full_plan(p_validity_days integer default 30)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_user_id uuid := auth.uid();
begin
  if v_user_id is null then
    raise exception 'ct_upgrade_to_full_plan: no authenticated user';
  end if;

  insert into user_plans (user_id, plan_type, plan_started_at, plan_expires_at, updated_at)
  values (v_user_id, 'full', now(), now() + make_interval(days => p_validity_days), now())
  on conflict (user_id) do update
    set plan_type = 'full',
        plan_started_at = now(),
        plan_expires_at = now() + make_interval(days => p_validity_days),
        updated_at = now();
end;
$$;
revoke execute on function ct_upgrade_to_full_plan(integer) from public, anon;
grant execute on function ct_upgrade_to_full_plan(integer) to authenticated;

create or replace function ct_reserve_credit(p_analysis_id uuid, p_policy_version text)
returns boolean
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_user_id uuid := auth.uid();
  v_available integer;
  v_unlimited boolean;
begin
  if v_user_id is null then
    raise exception 'ct_reserve_credit: no authenticated user';
  end if;

  if not exists (select 1 from analyses where id = p_analysis_id and user_id = v_user_id) then
    raise exception 'ct_reserve_credit: analysis % does not belong to caller', p_analysis_id;
  end if;

  select exists(
    select 1 from user_plans
    where user_id = v_user_id and plan_type = 'full' and (plan_expires_at is null or plan_expires_at > now())
  ) into v_unlimited;

  if v_unlimited then
    insert into credit_reservations (user_id, analysis_id, amount, status, exemption_type, policy_version, idempotency_key, reserved_at)
    values (v_user_id, p_analysis_id, 1, 'reserved', 'unlimited_plan', p_policy_version, 'reserve-' || p_analysis_id::text, now())
    on conflict (user_id, idempotency_key) do nothing;
    return true;
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
  v_exemption_type text;
  v_available integer;
begin
  if v_user_id is null then
    raise exception 'ct_confirm_credit_reservation: no authenticated user';
  end if;

  select id, exemption_type into v_reservation_id, v_exemption_type from credit_reservations
    where analysis_id = p_analysis_id and user_id = v_user_id and status = 'reserved'
    for update;
  if v_reservation_id is null then
    return; -- nothing reserved (e.g. Core 1, which never reserves) — no-op, not an error
  end if;

  update credit_reservations set status = 'confirmed', confirmed_at = now() where id = v_reservation_id;

  if v_exemption_type = 'unlimited_plan' then
    return; -- no balance was ever touched at reserve time — nothing to reconcile
  end if;

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
  v_exemption_type text;
  v_available integer;
begin
  if v_user_id is null then
    raise exception 'ct_release_credit_reservation: no authenticated user';
  end if;

  select id, exemption_type into v_reservation_id, v_exemption_type from credit_reservations
    where analysis_id = p_analysis_id and user_id = v_user_id and status = 'reserved'
    for update;
  if v_reservation_id is null then
    return;
  end if;

  update credit_reservations set status = 'released', released_at = now() where id = v_reservation_id;

  if v_exemption_type = 'unlimited_plan' then
    return; -- no balance was ever touched at reserve time — nothing to restore
  end if;

  update credit_accounts
    set available_credits = available_credits + 1, reserved_credits = greatest(0, reserved_credits - 1)
    where user_id = v_user_id
    returning available_credits into v_available;

  insert into credit_ledger (user_id, analysis_id, reservation_id, transaction_type, amount, balance_after, idempotency_key, reason, policy_version)
  values (v_user_id, p_analysis_id, v_reservation_id, 'restoration', 1, v_available, 'restore-' || p_analysis_id::text, p_reason, p_policy_version)
  on conflict (user_id, idempotency_key) do nothing;
end;
$$;

-- _service variants (called by core2-analysis Edge Function via SUPABASE_SERVICE_ROLE_KEY,
-- see 20260101000026_credit_rpc_service_role.sql) — same unlimited_plan skip, keyed by
-- p_user_id since there's no auth.uid() in that context.
create or replace function ct_confirm_credit_reservation_service(p_analysis_id uuid, p_user_id uuid, p_policy_version text)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_reservation_id uuid;
  v_exemption_type text;
  v_available integer;
begin
  select id, exemption_type into v_reservation_id, v_exemption_type from credit_reservations
    where analysis_id = p_analysis_id and user_id = p_user_id and status = 'reserved'
    for update;
  if v_reservation_id is null then
    return;
  end if;

  update credit_reservations set status = 'confirmed', confirmed_at = now() where id = v_reservation_id;

  if v_exemption_type = 'unlimited_plan' then
    return;
  end if;

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
  v_exemption_type text;
  v_available integer;
begin
  select id, exemption_type into v_reservation_id, v_exemption_type from credit_reservations
    where analysis_id = p_analysis_id and user_id = p_user_id and status = 'reserved'
    for update;
  if v_reservation_id is null then
    return;
  end if;

  update credit_reservations set status = 'released', released_at = now() where id = v_reservation_id;

  if v_exemption_type = 'unlimited_plan' then
    return;
  end if;

  update credit_accounts
    set available_credits = available_credits + 1, reserved_credits = greatest(0, reserved_credits - 1)
    where user_id = p_user_id
    returning available_credits into v_available;

  insert into credit_ledger (user_id, analysis_id, reservation_id, transaction_type, amount, balance_after, idempotency_key, reason, policy_version)
  values (p_user_id, p_analysis_id, v_reservation_id, 'restoration', 1, v_available, 'restore-' || p_analysis_id::text, p_reason, p_policy_version)
  on conflict (user_id, idempotency_key) do nothing;
end;
$$;
