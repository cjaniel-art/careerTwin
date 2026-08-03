"use server";

import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/infrastructure/auth/supabase-server-client";
import { trackEvent } from "@/infrastructure/analytics";
import { ANALYTICS_EVENTS } from "@/infrastructure/analytics/events";
import {
  loginSchema,
  requestPasswordResetSchema,
  signUpSchema,
  updatePasswordSchema,
} from "./schemas";

export interface AuthActionState {
  error?: string;
  fieldErrors?: Record<string, string>;
  success?: boolean;
}

const CURRENT_POLICY_VERSION = "provisional-v1"; // see open-decisions.md #11

function isSafeInternalPath(path: string | null): path is string {
  return !!path && path.startsWith("/") && !path.startsWith("//");
}

export async function signUpAction(_prev: AuthActionState, formData: FormData): Promise<AuthActionState> {
  const parsed = signUpSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });
  if (!parsed.success) {
    return { fieldErrors: flattenZodErrors(parsed.error) };
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error) {
    // RF-AUTH-007/RN-AUTH-007: never reveal whether the account already exists.
    return { error: "Não foi possível concluir o cadastro. Revise os dados e tente novamente." };
  }

  if (data.user && data.session) {
    // Only record consent once the user has an authenticated session (RLS requires it).
    await supabase.from("consent_records").insert([
      {
        user_id: data.user.id,
        consent_type: "terms_of_use",
        policy_version: CURRENT_POLICY_VERSION,
        status: "granted",
        source: "signup",
      },
      {
        user_id: data.user.id,
        consent_type: "privacy_policy",
        policy_version: CURRENT_POLICY_VERSION,
        status: "granted",
        source: "signup",
      },
    ]);
  }

  if (data.user) trackEvent(ANALYTICS_EVENTS.signupCompleted, { userId: data.user.id });

  if (!data.session) {
    // Email confirmation is required by the current Supabase Auth config.
    redirect("/cadastro/confirme-seu-email");
  }

  redirect("/onboarding");
}

export async function loginAction(_prev: AuthActionState, formData: FormData): Promise<AuthActionState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { fieldErrors: flattenZodErrors(parsed.error) };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) {
    trackEvent(ANALYTICS_EVENTS.loginFailed);
    return { error: "Não foi possível entrar com os dados informados. Revise as informações ou recupere sua senha." };
  }

  const redirectParam = formData.get("redirect");
  const destination =
    typeof redirectParam === "string" && isSafeInternalPath(redirectParam) ? redirectParam : null;

  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: account } = await supabase
    .from("user_accounts")
    .select("onboarding_status")
    .eq("user_id", user!.id)
    .single();

  trackEvent(ANALYTICS_EVENTS.loginCompleted, { userId: user!.id });

  if (destination) redirect(destination);
  redirect(account?.onboarding_status === "completed" ? "/app/dashboard" : "/onboarding");
}

export async function signInWithGoogleAction(formData: FormData): Promise<void> {
  const supabase = await createSupabaseServerClient();

  const redirectParam = formData.get("redirect");
  const destination =
    typeof redirectParam === "string" && isSafeInternalPath(redirectParam) ? redirectParam : null;

  const callbackUrl = new URL("/auth/callback", process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000");
  if (destination) callbackUrl.searchParams.set("redirect", destination);

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: callbackUrl.toString() },
  });

  if (error || !data.url) {
    redirect("/login?erro=google-oauth");
  }

  redirect(data.url);
}

export async function logoutAction(): Promise<void> {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/");
}

export async function requestPasswordResetAction(
  _prev: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = requestPasswordResetSchema.safeParse({ email: formData.get("email") });
  if (!parsed.success) {
    return { fieldErrors: flattenZodErrors(parsed.error) };
  }

  const supabase = await createSupabaseServerClient();
  // RF-AUTH-024: the response never reveals whether the e-mail is registered,
  // so this call's result is deliberately not branched on.
  await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL ?? ""}/redefinir-senha`,
  });

  return { success: true };
}

export async function updatePasswordAction(
  _prev: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = updatePasswordSchema.safeParse({
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });
  if (!parsed.success) {
    return { fieldErrors: flattenZodErrors(parsed.error) };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
  if (error) {
    return { error: "Não foi possível redefinir sua senha. O link pode ter expirado — solicite um novo." };
  }

  redirect("/login?redefinicao=concluida");
}

function flattenZodErrors(error: { flatten: () => { fieldErrors: Record<string, string[] | undefined> } }) {
  const { fieldErrors } = error.flatten();
  const out: Record<string, string> = {};
  for (const [key, messages] of Object.entries(fieldErrors)) {
    if (messages?.[0]) out[key] = messages[0];
  }
  return out;
}
