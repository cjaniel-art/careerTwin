-- CareerTwin — simulated credits (no real payment). Reservation -> ledger pattern.
-- Source: Modelo de Dados §4.15; PRD 03 §39/§45; Modelo de Negócio.

create table if not exists credit_accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references user_accounts (user_id) on delete cascade,
  available_credits integer not null default 0 check (available_credits >= 0),
  reserved_credits integer not null default 0 check (reserved_credits >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger credit_accounts_set_updated_at before update on credit_accounts
  for each row execute function ct_set_updated_at();

create table if not exists credit_reservations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references user_accounts (user_id) on delete cascade,
  analysis_id uuid not null references analyses (id),
  amount integer not null check (amount > 0),
  status text not null default 'reserved'
    check (status in ('reserved', 'confirmed', 'released', 'expired', 'exempt')),
  exemption_type text
    check (exemption_type in ('technical_retry', 'identical_result_reuse', 'pilot_grant', 'administrative_adjustment')),
  policy_version text not null,
  idempotency_key text not null,
  reserved_at timestamptz,
  confirmed_at timestamptz,
  released_at timestamptz,
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  unique (user_id, idempotency_key)
);
create index on credit_reservations (analysis_id);

create table if not exists credit_ledger (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references user_accounts (user_id) on delete cascade,
  analysis_id uuid references analyses (id),
  reservation_id uuid references credit_reservations (id),
  transaction_type text not null check (transaction_type in ('grant', 'consumption', 'restoration', 'expiration', 'adjustment')),
  amount integer not null,
  balance_after integer not null check (balance_after >= 0),
  idempotency_key text not null,
  reason text not null,
  policy_version text not null,
  created_at timestamptz not null default now(),
  unique (user_id, idempotency_key)
);
create index on credit_ledger (user_id, created_at desc);

-- The ledger is append-only / immutable: corrections use a compensating entry,
-- never an UPDATE or DELETE of a prior transaction (Modelo de Dados §4.15).
create or replace function ct_ledger_is_append_only()
returns trigger language plpgsql as $$
begin
  raise exception 'credit_ledger is append-only; corrections must use a compensating transaction, not %', tg_op;
end;
$$;
create trigger credit_ledger_no_update
  before update on credit_ledger
  for each row execute function ct_ledger_is_append_only();
create trigger credit_ledger_no_delete
  before delete on credit_ledger
  for each row execute function ct_ledger_is_append_only();

create table if not exists purchase_intents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references user_accounts (user_id) on delete cascade,
  offer_key text not null,
  offer_version text not null,
  price_cents integer not null,
  currency text not null default 'BRL',
  credits_displayed integer not null,
  validity_days_displayed integer not null,
  status text not null default 'viewed' check (status in ('viewed', 'clicked', 'confirmed_intent', 'dismissed')),
  created_at timestamptz not null default now()
);
create index on purchase_intents (user_id, created_at desc);

alter table credit_accounts enable row level security;
create policy credit_accounts_owner_select on credit_accounts for select using (user_id = auth.uid());

alter table credit_reservations enable row level security;
create policy credit_reservations_owner_select on credit_reservations for select using (user_id = auth.uid());

alter table credit_ledger enable row level security;
create policy credit_ledger_owner_select on credit_ledger for select using (user_id = auth.uid());

alter table purchase_intents enable row level security;
create policy purchase_intents_owner on purchase_intents
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

comment on table credit_accounts is
  'available_credits/reserved_credits are denormalized for fast reads; credit_ledger is the source of truth. All balance mutations happen server-side (service role) inside the same transaction as the corresponding ledger entry.';
