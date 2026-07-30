-- CareerTwin — opportunities (user-submitted jobs), role references (catalog),
-- and structured requirements.
-- Source: Modelo de Dados §4.12; PRD 03 §7–§13.

create table if not exists opportunities (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references user_accounts (user_id) on delete cascade,
  current_version_id uuid,
  status text not null default 'draft' check (status in ('draft', 'confirmed', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger opportunities_set_updated_at before update on opportunities
  for each row execute function ct_set_updated_at();

create table if not exists opportunity_versions (
  id uuid primary key default gen_random_uuid(),
  opportunity_id uuid not null references opportunities (id) on delete cascade,
  version_number integer not null,
  previous_version_id uuid references opportunity_versions (id),
  title text,
  company text,
  source_type text not null check (source_type in ('pasted_text', 'pdf', 'manual_entry')),
  source_document_id uuid references documents (id),
  reference_url text,
  content_hash text not null,
  structured_snapshot jsonb,
  confirmation_status text not null default 'draft' check (confirmation_status in ('draft', 'confirmed')),
  confirmed_at timestamptz,
  created_at timestamptz not null default now(),
  unique (opportunity_id, version_number)
);

create or replace function ct_prevent_confirmed_opportunity_update()
returns trigger language plpgsql as $$
begin
  if old.confirmation_status = 'confirmed' then
    raise exception 'opportunity_versions: confirmed versions are immutable (id=%)', old.id;
  end if;
  return new;
end;
$$;
create trigger opportunity_versions_immutability
  before update on opportunity_versions
  for each row execute function ct_prevent_confirmed_opportunity_update();

alter table opportunities
  add constraint opportunities_current_version_fk
  foreign key (current_version_id) references opportunity_versions (id);

-- Role reference catalog: logically shared across users (not per-user data).
-- Only status = 'approved' role_reference_versions may back a definitive analysis
-- (open-decisions.md #1 — catalog content is empty until approved by product).
create table if not exists role_references (
  id uuid primary key default gen_random_uuid(),
  normalized_role text not null,
  area text not null,
  status text not null default 'draft' check (status in ('draft', 'approved', 'deprecated')),
  current_version_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger role_references_set_updated_at before update on role_references
  for each row execute function ct_set_updated_at();

create table if not exists role_reference_versions (
  id uuid primary key default gen_random_uuid(),
  role_reference_id uuid not null references role_references (id) on delete cascade,
  version_number integer not null,
  seniority text not null check (seniority in ('intern', 'junior', 'mid', 'senior')),
  reference_snapshot jsonb not null default '{}'::jsonb,
  source_method text,
  approval_status text not null default 'draft' check (approval_status in ('draft', 'approved', 'deprecated')),
  approved_by uuid references user_accounts (user_id),
  approved_at timestamptz,
  created_at timestamptz not null default now(),
  unique (role_reference_id, version_number)
);

alter table role_references
  add constraint role_references_current_version_fk
  foreign key (current_version_id) references role_reference_versions (id);

create table if not exists requirements (
  id uuid primary key default gen_random_uuid(),
  opportunity_version_id uuid references opportunity_versions (id) on delete cascade,
  role_reference_version_id uuid references role_reference_versions (id) on delete cascade,
  description text not null,
  normalized_name text,
  category text not null
    check (category in (
      'skill', 'tool', 'experience', 'responsibility', 'education', 'certification',
      'seniority', 'scope', 'location', 'language', 'other'
    )),
  criticality text not null
    check (criticality in ('mandatory', 'desired', 'differential', 'complementary', 'blocking')),
  -- Generated, not independent: cannot contradict `criticality` (Modelo de Dados
  -- internal conflict resolved per open-decisions.md #13).
  is_critical boolean generated always as (criticality in ('mandatory', 'blocking')) stored,
  applicability text not null default 'applicable'
    check (applicability in ('applicable', 'not_applicable', 'unknown')),
  extraction_confidence numeric(4,3) not null check (extraction_confidence between 0 and 1),
  source_excerpt text not null,
  ambiguous boolean not null default false,
  user_confirmed boolean not null default false,
  created_at timestamptz not null default now(),
  -- Each requirement belongs to exactly one origin (never both, never neither).
  check (
    (opportunity_version_id is not null and role_reference_version_id is null)
    or (opportunity_version_id is null and role_reference_version_id is not null)
  )
);
create index on requirements (opportunity_version_id);
create index on requirements (role_reference_version_id);

alter table opportunities enable row level security;
create policy opportunities_owner on opportunities
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

alter table opportunity_versions enable row level security;
create policy opportunity_versions_owner on opportunity_versions
  for all using (
    exists (select 1 from opportunities o
            where o.id = opportunity_versions.opportunity_id and o.user_id = auth.uid())
  );

-- Role reference catalog is shared reference data, readable by any authenticated
-- user (never user-owned), writable only by service role (product/admin curation).
alter table role_references enable row level security;
create policy role_references_read_all on role_references
  for select using (auth.uid() is not null);
alter table role_reference_versions enable row level security;
create policy role_reference_versions_read_all on role_reference_versions
  for select using (auth.uid() is not null);

alter table requirements enable row level security;
create policy requirements_owner on requirements
  for select using (
    (opportunity_version_id is not null and exists (
      select 1 from opportunity_versions ov join opportunities o on o.id = ov.opportunity_id
      where ov.id = requirements.opportunity_version_id and o.user_id = auth.uid()
    ))
    or (role_reference_version_id is not null and auth.uid() is not null)
  );
