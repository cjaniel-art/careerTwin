-- CareerTwin — analyses (Core 1 and Core 2), results, limits.
-- Source: Modelo de Dados §4.11; PRD 02 §11/§19/§24; PRD 03 §19/§26/§34.
-- Completed analyses are immutable (RNF-C1-005/RNF-C2-005, Guardrails §13).

create table if not exists analyses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references user_accounts (user_id) on delete cascade,
  analysis_type text not null
    check (analysis_type in ('profile_analysis', 'target_role_analysis', 'job_analysis')),
  profile_version_id uuid not null references profile_versions (id),
  target_context_version_id uuid not null references target_context_versions (id),
  opportunity_version_id uuid references opportunity_versions (id),
  role_reference_version_id uuid references role_reference_versions (id),
  previous_analysis_id uuid references analyses (id),
  status text not null default 'draft'
    check (status in (
      'draft', 'queued', 'processing', 'preliminary', 'completed',
      'insufficient_data', 'failed_retryable', 'failed_final', 'cancelled'
    )),
  idempotency_key text not null,
  input_hash text not null,
  model_version text,
  prompt_version text,
  schema_version text,
  rubric_version text not null,
  engine_version text not null,
  configuration_version text not null,
  confidence_score numeric(4,3) check (confidence_score between 0 and 1),
  confidence_band text check (confidence_band in ('low', 'medium', 'high')),
  confidence_reasons jsonb not null default '[]'::jsonb,
  missing_information jsonb not null default '[]'::jsonb,
  conflicts jsonb not null default '[]'::jsonb,
  warnings jsonb not null default '[]'::jsonb,
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  unique (user_id, idempotency_key),
  -- Per-type reference requirements (Modelo de Dados §4.11 "Regras por tipo").
  check (
    (analysis_type = 'profile_analysis'
      and opportunity_version_id is null and role_reference_version_id is null)
    or (analysis_type = 'target_role_analysis'
      and opportunity_version_id is null and role_reference_version_id is not null)
    or (analysis_type = 'job_analysis'
      and opportunity_version_id is not null and role_reference_version_id is null)
  )
);
create index on analyses (user_id, created_at desc);
create index on analyses (user_id, status, created_at desc);
create index on analyses (user_id, analysis_type, created_at desc);

create or replace function ct_prevent_completed_analysis_update()
returns trigger language plpgsql as $$
begin
  if old.status = 'completed' then
    raise exception 'analyses: completed analyses are immutable (id=%)', old.id;
  end if;
  return new;
end;
$$;
create trigger analyses_immutability
  before update on analyses
  for each row execute function ct_prevent_completed_analysis_update();

alter table processing_jobs
  add constraint processing_jobs_analysis_fk
  foreign key (analysis_id) references analyses (id);

-- ---- Core 1 results ----
create table if not exists profile_analysis_results (
  analysis_id uuid primary key references analyses (id) on delete cascade,
  ipp_score numeric(5,2) not null check (ipp_score between 0 and 100),
  ipp_display_score smallint not null check (ipp_display_score between 0 and 100),
  ipp_band text not null
    check (ipp_band in ('low_readiness', 'developing_readiness', 'good_readiness', 'high_readiness')),
  diagnosis text not null,
  main_strength text not null,
  main_gap text not null,
  next_best_action text not null,
  calculation_snapshot jsonb not null,
  created_at timestamptz not null default now()
);

create table if not exists profile_dimension_results (
  id uuid primary key default gen_random_uuid(),
  analysis_id uuid not null references analyses (id) on delete cascade,
  dimension text not null
    check (dimension in (
      'objective_clarity', 'experience_quality', 'evidence_and_results', 'skills_and_tools',
      'cross_source_consistency', 'positioning_quality', 'profile_completeness'
    )),
  rubric_level smallint not null check (rubric_level between 0 and 4),
  dimension_score numeric(5,2) not null check (dimension_score between 0 and 100),
  weight numeric(5,4) not null check (weight between 0 and 1),
  weighted_contribution numeric(6,3) not null,
  reasoning text not null,
  created_at timestamptz not null default now(),
  unique (analysis_id, dimension)
);
create index on profile_dimension_results (analysis_id, dimension);

