-- CareerTwin — Target context (contexto-alvo): separate, versioned, never part of Thin Twin.
-- Source: Modelo de Dados §4.4; PRD 01 §34; Thin Twin §4.2.

create table if not exists target_contexts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references user_accounts (user_id) on delete cascade,
  current_version_id uuid,
  status text not null default 'draft' check (status in ('draft', 'confirmed', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger target_contexts_set_updated_at before update on target_contexts
  for each row execute function ct_set_updated_at();

create table if not exists target_context_versions (
  id uuid primary key default gen_random_uuid(),
  target_context_id uuid not null references target_contexts (id) on delete cascade,
  version_number integer not null,
  previous_version_id uuid references target_context_versions (id),
  target_area text not null,
  target_role text not null,
  normalized_role text,
  desired_seniority text not null check (desired_seniority in ('intern', 'junior', 'mid', 'senior')),
  transition_type text
    check (transition_type in (
      'same_role', 'new_specialty', 'new_role', 'new_area', 'return_to_market', 'not_informed'
    )),
  search_context text
    check (search_context in (
      'unemployed', 'employed_seeking_change', 'career_transition', 'returning_to_work', 'not_informed'
    )),
  preferences jsonb not null default '{}'::jsonb,
  confirmation_status text not null default 'draft'
    check (confirmation_status in ('draft', 'confirmed')),
  confirmed_at timestamptz,
  created_at timestamptz not null default now(),
  unique (target_context_id, version_number)
);

create or replace function ct_prevent_confirmed_target_context_update()
returns trigger language plpgsql as $$
begin
  if old.confirmation_status = 'confirmed' then
    raise exception 'target_context_versions: confirmed versions are immutable (id=%)', old.id;
  end if;
  return new;
end;
$$;
create trigger target_context_versions_immutability
  before update on target_context_versions
  for each row execute function ct_prevent_confirmed_target_context_update();

alter table target_contexts
  add constraint target_contexts_current_version_fk
  foreign key (current_version_id) references target_context_versions (id);

alter table target_contexts enable row level security;
create policy target_contexts_owner on target_contexts
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

alter table target_context_versions enable row level security;
create policy target_context_versions_owner on target_context_versions
  for all using (
    exists (select 1 from target_contexts c
            where c.id = target_context_versions.target_context_id and c.user_id = auth.uid())
  );
