import type { AnalyticsEventName } from "@/infrastructure/analytics/events";

/**
 * AnalyticsPort — the only way application code emits product analytics.
 * Properties are an explicit allowlist (Analytics §4/§6-§11 "propriedades
 * permitidas"), never a free-form record — this makes sending forbidden
 * content (names, emails, résumé/LinkedIn/job text, comments, evidence,
 * recommendation text) a compile error, not a runtime discipline problem.
 */
export interface AnalyticsProperties {
  documentType?: "resume" | "linkedin";
  step?: string;
  ippBand?: "low_readiness" | "developing_readiness" | "good_readiness" | "high_readiness";
  iaoBand?: "low_observable_fit" | "partial_fit" | "good_observable_fit" | "high_observable_fit";
  confidenceLevel?: "low" | "medium" | "high";
  recommendationCount?: number;
  recommendationCategory?: "competency" | "communication" | "evidence" | "positioning";
  requirementCount?: number;
  appliedLimit?: boolean;
  recommendationType?: string;
  applicationIntent?: "apply" | "apply_after_adjustments" | "not_apply" | "undecided" | "not_applicable";
  errorCategory?: string;
  restorationReason?: "technical_failure" | "insufficient_data" | "other";
  actionStatus?: "pending" | "selected" | "in_progress" | "completed";
  offerKey?: string;
  priceCents?: number;
  creditsDisplayed?: number;
  validityDaysDisplayed?: number;
  usefulnessScore?: 1 | 2 | 3 | 4 | 5;
  specificity?: "yes" | "partially" | "no";
}

export interface AnalyticsContext {
  userIdHash?: string;
  analysisId?: string;
  analysisType?: "profile_analysis" | "job_analysis" | "target_role_analysis";
}

export interface AnalyticsEvent {
  eventId: string;
  eventName: AnalyticsEventName;
  eventVersion: 1;
  occurredAt: string;
  environment: "development" | "test" | "production";
  source: "server";
  context: AnalyticsContext;
  properties: AnalyticsProperties;
}

export interface AnalyticsPort {
  track(event: AnalyticsEvent): void | Promise<void>;
}
