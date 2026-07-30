import { randomUUID, createHash } from "node:crypto";
import type { AnalyticsPort, AnalyticsProperties, AnalyticsContext } from "@/application/ports/analytics";
import type { AnalyticsEventName } from "./events";
import { ConsoleAnalyticsAdapter } from "./console-adapter";

let cached: AnalyticsPort | undefined;

function getAnalyticsAdapter(): AnalyticsPort {
  if (!cached) cached = new ConsoleAnalyticsAdapter();
  return cached;
}

function hashUserId(userId: string): string {
  return createHash("sha256").update(userId).digest("hex");
}

/**
 * Emits a product analytics event. Called from Server Actions after
 * successful persistence (Analytics §17: "Eventos de conclusão devem ser
 * emitidos preferencialmente pelo backend, após a persistência bem-sucedida
 * da operação") — never from the client, never before the write commits.
 * `userId` is hashed here, never forwarded raw (Analytics §4 `user_id_hash`).
 */
export function trackEvent(
  eventName: AnalyticsEventName,
  options?: { userId?: string; analysisId?: string; analysisType?: AnalyticsContext["analysisType"]; properties?: AnalyticsProperties },
): void {
  const event = {
    eventId: randomUUID(),
    eventName,
    eventVersion: 1 as const,
    occurredAt: new Date().toISOString(),
    environment: (process.env.NODE_ENV as "development" | "test" | "production") ?? "development",
    source: "server" as const,
    context: {
      userIdHash: options?.userId ? hashUserId(options.userId) : undefined,
      analysisId: options?.analysisId,
      analysisType: options?.analysisType,
    },
    properties: options?.properties ?? {},
  };

  try {
    void getAnalyticsAdapter().track(event);
  } catch (err) {
    // Analytics must never break the user-facing operation it's attached to.
    console.error("trackEvent: adapter failed:", err instanceof Error ? err.message : err);
  }
}
