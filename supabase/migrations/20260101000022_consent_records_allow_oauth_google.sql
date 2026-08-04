-- The Google OAuth callback (src/app/auth/callback/route.ts) records first-sign-in
-- consent with source = 'oauth_google', but the check constraint only allowed
-- 'signup' | 'account_settings' | 'onboarding'. Every Google-signup consent insert
-- was silently failing (error not checked at the call site), leaving those users
-- with no consent_records row at all.
alter table public.consent_records drop constraint consent_records_source_check;
alter table public.consent_records
  add constraint consent_records_source_check
  check (source = any (array['signup', 'account_settings', 'onboarding', 'oauth_google']));
