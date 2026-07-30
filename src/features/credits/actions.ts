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
  if (!user) redirect("/login?redirect=/app/creditos");
  return { supabase, user };
}

/**
 * Registers purchase INTENT only — no real charge, no card data collected
 * (Modelo de Negócio: "Não haverá cobrança nem coleta de dados de cartão").
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

  trackEvent(ANALYTICS_EVENTS.purchaseIntentConfirmed, {
    userId: user.id,
    properties: {
      offerKey: SIMULATED_OFFER.offerKey,
      priceCents: SIMULATED_OFFER.priceCents,
      creditsDisplayed: SIMULATED_OFFER.creditsDisplayed,
      validityDaysDisplayed: SIMULATED_OFFER.validityDaysDisplayed,
    },
  });

  revalidatePath("/app/creditos");
}
