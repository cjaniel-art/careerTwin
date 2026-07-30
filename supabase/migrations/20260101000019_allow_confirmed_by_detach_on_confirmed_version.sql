-- The immutability trigger correctly blocks any edit to a confirmed
-- profile_version, but that also blocked the legitimate ON DELETE SET NULL
-- action on confirmed_by_user_id (20260101000017) when the confirming
-- user's account is deleted — found live while cleaning up test data.
-- Narrow the trigger: allow an update only when confirmed_by_user_id is the
-- sole column changing (and only toward NULL) — every other field, and any
-- other combination, remains blocked exactly as before.
create or replace function ct_prevent_confirmed_version_update()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
begin
  if old.status = 'confirmed' then
    if new.confirmed_by_user_id is null
       and new.id = old.id
       and new.profile_id = old.profile_id
       and new.version_number = old.version_number
       and new.status = old.status
       and new.source_type = old.source_type
       and coalesce(new.change_reason, '') = coalesce(old.change_reason, '')
       and coalesce(new.previous_version_id::text, '') = coalesce(old.previous_version_id::text, '')
       and new.change_summary = old.change_summary
       and coalesce(new.snapshot::text, '') = coalesce(old.snapshot::text, '')
       and coalesce(new.snapshot_hash, '') = coalesce(old.snapshot_hash, '')
       and new.confirmed_at = old.confirmed_at
       and new.created_at = old.created_at
    then
      return new; -- account-deletion detach only, nothing else changed
    end if;
    raise exception 'profile_versions: confirmed versions are immutable (id=%)', old.id;
  end if;
  return new;
end;
$$;
