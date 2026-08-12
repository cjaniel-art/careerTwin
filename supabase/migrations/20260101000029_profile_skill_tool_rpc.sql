-- Found while auditing onboarding data loss (see profile-extraction.ts /
-- pipeline.ts commit "Corrige perda de formação e certificações..."):
-- competencies/tools extracted from résumé/LinkedIn were ALSO never
-- persisted, for a different reason than education/certifications — skills
-- and tools live in shared catalog tables (skills/tools) that only allow
-- authenticated users to SELECT, never INSERT (to keep one normalized
-- vocabulary instead of "React" vs "ReactJS" duplicates polluting the
-- catalog per user). profile_skills/profile_tools themselves ARE
-- owner-scoped and writable directly — the catalog row is the only blocker.
--
-- These RPCs do the find-or-create on the catalog (SECURITY DEFINER, the
-- only way around the read-only catalog RLS) plus the owner-scoped
-- profile_skills/profile_tools insert, in one call. taxonomy_version
-- 'auto-extracted/1.0' distinguishes catalog rows created this way from any
-- future curated taxonomy import — the catalog is empty today (0 rows),
-- so this is also what seeds it going forward.
create or replace function ct_upsert_profile_skill(
  p_profile_version_id uuid,
  p_original_term text,
  p_normalized_name text,
  p_skill_type text,
  p_skill_domain text,
  p_declared_level text,
  p_extraction_confidence numeric
)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_user_id uuid := auth.uid();
  v_skill_id uuid;
begin
  if v_user_id is null then
    raise exception 'ct_upsert_profile_skill: no authenticated user';
  end if;

  if not exists (
    select 1 from profile_versions v join professional_profiles p on p.id = v.profile_id
    where v.id = p_profile_version_id and p.user_id = v_user_id
  ) then
    raise exception 'ct_upsert_profile_skill: profile_version % does not belong to caller', p_profile_version_id;
  end if;

  insert into skills (normalized_name, skill_type, skill_domain, taxonomy_version, status, aliases)
  values (p_normalized_name, p_skill_type, p_skill_domain, 'auto-extracted/1.0', 'active', array[]::text[])
  on conflict (normalized_name, taxonomy_version) do update set updated_at = now()
  returning id into v_skill_id;

  insert into profile_skills (
    profile_version_id, skill_id, original_term, declared_level, inference_status, extraction_confidence, confirmation_status
  ) values (
    p_profile_version_id, v_skill_id, p_original_term, p_declared_level, 'fact', p_extraction_confidence, 'extracted'
  );
end;
$$;
revoke execute on function ct_upsert_profile_skill(uuid, text, text, text, text, text, numeric) from public, anon;
grant execute on function ct_upsert_profile_skill(uuid, text, text, text, text, text, numeric) to authenticated;

create or replace function ct_upsert_profile_tool(
  p_profile_version_id uuid,
  p_original_term text,
  p_normalized_name text,
  p_tool_category text,
  p_usage_context text,
  p_declared_level text,
  p_extraction_confidence numeric
)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_user_id uuid := auth.uid();
  v_tool_id uuid;
begin
  if v_user_id is null then
    raise exception 'ct_upsert_profile_tool: no authenticated user';
  end if;

  if not exists (
    select 1 from profile_versions v join professional_profiles p on p.id = v.profile_id
    where v.id = p_profile_version_id and p.user_id = v_user_id
  ) then
    raise exception 'ct_upsert_profile_tool: profile_version % does not belong to caller', p_profile_version_id;
  end if;

  insert into tools (normalized_name, tool_category, taxonomy_version, status, aliases)
  values (p_normalized_name, p_tool_category, 'auto-extracted/1.0', 'active', array[]::text[])
  on conflict (normalized_name, taxonomy_version) do update set updated_at = now()
  returning id into v_tool_id;

  insert into profile_tools (
    profile_version_id, tool_id, original_term, usage_context, declared_level, extraction_confidence, confirmation_status
  ) values (
    p_profile_version_id, v_tool_id, p_original_term, p_usage_context, p_declared_level, p_extraction_confidence, 'extracted'
  );
end;
$$;
revoke execute on function ct_upsert_profile_tool(uuid, text, text, text, text, text, numeric) from public, anon;
grant execute on function ct_upsert_profile_tool(uuid, text, text, text, text, text, numeric) to authenticated;
