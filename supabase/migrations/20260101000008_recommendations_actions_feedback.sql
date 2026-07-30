-- CareerTwin — recommendations, actions, feedback.
-- Source: Modelo de Dados §4.13–4.14; PRD 02 §20–23/§26; PRD 03 §35/§38.

create table if not exists recommendations (
  id uuid primary key default gen_random_uuid(),
  analysis_id uuid not null references analyses (id) on delete cascade,
  recommendation_key text not null,
  category text not null check (category in ('competency', 'communication', 'evidence', 'positioning')),
  title text not null,
  problem text not null,
  reasoning text not null,
  suggested_action text not null,
  expected_outcome text,
  completion_criteria text not null,
  impact smallint not null check (impact between 1 and 5),
  effort smallint not null check (effort between 1 and 5),
  urgency smallint not null check (urgency between 1 and 5),
  confidence smallint not null check (confidence between 1 and 5),
  priority_score numeric(5,2) not null,
  priority_order integer not null,
  status text not null default 'generated'
    check (status in ('generated', 'highlighted', 'selected', 'dismissed', 'converted_to_action')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (analysis_id, recommendation_key)
);
create trigger recommendations_set_updated_at before update on recommendations
  for each row execute function ct_set_updated_at();
create index on recommendations (analysis_id, priority_order);

create table if not exists recommendation_evidences (
  recommendation_id uuid not null references recommendations (id) on delete cascade,
  evidence_id uuid not null references evidences (id) on delete cascade,
  relationship_type text not null default 'supports' check (relationship_type in ('supports')),
  created_at timestamptz not null default now(),
  primary key (recommendation_id, evidence_id)
);

create table if not exists recommendation_requirements (
  recommendation_id uuid not null references recommendations (id) on delete cascade,
  requirement_id uuid not null references requirements (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (recommendation_id, requirement_id)
);

create table if not exists actions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references user_accounts (user_id) on delete cascade,
  recommendation_id uuid not null references recommendations (id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'selected', 'in_progress', 'completed')),
  user_notes text,
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger actions_set_updated_at before update on actions
  for each row execute function ct_set_updated_at();
create index on actions (user_id, status, created_at desc);

create table if not exists analysis_feedback (
  id uuid primary key default gen_random_uuid(),
  analysis_id uuid not null references analyses (id) on delete cascade,
  user_id uuid not null references user_accounts (user_id) on delete cascade,
  usefulness_score smallint not null check (usefulness_score between 1 and 5),
  specificity text not null check (specificity in ('yes', 'partially', 'no')),
  intended_action_id uuid references actions (id),
  application_intent text
    check (application_intent in ('apply', 'apply_after_adjustments', 'not_apply', 'undecided', 'not_applicable')),
  comment text,
  created_at timestamptz not null default now(),
  unique (analysis_id, user_id)
);

alter table recommendations enable row level security;
create policy recommendations_owner on recommendations
  for all using (exists (select 1 from analyses a where a.id = recommendations.analysis_id and a.user_id = auth.uid()));

alter table recommendation_evidences enable row level security;
create policy recommendation_evidences_owner on recommendation_evidences
  for all using (
    exists (select 1 from recommendations r join analyses a on a.id = r.analysis_id
            where r.id = recommendation_evidences.recommendation_id and a.user_id = auth.uid())
  );

alter table recommendation_requirements enable row level security;
create policy recommendation_requirements_owner on recommendation_requirements
  for all using (
    exists (select 1 from recommendations r join analyses a on a.id = r.analysis_id
            where r.id = recommendation_requirements.recommendation_id and a.user_id = auth.uid())
  );

alter table actions enable row level security;
create policy actions_owner on actions
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

alter table analysis_feedback enable row level security;
create policy analysis_feedback_owner on analysis_feedback
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());
