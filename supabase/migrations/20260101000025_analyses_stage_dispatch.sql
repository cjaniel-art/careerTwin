-- Core 1's dimensions/recommendations AI calls moved out of the Vercel
-- request/response cycle (60s Hobby-plan ceiling) into a Supabase Edge
-- Function (150s wall-clock ceiling on this project's free plan). Vercel now
-- only dispatches the edge function and polls `analyses.status` — this column
-- is the compare-and-set claim that stops a poll round from re-dispatching a
-- stage that's already running.
alter table analyses add column if not exists stage_dispatched_at timestamptz;
