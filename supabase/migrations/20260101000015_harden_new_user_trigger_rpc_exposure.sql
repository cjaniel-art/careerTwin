-- Supabase security advisor: ct_handle_new_user() is SECURITY DEFINER and was
-- exposed to anon/authenticated via PostgREST's automatic RPC endpoint
-- (/rest/v1/rpc/ct_handle_new_user). It is meant to run exclusively as an
-- AFTER INSERT trigger on auth.users (fired by the Auth service's own role),
-- never as a client-callable RPC. Verified live that signup still provisions
-- user_accounts/credit_accounts correctly after this revoke.
revoke execute on function ct_handle_new_user() from public, anon, authenticated;