-- ---- Core 2 results ----
create table if not exists fit_analysis_results (
  analysis_id uuid primary key references analyses (id) on delete cascade,
  iao_raw_score numeric(5,2) not null check (iao_raw_score between 0 and 100),
  iao_final_score numeric(5,2) not null check (iao_final_score between 0 and 100),
  iao_display_score smallint not null check (iao_display_score between 0 and 100),
  iao_band text not null
    check (iao_band in ('low_observable_fit', 'partial_fit', 'good_observable_fit', 'high_observable_fit')),
  recommendation_type text not null
    check (recommendation_type in (
      -- job-specific
      'apply_now', 'apply_with_adjustments', 'develop_gaps_before_applying', 'do_not_prioritize',
      -- target-role
      'ready_to_prioritize', 'prioritize_with_adjustments', 'develop_before_prioritizing', 'reassess_target_context',
      -- shared
      'insufficient_data'
    )),
  recommendation_reasoning text not null,
  calculation_snapshot jsonb not null,
  created_at timestamptz not null default now(),
  check (iao_final_score <= iao_raw_score)
);

create table if not exists analysis_limits (
  id uuid primary key default gen_random_uuid(),
  analysis_id uuid not null references analyses (id) on delete cascade,
  limit_type text not null
    check (limit_type in (
      'confirmed_blocker', 'multiple_critical_mandatory_gaps', 'strong_seniority_mismatch',
      'insufficient_data_restriction', 'other_versioned_rule'
    )),
  maximum_score smallint,
  reason text not null,
  requirement_ids uuid[] not null default '{}',
  applied boolean not null default true,
  created_at timestamptz not null default now()
);
create index on analysis_limits (analysis_id);

create table if not exists requirement_assessments (
  id uuid primary key default gen_random_uuid(),
  analysis_id uuid not null references analyses (id) on delete cascade,
  requirement_id uuid not null references requirements (id),
  match_status text not null
    check (match_status in (
      'confirmed_match', 'partial_match', 'communication_gap', 'evidence_gap',
      'unknown', 'not_observed', 'confirmed_mismatch'
    )),
  match_factor numeric(4,3) not null check (match_factor between 0 and 1),
  criticality_weight numeric(4,2) not null,
  requirement_confidence numeric(4,3) not null check (requirement_confidence between 0 and 1),
  assessment_confidence numeric(4,3) not null check (assessment_confidence between 0 and 1),
  weighted_contribution numeric(7,4) not null,
  reasoning text not null,
  gap_type text
    check (gap_type in (
      'competency', 'experience', 'education_or_certification', 'communication',
      'evidence', 'positioning', 'unknown'
    )),
  created_at timestamptz not null default now(),
  unique (analysis_id, requirement_id)
);
create index on requirement_assessments (analysis_id, requirement_id);

create table if not exists requirement_assessment_evidences (
  requirement_assessment_id uuid not null references requirement_assessments (id) on delete cascade,
  evidence_id uuid not null references evidences (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (requirement_assessment_id, evidence_id)
);

-- ---------------------------------------------------------------------------
alter table analyses enable row level security;
create policy analyses_owner_select on analyses for select using (user_id = auth.uid());
create policy analyses_owner_insert on analyses for insert with check (user_id = auth.uid());
create policy analyses_owner_update on analyses for update using (user_id = auth.uid());

alter table profile_analysis_results enable row level security;
create policy profile_analysis_results_owner on profile_analysis_results
  for all using (exists (select 1 from analyses a where a.id = profile_analysis_results.analysis_id and a.user_id = auth.uid()));

alter table profile_dimension_results enable row level security;
create policy profile_dimension_results_owner on profile_dimension_results
  for all using (exists (select 1 from analyses a where a.id = profile_dimension_results.analysis_id and a.user_id = auth.uid()));

alter table fit_analysis_results enable row level security;
create policy fit_analysis_results_owner on fit_analysis_results
  for all using (exists (select 1 from analyses a where a.id = fit_analysis_results.analysis_id and a.user_id = auth.uid()));

alter table analysis_limits enable row level security;
create policy analysis_limits_owner on analysis_limits
  for all using (exists (select 1 from analyses a where a.id = analysis_limits.analysis_id and a.user_id = auth.uid()));

alter table requirement_assessments enable row level security;
create policy requirement_assessments_owner on requirement_assessments
  for all using (exists (select 1 from analyses a where a.id = requirement_assessments.analysis_id and a.user_id = auth.uid()));

alter table requirement_assessment_evidences enable row level security;
create policy requirement_assessment_evidences_owner on requirement_assessment_evidences
  for all using (
    exists (
      select 1 from requirement_assessments ra join analyses a on a.id = ra.analysis_id
      where ra.id = requirement_assessment_evidences.requirement_assessment_id and a.user_id = auth.uid()
    )
  );
