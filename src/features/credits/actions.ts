"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/infrastructure/auth/supabase-server-client";
import { SIMULATED_OFFER } from "@/config/engine/offer";
import { trackEvent } from "@/infrastructure/analytics";
import { ANALYTICS_EVENTS } from "@/infrastructure/analytics/events";

async function requireUser() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?redirect=/app/assinatura");
  return { supabase, user };
}

/**
 * Registers purchase INTENT — no real charge, no card data collected
 * (Modelo de Negócio: "Não haverá cobrança nem coleta de dados de cartão").
 * Since there's no payment gateway yet, this simulated/pilot offer also
 * immediately grants SIMULATED_OFFER.creditsDisplayed credits via
 * ct_grant_purchase_credits (idempotent — one grant per offer/version per
 * user) — see 20260101000028_purchase_credit_grant.sql for why that has to
 * be a SECURITY DEFINER RPC rather than a direct table write.
 */
export async function confirmPurchaseIntentAction(): Promise<void> {
  const { supabase, user } = await requireUser();
  await supabase.from("purchase_intents").insert({
    id: randomUUID(),
    user_id: user.id,
    offer_key: SIMULATED_OFFER.offerKey,
    offer_version: SIMULATED_OFFER.offerVersion,
    price_cents: SIMULATED_OFFER.priceCents,
    currency: SIMULATED_OFFER.currency,
    credits_displayed: SIMULATED_OFFER.creditsDisplayed,
    validity_days_displayed: SIMULATED_OFFER.validityDaysDisplayed,
    status: "confirmed_intent",
  });

  const { error: grantError } = await supabase.rpc("ct_grant_purchase_credits", {
    p_credits: SIMULATED_OFFER.creditsDisplayed,
    p_offer_key: SIMULATED_OFFER.offerKey,
    p_offer_version: SIMULATED_OFFER.offerVersion,
  });
  if (grantError) {
    console.error("confirmPurchaseIntentAction: ct_grant_purchase_credits failed:", grantError.message);
  }

  trackEvent(ANALYTICS_EVENTS.purchaseIntentConfirmed, {
    userId: user.id,
    properties: {
      offerKey: SIMULATED_OFFER.offerKey,
      priceCents: SIMULATED_OFFER.priceCents,
      creditsDisplayed: SIMULATED_OFFER.creditsDisplayed,
      validityDaysDisplayed: SIMULATED_OFFER.validityDaysDisplayed,
    },
  });

  revalidatePath("/app/assinatura");
  revalidatePath("/app/aderencia");
}
