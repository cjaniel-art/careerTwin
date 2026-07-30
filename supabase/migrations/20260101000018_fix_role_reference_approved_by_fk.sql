-- Same class of issue as 20260101000017 (profile_versions.confirmed_by_user_id):
-- an admin who approved a role_reference_versions row (shared catalog data,
-- not owned by the user being deleted) should not have their own account
-- deletion blocked by that reference.
alter table role_reference_versions drop constraint role_reference_versions_approved_by_fkey;
alter table role_reference_versions
  add constraint role_reference_versions_approved_by_fkey
  foreign key (approved_by) references user_accounts (user_id) on delete set null;
