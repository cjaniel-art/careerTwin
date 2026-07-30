-- CareerTwin — user accounts and personal data
-- Source: Modelo de Dados §4.1–4.2. auth.users is managed by Supabase Auth.
-- Personal data is stored separately from professional data (Decision Log #12/#14,
-- Segurança §3) and must never influence IPP/IAO/confidence/recommendations.

create table if not exists user_accounts (
  user_id uuid primary key references auth.users (id) on delete cascade,
  status text not null default 'active'
    check (status in ('active', 'blocked', 'deletion_pending')),
  locale text not null default 'pt-BR',
  timezone text not null default 'America/Sao_Paulo',
  onboarding_status text not null default 'not_started'
    check (onboarding_status in (
      'not_started', 'in_progress', 'profile_review', 'target_context_pending', 'completed'
    )),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deletion_requested_at timestamptz
);

create trigger user_accounts_set_updated_at
  before update on user_accounts
  for each row execute function ct_set_updated_at();

alter table user_accounts enable row level security;

create policy user_accounts_select_own on user_accounts
  for select using (user_id = auth.uid());
create policy user_accounts_update_own on user_accounts
  for update using (user_id = auth.uid())
  with check (user_id = auth.uid());
-- Insert happens server-side (service role, via signup trigger/use-case) only.

-- Personal data: nome completo (obrigatório), cidade/estado (opcionais).
-- Explicitly NOT collected in the MVP: data de nascimento, CEP, endereço completo
-- (PRD 01 §5, Decision Log #13, Segurança §3).
create table if not exists personal_data (
  user_id uuid primary key references user_accounts (user_id) on delete cascade,
  full_name text not null,
  city text,
  state text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger personal_data_set_updated_at
  before update on personal_data
  for each row execute function ct_set_updated_at();

alter table personal_data enable row level security;

create policy personal_data_select_own on personal_data
  for select using (user_id = auth.uid());
create policy personal_data_insert_own on personal_data
  for insert with check (user_id = auth.uid());
create policy personal_data_update_own on personal_data
  for update using (user_id = auth.uid())
  with check (user_id = auth.uid());
create policy personal_data_delete_own on personal_data
  for delete using (user_id = auth.uid());

comment on table personal_data is
  'Never joined into AI prompts, analytics payloads, or score calculations. See Segurança §4/§17.';
