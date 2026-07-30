-- Found via live test-data cleanup: profile_versions.confirmed_by_user_id
-- referenced user_accounts with NO ACTION (the implicit default), which
-- blocks the natural professional_profiles -> profile_versions cascade
-- delete during account deletion (Segurança §7, step 11: "Thin Twin e
-- versões excluídos"). The confirmed snapshot itself is preserved by the
-- cascade from professional_profiles; only the "who confirmed it" pointer
-- needs to detach, so ON DELETE SET NULL is correct here (the column is
-- already nullable).
alter table profile_versions drop constraint profile_versions_confirmed_by_user_id_fkey;
alter table profile_versions
  add constraint profile_versions_confirmed_by_user_id_fkey
  foreign key (confirmed_by_user_id) references user_accounts (user_id) on delete set null;
