-- Pin search_path on every trigger function to prevent search_path hijacking
-- (Supabase security advisor: function_search_path_mutable).
alter function ct_set_updated_at() set search_path = public, pg_temp;
alter function ct_prevent_confirmed_version_update() set search_path = public, pg_temp;
alter function ct_check_current_version_ownership() set search_path = public, pg_temp;
alter function ct_prevent_confirmed_target_context_update() set search_path = public, pg_temp;
alter function ct_prevent_confirmed_opportunity_update() set search_path = public, pg_temp;
alter function ct_prevent_completed_analysis_update() set search_path = public, pg_temp;
alter function ct_ledger_is_append_only() set search_path = public, pg_temp;
