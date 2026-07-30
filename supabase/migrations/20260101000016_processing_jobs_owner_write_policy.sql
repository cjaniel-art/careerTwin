-- Found via live end-to-end testing: processing_jobs had only a SELECT policy
-- (Modelo de Dados' original intent: "Inserts/updates to jobs happen
-- exclusively via service role"). This deployment has no separate queue/worker
-- process — job bookkeeping runs synchronously inside the user's own
-- authenticated request (documented simplification, see relatório final /
-- Fase 3 e 4). Without an INSERT/UPDATE policy, every job row silently failed
-- to write under RLS, and the code swallowed it (`if (job) { ... }`), so
-- résumé/LinkedIn processing appeared to work but left zero job history.
--
-- This grants owner-scoped write access, preserving the actual security
-- guarantee (a user can never see or modify another user's job) without
-- requiring a service-role connection this environment doesn't have
-- configured. A real worker deployment should tighten this back to
-- service-role-only once a queue is introduced.
create policy processing_jobs_owner_insert on processing_jobs
  for insert with check (user_id = auth.uid());

create policy processing_jobs_owner_update on processing_jobs
  for update using (user_id = auth.uid());
