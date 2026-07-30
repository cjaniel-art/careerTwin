-- CareerTwin — consent records, account deletion requests, audit log.
-- Source: Modelo de Dados §4.16–4.17; Segurança §7–§8.

create table if not exists consent_records (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references user_accounts (user_id) on delete cascade,
  consent_type text not null check (consent_type in ('terms_of_use', 'privacy_policy', 'optional_product_improvement')),
  policy_version text not null,
  status text not null check (status in ('granted', 'revoked', 'not_applicable')),
  source text not null check (source in ('signup', 'account_settings', 'onboarding')),
  recorded_at timestamptz not null default now(),
  revoked_at timestamptz
);
create index on consent_records (user_id, consent_type, recorded_at desc);

create table if not exists deletion_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references user_accounts (user_id) on delete cascade,
  status text not null default 'requested'
    check (status in (
      'requested', 'confirmed', 'processing', 'active_systems_completed',
      'backup_removal_pending', 'completed', 'failed', 'cancelled'
    )),
  requested_at timestamptz not null default now(),
  confirmed_at timestamptz,
  active_systems_deadline timestamptz not null,
  backup_deadline timestamptz not null,
  completed_at timestamptz,
  failure_reason text,
  created_at timestamptz not null default now()
);
create index on deletion_requests (user_id);
create index deletion_requests_pending_idx on deletion_requests (status)
  where status not in ('completed', 'cancelled');

-- Only one active (non-terminal) deletion request per user.
create unique index deletion_requests_one_active_per_user
  on deletion_requests (user_id)
  where status not in ('completed', 'cancelled', 'failed');

create table if not exists audit_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references user_accounts (user_id) on delete set null,
  actor_type text not null check (actor_type in ('user', 'system', 'worker', 'admin')),
  actor_id uuid,
  action text not null,
  resource_type text not null,
  resource_id uuid,
  result text not null check (result in ('success', 'failure', 'denied')),
  correlation_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index on audit_logs (user_id, created_at desc);
create index on audit_logs (correlation_id);
create index on audit_logs (resource_type, resource_id);

comment on table audit_logs is
  'Never stores full documents, résumés, LinkedIn content, job descriptions, evidence text, passwords, tokens, secrets, or full AI responses (Modelo de Dados §4.17, Segurança §14).';

alter table consent_records enable row level security;
create policy consent_records_owner on consent_records
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

alter table deletion_requests enable row level security;
create policy deletion_requests_owner_select on deletion_requests for select using (user_id = auth.uid());
create policy deletion_requests_owner_insert on deletion_requests for insert with check (user_id = auth.uid());

-- audit_logs: readable only by the owning user for their own actions; writes are
-- service-role only (no client insert/update/delete policy is defined on purpose).
alter table audit_logs enable row level security;
create policy audit_logs_owner_select on audit_logs for select using (user_id = auth.uid());
