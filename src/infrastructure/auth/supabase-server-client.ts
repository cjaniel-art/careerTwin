import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import { requireEnv } from "@/lib/env";

interface CookieToSet {
  name: string;
  value: string;
  options: CookieOptions;
}

/**
 * Server-side Supabase client bound to the request's cookies, using only the
 * anon key — RLS still applies (auth.uid() resolves from the user's session).
 * Never instantiate a service-role client here; that belongs exclusively in
 * infrastructure/database (server-only, never imported by app/ route code).
 */
export async function createSupabaseServerClient() {
  const cookieStore = await cookies();

  return createServerClient(requireEnv("NEXT_PUBLIC_SUPABASE_URL"), requireEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY"), {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet: CookieToSet[]) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // Called from a Server Component with no writable cookie jar — the
          // middleware below is what actually refreshes the session cookie.
        }
      },
    },
  });
}
