import { createClient } from "@supabase/supabase-js";
import { requireEnv } from "@/lib/env";

/**
 * Service-role Supabase client — bypasses RLS entirely. Server-only, and
 * only for code that genuinely needs to read/aggregate across every user
 * (ex: painel admin). Never import this from `src/app/**` route code
 * directly — route code calls a named query function from this directory
 * instead (ex: `getExecutiveDashboardMetrics`), which is the only place
 * that touches this client.
 */
export function createSupabaseServiceClient() {
  return createClient(requireEnv("NEXT_PUBLIC_SUPABASE_URL"), requireEnv("SUPABASE_SERVICE_ROLE_KEY"), {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
