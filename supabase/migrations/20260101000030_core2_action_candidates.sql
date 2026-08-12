-- CareerTwin — materializa os action candidates do Core 2 como linhas reais
-- (mirror de `recommendations`), fechando a paridade com o Core 1: até aqui
-- essas sugestões só existiam dentro de fit_analysis_results.calculation_snapshot
-- (JSON, não convertível em `actions` rastreáveis — ver docstring antiga em
-- src/config/schemas/core2.ts's actionCandidateSchema).

create table if not exists core2_action_candidates (
  id uuid primary key default gen_random_uuid(),
  analysis_id uuid not null references analyses (id) on delete cascade,
  action_key text not null,
  title text not null,
  reasoning text not null,
  suggested_action text not null,
  horizon text not null check (horizon in ('before_applying', 'during_process', 'long_term')),
  impact smallint not null check (impact between 1 and 5),
  effort smallint not null check (effort between 1 and 5),
  success_criteria text not null,
  related_requirement_ids uuid[] not null default '{}',
  status text not null default 'generated' check (status in ('generated', 'converted_to_action')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (analysis_id, action_key)
);
create trigger core2_action_candidates_set_updated_at before update on core2_action_candidates
  for each row execute function ct_set_updated_at();
create index on core2_action_candidates (analysis_id);

alter table core2_action_candidates enable row level security;
create policy core2_action_candidates_owner on core2_action_candidates
  for all using (
    exists (select 1 from analyses a where a.id = core2_action_candidates.analysis_id and a.user_id = auth.uid())
  );

-- `actions` passa a aceitar duas origens possíveis (Core 1 via recommendation_id,
-- Core 2 via core2_action_candidate_id) — exatamente uma das duas deve estar
-- preenchida. RLS de `actions` já é ownership-genérica (user_id = auth.uid()),
-- não depende de qual origem, então nenhuma policy nova é necessária aqui.
alter table actions
  alter column recommendation_id drop not null,
  add column core2_action_candidate_id uuid references core2_action_candidates (id) on delete cascade,
  add constraint actions_exactly_one_origin check (
    (recommendation_id is not null)::int + (core2_action_candidate_id is not null)::int = 1
  );

-- Backfill: análises Core 2 já concluídas antes desta migração só têm os
-- action candidates dentro do JSON — materializa como linhas para que
-- relatórios antigos também ganhem a experiência de conversão em ação.
-- relatedRequirementIds inválidos (não-UUID) são descartados silenciosamente
-- em vez de abortar o insert inteiro.
insert into core2_action_candidates (
  analysis_id, action_key, title, reasoning, suggested_action, horizon, impact, effort, success_criteria, related_requirement_ids
)
select
  f.analysis_id,
  cand->>'actionKey',
  cand->>'title',
  cand->>'reasoning',
  cand->>'suggestedAction',
  cand->>'horizon',
  (cand->>'impact')::smallint,
  (cand->>'effort')::smallint,
  cand->>'successCriteria',
  coalesce(
    (select array_agg(x::uuid) from jsonb_array_elements_text(cand->'relatedRequirementIds') x
     where x ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'),
    '{}'
  )
from fit_analysis_results f
cross join lateral jsonb_array_elements(coalesce(f.calculation_snapshot->'actionCandidates', '[]'::jsonb)) cand
where cand->>'actionKey' is not null
  and cand->>'horizon' in ('before_applying', 'during_process', 'long_term')
on conflict (analysis_id, action_key) do nothing;
