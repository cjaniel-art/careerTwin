import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { trackEvent } from "@/infrastructure/analytics";
import { ANALYTICS_EVENTS } from "@/infrastructure/analytics/events";

const FORBIDDEN_SUBSTRINGS = [
  "full_name",
  "e-mail",
  "email",
  "cidade",
  "city",
  "endereco",
  "curriculo",
  "resume_text",
  "linkedin_text",
  "job_description",
  "evidencia_texto",
  "comment",
  "prompt",
  "password",
  "token",
  "signed_url",
];

describe("analytics event payloads", () => {
  let warnSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    warnSpy = vi.spyOn(console, "warn").mockImplementation(() => undefined);
  });
  afterEach(() => {
    warnSpy.mockRestore();
  });

  function lastPayload(): Record<string, unknown> {
    const call = warnSpy.mock.calls.at(-1);
    expect(call).toBeDefined();
    return JSON.parse(call![1] as string);
  }

  it("emits the common envelope for a simple event", () => {
    trackEvent(ANALYTICS_EVENTS.loginCompleted, { userId: "user-123" });
    const payload = lastPayload();

    expect(payload.eventName).toBe("login_completed");
    expect(payload.eventVersion).toBe(1);
    expect(typeof payload.eventId).toBe("string");
    expect(typeof payload.occurredAt).toBe("string");
    expect(["development", "test", "production"]).toContain(payload.environment);
    expect(payload.source).toBe("server");
  });

  it("never sends the raw user id — only a pseudonymous hash", () => {
    trackEvent(ANALYTICS_EVENTS.loginCompleted, { userId: "user-123" });
    const payload = lastPayload();
    const context = payload.context as Record<string, unknown>;

    expect(JSON.stringify(payload)).not.toContain("user-123");
    expect(typeof context.userIdHash).toBe("string");
    expect((context.userIdHash as string).length).toBe(64); // sha256 hex
  });

  it("hashes the same user id deterministically across events", () => {
    trackEvent(ANALYTICS_EVENTS.loginCompleted, { userId: "user-abc" });
    const first = (lastPayload().context as Record<string, unknown>).userIdHash;
    trackEvent(ANALYTICS_EVENTS.actionStarted, { userId: "user-abc" });
    const second = (lastPayload().context as Record<string, unknown>).userIdHash;

    expect(first).toBe(second);
  });

  it("only carries allowlisted, aggregated properties — never forbidden personal/professional content", () => {
    trackEvent(ANALYTICS_EVENTS.profileAnalysisCompleted, {
      userId: "user-123",
      analysisId: "analysis-1",
      analysisType: "profile_analysis",
      properties: {
        ippBand: "good_readiness",
        confidenceLevel: "high",
        recommendationCount: 3,
      },
    });
    const payload = lastPayload();
    const json = JSON.stringify(payload).toLowerCase();

    for (const forbidden of FORBIDDEN_SUBSTRINGS) {
      expect(json).not.toContain(forbidden);
    }
  });

  it("carries analysisId/analysisType context without leaking scores as raw numbers where a band is expected", () => {
    trackEvent(ANALYTICS_EVENTS.jobAnalysisCompleted, {
      userId: "user-123",
      analysisId: "analysis-2",
      analysisType: "job_analysis",
      properties: { iaoBand: "good_observable_fit", confidenceLevel: "high", requirementCount: 3, appliedLimit: false },
    });
    const payload = lastPayload();
    const context = payload.context as Record<string, unknown>;
    const properties = payload.properties as Record<string, unknown>;

    expect(context.analysisId).toBe("analysis-2");
    expect(context.analysisType).toBe("job_analysis");
    expect(properties.iaoBand).toBe("good_observable_fit");
    expect(properties).not.toHaveProperty("iaoDisplayScore");
    expect(properties).not.toHaveProperty("iaoRawScore");
  });

  it("does not throw when tracking fails internally (analytics must never break the caller)", () => {
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => undefined);
    warnSpy.mockImplementation(() => {
      throw new Error("adapter exploded");
    });
    expect(() => trackEvent(ANALYTICS_EVENTS.loginCompleted, { userId: "user-123" })).not.toThrow();
    errorSpy.mockRestore();
  });
});
