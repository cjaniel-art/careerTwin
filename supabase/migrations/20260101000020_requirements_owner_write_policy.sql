-- Found via live end-to-end testing: requirements had only a SELECT policy,
-- so every requirement insert from the opportunity-structuring flow failed
-- silently under RLS (0 rows persisted despite a valid, schema-passing AI
-- response). Add owner-scoped INSERT/UPDATE, restricted to the
-- opportunity_version_id path (a user can never write to the shared
-- role_reference catalog — that stays read-only for regular users, matching
-- the "curator/service-role only" comment already on
-- role_references/role_reference_versions).
create policy requirements_owner_insert on requirements
  for insert with check (
    opportunity_version_id is not null and exists (
      select 1 from opportunity_versions ov join opportunities o on o.id = ov.opportunity_id
      where ov.id = requirements.opportunity_version_id and o.user_id = auth.uid()
    )
  );

create policy requirements_owner_update on requirements
  for update using (
    opportunity_version_id is not null and exists (
      select 1 from opportunity_versions ov join opportunities o on o.id = ov.opportunity_id
      where ov.id = requirements.opportunity_version_id and o.user_id = auth.uid()
    )
  );
