import { createBrowserClient } from "@supabase/ssr";
import { requireEnv } from "@/lib/env";

/**
 * Browser-side Supabase client. Only ever holds the publishable anon key —
 * never the service role key (Segurança §9: "frontend não tem chave
 * administrativa, service role, acesso irrestrito a banco/storage").
 */
export function createSupabaseBrowserClient() {
  return createBrowserClient(requireEnv("NEXT_PUBLIC_SUPABASE_URL"), requireEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY"));
}
