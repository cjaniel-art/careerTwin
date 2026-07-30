import type { AnalyticsEvent, AnalyticsPort } from "@/application/ports/analytics";

/**
 * No analytics provider has been chosen (open-decisions.md #23) — the
 * Arquitetura doc treats every vendor as a pending decision, and Analytics
 * itself never names one. This adapter logs the validated, already-
 * minimized event envelope to stdout so the contract (names, versioning,
 * allowlisted properties) is real and testable without adopting a vendor
 * unilaterally. Swapping in a real provider later only means implementing
 * AnalyticsPort — no call site changes.
 */
export class ConsoleAnalyticsAdapter implements AnalyticsPort {
  track(event: AnalyticsEvent): void {
    // console.warn, not .log: project lint only allows warn/error — this is
    // dev-visibility output, not an actual warning condition.
    console.warn(`[analytics] ${event.eventName}`, JSON.stringify(event));
  }
}
