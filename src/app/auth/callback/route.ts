import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/infrastructure/auth/supabase-server-client";
import { trackEvent } from "@/infrastructure/analytics";
import { ANALYTICS_EVENTS } from "@/infrastructure/analytics/events";

const CURRENT_POLICY_VERSION = "provisional-v1"; // see open-decisions.md #11

function isSafeInternalPath(path: string | null): path is string {
  return !!path && path.startsWith("/") && !path.startsWith("//");
}

/** Exchanges the Google OAuth code for a session (Supabase `signInWithOAuth` redirect target). */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const destination = isSafeInternalPath(searchParams.get("redirect")) ? searchParams.get("redirect") : null;

  if (!code) {
    return NextResponse.redirect(`${origin}/login?erro=google-oauth`);
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    return NextResponse.redirect(`${origin}/login?erro=google-oauth`);
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.redirect(`${origin}/login?erro=google-oauth`);
  }

  const { data: existingConsent } = await supabase
    .from("consent_records")
    .select("id")
    .eq("user_id", user.id)
    .eq("consent_type", "terms_of_use")
    .maybeSingle();

  if (!existingConsent) {
    // First sign-in via Google: record consent, granted by continuing past the
    // disclaimer shown on the login screen — same guarantee as the signup checkboxes.
    await supabase.from("consent_records").insert([
      {
        user_id: user.id,
        consent_type: "terms_of_use",
        policy_version: CURRENT_POLICY_VERSION,
        status: "granted",
        source: "oauth_google",
      },
      {
        user_id: user.id,
        consent_type: "privacy_policy",
        policy_version: CURRENT_POLICY_VERSION,
        status: "granted",
        source: "oauth_google",
      },
    ]);
    trackEvent(ANALYTICS_EVENTS.signupCompleted, { userId: user.id });
  }

  const { data: account } = await supabase
    .from("user_accounts")
    .select("onboarding_status")
    .eq("user_id", user.id)
    .single();

  trackEvent(ANALYTICS_EVENTS.loginCompleted, { userId: user.id });

  const target = destination ?? (account?.onboarding_status === "completed" ? "/app/dashboard" : "/onboarding");
  return NextResponse.redirect(`${origin}${target}`);
}
