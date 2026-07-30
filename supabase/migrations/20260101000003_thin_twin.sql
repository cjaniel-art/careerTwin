-- CareerTwin — Thin Twin (professional profile): logical profile + immutable versions
-- Source: Modelo de Dados §4.3, §4.5–§4.8; Thin Twin doc §4, §6, §11.

create table if not exists professional_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references user_accounts (user_id) on delete cascade,
  current_version_id uuid, -- FK added after profile_versions exists
  status text not null default 'draft'
    check (status in ('draft', 'under_review', 'confirmed', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger professional_profiles_set_updated_at
  before update on professional_profiles
  for each row execute function ct_set_updated_at();

create table if not exists profile_versions (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references professional_profiles (id) on delete cascade,
  version_number integer not null,
  previous_version_id uuid references profile_versions (id),
  status text not null default 'draft'
    check (status in ('draft', 'confirmed', 'superseded', 'archived')),
  change_reason text,
  source_type text not null
    check (source_type in (
      'initial_onboarding', 'resume_update', 'linkedin_update', 'manual_edit',
      'conflict_resolution', 'professional_update', 'system_migration'
    )),
  change_summary jsonb not null default '{}'::jsonb,
  snapshot jsonb, -- populated on confirmation only
  snapshot_hash text,
  confirmed_by_user_id uuid references user_accounts (user_id),
  confirmed_at timestamptz,
  created_at timestamptz not null default now(),
  unique (profile_id, version_number)
);

-- Confirmed versions are immutable: no UPDATE once status = 'confirmed'.
create or replace function ct_prevent_confirmed_version_update()
returns trigger
language plpgsql
as $$
begin
  if old.status = 'confirmed' then
    raise exception 'profile_versions: confirmed versions are immutable (id=%)', old.id;
  end if;
  return new;
end;
$$;

create trigger profile_versions_immutability
  before update on profile_versions
  for each row execute function ct_prevent_confirmed_version_update();

alter table professional_profiles
  add constraint professional_profiles_current_version_fk
  foreign key (current_version_id) references profile_versions (id);

-- Enforce current_version_id belongs to the same profile (defense in depth,
-- app layer must also validate this in the same transaction).
create or replace function ct_check_current_version_ownership()
returns trigger
language plpgsql
as $$
declare
  v_profile_id uuid;
begin
  if new.current_version_id is not null then
    select profile_id into v_profile_id from profile_versions where id = new.current_version_id;
    if v_profile_id is distinct from new.id then
      raise exception 'professional_profiles.current_version_id must belong to the same profile';
    end if;
  end if;
  return new;
end;
$$;

create trigger professional_profiles_check_current_version
  before insert or update on professional_profiles
  for each row execute function ct_check_current_version_ownership();

-- Shared confirmation/inference state enums used across profile facts.
-- confirmation_status: extracted, confirmed, corrected, added, rejected, in_conflict, unconfirmed
-- inference_status: fact, inference, hypothesis, suggestion
-- Only confirmed/corrected/added count as professional facts (Thin Twin §6).

create table if not exists experiences (
  id uuid primary key default gen_random_uuid(),
  profile_version_id uuid not null references profile_versions (id) on delete cascade,
  company_name text not null,
  role_title text not null,
  normalized_role text,
  employment_type text
    check (employment_type in (
      'internship', 'employee', 'contractor', 'freelance', 'founder',
      'volunteer', 'academic', 'other', 'not_informed'
    )),
  start_date date,
  end_date date,
  is_current boolean not null default false,
  description text,
  scope_summary text,
  confirmation_status text not null default 'extracted'
    check (confirmation_status in (
      'extracted', 'confirmed', 'corrected', 'added', 'rejected', 'in_conflict', 'unconfirmed'
    )),
  inference_status text not null default 'fact'
    check (inference_status in ('fact', 'inference', 'hypothesis', 'suggestion')),
  created_at timestamptz not null default now(),
  check (end_date is null or start_date is null or end_date >= start_date)
);
create index on experiences (profile_version_id);

create table if not exists experience_responsibilities (
  id uuid primary key default gen_random_uuid(),
  experience_id uuid not null references experiences (id) on delete cascade,
  description text not null,
  confirmation_status text not null default 'extracted'
    check (confirmation_status in (
      'extracted', 'confirmed', 'corrected', 'added', 'rejected', 'in_conflict', 'unconfirmed'
    )),
  inference_status text not null default 'fact'
    check (inference_status in ('fact', 'inference', 'hypothesis', 'suggestion')),
  created_at timestamptz not null default now()
);
create index on experience_responsibilities (experience_id);

create table if not exists projects (
  id uuid primary key default gen_random_uuid(),
  experience_id uuid references experiences (id) on delete set null,
  profile_version_id uuid not null references profile_versions (id) on delete cascade,
  name text not null,
  context text,
  objective text,
  user_role text,
  activities jsonb not null default '[]'::jsonb,
  deliverables jsonb not null default '[]'::jsonb,
  results jsonb not null default '[]'::jsonb,
  start_date date,
  end_date date,
  confirmation_status text not null default 'extracted'
    check (confirmation_status in (
      'extracted', 'confirmed', 'corrected', 'added', 'rejected', 'in_conflict', 'unconfirmed'
    )),
  created_at timestamptz not null default now()
);
create index on projects (profile_version_id);

-- Skills and tools catalogs (normalized, shared taxonomy) — kept separate per
-- explicit rule "competência não deve ser armazenada como ferramenta e vice-versa".
create table if not exists skills (
  id uuid primary key default gen_random_uuid(),
  normalized_name text not null,
  skill_type text not null
    check (skill_type in (
      'technical', 'method', 'domain', 'management', 'leadership',
      'communication', 'collaboration', 'business', 'language', 'other'
    )),
  skill_domain text,
  aliases text[] not null default '{}',
  taxonomy_version text not null,
  status text not null default 'active'
    check (status in ('active', 'deprecated', 'pending_review')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (normalized_name, taxonomy_version)
);
create trigger skills_set_updated_at before update on skills
  for each row execute function ct_set_updated_at();

create table if not exists profile_skills (
  id uuid primary key default gen_random_uuid(),
  profile_version_id uuid not null references profile_versions (id) on delete cascade,
  skill_id uuid not null references skills (id),
  original_term text not null,
  declared_level text,
  extraction_confidence numeric(4,3) check (extraction_confidence between 0 and 1),
  confirmation_status text not null default 'extracted'
    check (confirmation_status in (
      'extracted', 'confirmed', 'corrected', 'added', 'rejected', 'in_conflict', 'unconfirmed'
    )),
  inference_status text not null default 'fact'
    check (inference_status in ('fact', 'inference', 'hypothesis', 'suggestion')),
  created_at timestamptz not null default now()
);
create index on profile_skills (profile_version_id);

create table if not exists experience_skills (
  experience_id uuid not null references experiences (id) on delete cascade,
  profile_skill_id uuid not null references profile_skills (id) on delete cascade,
  relationship_type text not null default 'used_in' check (relationship_type in ('used_in')),
  created_at timestamptz not null default now(),
  primary key (experience_id, profile_skill_id)
);

create table if not exists tools (
  id uuid primary key default gen_random_uuid(),
  normalized_name text not null,
  tool_category text,
  aliases text[] not null default '{}',
  taxonomy_version text not null,
  status text not null default 'active'
    check (status in ('active', 'deprecated', 'pending_review')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (normalized_name, taxonomy_version)
);
create trigger tools_set_updated_at before update on tools
  for each row execute function ct_set_updated_at();

create table if not exists profile_tools (
  id uuid primary key default gen_random_uuid(),
  profile_version_id uuid not null references profile_versions (id) on delete cascade,
  tool_id uuid not null references tools (id),
  original_term text not null,
  usage_context text,
  declared_level text,
  extraction_confidence numeric(4,3) check (extraction_confidence between 0 and 1),
  confirmation_status text not null default 'extracted'
    check (confirmation_status in (
      'extracted', 'confirmed', 'corrected', 'added', 'rejected', 'in_conflict', 'unconfirmed'
    )),
  created_at timestamptz not null default now()
);
create index on profile_tools (profile_version_id);

create table if not exists experience_tools (
  experience_id uuid not null references experiences (id) on delete cascade,
  profile_tool_id uuid not null references profile_tools (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (experience_id, profile_tool_id)
);

create table if not exists evidences (
  id uuid primary key default gen_random_uuid(),
  profile_version_id uuid not null references profile_versions (id) on delete cascade,
  evidence_type text not null
    check (evidence_type in (
      'responsibility', 'delivery', 'project', 'qualitative_result', 'quantitative_result',
      'promotion', 'recognition', 'scope_expansion', 'education', 'certification',
      'portfolio', 'professional_example'
    )),
  summary text not null,
  context text,
  source_document_id uuid, -- FK added in documents migration
  source_type text not null check (source_type in ('resume', 'linkedin', 'user')),
  source_snippet text,
  source_locator text,
  extraction_confidence numeric(4,3) check (extraction_confidence between 0 and 1),
  confirmation_status text not null default 'extracted'
    check (confirmation_status in (
      'extracted', 'confirmed', 'corrected', 'added', 'rejected', 'in_conflict', 'unconfirmed'
    )),
  inference_status text not null default 'fact'
    check (inference_status in ('fact', 'inference', 'hypothesis', 'suggestion')),
  created_at timestamptz not null default now()
);
create index on evidences (profile_version_id);

create table if not exists experience_evidences (
  experience_id uuid not null references experiences (id) on delete cascade,
  evidence_id uuid not null references evidences (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (experience_id, evidence_id)
);
create table if not exists project_evidences (
  project_id uuid not null references projects (id) on delete cascade,
  evidence_id uuid not null references evidences (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (project_id, evidence_id)
);
create table if not exists profile_skill_evidences (
  profile_skill_id uuid not null references profile_skills (id) on delete cascade,
  evidence_id uuid not null references evidences (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (profile_skill_id, evidence_id)
);
create table if not exists profile_tool_evidences (
  profile_tool_id uuid not null references profile_tools (id) on delete cascade,
  evidence_id uuid not null references evidences (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (profile_tool_id, evidence_id)
);

create table if not exists education_records (
  id uuid primary key default gen_random_uuid(),
  profile_version_id uuid not null references profile_versions (id) on delete cascade,
  institution text not null,
  course text not null,
  degree_type text,
  field text,
  start_date date,
  end_date date,
  status text not null default 'unconfirmed'
    check (status in ('completed', 'in_progress', 'incomplete', 'unconfirmed')),
  confirmation_status text not null default 'extracted'
    check (confirmation_status in (
      'extracted', 'confirmed', 'corrected', 'added', 'rejected', 'in_conflict', 'unconfirmed'
    )),
  created_at timestamptz not null default now()
);
create index on education_records (profile_version_id);

create table if not exists certifications (
  id uuid primary key default gen_random_uuid(),
  profile_version_id uuid not null references profile_versions (id) on delete cascade,
  name text not null,
  issuer text,
  issued_at date,
  expires_at date,
  credential_id text,
  credential_url text,
  confirmation_status text not null default 'extracted'
    check (confirmation_status in (
      'extracted', 'confirmed', 'corrected', 'added', 'rejected', 'in_conflict', 'unconfirmed'
    )),
  created_at timestamptz not null default now()
);
create index on certifications (profile_version_id);

create table if not exists languages (
  id uuid primary key default gen_random_uuid(),
  profile_version_id uuid not null references profile_versions (id) on delete cascade,
  language_name text not null,
  declared_level text,
  certification text,
  usage_context text,
  confirmation_status text not null default 'extracted'
    check (confirmation_status in (
      'extracted', 'confirmed', 'corrected', 'added', 'rejected', 'in_conflict', 'unconfirmed'
    )),
  created_at timestamptz not null default now()
);
create index on languages (profile_version_id);

-- ---------------------------------------------------------------------------
-- Row Level Security: every table here is reachable from the owning user only
-- via the profile_version_id -> profile_id -> user_id chain (Modelo de Dados §7).
-- ---------------------------------------------------------------------------

alter table professional_profiles enable row level security;
create policy professional_profiles_owner on professional_profiles
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

alter table profile_versions enable row level security;
create policy profile_versions_owner_select on profile_versions
  for select using (
    exists (select 1 from professional_profiles p
            where p.id = profile_versions.profile_id and p.user_id = auth.uid())
  );
create policy profile_versions_owner_insert on profile_versions
  for insert with check (
    exists (select 1 from professional_profiles p
            where p.id = profile_versions.profile_id and p.user_id = auth.uid())
  );
create policy profile_versions_owner_update on profile_versions
  for update using (
    exists (select 1 from professional_profiles p
            where p.id = profile_versions.profile_id and p.user_id = auth.uid())
  );

-- Reusable pattern for tables hanging off profile_version_id directly.
do $$
declare
  t text;
begin
  foreach t in array array[
    'experiences', 'projects', 'profile_skills', 'profile_tools',
    'evidences', 'education_records', 'certifications', 'languages'
  ]
  loop
    execute format('alter table %I enable row level security', t);
    execute format(
      'create policy %I_owner on %I for all using (
         exists (
           select 1 from profile_versions v
           join professional_profiles p on p.id = v.profile_id
           where v.id = %I.profile_version_id and p.user_id = auth.uid()
         )
       ) with check (
         exists (
           select 1 from profile_versions v
           join professional_profiles p on p.id = v.profile_id
           where v.id = %I.profile_version_id and p.user_id = auth.uid()
         )
       )', t, t, t, t
    );
  end loop;
end $$;

-- Second-level relation tables (experience_responsibilities, experience_skills,
-- experience_tools, and the *_evidences join tables) — ownership via experience/
-- project/profile_skill/profile_tool -> profile_version -> profile -> user.
alter table experience_responsibilities enable row level security;
create policy experience_responsibilities_owner on experience_responsibilities
  for all using (
    exists (select 1 from experiences e
            join profile_versions v on v.id = e.profile_version_id
            join professional_profiles p on p.id = v.profile_id
            where e.id = experience_responsibilities.experience_id and p.user_id = auth.uid())
  );

alter table experience_skills enable row level security;
create policy experience_skills_owner on experience_skills
  for all using (
    exists (select 1 from experiences e
            join profile_versions v on v.id = e.profile_version_id
            join professional_profiles p on p.id = v.profile_id
            where e.id = experience_skills.experience_id and p.user_id = auth.uid())
  );

alter table experience_tools enable row level security;
create policy experience_tools_owner on experience_tools
  for all using (
    exists (select 1 from experiences e
            join profile_versions v on v.id = e.profile_version_id
            join professional_profiles p on p.id = v.profile_id
            where e.id = experience_tools.experience_id and p.user_id = auth.uid())
  );

alter table experience_evidences enable row level security;
create policy experience_evidences_owner on experience_evidences
  for all using (
    exists (select 1 from experiences e
            join profile_versions v on v.id = e.profile_version_id
            join professional_profiles p on p.id = v.profile_id
            where e.id = experience_evidences.experience_id and p.user_id = auth.uid())
  );

alter table project_evidences enable row level security;
create policy project_evidences_owner on project_evidences
  for all using (
    exists (select 1 from projects pr
            join profile_versions v on v.id = pr.profile_version_id
            join professional_profiles p on p.id = v.profile_id
            where pr.id = project_evidences.project_id and p.user_id = auth.uid())
  );

alter table profile_skill_evidences enable row level security;
create policy profile_skill_evidences_owner on profile_skill_evidences
  for all using (
    exists (select 1 from profile_skills ps
            join profile_versions v on v.id = ps.profile_version_id
            join professional_profiles p on p.id = v.profile_id
            where ps.id = profile_skill_evidences.profile_skill_id and p.user_id = auth.uid())
  );

alter table profile_tool_evidences enable row level security;
create policy profile_tool_evidences_owner on profile_tool_evidences
  for all using (
    exists (select 1 from profile_tools pt
            join profile_versions v on v.id = pt.profile_version_id
            join professional_profiles p on p.id = v.profile_id
            where pt.id = profile_tool_evidences.profile_tool_id and p.user_id = auth.uid())
  );

-- Catalog tables (skills, tools) are read-only reference data for all authenticated users.
alter table skills enable row level security;
create policy skills_read_all on skills for select using (auth.uid() is not null);
alter table tools enable row level security;
create policy tools_read_all on tools for select using (auth.uid() is not null);
